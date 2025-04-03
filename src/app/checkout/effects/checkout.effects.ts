import { CartItem } from './../../core/models/cart_item';
import { CheckoutService } from './../../core/services/checkout.service';
import { CheckoutActions } from './../actions/checkout.actions';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';

@Injectable()
export class CheckoutEffects {

  constructor(private actions$: Actions,
  private checkoutService: CheckoutService,
  private actions: CheckoutActions) {}

  // tslint:disable-next-line:member-ordering
  @Effect()
    AddToCart$ = this.actions$
    .ofType(CheckoutActions.ADD_TO_CART)
    .mergeMap((action: Action) => {
      return this.checkoutService.createNewCartItem(action.payload);
    })
    .map((cartItem: CartItem) => this.actions.addToCartSuccess(cartItem));
  // tslint:disable-next-line:member-ordering
  @Effect()
    AddItemsToCart$ = this.actions$
    .ofType(CheckoutActions.ADD_ITEMS_TO_CART)
    .mergeMap((action: Action) => this.checkoutService.addItemsToCart(action.payload))
    .map((data: any) => this.actions.addItemsToCartSuccess(data));
  // tslint:disable-next-line:member-ordering
  @Effect()
    UpdateCartItem$ = this.actions$
    .ofType(CheckoutActions.UPDATE_CART_ITEM)
    .mergeMap((action: Action) => {
      return this.checkoutService.updateCartItem(action.payload);
    })
    .map((cartItem: CartItem) => this.actions.updateCartItemSuccess(cartItem));
  // tslint:disable-next-line:member-ordering
  @Effect()
    AddRequestItem$ = this.actions$
    .ofType(CheckoutActions.ADD_REQUEST_ITEM)
    .mergeMap((action: Action) => this.checkoutService.addRequestItem(action.payload))
    .map((data: any) => this.actions.addRequestItemSuccess(data));
  // tslint:disable-next-line:member-ordering
  @Effect()
    UpdateRequestItem$ = this.actions$
    .ofType(CheckoutActions.UPDATE_REQUEST_ITEM)
    .mergeMap((action: Action) => {
      return this.checkoutService.updateRequestItem(action.payload);
    })
    .map((cartItem: CartItem) => this.actions.updateCartItemSuccess(cartItem));
}
  // @Effect()
    // FetchCurrentOrder$ = this.actions$
    // .ofType(CartActions.FETCH_CURRENT_ORDER)
    // .switchMap((action: Action) => {
    //   return this.cartService.fetchCurrentOrder();
    // })
    // .map((order: Order) => {
    //   return this.cartActions.fetchCurrentOrderSuccess(order);
    // });



  // Use this effect once angular releases RC4

  // @Effect()
  //   RemoveCartItem$ = this.actions$
  //   .ofType(CartActions.REMOVE_LINE_ITEM)
  //   .switchMap((action: Action) => {
  //     return this.cartService.deleteCartItem(action.payload);
  //   })
  //   .map(() => this.cartActions.removeCartItemSuccess());
