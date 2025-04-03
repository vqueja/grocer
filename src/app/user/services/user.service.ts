import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from '../../interfaces';
import { UserActions } from '../actions/user.actions';
import { Order } from '../../core/models/order';
import { User } from '../../core/models/user';
import { HttpService } from '../../core/services/http';
import { ProductService } from '../../core/services/product.service';


@Injectable()
export class UserService {

  constructor(
    private http: HttpService,
    private actions: UserActions,
    private store: Store<AppState>,
    private productService: ProductService,
  ) { }

  /**
   *
   *
   * @returns {Observable<Order[]>}
   *
   * @memberof UserService
   */
  getOrders(): Observable<any> {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    return this.http.get(`v1/order/user/${userId}`)
      .map((res: Response) => res.json())
      .catch(() => Observable.of([]));
  }

  /**
   * @param {string} orderkey
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  getOrderItems(orderId: number): Observable<any> {
    return this.http.get(`v1/orderitems?orderId=${orderId}`)
      .map((res: Response) => res.json())
      .catch(() => Observable.of([]));
  }

  /**
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  getTimeSlotOrder(orderId: number): Observable<any> {
    return this.http.get(`v1/timeslotorder/order/${orderId}`)
      .map((res: Response) => res.json())
      .catch(() => Observable.of({}));
  }

  /**
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  getLists(): Observable<any> {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    return this.http.get(`v1/lists/user/${userId}`)
      .map((res: Response) => res.json())
      .catch(() => Observable.of([]));
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  createNewList(list): Observable<any> {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const _list = Object.assign({ useraccount_id: userId }, list);
    return this.http.post(`v1/lists/user/${userId}`, _list)
      .map((res: Response) => {
        const data = res.json();
        let newList;
        if (data.message === 'Saved') {
          newList = Object.assign({ id: data.id, userId, partnerId: _list.partner_id }, _list);
          delete newList.partner_id;
          delete newList.useraccount_id;
          this.http.loading.next({
            loading: false,
            success: true,
            message: `List ${list.name} successfully created.`
          });
        }
        return newList || {};
      })
      .catch(() => Observable.of({}));
    }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  createListAndAdd(payload): Observable<any> {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const list = Object.assign({ useraccount_id: userId }, payload.list);
    // const list = {
    //   useraccount_id: userId,
    //   name: payload.list.name,
    //   description: payload.list.description,
    // };
    return this.http.post(`v1/lists/user/${userId}/items`, {
      list,
      items: payload.items,
    })
    .map((res: Response) => {
        const data = res.json();
        let newList;
        if (data.message === 'Saved') {
          newList = Object.assign({ id: data.id, userId, partnerId: list.partner_id }, list);
          delete newList.partner_id;
          delete newList.useraccount_id;
          // newList = {
          //   id: data.id,
          //   name: payload.list.name,
          //   description: payload.list.description,
          //   userId: userId
          // };
          this.http.loading.next({
            loading: false,
            success: true,
            message: `List ${payload.list.name} successfully created.`
          });
        }
        return newList || {};
      })
      .catch(() => Observable.of({}));
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  updateList(list: any): Observable<any> {
    return this.http.put(`v1/lists/${list.id}`, {
      name: list.name,
      description: list.description
    })
      .map((res: Response) => {
        const response = res.json();
        if (response.message.indexOf('Updated') >= 0) {
          this.store.dispatch(this.actions.updateUserListSuccess(list));
          this.http.loading.next({
            loading: false,
            success: true,
            message: `List updated.`
          });
        }
        return response;
      })
      .catch(() => Observable.of({}));
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  deleteList(id: number): Observable<any> {
    return this.http.delete(`v1/lists/${id}`)
      .map((res: Response) => {
        const response = res.json();
        if (response.message === 'Deleted') {
          this.store.dispatch(this.actions.deleteUserListSuccess(id));
          this.http.loading.next({
            loading: false,
            info: true,
            message: `List deleted.`
          });
        }
        return response;
      })
      .catch(() => Observable.of(false));
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  getListItems(listId: number, markup: number): Observable<any> {
    return this.http.get(`v1/listitems/list/${listId}`)
      .map((res: Response) => {
        const data = res.json();
        if (data.length) {
          return this.productService.markUpPrice(data, markup);
        }
        return data;
      })
      .catch(res => Observable.of([]));
  }

  addListItem(data: any): Observable<any> {
    return this.http.post(`v1/listitems`, data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message === 'Saved') {
          this.http.loading.next({
            loading: false,
            success: true,
            message: `Item added to list.`
          });
        }
        return response;
      })
      .catch(res => Observable.of({}));
  }

  removeListItem(id: number, itemName: string = 'Item'): Observable<any> {
    return this.http.delete(`v1/listitems/${id}`)
      .map((res: Response) => {
        const response = res.json();
        if (response.message === 'Deleted') {
          this.http.loading.next({
            loading: false,
            info: true,
            message: `${itemName} removed from list.`
          });
        }
        return response;
      })
      .catch(res => Observable.of({}));
  }

  getListsOfItem(id: number): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      return this.http.get(`v1/listitems/user/${user.id}/item/${id}?limit=100`)
        .map((res: Response) => res.json())
        .catch(res => Observable.of([]));
    } else {
      return Observable.of([]);
    }
  }

  /**
   *
   *
   * @param {number} userId
   * @returns any
   *
   * @memberof CheckoutService
   */
  getAddress(userId: number): any {
    return this.http.get(`v1/address/user/${userId}`)
      .map(res => res.json())
      .catch(() => Observable.of([]));
  }

