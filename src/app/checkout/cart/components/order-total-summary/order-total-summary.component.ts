import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { getOrderState } from './../../../reducers/selectors';
import { CheckoutActions } from './../../../actions/checkout.actions';
import { CheckoutService } from './../../../../core/services/checkout.service';
import { AppState } from './../../../../interfaces';


@Component({
  selector: 'app-order-total-summary',
  templateUrl: './order-total-summary.component.html',
  styleUrls: ['./order-total-summary.component.scss']
})
export class OrderTotalSummaryComponent implements OnInit, OnDestroy {
  checkoutSub: Subscription;
  stateSub: Subscription;
  orderStatus: string;
  serviceFee: number;
  deliveryFee: number;
  promoSFee: number;
  promoDFee: number;
  sFee: any;
  dFee: any;
  promo_sFee: any;
  promo_dFee: any;
  @Input() totalCartValue: number;
  @Input() totalCartItems: number;
  @Input() totalDiscounts: number;
  @Input() totalAmtDue: number;
  @Input() grandTotal: number;
  @Input() serviceFees: number;
  @Input() deliveryFees: number;
  @Input() promoServiceFees: number;
  @Input() promoDeliveryFees: number;
  @Input() partnerStore: any;
  @Input() isAuth: boolean;
  @ViewChild('coupon') coupon: ElementRef;
  @ViewChild('appCoupon') appCoupon: ElementRef;
  totalDiscount$: Subscription;
  grandTotalContainer: number = 0;
  isDeliveryPromo : boolean = false;
  isServicePromo : boolean = false;
  forCoupon: any;
  errMsg: string;
  isShowErrMsg: boolean = false;
  partnerThreshold: any;


  constructor(private store: Store<AppState>,
    private actions: CheckoutActions,
    private checkoutService: CheckoutService,
    private router: Router) {
    this.stateSub = this.store.select(getOrderState)
      .subscribe(state => this.orderStatus = state);
  }

  ngOnInit() {
    // const settings = JSON.parse(localStorage.getItem('settings'));
    const partner = JSON.parse(localStorage.getItem('partner'));

    this.promoSFee = 0.00
    this.promoDFee = 0.00

    if (partner) {
      this.partnerThreshold = partner.threshold;
      this.serviceFee = partner.serviceFee;
      this.deliveryFee = partner.deliveryFee;
      if (partner.isZeroServiceFee === 0) {
        if (partner.serviceFee > 0) {
            if (partner.promoServiceFee > 0) {
              this.promoSFee = partner.promoServiceFee;
              this.isServicePromo = true;
            }
        }
      } else {
        this.promoSFee = 0.00;
        this.isServicePromo = true;
      }
      if (partner.isZeroDeliveryFee === 0) {
        if (partner.deliveryFee > 0) {
          if (partner.promoDeliveryFee > 0) {
            this.promoDFee = partner.promoDeliveryFee;
            this.isDeliveryPromo = true;
          }
        }
      } else {
        this.promoDFee = 0.00;
        this.isDeliveryPromo = true;
      }
    }

    if (this.isDeliveryPromo == true && this.isServicePromo == true) {
      this.grandTotalContainer = Number(this.totalCartValue) + this.promoSFee + this.promoDFee - this.totalDiscounts;
    } else if (this.isDeliveryPromo == true) {
      this.grandTotalContainer = Number(this.totalCartValue) + this.serviceFee  + this.promoDFee - this.totalDiscounts;
    } else if (this.isServicePromo == true) {
      this.grandTotalContainer = Number(this.totalCartValue) + this.promoSFee  + this.deliveryFee - this.totalDiscounts;
    } else {
      this.grandTotalContainer = Number(this.totalCartValue) + this.serviceFee + this.deliveryFee - this.totalDiscounts;
    }

    this.totalAmtDue = this.grandTotalContainer;
  }

  placeOrder() {
    if (!this.isAuth) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout/cart' }});
    } else {
      if (this.totalDiscounts == null) {
        this.totalDiscounts = 0;
      }
      this.checkoutSub = this.checkoutService.updateOrder({
        status: 'cart',
        totalQuantity: this.totalCartItems,
        itemTotal: this.totalCartValue,
        total: this.grandTotalContainer,
        discount: this.totalDiscounts,
        adjustmentTotal: this.totalAmtDue,
        partner_id: this.partnerStore.id,
      }).subscribe(() => {
        this.router.navigate(['/checkout', 'address']);
      });
    }
  }

  ngOnDestroy() {
    if (this.stateSub) {
      this.stateSub.unsubscribe();
    }
    if (this.checkoutSub) {
      this.checkoutSub.unsubscribe();
    }
  }
}
