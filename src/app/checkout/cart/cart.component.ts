import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from './../../interfaces';
import { CheckoutActions } from './../actions/checkout.actions';
import { getTotalCartValue, getOrderState, getTotalCartItems,
  getTotalAmtDue, getTotalDiscount, getGrandTotal, getServiceFee,
  getDeliveryFee } from './../reducers/selectors';
import { getAuthStatus } from './../../auth/reducers/selectors';
import { CheckoutService } from './../../core/services/checkout.service';
import { LineItem } from './../../core/models/line_item';
import { getProducts, getTaxonomies, getPartnerStore } from './../../product/reducers/selectors';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  totalCartValue$: Observable<number>;
  totalCartItems$: Observable<number>;
  totalAmtDue$: Observable<number>;
  totalDiscount$: Observable<number>;
  grandTotal$: Observable<number>;
  isAuthenticated$: Observable<boolean>;
  partnerStore$: Observable<boolean>;
  serviceFee$: Observable<number>;
  deliveryFee$: Observable<number>;
  deleteSub: Subscription;
  partnerSub: Subscription;
  returnUrl: string;
  @ViewChild('confirmModal') confirmModal;

  constructor(
    private store: Store<AppState>,
    private checkoutActions: CheckoutActions,
    private checkoutService: CheckoutService,
  ) {
    this.totalCartValue$ = this.store.select(getTotalCartValue);
    this.totalCartItems$ = this.store.select(getTotalCartItems);
    this.serviceFee$ = this.store.select(getServiceFee);
    this.deliveryFee$ = this.store.select(getDeliveryFee);
    this.totalAmtDue$ = this.store.select(getTotalAmtDue);
    this.grandTotal$ = this.store.select(getGrandTotal);
    // this.totalDiscount$ = this.store.select(getTotalDiscount);
    this.isAuthenticated$ = this.store.select(getAuthStatus);
    this.partnerStore$ = this.store.select(getPartnerStore);
  }

  ngOnInit() {
    this.partnerSub = this.partnerStore$.subscribe((partner: any) => {
      if (partner && partner.name) {
        const slug = partner.name.toLowerCase().replace(/\s+/g, '-');
        this.returnUrl = `/stores/${slug}`;
      } else {
        this.returnUrl = '/';
      }
    });
  }

  ngOnDestroy() {
    if (this.deleteSub) {
      this.deleteSub.unsubscribe();
    }
    if (this.partnerSub) {
      this.partnerSub.unsubscribe();
    }
  }

  clearCart() {
    this.store.dispatch(this.checkoutActions.removeCartItems());
    this.deleteSub = this.checkoutService.deleteCartItems().subscribe();
    this.confirmModal.hide();
  }
}
