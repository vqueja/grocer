import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { AppState } from './../../interfaces';
import { Globals } from './../../globals';
import { getAuthStatus } from './../../auth/reducers/selectors';
import { CheckoutService } from './../../core/services/checkout.service';
import { SearchActions } from './../../home/reducers/search.actions';
import { ProductActions } from '../../product/actions/product-actions';
import { UserActions } from './../../user/actions/user.actions';
import { UserService } from './../../user/services/user.service';


@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit, OnDestroy {
  saveListState = 0; // NOTE: 0 - show add list button, 1 - show save button, 2 - hide buttons
  inputNewList: string;
  isAuthenticated$: Observable<boolean>;
  routeSub: Subscription;
  orderDetails: any;
  deliveryDate: string;
  deliveryHours: string;
  cartItemIds: Array<number> = [];
  countWeighted = 0;
  amountPaid = 0.00;
  orderData: any;
  paymentResult: any;

  constructor(
    private userActions: UserActions,
    private productActions: ProductActions,
    private userService: UserService,
    private checkoutService: CheckoutService,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private searchActions: SearchActions,
    private globals: Globals,
  ) { }

  ngOnInit() {
    this.isAuthenticated$ = this.store.select(getAuthStatus);
    this.store.dispatch(this.userActions.getUserOrders());
    this.store.dispatch(this.searchActions.setFilter({}));
    this.store.dispatch(this.searchActions.setSorting({}));
    this.store.dispatch(this.productActions.setPartnerStore({}));
    this.routeSub = forkJoin([
        this.route.params.take(1),
        this.route.queryParams.take(1)
      ])
      .map(([params, queries]) => {
        this.paymentResult = queries;
        return params.key;
      })
      .mergeMap((orderkey) => this.checkoutService.getOrder(orderkey))
      .map((order: any) => {
        order.subTotal = Number(order.itemTotal);
        order.amountTotal = Number(order.adjustmentTotal);
        this.amountPaid = Number(order.paymentTotal);
        this.orderDetails = order;
        this.countWeighted = order.items.filter((item) => item.weighted != null).length;
        this.cartItemIds = order.items.map(item => item.orderItem_itemId);
        this.orderData = order;
        return order.id;
      })
      .mergeMap((orderId) => this.userService.getTimeSlotOrder(orderId))
      .do((timeslotorder) => {
        this.deliveryDate = timeslotorder.datetime;
        this.deliveryHours = this.globals.TIMESLOT_LABELS[(timeslotorder.timeslot_id - 1) % 5];
      })
      .mergeMap(() => {
        if (this.paymentResult
          && this.paymentResult.status === 'success'
          && this.orderData.status.toUpperCase() === 'PAYMENT') {
          return this.checkoutService.updateOrderStatus({
            id: this.orderData.id,
            status: 'pending',
          })
        }
        return Observable.of(false);
      })
      .subscribe();
  }

  createNewList(): void {
    if (this.inputNewList) {
      const d = new Date();
      const list = {
        name: this.inputNewList,
        description: `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`,
        partner_id: this.orderDetails.items[0].partner_id,
      };
      this.store.dispatch(this.userActions.saveCartItems(list, this.cartItemIds));
      this.saveListState = 2;
    }
  }

  continueShopping(): void {
    this.router.navigateByUrl('/');
    window.scrollTo(0, 0);
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
