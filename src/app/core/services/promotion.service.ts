import { Injectable } from '@angular/core';
import { Response, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { HttpService } from './http';
import { CartItem } from './../models/cart_item';
import { Item } from './../models/item';
import { Order } from './../models/order';
import { CheckoutActions } from './../../checkout/actions/checkout.actions';
import { getOrderNumber } from './../../checkout/reducers/selectors';
import { AppState } from './../../interfaces';

@Injectable()
export class PromotionService {

  /**
   * Creates an instance of PromotionService.
   * @param {HttpService} http
   * @param {CheckoutActions} actions
   * @param {Store<AppState>} store
   *
   * @memberof PromotionService
   */
  constructor(
    private http: HttpService,
    private actions: CheckoutActions,
    private store: Store<AppState>,
  ) {
      // this.store.select(getOrderNumber)
        // .subscribe(number => this.orderNumber = number);
    }

    getPromotions() {
      return this.http.get(`v1/promotions`
      ).map((res) => {
        return res.json();
      })
      .catch(err => Observable.of({}));
    }

    /**
     @memberof PromotionService
     */
    getBanner() {
      return this.http.get(`v1/banner`
      ).map((res) => {
        return res.json();
      })
      .catch(err => Observable.of({}));
    }

    /**
     @memberof PromotionService
     */
    getStoreBanner() {
      return this.http.get(`v1/storebanner`
      ).map((res) => {
        return res.json();
      })
      .catch(err => Observable.of({}));
    }

    /**
     @memberof PromotionService
     */
    getFeaturedBanner() {
      return this.http.get(`v1/bannerfeatured`
      ).map((res) => {
        return res.json();
      })
      .catch(err => Observable.of({}));
    }

    getUserVisitedStores(userId: number): Observable<any> {
      return this.http.get(`v1/userstores/${userId}`)
        .map((res: Response ) => res.json())
        .catch(() => Observable.of([]));
    }

    setUserVisitedStores(userId: number, data: any): Observable<any> {
      return this.http.put(`v1/userstores/${userId}`, data)
        .map((res: Response) => {
          const response = res.json();
          const msgObj = {
            loading: false,
            hasMsg: response.message,
            reset: 4500,
          };
          if (response.message.indexOf('Updated') >= 0) {
            this.http.loading.next(Object.assign(msgObj, { isSuccess : true }));
          } else {
            this.http.loading.next(Object.assign(msgObj, { hasError: true }));
          }
          return response;
        });
    }

}
