import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../services/admin.service';
import { AdminVarsService } from '../../../services/admin-vars.service';


@Component({
  selector: 'app-order-assemble',
  templateUrl: './order-assemble.component.html',
  styleUrls: ['./order-assemble.component.scss']
})
export class OrderAssembleComponent implements OnInit, OnDestroy {
  orderSeller: any;
  orderItems: Array<any> = [];
  orderItemStatus: any = {};
  itemsQuantity: number = 0;
  itemsTotal: number = 0;
  itemsConfirmed: number = 0;
  itemsUnavailable: number = 0;
  itemsReplaced: number = 0;
  userData: any;
  pbuData: any;
  gcData: Array<any> = [];
  payments: Array<any> = [];
  isCancelReason: boolean = false;
  isSticky: boolean = false;
  searchText: string = '';
  searchItems: Array<any> = [];
  selectedItem: any;
  substituteItem: any;
  replacedItemsObj: any = {};
  discrepancyItems: Array<any> = [];
  showErrorDetails: boolean = false;
  textTemplate: string = '';
  paymentDetails: Array<any> = [];
  paymentUpdates: Array<any> = [];
  cashUpdate: number;
  addCashPayment: any;
  pbuDataUpdate: {};
  gcDataUpdate: Array<string> = [];
  @ViewChild('cancelModal') cancelModal;
  @ViewChild('replaceModal') replaceModal;
  @ViewChild('textTemplateModal') textTemplateModal;
  markUp: number;
  partnerBuyer: any;
  partnerStore: any;
  isProcessing = false;
  isReadOnly = false;
  MIN_VALUE = 1;
  MAX_VALUE = 9999;
  PLUS = '+';
  MINUS = '-';
  replacementOptionText: Array<string> = [
    'Select a similar item for me',
    'Subsitute item selected',
    'Do not select a substitute'
  ];
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
  ) { }

  ngOnInit() {
    this.markUp = 0;
    this.userData = JSON.parse(localStorage.getItem('selleruser'));
    forkJoin([
      this.route.params.take(1),
      this.route.queryParams.take(1)
    ])
      .switchMap(([params, query]) => {
        this.isReadOnly = query.readonly || false;
        return this.adminService.getSellerOrder(params['id']);
      })
      .switchMap((results: any) => {
        if (results.message === 'Not Found') {
          return Observable.throw(new Error('Not Found'));
        } else if (!results.message && results.type === 'error') {
          return Observable.throw(new Error('Offline'));
        } else if (results.selleraccount_id !== this.userData.id && !this.isReadOnly) {
          return Observable.throw(new Error('Unauthorized'));
        }
        this.orderSeller = results;
        return forkJoin([
          this.adminService.getOrderItems(results.order_id),
          this.adminService.getPaymentDetailsPerOrder(results.order_id),
          this.adminService.getPartner(results.partner_id),
          this.adminService.getPartnerBuyerUser(results.useraccount_id)
            .mergeMap((pbu) => this.adminService.getPartner(pbu.partner_id)),
          Observable.of(results)
        ]);
      })
      .do(([orderItems, paymentDetails, store, pb, orderSeller]) => {
        this.markUp = (store.hasOwnProperty('markup') ? store.markup : 0);
        this.partnerBuyer = pb;
        this.partnerStore = store;
        this.paymentDetails = paymentDetails;
        if (orderItems.length) {
          orderItems.forEach((item, index) => {
            item.quantity = Number(item.quantity);
            item.price = Number(item.itemPrice);
            item.finalQuantity = item.finalQuantity ? Number(item.finalQuantity) : item.quantity;
            item.finalPrice = item.finalPrice ? Number(item.finalPrice) : item.price;
            item.subOption = item.subOption ? item.subOption : 0;
            switch (item.status) {
              case 'confirmed':
                this.itemsConfirmed++;
                this.itemsQuantity += item.finalQuantity;
                this.itemsTotal += Number((item.finalQuantity * item.finalPrice).toFixed(2));
                this.orderItemStatus[item.orderItem_id] = item.status;
                this.orderItems.push(item);
                break;
              case 'unavailable':
                this.itemsUnavailable++;
                this.orderItemStatus[item.orderItem_id] = item.status;
                this.orderItems.push(item);
                break;
              case 'replaced':
              this.itemsReplaced++;
                this.replacedItemsObj[item.orderItem_id] = item;
                break;
              default:
                this.orderItems.push(item);
            }
          });
          this.checkDataDiscrepancy();
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          switch (err.message) {
            case 'Not Found': // NOTE: break intentionally omitted
            case 'Unauthorized':
              this.router.navigate(['/admin/order-assemble']);
              break;
            case 'Offline':
              this.adminService.showErrorMsg('Unable to connect to server. Please try again later.');
              break;
            default:
          }
        }
        return Observable.empty();
      })
      .takeUntil(this.componentDestroyed)
      .subscribe();
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  getItemImageUrl(key: string): string {
    return key ? `${environment.IMAGE_REPO}${key}.jpg` : this.adminVarsService.ITEM_DEFAULT_IMG;
  }

  onImageError(e: any): void {
    e.target.src = this.adminVarsService.ITEM_DEFAULT_IMG;
  }

  incrementQuantity(index: number): void {
    if (this.orderItems[index].finalQuantity < this.MAX_VALUE) {
      this.orderItems[index].finalQuantity++;
    }
  }

  decrementQuantity(index: number): void {
    if (this.orderItems[index].finalQuantity > this.MIN_VALUE) {
      this.orderItems[index].finalQuantity--;
    }
  }

  confirm(orderItem: any): void {
    const data = {
      id: orderItem.orderItem_id,
      finalQuantity: `${orderItem.finalQuantity}`,
      finalPrice: `${orderItem.finalPrice}`,
      status: 'confirmed',
    };
    this.adminService.updateOrderItem(data)
      .takeUntil(this.componentDestroyed)
      .subscribe((res) => {
        if (res.message && res.message.indexOf('Updated') >= 0) {
          orderItem.status = 'confirmed';
          this.recalculate();
        } else if (!res.message && res.type === 'error') {
          this.adminService.showErrorMsg('Unable to connect to server. Please try again later.');
        }
      });
  }

  unavailable(orderItem: any): void {
    const data = {
      id: orderItem.orderItem_id,
      finalQuantity: '',
      finalPrice: '',
      status: 'unavailable',
    };
    this.adminService.updateOrderItem(data)
      .takeUntil(this.componentDestroyed)
      .subscribe((res) => {
        if (res.message && res.message.indexOf('Updated') >= 0) {
          orderItem.status = 'unavailable';
          this.recalculate();
        } else if (!res.message && res.type === 'error') {
          this.adminService.showErrorMsg('Unable to connect to server. Please try again later.');
        }
      });
  }

  reset(orderItem: any): void {
    const data = {
      id: orderItem.orderItem_id,
      finalQuantity: '',
      finalPrice: '',
      status: 'ordered',
    };
    this.adminService.updateOrderItem(data)
      .takeUntil(this.componentDestroyed)
      .subscribe((res) => {
        if (res.message && res.message.indexOf('Updated') >= 0) {
          this.orderItemStatus[orderItem.orderItem_id] = 0;
          orderItem.status = 'ordered';
          orderItem.finalQuantity = orderItem.quantity;
          orderItem.finalPrice = orderItem.price;
          this.recalculate();
        } else if (!res.message && res.type === 'error') {
          this.adminService.showErrorMsg('Unable to connect to server. Please try again later.');
        }
      });
  }

  updatePrice(e: any, orderItem: any): void {
    const value = Number(e.srcElement.value);
    if (isNaN(value)) {
      e.srcElement.value = orderItem.price;
    } else {
      orderItem.finalPrice = value;
    }
  }

  checkDataDiscrepancy(): void {
    this.discrepancyItems = [];
    const count = {};
    this.orderItems.forEach((item)=> {
      if (count[item.id]) {
        this.discrepancyItems.push({
          item,
          status: 'Duplicate item',
        });
      } else {
        count[item.id] = item.id;
      }
      if (item.replaced_orderitem_id && !this.replacedItemsObj[item.replaced_orderitem_id]) {
        this.discrepancyItems.push({
          item,
          status: 'Replacement item with no matching original item',
        });
      }
    });
    Object.keys(this.replacedItemsObj).forEach((id) => {
      const index = this.orderItems.map((item) => item.replaced_orderitem_id).indexOf(Number(id));
      if (index < 0) {
        this.discrepancyItems.push({
          item: this.replacedItemsObj[id],
          status: 'Replaced item with no matching replacement item',
        });
      }
    });
  }

  forwardToDelivery(): void {
    this.checkDataDiscrepancy();
    if (this.discrepancyItems.length) {
      return;
    }
    const difference = Number(this.orderSeller.itemTotal) - Number(this.itemsTotal.toFixed(2));
    // NOTE: skip if no difference or COD only
    if (difference === 0 || this.orderSeller.paymentTotal === 0) {
      this.processOrder();
      return;
    }

    const salaryIndex = this.paymentDetails.findIndex((payment) => {
      return payment.paymentType === 'SALARY_DEDUCTION';
    });
    const gcIndex = this.paymentDetails.findIndex((payment) => {
      return payment.paymentType === 'GIFT_CERTIFICATE';
    });
    const pbu$ = salaryIndex >= 0 ?
      this.adminService.getPartnerBuyerUser(this.orderSeller.useraccount_id) :
      Observable.of(false);
    const gc$ = gcIndex >= 0 ?
      this.adminService.getGiftCertificatesByOrder(this.orderSeller.order_id) :
      Observable.of([]);
    forkJoin([pbu$, gc$])
      .do((results) => {
        const pbuData = (results[0] as any);
        const gcData = (results[1] as any);
        if (pbuData && pbuData.message === 'Found') {
          this.pbuData = pbuData;
        }
        if (gcData.length) {
          this.gcData = gcData;
        }
        this.processOrder();
      })
      .takeUntil(this.componentDestroyed)
      .subscribe();
  }

  calculateFees(subTotal: number): {} {
    let serviceFee = 0;
    let deliveryFee = 0;
    let partner = null;
    const isPickUp = this.orderSeller.addressType === 3;

    if (this.partnerStore && this.partnerStore.useStoreFees) {
      partner = this.partnerStore;
    } else {
      partner = this.partnerBuyer;
    }

    if (partner && partner.hasOwnProperty('serviceFee') ) {
      if (!partner.isZeroServiceFee) {
        serviceFee = partner.promoServiceFee ?  partner.promoServiceFee : partner.serviceFee;
      }
      if (!partner.isZeroDeliveryFee && !isPickUp) {
        deliveryFee = partner.promoDeliveryFee ? partner.promoDeliveryFee : partner.deliveryFee;
      }
      if (partner.threshold > 0 && subTotal > partner.threshold) {
        const checkThreshold = Math.floor(subTotal / partner.threshold);
        if (checkThreshold > 0) {
          serviceFee += partner.serviceIncrement * checkThreshold;
          if (!isPickUp) {
            deliveryFee += partner.deliveryIncrement * checkThreshold;
          }
        }
      }
    }

    return {
      serviceFee: Number(serviceFee),
      deliveryFee: Number(deliveryFee)
    }
  }

  processOrder(): void {
    const itemTotalFinal = Number(this.itemsTotal.toFixed(2));
    const { serviceFee, deliveryFee } = this.calculateFees(itemTotalFinal) as any;
    const difference = this.computeDecimal(this.orderSeller.itemTotal, this.MINUS, itemTotalFinal);
    const grandTotal = Number(this.orderSeller.itemTotal) + deliveryFee
      + serviceFee - Number(this.orderSeller.discountTotal);
    const paymentPaid = Number(this.orderSeller.paymentTotal);
    const paymentDue = Number(this.orderSeller.adjustmentTotal);

    const data = {
      order: {
        id: this.orderSeller.order_id,
        finalItemTotal: itemTotalFinal,
        serviceFee: serviceFee,
        deliveryFee: deliveryFee,
        finalTotalQuantity: this.itemsQuantity,
        status: 'assembled',
      },
      orderseller: {
        id: this.orderSeller.id,
        selleraccount_id: 0,
        status: 'assembled',
        updatedBy: this.userData.id,
      },
      payments : [],
      addCash : {},
      gc: {},
      pbu: {},
    };
    if (difference !== 0) {
      this.updateOrderPayments(difference);
      data.payments = this.paymentUpdates;
      data.addCash = this.addCashPayment ? this.addCashPayment : {};
      data.pbu = this.pbuDataUpdate;
      data.gc = this.gcDataUpdate;
      data.order['total'] = this.computeDecimal(grandTotal, this.MINUS, difference);
      if (paymentPaid === 0) {
        data.order['adjustmentTotal'] = data.order['total'];
      } else {
        data.order['adjustmentTotal'] = this.cashUpdate;
        data.order['paymentTotal'] = this.computeDecimal(data.order['total'], this.MINUS, this.cashUpdate);
      }
    }
    console.log('%cPROCESS ORDER', 'color: red; font-size:22px; background-color: yellow');
    this.adminService.processOrder(data)
      .takeUntil(this.componentDestroyed)
      .subscribe((res: any) => {
        if (res.message && res.message.indexOf('Updated') >= 0) {
          this.router.navigate(['/admin/order-assemble']);
        } else if (!res.message && res.type === 'error') {
          this.adminService.showErrorMsg('Unable to connect to server. Please try again later.');
        }
      });
  }

  updateOrderPayments(balance: number): void {
    this.paymentUpdates = [];
    this.cashUpdate = 0;
    const typeIndex = this.paymentDetails.reduce((result, current, index) => {
      result[current.paymentType] = index;
      return result;
    }, {});
    if (balance > 0) { // item total decrease
      if (typeIndex.hasOwnProperty('CASH')) {
        balance = this.updateOrderPaymentPerId(this.paymentDetails[typeIndex['CASH']], balance);
      }
      if (typeIndex.hasOwnProperty('SALARY_DEDUCTION') && balance > 0) {
        const salaryPayment = this.paymentDetails[typeIndex['SALARY_DEDUCTION']];
        balance = this.updateOrderPaymentPerId(salaryPayment, balance);
        this.updatePbuData(salaryPayment);
      }
      if (typeIndex.hasOwnProperty('GIFT_CERTIFICATE') && balance > 0) {
        this.gcDataUpdate = [];
        this.paymentDetails.forEach((payment) => {
          if (balance > 0 && payment.paymentType === 'GIFT_CERTIFICATE') {
            const gcFind = this.gcData.find(gc => payment.referenceId === gc.code);
            const limit = gcFind ? gcFind.amount : 0;
            balance = this.updateOrderPaymentPerId(payment, balance, limit);
            if (this.paymentUpdates.length) {
              const paymentGcUpdate = this.paymentUpdates[this.paymentUpdates.length - 1];
              if (paymentGcUpdate.id === payment.id &&
                paymentGcUpdate.status === 'Cancelled') {
                this.gcDataUpdate.push(gcFind.code);
              }
            }
          }
        });
      }
    } else { // item total increase
      if (typeIndex.hasOwnProperty('GIFT_CERTIFICATE')) {
        this.paymentDetails.forEach((payment) => {
          if (balance < 0 && payment.paymentType === 'GIFT_CERTIFICATE') {
            const gcFind = this.gcData.find(gc => payment.referenceId === gc.code);
            const limit = gcFind ? gcFind.amount : 0;
            balance = this.updateOrderPaymentPerId(payment, balance, limit);
          }
        });
      }
      if (typeIndex.hasOwnProperty('SALARY_DEDUCTION') && balance < 0) {
        const salaryPayment = this.paymentDetails[typeIndex['SALARY_DEDUCTION']];
        const limit = this.pbuData.availablebalance + salaryPayment.amount;
        balance = this.updateOrderPaymentPerId(salaryPayment, balance, limit);
        this.updatePbuData(salaryPayment);
      }
      if (typeIndex.hasOwnProperty('CASH') && balance < 0) {
        balance = this.updateOrderPaymentPerId(this.paymentDetails[typeIndex['CASH']], balance);
      } else if (balance !== 0) {
        this.cashUpdate = Math.abs(balance);
        this.addCashPayment = {
          amount: this.cashUpdate,
          paymentType: 'CASH',
          referenceId: this.orderSeller.useraccount_id,
          referenceId2: '',
          status: 'Active',
          order_id: Number(this.orderSeller.order_id),
        };
      }
    }
  }

  updateOrderPaymentPerId(payment: any, balance: number, limit?: number): number {
    let amount;
    let isDecrease = false;
    if (balance > 0) { // item total decrease
      isDecrease = true;
      if (payment.amount < balance) {
        amount = 0;
        balance = this.computeDecimal(balance, this.MINUS, payment.amount);
      } else {
        amount = this.computeDecimal(payment.amount, this.MINUS, balance);
        balance = 0;
      }
    } else if (balance < 0) { // item total increase
      amount = this.computeDecimal(Math.abs(balance), this.PLUS, payment.amount);
      if (typeof(limit) !== 'undefined' && amount > limit) {
        balance = -(this.computeDecimal(amount, this.MINUS, limit));
        amount = limit;
        if (payment.amount === amount) {
          return balance;
        }
      } else {
        balance = 0;
      }
    }
    this.paymentUpdates.push({
      id: payment.id,
      amount,
      status: amount === 0 && isDecrease ? 'Cancelled' : payment.status,
      order_id: Number(payment.order_id),
      paymentType: payment.paymentType,
    });
    if (payment.paymentType === 'CASH') {
      this.cashUpdate = amount;
    }
    return balance;
  }

  updatePbuData(salaryPayment: any): void {
    this.pbuDataUpdate = {};
    if (this.paymentUpdates.length) {
      const paymentSalaryUpdate = this.paymentUpdates[this.paymentUpdates.length - 1];
      if (paymentSalaryUpdate.id === salaryPayment.id &&
        paymentSalaryUpdate.amount !== salaryPayment.amount) {
        const amount = this.computeDecimal(paymentSalaryUpdate.amount, this.MINUS, salaryPayment.amount);
        this.pbuDataUpdate = Object.assign(this.pbuDataUpdate, {
          id: this.pbuData.id,
          useraccount_id: this.pbuData.useraccount_id,
          availablebalance: this.computeDecimal(this.pbuData.availablebalance, this.MINUS, amount),
          outstandingbalance: this.computeDecimal(this.pbuData.outstandingbalance, this.PLUS, amount),
        });
      }
    }
  }

  cancelOrder(comments: string): void {
    // TODO: cancel orderpayment details, set gc to unused, refund pbu
    if (!comments) {
      this.isCancelReason = true;
    } else {
      const data = {
        id: this.orderSeller.id,
        selleraccount_id: 0,
        updatedBy: this.userData.id,
        status: 'cancelled',
        comments: comments
      };
      this.adminService.updateOrderSeller(data)
        .takeUntil(this.componentDestroyed)
        .subscribe((res: any) => {
          this.cancelModal.hide();
          if (res.message && res.message.indexOf('Updated') >= 0) {
            this.router.navigate(['/admin/order-assemble']);
          }
        });
    }
  }

  recalculate(): void {
    this.itemsConfirmed = 0;
    this.itemsUnavailable = 0;
    this.itemsQuantity = 0;
    this.itemsTotal = 0;
    this.orderItems.forEach(item => {
      switch (item.status) {
        case 'confirmed':
          this.itemsConfirmed++;
          this.itemsQuantity += Number(item.finalQuantity);
          this.itemsTotal += Number((item.finalQuantity * item.finalPrice).toFixed(2));
          break;
        case 'unavailable':
          this.itemsUnavailable++;
          break;
      }
    });
  }

  showReplacement(item: any): void {
    if (this.selectedItem && this.selectedItem.id === item.id) {
      this.replaceModal.show();
    } else {
      this.selectedItem = item;
      this.substituteItem = null;
      if (item.subItemId) {
        forkJoin([
          this.adminService.getItems({
            limit: 20,
            category2: item.category2,
            partnerId: item.partner_id,
          },this.markUp),
          this.adminService.getItem(item.subItemId)
        ])
          .takeUntil(this.componentDestroyed)
          .subscribe(([replacementItems, substituteItem]) => {
            this.searchItems = replacementItems;
            this.substituteItem = substituteItem;
            this.substituteItem['quantity'] = Number(item.subQuantity);
            this.replaceModal.show();
          });
      } else {
        this.adminService.getItems({
          limit: 20,
          category2: item.category2,
          partnerId: item.partner_id,
        },this.markUp)
          .takeUntil(this.componentDestroyed)
          .subscribe((result) => {
            this.searchItems = result;
            this.replaceModal.show();
          });
      }

    }
  }

  closeReplacement(): void {
    this.searchText = '';
    this.replaceModal.hide();
  }

  searchKeyword(): void {
    let data;
    if (!Number.isNaN(Number(this.searchText))) {
      data = {
        code: Number(this.searchText),
        partnerId: this.selectedItem.partner_id,
        search: 1,
      };
    } else {
      data = {
        limit: 50,
        partnerId: this.selectedItem.partner_id,
        keyword: this.searchText,
        search: 1,
      };
      if (this.selectedItem.isRequest) {
        data['admin'] = 1;
      }
    }
    this.adminService.getItems(data, this.markUp)
      .takeUntil(this.componentDestroyed)
      .subscribe((result) => {
        this.searchItems = result;
      });
  }

  replace(item: any): void {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    const selected = this.selectedItem;
    const data = {
      item: {
        id: selected.orderItem_id,
        finalQuantity: '',
        finalPrice: '',
        status: 'replaced',
      },
      replacement: {
        item_id: item.id,
        price: item.price,
        quantity: item.quantity || selected.quantity,
        orderkey: this.orderSeller.orderkey,
        order_id: this.orderSeller.order_id,
        replaced_orderitem_id: selected.orderItem_id,  
        user_id: selected.user_id,
        status: 'ordered',
      }
    };
    this.adminService.replaceOrderItem(data)
      .do((response) => {
        this.isProcessing = false;
        if (response.message && response.message === 'Replaced') {
          item.orderItem_id = response.id;
          item.item_id = item.id;
          item.quantity = item.quantity || selected.quantity;
          item.price = Number(item.price);
          item.finalPrice = Number(item.price);
          item.finalQuantity = Number(item.quantity);
          item.status = 'ordered';
          item.replaced_orderitem_id = selected.orderItem_id;
  
          const index = this.orderItems.findIndex((element) => element.id === selected.id);
          this.orderItems.splice(index, 1, item);
          this.orderItemStatus[item.orderItem_id] = item.status;
          this.replacedItemsObj[selected.orderItem_id] = selected;
          this.itemsReplaced += 1;
          this.selectedItem = null;
  
          this.closeReplacement();
        } else if (response.type && response.type === 'error') {
          this.adminService.showErrorMsg('Unable to connect to server. Please try again later.');
        } else if (response.message) {
          switch (response.message) {
            case 'Found':
              this.adminService.showErrorMsg('Item already exists in order.');
              break;
            case 'Not Found':
              this.adminService.showErrorMsg(`${selected.name} is not in order.`);
              break;
            default:
              this.adminService.showErrorMsg(response.message);
          }          
        } else {
          this.adminService.showErrorMsg('Error has occurred. Please refresh the page.');
        }
      })
      .takeUntil(this.componentDestroyed)
      .subscribe();
  }

  unreplace(item: any): void {
    const replacedItem = this.replacedItemsObj[item.replaced_orderitem_id];
    const data = {
      id: replacedItem.orderItem_id,
      finalQuantity: '',
      finalPrice: '',
      status: 'ordered',
    };
    this.adminService.unreplaceOrderItem(item.orderItem_id, data)
      .takeUntil(this.componentDestroyed)
      .subscribe((response) => {
        if(response.message && response.message === 'Deleted') {
          this.orderItemStatus[replacedItem.orderItem_id] = 0;
          replacedItem.status = 'ordered';
          replacedItem.finalQuantity = replacedItem.quantity;
          replacedItem.finalPrice = replacedItem.price;
          const index = this.orderItems.findIndex((element) => element.id === item.id);
          this.orderItems.splice(index, 1, replacedItem);
          delete this.replacedItemsObj[replacedItem.orderItem_id];
          this.itemsReplaced--;
          this.recalculate();
        } else if (response.type && response.type === 'error') {
          this.adminService.showErrorMsg('Unable to connect to server. Please try again later.');
        } else if (response.message) {
          switch (response.message) {
            case 'Not Found 1':
              this.adminService.showErrorMsg(`${replacedItem.name} is not in order.`);
              break;
            case 'Not Found 2':
              this.adminService.showErrorMsg(`${item.name} is not in order.`);
              break;
            default:
              this.adminService.showErrorMsg(response.message);
          }
        } else {
          this.adminService.showErrorMsg('Error has occurred. Please refresh the page.');
        }
      });
  }

  createText(): void {
    this.checkDataDiscrepancy();
    const replaceItems = [];
    const unavailableItems = [];
    this.orderItems.forEach((item) => {
      if (item.replaced_orderitem_id && this.replacedItemsObj[item.replaced_orderitem_id]) {
        const rItem = this.replacedItemsObj[item.replaced_orderitem_id];
        replaceItems.push(`${rItem.quantity} x ${rItem.name} = ₱${rItem.price.toFixed(2)}\n`);
        replaceItems.push('SUGGESTED REPLACEMENT:\n');
        replaceItems.push(`${item.finalQuantity} x ${item.name} = ₱${item.finalPrice.toFixed(2)}\n\n`);
      } else if (item.status === 'unavailable') {
        unavailableItems.push(`- ${item.name}\n`);
      }
    });
    const text = [];
    text.push(`Hi ${this.orderSeller.firstname},\n\n`);
    text.push(`I'm ${this.userData.name.split(' ')[0]}, your OMG! shopper. `);
    text.push(`I'm shopping for your order (Order# ${this.orderSeller.number}).\n\n`);
    if (replaceItems.length) {
      text.push('FYI, some items from your order are not available:\n');
      text.push(replaceItems.join(''));
      text.push('I will be checking out your order soon. ');
      text.push('I hope to hear from you if you\'re okay with my suggested replacement. Thanks!\n');
    }
    if (unavailableItems.length) {
      if (replaceItems.length) {
        text.push('\n');
      }
      text.push('So sorry to inform you that the ff is/are not available:\n');
      text.push(unavailableItems.join(''));
    }
    text.push('\nYou will be receiving an email with the updated order details and total for your reference. ');
    text.push('Our customer service person will also contact you for any payment adjustments including credits/refunds ');
    text.push('if applicable. Please allow 3-5 business days for processing.');
    this.textTemplate = text.join('');
    this.textTemplateModal.show();
  }

  copyText(textArea: any): void {
    textArea.select();
    document.execCommand('copy');
    textArea.setSelectionRange(0, 0);
  }

  private computeDecimal(num1: number, operation: string, num2: number): number {
    switch (operation) {
      case this.PLUS:
        return Number((num1 + num2).toFixed(2));
      case this.MINUS:
        return Number((num1 - num2).toFixed(2));
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const number = window.scrollY;
    if (number > 60) {
      this.isSticky = true;
    } else {
      this.isSticky = false;
    }
  }
}
