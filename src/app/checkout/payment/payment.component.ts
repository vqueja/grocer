import { Component, OnInit, OnDestroy, ViewChild, Input, ElementRef, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from './../../interfaces';
import { CheckoutActions } from './../actions/checkout.actions';
import { getOrderId, getShipAddress, getBillAddress, getDeliveryDate, getGiftCerts,
  getGrandTotal, getTotalCartItems, getTotalCartValue, getCartItems, getOrderState,
  getTotalDiscount, getTotalAmtDue, getTotalAmtPaid, getCoupon, getPaymentDetails, getServiceFee,
  getDeliveryFee } from './../reducers/selectors';
import { getAuthStatus } from './../../auth/reducers/selectors';
import { AuthService } from './../../core/services/auth.service';
import { CheckoutService } from './../../core/services/checkout.service';
import { ThirdPartyService } from './../../core/services/thirdparty.service';
import { CartItem } from './../../core/models/cart_item';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})

export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('gCode') gCode: ElementRef;
  @ViewChild('gc') gc: ElementRef;
  @ViewChild('cod') cod: ElementRef;
  @ViewChild('loadingModal') loadingModal;
  totalCartValue$: Observable<number>;
  totalCartItems$: Observable<number>;
  serviceFee$: Observable<number>;
  deliveryFee$: Observable<number>;
  totalAmountDue$: Observable<number>;
  totalAmountPaid$: Observable<number>;
  tempDiscount$: Observable<any>;
  shipAddress$: Observable<any>;
  billAddress$: Observable<any>;
  deliveryDate$: Observable<any>;
  orderNumber$: Observable<string>;
  grandTotal$: Observable<number>;
  cartTotal$: Observable<number>;
  cartItems$: Observable<CartItem[]>;
  isAuthenticated$: Observable<boolean>;
  coupon$: Observable<any>;
  paymentDetails$: Observable<any>;
  giftCertList$: Observable<any>;
  // orderStatus: string;
  orderId: number;
  cartItems: Array<CartItem> = [];
  cartTotal: number = 0;
  grandTotal: number = 0;
  totalAmountDue: number = 0;
  totalAmountPaid: number = 0;
  actualServiceFee: number = 0.00;
  actualDeliveryFee: number = 0.00;
  deliveryDate: any;
  gcList: Array<any>;
  bCouponEntered: boolean;
  couponErrorMsg: string = '';
  couponIcon: string;
  couponCode: string; // NOTE: ngModel
  couponData: any;
  checkedGC: boolean; // NOTE: ngModel
  checkedCash: boolean; // NOTE: ngModel
  checkedPP: boolean; // NOTE: ngModel
  checkedCC: boolean; // NOTE: ngModel
  checkedPBU: boolean; // NOTE: ngMODEL
  checkedPayMaya: boolean; // NOTE: ngMODEL
  instructionsText: string = ''; // NOTE: ngModel
  userData: any;
  pbUserData: any;
  availableBalance: number = 0.00;
  availableBalanceDisplay: number = 0.00;
  confirmOrderId: any;
  payMayaData: any;
  private componentDestroyed: Subject<any> = new Subject();


  constructor(
    private store: Store<AppState>,
    private router: Router,
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private checkoutAction: CheckoutActions,
    private authService: AuthService,
    private thirdPartyService: ThirdPartyService,
    @Inject(DOCUMENT) private document: Document
  ) {
      // this.store.select(getOrderState).subscribe(status => this.orderStatus = status);
  }

  ngOnInit() {
    this.checkedCash = false;
    this.checkedPP = false;
    this.checkedCC = false;
    this.checkedGC = false;
    this.couponCode = '';
    this.couponIcon = 'glyphicon glyphicon-tag text-default';
    this.bCouponEntered = false;
    this.gcList = [];
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.removeCoupon();

    this.store.select(getOrderId)
    .takeUntil(this.componentDestroyed)
    .subscribe((id) => {
      if (id) {
        this.orderId = id;
        this.confirmOrderId = id;
        this.shipAddress$ = this.store.select(getShipAddress);
        this.billAddress$ = this.store.select(getBillAddress);
        this.cartTotal$ = this.store.select(getTotalCartValue);
        this.grandTotal$ = this.store.select(getGrandTotal);
        this.tempDiscount$ = this.store.select(getTotalDiscount);
        this.totalAmountPaid$ = this.store.select(getTotalAmtPaid);
        this.totalAmountDue$ = this.store.select(getTotalAmtDue);
        this.serviceFee$ = this.store.select(getServiceFee);
        this.deliveryFee$ = this.store.select(getDeliveryFee);
        this.cartItems$ = this.store.select(getCartItems);
        this.deliveryDate$ = this.store.select(getDeliveryDate);
        this.isAuthenticated$ = this.store.select(getAuthStatus);
        this.giftCertList$ = this.store.select(getGiftCerts);
        this.paymentDetails$ = this.store.select(getPaymentDetails);
        this.coupon$ =  this.store.select(getCoupon);
        this.initSubscriptions();
      }
    });
  }

  initSubscriptions(): void {
    this.authService.getPartnerBuyerUser(this.userData.id)
      .mergeMap((data) => {
        this.pbUserData = data;
        if (this.pbUserData.status === 'enabled') {
          return this.checkoutService.getPartner(this.pbUserData.partner_id)
        }
        return Observable.of(false);
      })
      .map((partner: any) => {
        if (partner && partner.salaryDeduction === 1) {
          this.availableBalance = this.pbUserData['availablebalance'];
          if (!this.checkedPBU) {
            this.availableBalanceDisplay = this.availableBalance;
          }
        }
      })
      .takeUntil(this.componentDestroyed)
      .subscribe();
    this.totalAmountPaid$
      .takeUntil(this.componentDestroyed)
      .subscribe((amountPaid) => this.totalAmountPaid = amountPaid);
    this.grandTotal$
      .takeUntil(this.componentDestroyed)
      .subscribe((total) => this.grandTotal = total);
    this.cartTotal$
      .takeUntil(this.componentDestroyed)
      .subscribe((cartTotal) => {
        this.cartTotal = cartTotal;
        this.store.dispatch(this.checkoutAction.updateAmountPaid({ type: 'refresh' }));
      });
    this.cartItems$
      .takeUntil(this.componentDestroyed)
      .subscribe((cartItems) => {
        this.cartItems = cartItems;
        if (!cartItems.length) {
          // this.router.navigate(['/checkout', 'cart']);
        }
      });
    this.serviceFee$
      .takeUntil(this.componentDestroyed)
      .subscribe((serviceFee) => {
        if(serviceFee != null) {
          this.actualServiceFee = serviceFee;
        }
    });
    this.deliveryFee$
      .takeUntil(this.componentDestroyed)
      .subscribe((deliveryFee) => {
        if(deliveryFee != null) {
          this.actualDeliveryFee = deliveryFee;
        }
      });
    this.totalAmountDue$
      .takeUntil(this.componentDestroyed)
      .subscribe((amountDue) => this.totalAmountDue = amountDue);
    this.coupon$.takeUntil(this.componentDestroyed).subscribe((coupon) => {
      if (coupon && coupon.id) {
        this.couponData = coupon;
        this.couponCode = coupon.code;
        this.bCouponEntered = true;
        this.couponIcon = 'glyphicon glyphicon-ok text-success';
      } else {
        this.couponIcon = 'glyphicon glyphicon-tag text-default';
        this.couponCode = '';
      }
    });
    this.deliveryDate$.takeUntil(this.componentDestroyed).subscribe((deliveryDate) => {
      if (!deliveryDate.timeslotId) {
        // this.goBack();
      } else {
        this.deliveryDate = deliveryDate;
      }
    });
    this.paymentDetails$.takeUntil(this.componentDestroyed).subscribe((paymentDetails) => {
      if (typeof(paymentDetails.salaryBalance) !== 'undefined') {
        this.checkedPBU = true;
        this.availableBalanceDisplay = paymentDetails.salaryBalance;
      } else {
        if (this.pbUserData && this.pbUserData.availablebalance) {
          this.availableBalanceDisplay = this.pbUserData.availablebalance;
        } else {
          this.availableBalanceDisplay = 0;
        }
      }
      if (typeof(paymentDetails.gcList) !== 'undefined') {
        this.gcList = paymentDetails.gcList;
        if (this.gcList.length) {
          this.checkedGC = true;
        }
      } else {
        this.gcList = [];
      }
      if (typeof(paymentDetails.paymaya) !== 'undefined') {
        this.checkedPayMaya = !!paymentDetails.paymaya;
      }
    });
  }

  toggleCheckBox(event): void {
    switch (event.target.name) {
      case 'cod':
        if (this.checkedPayMaya) {
          this.store.dispatch(this.checkoutAction.updateAmountPaid({
            type: 'paymaya',
            balance: 0,
          }));
        }
        this.checkedPayMaya = false;
        this.checkedCash = !this.checkedCash;
        break;
      case 'pbu':
        this.checkedPayMaya = false;
        this.checkedPBU = !this.checkedPBU;
        this.store.dispatch(this.checkoutAction.updateAmountPaid({
          type: 'salary',
          balance: this.checkedPBU ? this.pbUserData.availablebalance : 0,
        }));
        break;
      case 'gc':
        this.checkedPayMaya = false;
        this.checkedGC = !this.checkedGC;
        if (!this.checkedGC) {
          this.removeGiftCertificate();
        }
        break;
      case 'paymaya':
        this.checkedPBU = false;
        this.checkedCash = false;
        this.checkedGC = false;
        this.checkedPayMaya = !this.checkedPayMaya;
        this.store.dispatch(this.checkoutAction.updateAmountPaid({
          type: 'paymaya',
          balance: this.checkedPayMaya ? 1 : 0,
        }));
        break;
      default:
        break;
    }
  }

  applyCoupon(): void {
    if (this.couponCode !== '') {
      this.checkoutService.checkVoucher({
        code: this.couponCode,
        userId: this.userData.id,
        amount: this.grandTotal,
      })
        .takeUntil(this.componentDestroyed)
        .subscribe((coupon) => {
          this.couponIcon = 'glyphicon glyphicon-remove text-danger';
          switch (coupon.message.toUpperCase()) {
            case 'VALID':
              this.couponIcon = 'glyphicon glyphicon-ok text-success';
              this.bCouponEntered = true;
              this.couponErrorMsg = '';
              this.couponData = {
                id: coupon.id,
                code: coupon.code,
                value: Number(coupon.discount),
              };
              this.store.dispatch(this.checkoutAction.applyCoupon(this.couponData));
              this.store.dispatch(this.checkoutAction.updateAmountPaid({ type: 'refresh' }));
              break;
            case 'DATE EXPIRED':
              this.couponErrorMsg = 'Coupon is expired.';
              break;
            case 'USAGE LIMIT':
              this.couponErrorMsg = 'Maximum usage limit for coupon has reached. Please use another.';
              break;
            case 'BELOW MINIMUM':
              this.couponErrorMsg = `Total amount must reach ₱${Number(coupon.minimum).toFixed(2)} to use this coupon.`;
              break;
            case 'INACTIVE': // NOTE: break intentionally omitted
            case 'NOT FOUND': // NOTE: break intentionally omitted
            default:
              this.couponErrorMsg = 'Coupon is not valid.';
          }
        });
    }
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponData = {};
    this.couponIcon = 'glyphicon glyphicon-tag text-default';
    this.bCouponEntered = false;
    this.store.dispatch(this.checkoutAction.removeCoupon());
    this.store.dispatch(this.checkoutAction.updateAmountPaid({ type: 'refresh' }));
  }

  addGiftCertificate(code): void {
    if (code.value === '' || (this.gcList.length && (this.gcList.find(gc => gc.code === code.value)))) {
      this.checkoutService.showErrorMsg('', 'Please enter another gift certificate.');
    } else {
      this.checkoutService.getGC(code.value)
        .takeUntil(this.componentDestroyed)
        .subscribe((data) => {
          if (data.message) {
            this.checkoutService.showErrorMsg('', `Gift certificate ${code.value} not found.`);
          } else if (data.status === 'used' || data.expired) {
            this.checkoutService.showErrorMsg('', `Gift certificate ${code.value} is no longer available.`);
          } else {
            const cloneGcList = this.gcList.slice();
            cloneGcList.push({
              code: code.value,
              value: data.amount
            });
            let gcTotal = 0;
            cloneGcList.forEach(gc => gcTotal += gc.value);
            this.store.dispatch(this.checkoutAction.updateAmountPaid({
              type: 'gc',
              balance: gcTotal,
              gcList: cloneGcList,
            }));
            this.gCode.nativeElement.value = '';
          }
        });
    }
  }

  removeGiftCertificate(): void {
    this.store.dispatch(this.checkoutAction.updateAmountPaid({
      type: 'gc',
      balance: 0,
      gcList: [],
    }));
  }

  goBack(): void {
    this.router.navigate(['/checkout', 'address', {deliveryOptions: true}]);
  }

  redirectToHome(): void {
    this.router.navigate(['/']);
  }

  validateOrder(): void {
    // TODO: check GC, Voucher, Timeslotorder
    let errorMsg = '';
    if (!this.orderId) {
      errorMsg = 'Apologies! I am unable to continue! Please cancel your order, refresh the page and try again.';
    } else if (!this.deliveryDate) {
      errorMsg = 'No delivery time slot selected. Please go back to the previous page and select a time slot.';
    } else if (!this.checkedGC && !this.checkedPBU && !this.checkedCash && !this.checkedPayMaya) {
      errorMsg = 'Please select a payment method';
    } else if (this.checkedGC && !this.gcList.length) {
      errorMsg = 'Enter a gift certificate code.';
    } else if (this.totalAmountDue > 0 && !this.checkedCash) {
      if (this.checkedGC) {
        errorMsg = 'You do not have enough credit for this purchase. ';
        errorMsg += 'Please select another a payment method or add another gift certificate.';
      } else {
        errorMsg = 'You do not have enough credit for this purchase. Please select another a payment method.';
      }
    }
    if (errorMsg !== '') {
      this.checkoutService.showErrorMsg('', errorMsg);
      return;
    }
    if (this.checkedPayMaya) {
    // NOTE: PayMaya payment
      this.connectPayMaya()
        .takeUntil(this.componentDestroyed)
        .subscribe((result: any) => {
          if (result.message) {
            this.checkoutService.showErrorMsg('', 'We are unable to connect to PayMaya right now. Please try again or select another payment method');
          } else {
            this.payMayaData = result;
            this.processOrder();
          }
        });
    } else {
    // NOTE: Cash, Gift Cerficate, Salary Deduction payment
      combineLatest([
        this.checkedGC
          ? forkJoin(this.gcList.map(gc => this.checkoutService.getGC(gc.code)))
          : Observable.of(false),
        this.couponCode
          ? this.checkoutService.checkVoucher({
              code: this.couponCode,
              userId: this.userData.id,
              amount: this.grandTotal,
            })
          : Observable.of(false)
      ])
        .takeUntil(this.componentDestroyed)
        .subscribe(([gcResult, couponResult]) => {
          let isError = false;
          const usedGc = [];
          if (gcResult) {
            for (let i = 0; i < gcResult.length; i++) {
              if (gcResult[i].status === 'used' || gcResult[i].expired) {
                isError = true;
                usedGc.push(gcResult[i].code);
              }
            }
            if (isError) {
              this.checkoutService.showErrorMsg('', `Gift certificate(s) ${usedGc.join(' ,')} no longer available.`);
            }
          }
          if (couponResult && !isError) {
            const coupon = (couponResult as any);
            const message = coupon.message.toUpperCase();
            if (message !== 'VALID') {
              isError = true;
              let errorMessage = '';
              switch (message) {
                case 'DATE EXPIRED':
                  errorMessage = 'Coupon is expired.';
                  break;
                case 'USAGE LIMIT':
                  errorMessage = 'Maximum usage limit for coupon has reached. Please use another.';
                  break;
                case 'BELOW MINIMUM':
                  errorMessage = `Total amount must reach ₱${Number(coupon.minimum).toFixed(2)} to use this coupon.`;
                  break;
                case 'INACTIVE': // NOTE: break intentionally omitted
                case 'NOT FOUND': // NOTE: break intentionally omitted
                default:
                  errorMessage = 'Coupon is not valid.';
              }
              this.checkoutService.showErrorMsg('', errorMessage);
            }
          }
          if (!isError) {
            this.processOrder();
          }
        });
    }
  }

  processOrder(): void {
    this.loadingModal.show();
    const status = this.checkedPayMaya ? 'payment' : 'pending';
    const orderDetails = {
      id: this.confirmOrderId,
      specialInstructions: this.instructionsText,
      paymentTotal: this.totalAmountPaid.toFixed(2),
      discountTotal: this.bCouponEntered ? this.couponData.value.toFixed(2) : 0,
      serviceFee: this.actualServiceFee.toFixed(2),
      deliveryFee: this.actualDeliveryFee.toFixed(2),
      adjustmentTotal: this.totalAmountDue.toFixed(2),
      total: this.grandTotal.toFixed(2),
      status,
      useraccount_id: this.userData.id,
      voucherCode: this.bCouponEntered ? this.couponCode : '',
    };
    const timeslotOrder = {
      order_id: this.confirmOrderId,
      timeslot_id: this.deliveryDate.timeslotId,
      storeTimeslot_id: this.deliveryDate.storeTimeslotId,
      date: this.deliveryDate.date,
      datetime: this.deliveryDate.datetime,
    };
    const paymentDetails = [];
    const pbuData = {};
    if (this.checkedPayMaya) {
      paymentDetails.push({
        order_id: this.confirmOrderId,
        amount: this.totalAmountPaid.toFixed(2),
        paymentType: 'PAYMAYA',
        referenceId: this.payMayaData.checkoutId,
        referenceId2: '',
        status: 'Active',
      });
    } else {
      if (this.checkedCash && this.totalAmountDue > 0) {
        paymentDetails.push({
          order_id: this.confirmOrderId,
          amount: this.totalAmountDue.toFixed(2),
          paymentType: 'CASH',
          referenceId: this.userData.id,
          referenceId2: '',
          status: 'Active',
        });
      }
      if (this.checkedPBU) {
        const salaryDeduction = this.pbUserData.availablebalance - this.availableBalanceDisplay;
        pbuData['useraccount_id'] = this.pbUserData.useraccount_id;
        pbuData['outstandingbalance'] = this.pbUserData.outstandingbalance + salaryDeduction;
        pbuData['availablebalance'] = this.availableBalanceDisplay;
        paymentDetails.push({
          order_id: this.confirmOrderId,
          amount: salaryDeduction.toFixed(2),
          paymentType: 'SALARY_DEDUCTION',
          referenceId: this.pbUserData['useraccount_id'],
          referenceId2: this.pbUserData['partner_id'],
          status: 'Active',
        });
      }
      if (this.checkedGC) {
        this.gcList.forEach((gc) => {
          paymentDetails.push({
            order_id: this.confirmOrderId,
            amount: gc.value,
            paymentType: 'GIFT_CERTIFICATE',
            referenceId: gc.code,
            referenceId2: '',
            status: 'Active',
          });
        });
      }
    }

    const payload = {
      order: orderDetails,
      timeslotOrder: timeslotOrder,
      gcList: this.gcList,
      pbu: this.checkedPBU ? pbuData : 0,
      paymentDetails: paymentDetails,
    };
    const orderKey = this.checkoutService.getOrderKey();
    this.checkoutService.processOrderPayment(payload)
      .takeUntil(this.componentDestroyed)
      .subscribe((result) => {
        if (result.message === 'Processed') {
          if (this.checkedPayMaya) {
            this.document.location.href = this.payMayaData.redirectUrl;
          } else {
            this.router.navigate(['/checkout', 'confirm', orderKey]);
          }
        } else {
          this.loadingModal.hide();
          this.checkoutService.showErrorMsg('', `Error Occurred: ${result.message}`);
        }
      });
  }

  connectPayMaya(): Observable<any> {
    // NOTE: Paymaya API objects
    // https://developers.paymaya.com/blog/entry/paymaya-checkout-api-overview
    return forkJoin([
      this.cartItems$.take(1),
      this.shipAddress$.take(1),
      this.billAddress$.take(1),
    ])
      .map((results: Array<any>) => {
        console.log(results);
        const [cartItems, shipAddress, billAddress] = results;
        const shippingAddress = {
          line1: shipAddress.shippingAddress01,
          line2: shipAddress.shippingAddress02,
          city: shipAddress.city,
          // state: ''
          zipCode: shipAddress.postalcode,
          countryCode: 'PH',
        };
        const buyer = {
          firstName: shipAddress.firstName,
          // middleName: '',
          lastName: shipAddress.lastName,
          contact: {
            phone: shipAddress.phone,
            email: shipAddress.email,
          },
          shippingAddress,
          billingAddress: !billAddress.billingAddress01 ? shippingAddress : {
            line1: billAddress.billingAddress01,
            line2: billAddress.billingAddress02,
            city: billAddress.billCity,
            // state: ''
            zipCode: billAddress.billPostalcode,
            countryCode: 'PH',
          },
          // ipAddress: '0.0.0.0'
        };
        const items = cartItems.map((item) => {
          return {
            name: item.item.name,
            code: item.item.code,
            description: `Store ID: ${item.item.partner_id}`,
            quantity: item.quantity,
            amount: {
              value: item.price,
              // details: {
              //   discount: 100.00,
              //   subtotal: 1721.10
              // }
            },
            totalAmount: {
              value: item.total.toFixed(2),
              // details: {
              //   discount: 300.00,
              //   subtotal: 5163.30
              // }
            }
          };
        });

        const omgUrl = `${this.document.location.protocol}//${this.document.location.host}`;
        const orderKey = this.checkoutService.getOrderKey();
        const data = {
          totalAmount: {
            currency: 'PHP',
            value: this.grandTotal.toFixed(2),
            details: {
              discount: this.bCouponEntered ? this.couponData.value.toFixed(2) : 0,
              serviceCharge: this.actualServiceFee.toFixed(2),
              shippingFee: this.actualDeliveryFee.toFixed(2),
              // tax: 0,
              subtotal: this.cartTotal.toFixed(2)
            }
          },
          buyer,
          items,
          redirectUrl: {
            success: `${omgUrl}/checkout/confirm/${orderKey}?type=paymaya&status=success`,
            failure: `${omgUrl}/checkout/confirm/${orderKey}?type=paymaya&status=failure`,
            cancel: `${omgUrl}/checkout/confirm/${orderKey}?type=paymaya&status=cancel`,
          },
          requestReferenceNumber: `${this.orderId}`,
          // metadata: {}
        };
        return data;
      })
      .mergeMap((data) => this.thirdPartyService.postPaymaya(data));

  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

}
