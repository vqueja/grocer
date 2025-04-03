import { CartItem } from './../../core/models/cart_item';
import { Order } from './../../core/models/order';
import { Item } from './../../core/models/item';
import { Action } from '@ngrx/store';

export class CheckoutActions {
  static FETCH_CURRENT_ORDER = 'FETCH_CURRENT_ORDER';
  static FETCH_CURRENT_ORDER_SUCCESS = 'FETCH_CURRENT_ORDER_SUCCESS';
  static ADD_TO_CART = 'ADD_TO_CART';
  static ADD_TO_CART_SUCCESS = 'ADD_TO_CART_SUCCESS';
  static APPLY_COUPON = 'APPLY_COUPON';
  static REMOVE_COUPON = 'REMOVE_COUPON';
  static APPLY_GC = 'APPLY_GC';
  static REMOVE_GC = 'REMOVE_GC';
  static RESET_GC = 'RESET_GC';
  static REMOVE_CART_ITEM = 'REMOVE_CART_ITEM';
  static REMOVE_CART_ITEM_SUCCESS = 'REMOVE_CART_ITEM_SUCCESS';
  static REMOVE_CART_ITEMS = 'REMOVE_CART_ITEMS';
  static REMOVE_CART_ITEMS_SUCCESS = 'REMOVE_CART_ITEMS_SUCCESS';
  static UPDATE_CART_ITEM = 'UPDATE_CART_ITEM';
  static UPDATE_CART_ITEM_SUCCESS = 'UPDATE_CART_ITEM_SUCCESS';
  static PLACE_ORDER = 'PLACE_ORDER';
  static CHANGE_ORDER_STATE = 'CHANGE_ORDER_STATE';
  static CHANGE_ORDER_STATE_SUCCESS = 'CHANGE_ORDER_STATE_SUCCESS';
  static UPDATE_ORDER = 'UPDATE_ORDER';
  static UPDATE_ORDER_SUCCESS = 'UPDATE_ORDER_SUCCESS';
  static ORDER_COMPLETE_SUCCESS = 'ORDER_COMPLETE_SUCCESS';
  static UPDATE_ADDRESS_SUCCESS = 'UPDATE_ADDRESS_SUCCESS';
  static UPDATE_DELIVERY_OPTIONS_SUCCESS = 'UPDATE_DELIVERY_OPTIONS_SUCCESS';
  static ADD_ITEMS_TO_CART = 'ADD_ITEMS_TO_CART';
  static ADD_ITEMS_TO_CART_SUCCESS = 'ADD_ITEMS_TO_CART_SUCCESS';
  static UPDATE_AMOUNT_PAID = 'UPDATE_AMOUNT_PAID';
  static ADD_REQUEST_ITEM = 'ADD_REQUEST_ITEM';
  static ADD_REQUEST_ITEM_SUCCESS = 'ADD_REQUEST_ITEM_SUCCESS';
  static UPDATE_REQUEST_ITEM = 'UPDATE_REQUEST_ITEM';

  fetchCurrentOrder() {
    return { type: CheckoutActions.FETCH_CURRENT_ORDER };
  }

  fetchCurrentOrderSuccess(order) {
    return {
      type: CheckoutActions.FETCH_CURRENT_ORDER_SUCCESS,
      payload: order
    };
  }

  addToCart(item: Item): Action {
    return {
      type: CheckoutActions.ADD_TO_CART,
      payload: item
    };
  }

  addToCartSuccess(cartItem: CartItem): Action {
    return {
      type: CheckoutActions.ADD_TO_CART_SUCCESS,
      payload: cartItem
    };
  }

  addItemsToCart(items: Array<Item>): Action {
    return {
      type: CheckoutActions.ADD_ITEMS_TO_CART,
      payload: items
    };
  }

  addItemsToCartSuccess(data: any): Action {
    return {
      type: CheckoutActions.ADD_ITEMS_TO_CART_SUCCESS,
      payload: data
    };
  }