  /**
   *
   *
   * @param {number} userId
   * @returns any
   *
   * @memberof CheckoutService
   */
  getAddressById(addressId: number): any {
    return this.http.get(`v1/address/${addressId}`)
      .map(res => res.json())
      .catch(() => Observable.of([]));
  }

  /**
   *
   *
   * @param {any} data
   * @returns any
   *
   * @memberof CheckoutService
   */
  updateAddress(data: any): any {
    return this.http.put(`v1/address/${data.id}`, data)
      .map(res => res.json())
      .catch(() => Observable.of({}));
  }

  /**
   *
   *
   * @param {any} data
   * @returns any
   *
   * @memberof CheckoutService
   */
  saveAddress(data: any): any {
    return this.http.post(`v1/address`, data)
      .map(res => res.json())
      .catch(() => Observable.of({}));
  }

  /**
   * function to save star rating to db
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof UserService
   */
  createOrderFeedBack(data: any): Observable<any> {
    return this.http.post(`v1/orderfeedbacks`, data)
      .map((res: Response) => res.json())
      .catch((err) => Observable.of({ message: 'Failed', error: err }));
  }

  /**
   *
   *
   * @param {string} orderkey
   * @returns {Observable<boolean>}
   *
   * @memberof CheckoutService
   */
  checkOrderFeedBack(orderkey: string): Observable<boolean> {
    return this.http.get(`v1/orderfeedbacks/check?orderkey=${orderkey}`)
      .map((res: Response) => {
        const data = res.json();
        if (data.message === 'Not Found') {
          return true;
        }
        else false;
      })
      .catch(() => Observable.of(false));
  }

  /**
   *
   *
   * @returns void
   *
   * @memberof UserService
   */

  showMessage(mode: string, details: string = '') {
    switch (mode) {
      case 'item_exist':
        this.http.loading.next({
          loading: false,
          error: true,
          message: `${details} already in cart.`
        });
        break;
      case 'address_error':
        this.http.loading.next({
          loading: false,
          hasError: true,
          hasMsg: `Please enter required information. ${details}`,
          reset: 4500,
        });
        break;
      case 'address_success':
        this.http.loading.next({
          loading: false,
          isSuccess: true,
          hasMsg: `Address successfully saved.`,
          reset: 4500,
        });
        break;
      case 'connection_error':
        this.http.loading.next({
          loading: false,
          hasError: true,
          hasMsg: `Error has occurred. Please try again.`,
          reset: 4500,
        });
        break;
      case 'success':
        this.http.loading.next({
          loading: false,
          isSuccess: true,
          hasMsg: details,
          reset: 4500
        });
        break;
      default:
        this.http.loading.next({
          loading: false,
          hasError: true,
          hasMsg: details,
          reset: 4500,
        });
    }

  }

  getOrderPaymentDetail(orderId: any) {
    return this.http.get(`v1/orderpaymentdetails/order/${orderId}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  getReferredUserList(userId: string) {
    return this.http.get(`v1/referrals/referred-users?userId=${ userId }`)
      .map((res: Response) => res.json())
      .catch(() => Observable.of([]));
  }

/*
GET list/{useraccount_id} = return all user's list
POST list {useraccount_id} = create new list
PUT list/{id} {payload} = edit list name
DELETE list/{id}= delete list
GET listitem/{listitem_id} = return all items in the list
PUT listitem/{listitem_id} {list_id, item_id, user_id} = add item to list
DELETE listitem/{listitem_id} = delete item from list
*/

}
