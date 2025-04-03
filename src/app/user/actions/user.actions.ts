import { Action } from '@ngrx/store';
import { Order } from '../../core/models/order';

export class UserActions {
  static GET_USER_ORDERS = 'GET_USER_ORDERS';
  static GET_USER_ORDERS_SUCCESS = 'GET_USER_ORDERS_SUCCESS';
  static GET_USER_LISTS = 'GET_USER_LISTS';
  static GET_USER_LISTS_SUCCESS = 'GET_USER_LISTS_SUCCESS';
  static CREATE_USER_LIST = 'CREATE_USER_LIST';
  static CREATE_USER_LIST_SUCCESS = 'CREATE_USER_LIST_SUCCESS';
  static UPDATE_USER_LIST = 'UPDATE_USER_LIST';
  static UPDATE_USER_LIST_SUCCESS = 'UPDATE_USER_LIST_SUCCESS';
  static DELETE_USER_LIST = 'DELETE_USER_LIST';
  static DELETE_USER_LIST_SUCCESS = 'DELETE_USER_LIST_SUCCESS';
  static SAVE_CART_ITEMS = 'SAVE_CART_ITEMS';

  getUserOrders(): Action {
    return { type: UserActions.GET_USER_ORDERS };
  }

  getUserOrdersSuccess(orders: any[]): Action {
    return { type: UserActions.GET_USER_ORDERS_SUCCESS, payload: orders };
  }

  getUserLists(): Action {
    return { type: UserActions.GET_USER_LISTS };
  }

  getUserListsSuccess(lists: any) {
    return {
      type: UserActions.GET_USER_LISTS_SUCCESS,
      payload: lists
    };
  }

  createUserList(list: any): Action {
    return{
      type: UserActions.CREATE_USER_LIST,
      payload: list
    };
  }

  createUserListSuccess(list: any) {
    return {
      type: UserActions.CREATE_USER_LIST_SUCCESS,
      payload: list
    };
  }

  updateUserList(list: any): Action {
    return {
      type: UserActions.UPDATE_USER_LIST,
      payload: list
    };
  }

  updateUserListSuccess(list: any) {
    return {
      type: UserActions.UPDATE_USER_LIST_SUCCESS,
      payload: list
    };
  }

  deleteUserList(id: number): Action {
    return {
      type: UserActions.DELETE_USER_LIST,
      payload: id
    };
  }

  deleteUserListSuccess(id: number) {
    return {
      type: UserActions.DELETE_USER_LIST_SUCCESS,
      payload: id
    };
  }

  saveCartItems(list: any, items: Array<number>) {
    return {
      type: UserActions.SAVE_CART_ITEMS,
      payload: {
        list: list,
        items: items
      }
    };
  }

}