  applyCoupon(coupon: any): Action {
    return {
      type: CheckoutActions.APPLY_COUPON,
      payload: coupon
    };
  }

  applyGC(gc: any): Action {
    return {
      type: CheckoutActions.APPLY_GC,
      payload: gc
    };
  }

  removeGC(gc: any): Action {
    return {
      type: CheckoutActions.REMOVE_GC,
      payload: gc
    };
  }

  resetGCList(): Action {
    return {
      type: CheckoutActions.RESET_GC,
    };
  }

  removeCartItem(cartItemId: number): Action {
    return {
      type: CheckoutActions.REMOVE_CART_ITEM,
      payload: cartItemId
    };
  }

  removeCartItemSuccess(cartItem: CartItem): Action {
    return {
      type: CheckoutActions.REMOVE_CART_ITEM_SUCCESS,
      payload: cartItem
    };
  }

  removeCartItems(): Action {
    return {
      type: CheckoutActions.REMOVE_CART_ITEMS,
    };
  }

  removeCartItemsSuccess(): Action {
    return {
      type: CheckoutActions.REMOVE_CART_ITEMS_SUCCESS,
    };
  }

  updateCartItem(cartItem: CartItem): Action {
    return {
      type: CheckoutActions.UPDATE_CART_ITEM,
      payload: cartItem
    };
  }

  updateCartItemSuccess(cartItem: CartItem): Action {
    return {
      type: CheckoutActions.UPDATE_CART_ITEM_SUCCESS,
      payload: { cartItem }
    };
  }

//remove coupon action
  removeCoupon(): Action {
    return { type: CheckoutActions.REMOVE_COUPON };
  }

  placeOrder(): Action {
    return { type: CheckoutActions.PLACE_ORDER };
  }

  changeOrderState(): Action {
    return { type: CheckoutActions.CHANGE_ORDER_STATE };
  }

  changeOrderStateSuccess(order: Order): Action {
    return {
      type: CheckoutActions.CHANGE_ORDER_STATE_SUCCESS,
      payload: order
    };
  }

  updateOrder(data: any): Action {
    return {
      type: CheckoutActions.UPDATE_ORDER,
      payload: data
    };
  }

  updateOrderSuccess(data: any): Action {
    return {
      type: CheckoutActions.UPDATE_ORDER_SUCCESS,
      payload: data
    };
  }

  updateOrderAddressSuccess(data: any): Action {
    return {
      type: CheckoutActions.UPDATE_ADDRESS_SUCCESS,
      payload: data
    };
  }

  updateOrderDeliveryOptionsSuccess(data: any): Action {
    return {
      type: CheckoutActions.UPDATE_DELIVERY_OPTIONS_SUCCESS,
      payload: data
    };
  }

  updateAmountPaid(amountPaid: any): Action {
    return {
      type: CheckoutActions.UPDATE_AMOUNT_PAID,
      payload: amountPaid
    };
  }

  orderCompleteSuccess() {
    return { type: CheckoutActions.ORDER_COMPLETE_SUCCESS };
  }

  addRequestItem(data: any): Action {
    return {
      type: CheckoutActions.ADD_REQUEST_ITEM,
      payload: data
    };
  }

  addRequestItemSuccess(cartItem: CartItem): Action {
    return {
      type: CheckoutActions.ADD_REQUEST_ITEM_SUCCESS,
      payload: cartItem
    };
  }

  updateRequestItem(cartItem: CartItem): Action {
    return {
      type: CheckoutActions.UPDATE_REQUEST_ITEM,
      payload: cartItem
    };
  }

  // updateRequestItemSuccess(cartItem: CartItem): Action {
  //   return {
  //     type: CheckoutActions.UPDATE_CART_ITEM_SUCCESS,
  //     payload: { cartItem }
  //   };
  // }

}
