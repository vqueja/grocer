import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../services/admin.service';
import { AdminVarsService } from '../../../services/admin-vars.service';
import { defaultIfEmpty } from 'rxjs/operator/defaultIfEmpty';


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  actionSub: Subscription;
  orderSeller: any;
  orderItems: Array<any> = [];
  orderItemsData: Array<any> = [];
  replacedItems: Array<any> = [];
  discrepancyItems: Array<any> = [];
  activeUser: any;
  orderPayments: Array<any> = [];
  partnerStoreData: any;
  @ViewChild('unassignModal') unassignModal;
  @ViewChild('sendPOModal') sendPOModal;
  @ViewChild('printListModal') printListModal;
  printListData: any = {
    number: null,
    date: null,
    code: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
  ) { }

  ngOnInit() {
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    this.printListData.date = new Date();
    this.routeSub = this.route.params
      .switchMap((params: any) => this.adminService.getSellerOrder(params.id))
      .switchMap((order: any) => {
        order['time'] = this.adminVarsService.ORDER_TIMESLOT[Number(order.timeslot_id - 1) % 5];
        this.printListData.number = order.orderNumber.match(/.{1,4}/g).join('-');
        this.printListData.date = new Date(order.date);
        this.printListData.code = `T${0}`;
        switch(order.addressType) {
          case 1:
            order['addressTypeStr'] = 'Personal Address';
            break;
          case 2:
            order['addressTypeStr'] = 'Office Address';
            break;
          case 3:
            order['addressTypeStr'] = 'Easy Pick-Up';
            break;
          default:
        }
        this.orderSeller = order;
        return forkJoin([
          this.adminService.getOrderItems(order.order_id),
          this.adminService.getPaymentDetailsPerOrder(order.order_id),
          this.adminService.getPartner(order.partner_id)
        ]);
      })
      .do(([orderItems, orderPayments, partner]) => {
        this.partnerStoreData = partner;
        this.orderItemsData = orderItems;
        orderItems.forEach((item, index) => {
          switch (item.status) {
            case 'replaced':
              this.replacedItems.push(item);
              break;
            default:
              item.quantity = Number(item.quantity);
              item.finalQuantity = item.finalQuantity ? Number(item.finalQuantity) : item.quantity;
              item.finalPrice = item.finalPrice ? Number(item.finalPrice) : Number(item.itemPrice);
              this.orderItems.push(item);
          }
        });
        this.replacedItems.forEach((replaced) => {
          const index = this.orderItems.map((item) => item.replaced_orderitem_id)
            .indexOf(replaced.orderItem_id);
          if (index >= 0) {
            this.orderItems[index]['replaced'] = replaced;
          } else {
            this.discrepancyItems.push({
              item: replaced,
              status: 'Replaced item with no matching replacement item'
            });
          }
        });
        const count = {};
        this.orderItems.forEach((item) => {
          if (item.replaced_orderitem_id && !item.replaced) {
            this.discrepancyItems.push({
              item,
              status: 'Replacement item with no matching original item',
            });
          }
          if (count[item.id]) {
            this.discrepancyItems.push({
              item,
              status: 'Duplicate item',
            });
          } else {
            count[item.id] = item.id;
          }
        });

        this.orderPayments = orderPayments.map((payment) => {
          switch (payment.paymentType) {
            case 'CASH':
              payment['label'] = 'Fund Transfer';
              break;
            case 'GIFT_CERTIFICATE':
              payment['label'] = `Gift Certificate (code: ${payment.referenceId})`;
              break;
            case 'SALARY_DEDUCTION':
              payment['label'] = 'My Credit';
              break;
            default:
          }
          return payment;
        });
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.actionSub) {
      this.actionSub.unsubscribe();
    }
  }

  showButton(button: string): boolean {
    const status = this.orderSeller.status.toUpperCase();
    switch (button) {
      case 'TAKE':
        return status === 'PENDING';
      case 'CONTINUE':
        return (status === 'IN-PROGRESS' && this.orderSeller.assembledBy === this.activeUser.id);
      case 'READONLY' :
        return (status === 'IN-PROGRESS' && this.orderSeller.assembledBy !== this.activeUser.id);
      case 'CONTINUE-DELIVER':
        return (status === 'IN-TRANSIT' || status === 'RETURNED' && this.orderSeller.assembledBy === this.activeUser.id);
      case 'DELIVER':
        return status === 'ASSEMBLED';
      case 'UNASSIGN':
        return (status === 'IN-TRANSIT' || status === 'IN-PROGRESS');
    }
  }

  takeOrder(): void {
    this.actionSub = this.adminService.updateOrderSeller({
      id: this.orderSeller.id,
      selleraccount_id: this.activeUser.id,
      assembledBy: this.activeUser.id,
      updatedBy: this.activeUser.id,
      status: 'in-progress',
    })
      .subscribe((response: any) => {
        if (response && response.message.indexOf('Updated') >= 0) {
          this.router.navigate(['/admin/order-assemble/edit', this.orderSeller.id]);
        }
      });
  }

  deliverOrder(): void {
    this.actionSub = this.adminService.updateOrderSeller({
      id: this.orderSeller.id,
      selleraccount_id: this.activeUser.id,
      deliveredBy: this.activeUser.id,
      updatedBy: this.activeUser.id,
      status: 'in-transit',
    })
      .subscribe((response: any) => {
        if (response && response.message.indexOf('Updated') >= 0) {
          this.router.navigate(['/admin/order-assemble/view', this.orderSeller.id]);
        }
      });
  }

  confirmUnassign(): void {
    const data = {
      id: this.orderSeller.id,
      selleraccount_id: 0,
      updatedBy: this.activeUser.id,
      status: '',
      assembledBy: 0,
      deliveredBy: 0,
    };
    if (this.orderSeller.status.toUpperCase() === 'IN-PROGRESS') {
      data.status = 'pending';
      delete data.deliveredBy;
    } else if (this.orderSeller.status.toUpperCase() === 'IN-TRANSIT') {
      data.status = 'assembled';
      delete data.assembledBy;
    }
    this.actionSub = this.adminService.updateOrderSeller(data)
      .subscribe((response: any) => {
        this.unassignModal.hide();
        if (response && response.message.indexOf('Updated') >= 0) {
          if (this.orderSeller.status.toUpperCase() === 'IN-PROGRESS') {
            this.orderSeller.status = 'pending';
            this.orderSeller.assembledBy = 0;
            this.orderSeller.assembledByName = '';
            this.orderSeller.selleraccount_id = 0;
          } else {
            this.orderSeller.status = 'assembled';
            this.orderSeller.deliveredBy = 0;
            this.orderSeller.deliveredByName = '';
            this.orderSeller.selleraccount_id = 0;
          }
        }
      });
  }

  getProductImageUrl(key: string): string {
    return key ? `${environment.IMAGE_REPO}${key}.jpg` : this.adminVarsService.ITEM_DEFAULT_IMG;
  }

  onImageError(e: any): void {
    e.target.src = this.adminVarsService.ITEM_DEFAULT_IMG;
  }

  printList(): void {
    const diff = new Date(this.orderSeller.date.replace(/-/g, "/")).getTime() - this.printListData.date.getTime();
    const days = Math.ceil((diff) / (1000 * 60 * 60 * 24));
    this.printListData.code = `T${days}`;
    this.printListModal.hide();
    window.setTimeout(() => window.print(), 500);
  }

  sendPurchaseOrder(): void {
    this.sendPOModal.hide();
    this.actionSub = this.adminService.sendPurchaseOrder(this.orderSeller.order_id)
      .subscribe((response: any) => {
      });
  }

  sendConfirmationEmail(): void {
    if (this.orderSeller.status !== 'pending') {
      return;
    }
    this.actionSub = this.adminService.sendConfirmationEmail(this.orderSeller.order_id)
      .subscribe((response: any) => {
      });
  }
}
