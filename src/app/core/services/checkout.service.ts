import { Injectable } from '@angular/core';
import { Response, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { HttpService } from './http';
import { CartItem } from './../models/cart_item';
import { Item } from './../models/item';
import { Order } from './../models/order';
import { Globals } from './../../globals';
import { CheckoutActions } from './../../checkout/actions/checkout.actions';
import { getOrderNumber } from './../../checkout/reducers/selectors';
import { ProductActions } from './../../product/actions/product-actions';
import { AppState } from './../../interfaces';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { forkJoin } from 'rxjs/observable/forkJoin';


@Injectable()
export class CheckoutService {
  private orderNumber: number;
  private orderIdContainer: number;
  private markUp: number;

  /**
   * Creates an instance of CheckoutService.
   * @param {HttpService} http
   * @param {CheckoutActions} actions
   * @param {Store<AppState>} store
   *
   * @memberof CheckoutService
   */
  constructor(
    private http: HttpService,
    private globals: Globals,
    private actions: CheckoutActions,
    private productActions: ProductActions,
    private store: Store<AppState>,
  ) {
      // this.store.select(getOrderNumber)
        // .subscribe(number => this.orderNumber = number);
    }

//  Change below methods once angular releases RC4, so that this methods can be called from effects
//  Follow this linke to know more about this issue https://github.com/angular/angular/issues/12869


 /**
  * @returns
  *
  * @memberof CheckoutService
  */
  fetchCurrentOrder(isAuth: boolean): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user'));
    const orderStorage = this.getOrderInLocalStorage();
    const orderkey = orderStorage != null ? orderStorage.order_token : null;
    if (!orderkey) {
      console.log('NEW ORDER KEY');
      return this.createNewOrder();
    }
    return this.http.get(`v1/order?orderkey=${orderkey}`)
      .map((res: Response) => res.json())
      .switchMap((order: any) => {
        if (order.message && order.message === 'Unauthorized') {
          console.log('TOKEN TIMEOUT');
          return Observable.of(false);
        }
        if (!order.id) {
          console.log('CREATE NEW ORDER');
          return this.createNewOrder();
        }
        console.log('CURRENT ORDER KEY');
        return combineLatest([
          this.http.get(`v1/orderitems?key=${orderkey}`),
          this.globals.getPartners(),
        ]).map((results) => {
          const [orderItems, partners] = results;
          const data = orderItems.json();
          if (data.length) {
            const partnerStore = partners.filter((partner) => partner.id === data[0].partner_id);
            if (partnerStore.length) {
              this.store.dispatch(this.productActions.setPartnerStore(partnerStore[0]));
            }
          }
          let itemTotal = 0, qtyTotal = 0;
          const cartItems = [];
          data.forEach((item) => {
            cartItems.push(this.formatCartItem(item));
            itemTotal += Number(item.itemPrice) * item.quantity;
            qtyTotal += Number(item.quantity);
          });
          order.cartItems =  cartItems;
          order.totalQuantity = qtyTotal;
          order.itemTotal = itemTotal;
          order.deliveryDate = { date: '', timeslotId: null, };
          if (isAuth && user.id !== order.useraccount_id) {
            order.firstname = '';
            order.lastname = '';
            order.email = '';
            order.phone = '';
            order.shippingAddress01 = '';
            order.shippingAddress02 = '';
            order.city = '';
            order.country = '';
            order.postalcode = '';
            order.specialInstructions = '';
            order.billingAddress01 = '';
            order.billingAddress02 = '';
            order.billCity = '';
            order.billCountry = '';
            order.billPostalcode = '';
            order.useraccount_id = user.id;
            order.addressType = 1;
          }
          this.store.dispatch(this.actions.fetchCurrentOrderSuccess(order));
          return Observable.of(true);
        });
      });
  }

  /**
   *
   *
   * @returns
   *
   * @memberof CheckoutService
   */
  createNewOrder(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : 0;
    return this.http.get(`v1/orderkey`)
      .map(res => res.json())
      .map(data => data.orderkey)
      .mergeMap(orderkey => {
        const data = {
          orderkey: orderkey,
          status: 'cart',
          useraccount_id: userId,
          partner_id: 1, // TODO: refer to actual seller ID
        };
        return forkJoin(this.http.post('v1/order', data), Observable.of(orderkey));
      })
      .map(([newOrder, orderkey]) => {
        const orderId = newOrder.json()['id'];
        this.setOrderTokenInLocalStorage({
          order_id: orderId,
          order_token: orderkey,
        });
        const order = {
          id: orderId,
          number: '0',
          orderkey: orderkey,
          cartItems: [],
          totalQuantity: '0',
          itemTotal: '0',
          shippingAddress01: '',
          billingAddress01: '',
          deliveryDate: '',
          status: 'cart',
        };
        return this.store.dispatch(this.actions.fetchCurrentOrderSuccess(order));
      });
  }

  /**
   *
   *
   * @param {any} params
   * @returns
   *
   * @memberof CheckoutService
   */
  createOrderPaymentDetails(params: any) {
    return this.http.post('v1/orderpaymentdetails', params)
      .map(res => res.json())
      .catch(err => Observable.empty());
  }
  /**
   *
   *
   * @param {string} orderKey
   * @returns
   *
   * @memberof CheckoutService
   */

  getOrder(orderKey: string) {
    return this.http.get(`v1/order?orderkey=${orderKey}`)
      .map((res) => res.json())
      .switchMap((order: any) => {
        return forkJoin([
          this.http.get(`v1/orderitems?orderId=${order.id}`),
          Observable.of(order)
        ]);
      })
      .map((results) => {
        const items = (results[0] as any);
        return Object.assign({ items: items.json() }, results[1]);
      })
      .catch((err) => Observable.of({}));
  }

  /**
   *
   *
   * @param {Item} item
   * @returns CartItem
   *
   * @memberof CheckoutService
   */
  createNewCartItem(item: Item) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : 0;
    return this.http.post(`v1/orderitems`, {
      user_id: userId,
      item_id: item.id,
      quantity: 1,
      price: item.price,
      orderkey: this.getOrderKey(),
      order_id: this.getOrderId(),
      subOption: 2,
    })
      .map((res: Response) => {
        const data = res.json();
        let cartItem = new CartItem;
        if (data.message === 'Saved') {
          cartItem = {
            id: data.id,
            quantity: 1,
            price: Number(item.price),
            total: Number(item.price),
            item_id: item.id,
            instructions: null,
            item: item,
            subOption: 2,
            subPrice: null,
            subQuantity: null,
            subItemId: null,
            isRequest: false,
          };
          this.http.loading.next({
            loading: false,
            success: true,
            message: `${item.name} added to cart.`
          });
        } else {
          this.http.loading.next({
            loading: false,
            error: true,
            message: `${item.name} already in cart.`
          });
        }
       return cartItem;
      })
      .catch(err => Observable.of({}));
  }

  /**
   *
   *
   * @param {Array<Item>} items
   * @returns object
   *
   * @memberof CheckoutService
   */
  addItemsToCart(items: Array<Item>) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : 0;
    const orderId = this.getOrderId();
    const orderKey = this.getOrderKey();
    const cartItems = items.map((item) => {
      return {
        user_id: userId,
        item_id: item.id,
        price: item.price,
        quantity: item.quantity || 1,
        orderkey: orderKey,
        order_id: orderId,
      };
    });
    return this.http.post(`v1/orderitems/order/${orderId}`, {
      items: cartItems,
      orderkey: orderKey,
    }).map((res: Response) => res.json())
      .map((results: any) => {
        const data = {
          cartItems: [],
          quantity: 0,
          total: 0,
        };
        const msgbox = {
          loading: false,
          success: false,
          error: false,
          message: '',
        };
        if (results.message === 'Saved') {
          const addedItems = [];
          results.items.forEach((item) => {
            data.quantity += Number(item.quantity);
            data.total += item.itemPrice * Number(item.quantity);
            addedItems.push(Object.assign({}, this.formatCartItem(item)));
          });
          data.cartItems = addedItems;
          msgbox.success = true;
          msgbox.message = `${results.items.length} item(s) added to cart.`;
        } else {
          msgbox.error = true;
          msgbox.message = results.message === 'Existing' ? 'Item(s) already in cart' : 'Server Error';
        }
        this.http.loading.next(msgbox);
        return data;
      })
      .catch(() => Observable.of({ cartItems: [] }));
  }

  /**
   *
   *
   * @param {CartItem} cartItem
   * @returns
   *
   * @memberof CheckoutService
   */
  deleteCartItem(cartItem: CartItem) {
    return this.http.delete(`v1/orderitems/${cartItem.id}`)
      .map(res => {
        this.http.loading.next({
          loading: false,
          info: true,
          message: `${cartItem.item.name} removed from cart.`
        });
        this.store.dispatch(this.actions.removeCartItemSuccess(cartItem));
      }).catch(err => Observable.empty());
  }

  /**
   *
   *
   * @param {CartItem} cartItem
   * @returns
   *
   * @memberof CheckoutService
   */
  deleteCartItems() {
    const orderId = this.getOrderId();
    if (!orderId) {
      return Observable.of(false);
    }
    return this.http.delete(`v1/orderitems/order/${orderId}`)
      .map(res => {
        this.http.loading.next({
          loading: false,
          info: true,
          message: `All items removed from cart.`
        });
        this.store.dispatch(this.actions.removeCartItemsSuccess());
      }).catch(err => Observable.empty());
  }

  /**
   *
   *
   * @param {any} data
   * @returns
   *
   * @memberof CheckoutService
   */
  addRequestItem(data: any): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : 0;
    const _data = Object.assign({
      userId,
      orderKey: this.getOrderKey(),
      orderId: this.getOrderId(),   
    }, data);
    return this.http.post('v1/orderitems/request', _data)
      .map((res: Response) => {
        const result = res.json();
        let cartItem = new CartItem;
        if (result.message === 'Saved') {
          cartItem = {
            id: result.orderItemId,
            quantity: data.quantity,
            price: 0,
            total: 0,
            item_id: result.storeItemId,
            instructions: data.instructions,
            item: {
              id: result.storeItemId,
              item_id: result.itemId,
              name: data.name,
              code: data.code,
              slug: '',
              imageKey: data.image,
              price: 0,
              displayPrice: 0,
              enabled: 0,
              category1: 0,
              category2: 0,
              category3: 0,
              partner_id: data.storeId,
              dateCreate: new Date().getTime(),
            },
            subOption: 2,
            subPrice: null,
            subQuantity: null,
            subItemId: null,
            isRequest: true,
          };
          this.http.loading.next({
            loading: false,
            success: true,
            message: `${data.name} added to cart.`
          });
        } else {
          this.http.loading.next({
            loading: false,
            error: true,
            message: `Error occured. ${data.name} not added.`
          });
        }
        return cartItem;
      })
      .catch((err) => Observable.of({}));
  }

  /**
   *
   *
   * @param {any} data
   * @returns
   *
   * @memberof CheckoutService
   */
  updateRequestItem(cartItem: CartItem) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : 0;
    const data = {
      user_id: userId,
      item_id: cartItem.item.id,
      orderkey: this.getOrderKey(),
      name: cartItem.item.name,
      quantity: cartItem.quantity,
      specialInstructions: cartItem.instructions,
    }
    return this.http.put(`v1/orderitems/request/${cartItem.id}`, data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message.indexOf('Updated') > -1) {
          this.http.loading.next({
            loading: true,
            success: true,
            message: `Item details updated.`
          });
          return cartItem;
        }
        this.http.loading.next({
          loading: true,
          error: true,
          message: `Error occured. Update failed.`
        });
        return new CartItem();
      })
      .catch(err => Observable.of([]));
  }
  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof CheckoutService
   */
  getPartner(id): Observable<any> {
    return this.http.get(`v1/partners/${id}`)
      .map((res: Response) => {
        return res.json();
      });
  }

  /**
   *
   *
   * @param {CartItem} cartItem
   * @returns
   *
   * @memberof CheckoutService
   */
  updateCartItem(cartItem: CartItem) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : 0;
    return this.http.put(`v1/orderitems/${cartItem.id}`, {
        user_id: userId,
        quantity: cartItem.quantity,
        specialInstructions: cartItem.instructions || '',
        subOption: cartItem.subOption,
        subItemId: cartItem.subItemId,
        subPrice: cartItem.subPrice,
        subQuantity: cartItem.subQuantity,
      })
      .map((res: Response) => {
        return cartItem;
      })
      .catch(err => Observable.of([]));
  }

  /**
    * @param {any} gcCode
    * @returns
    *
    * @memberof CheckoutService
    */
  getGC(gcCode) {
    return this.http.get(`v1/gc/${gcCode}`).map(res => {
      const gc = res.json();
      return gc;
   }).catch(err => Observable.empty());
  }

  /**
    * @param {any} data
    * @returns {Observable<any>}
    *
    * @memberof CheckoutService
    */
  checkVoucher(data: any): Observable<any> {
    return this.http.post(`v1/vouchers/check`, data)
      .map((res) => {
        return res.json();
      })
      .catch(err => Observable.of({}));
  }

  /**
    * @param {any} vCode
    * @returns
    *
    * @memberof CheckoutService
    */
  getvoucher(vCode) {
    return this.http.get(`v1/voucher/${vCode}`).map(res => {
      const v = res.json();
      return v;
   }).catch(err => Observable.empty());
  }

  /**
    * @param {any} orderId
    * @returns
    *
    * @memberof CheckoutService
    */
  getTransaction(orderId) {
    return this.http.get(`v1/transactions/${orderId}`).map(res => {
      return res.json();
   }).catch(err => Observable.empty());
  }

  /**
    * @param {any} vCode
    * @returns
    *
    * @memberof CheckoutService
    */
  updateVoucherStatus(vCode) {
    return this.http.put(`v1/voucher/${vCode}`,{
      status:'consumed'
      }).map(res => {
        return res.json();
    }).catch(err => Observable.empty());
  }

  /**

    * @param {string} gcCode

    * @returns
    *
    * @memberof CheckoutService
    */
  updateGC_status(gcCode: string) {
    return this.http.put(`v1/gc/${gcCode}`,{
      status:'used'
      }).map(res => {
        return res.json();
    }).catch(err => Observable.empty());
  }

  /**
   *
   *
   * @param {any} params
   * @returns
   *
   * @memberof CheckoutService
   */
  updateOrder(params: any) {
    const orderkey = this.getOrderKey();
    return this.http.put(`v1/order/${orderkey}`, params).map((res) => {
      const order = res.json();
      switch (params.status) {
        case 'cart':
          this.store.dispatch(this.actions.updateOrderSuccess({status: 'address'}));
          break;
        case 'address':
          const payload = {
            shippingAddress: {
              'firstname': params.firstname,
              'lastname': params.lastname,
              'phone': params.phone,
              'shippingAddress01': params.shippingAddress01,
              'shippingAddress02': params.shippingAddress02,
              'email': params.email,
              'city': params.city,
              'postalcode': params.postalcode,
              'country': params.country,
              'specialInstructions': params.specialInstructions,
              'userAccountId': params.useraccount_id,
            },
            billingAddress: {
              'billCity': params.billCity,
              'billCountry': params.billCountry,
              'billingAddress01': params.billingAddress01,
              'billingAddress02': params.billingAddress02,
              'billPostalcode': params.billPostalcode
            },
            status: 'timeslot',
            addressType: params.addressType,
          }
          this.store.dispatch(this.actions.updateOrderAddressSuccess(payload));
          break;
        case 'timeslot':
          break;
        // case 'payment':
        //   break;
        // case: 'confirm':
        //   break;
      }

    }).catch(err => Observable.of({}));
  }

  updateOrderStatus(params:any) : Observable<any> {
    return this.http.put(`v1/order/${params.id}/status`, params)
      .map((res: Response) => res.json());
  }

  processOrderPayment(data: any): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user'));
    return this.http.put(`v1/order/${data.order.id}/process/`, data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message === 'Processed') {
          this.store.dispatch(this.actions.orderCompleteSuccess());
          this.createNewOrder().subscribe();
        }
        return response;
      })
      .catch(err => Observable.of({ message: err }));
  }

  createTransaction(params: any){
    const order = JSON.parse(localStorage.getItem('order'));
    const orderId = order ? order.id: 0;
    params['number'] = this.getOrderKey();
    params['order_id'] = orderId;
    return this.http.post(`v1/transactions/`, params)
    .map(res => {
      const response = res.json();
      return response;
    });
  }

  updateTransaction(params: any){
    const order = JSON.parse(localStorage.getItem('order'));
    const order_id = this.orderIdContainer;
    // params['value'] = this.getOrderKey();
    return this.http.put(`v1/transactions/${order_id}`, params)
    .map(res => {
      const response = res.json();
      return response;
    });
  }

  /**
   * @param {number} partnerId
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  getTimeSlotsByPartnerId(partnerId: number): Observable<object> {
    return this.http.get(`v1/timeslots/partner/${partnerId}`)
      .map((res: Response) => res.json());
  }

  /**
   * @param {number} partnerId
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  getTimeSlotOrderByPartnerId(partnerId: number): Observable<object> {
    return this.http.get(`v1/timeslotorder/partner/${partnerId}`)
      .map((res: Response) => res.json());
  }

  /**
   * @param {number} partnerId
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  getTimeSlotOrder(options ?: {}): Observable<object> {
    const optionText = [];
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        optionText.push(`${key}=${options[key]}`)
      }
    });
    return this.http.get(`v1/timeslotorder?${optionText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(() => Observable.of([]));
  }

  /**
   * @param {string} filename
   * @param {string} cont
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  uploadFileToS3(file: File, rename: string): Observable<any> {
    return this.http.get(`v1/upload?filename=${rename}&content_type=${file.type}`)
      .map((res: Response) => res.json())
      .mergeMap((response) => {
        const fd = new FormData();
        fd.append('key', rename);
        fd.append('acl', response.params.acl);
        fd.append('Content-Type', file.type);
        fd.append('policy', response.params.policy);
        fd.append('x-amz-algorithm', response.params['x-amz-algorithm']);
        fd.append('x-amz-credential', response.params['x-amz-credential']);
        fd.append('x-amz-date', response.params['x-amz-date']);
        fd.append('x-amz-signature', response.params['x-amz-signature']);
        fd.append('success_action_status', response.params['success_action_status'])
        fd.append('file', file);
        return this.http.post3rdParty('s3', response.endpoint_url, fd);
      })
      .map((res: Response) => res.json())
      .catch(() => Observable.of({}));
  }
  
  /**
   * @param {object} data
   * @returns {Observable<any>}
   *
   * @memberof CheckoutService
   */
  setTimeSlotOrder(data: object): Observable<any> {
    return this.http.post(`v1/timeslotorder`, data)
      .map((res) => {
        const response = res.json();
        switch (response.message) {
          case 'Full':
            this.showErrorMsg('timeslot_full');
            break;
          case 'Not Found':
            this.showErrorMsg('timeslot');
            break;
          default:
            this.showErrorMsg('',)
        }
        return response;
      })
      .catch(() => Observable.of(false));
  }


  /**
   * @param {string} mode
   * @param {string} msg
   * @returns void
   *
   * @memberof CheckoutService
   */
  showErrorMsg(mode: string, msg: string = ''): void {
    let message = '';
    switch (mode) {
      case 'address':
        message = `Please enter required information. ${msg}`;
        break;
      case 'timeslot':
        message = `Please select a delivery time slot.`;
        break;
      case 'timeslot_full':
        message = `Delivery slot is already full. Please select another.`;
        break;
      case 'payment':
        message = `Error occured. ${msg} Please review your order and try again.`;
        break;
      case 'voucher':
        message = "Please enter a valid coupon.";
        break;
      default:
        message = msg;
    }
    this.http.loading.next({
      loading: false,
      hasError: true,
      hasMsg: message,
      reset: 4500
    });
   }

  /**
   * @returns {string}
   *
   * @memberof CheckoutService
   */
  getOrderKey() {
    const order = JSON.parse(localStorage.getItem('order'));
    let token = null;
    if(order) {
      token = order.order_token;
    }
    return token;
  }

  /**
   *
   *
   *
   * @returns
   *
   * @memberof CheckoutService
   */
  getOrderId() {
    const order = JSON.parse(localStorage.getItem('order'));
    let token = 0;
    if(order) {
      token = order.order_id;
    }
    return token;
  }

  /**
   *
   *
   * @private
   * @param {any} token
   *
   * @memberof CheckoutService
   */
  private setOrderTokenInLocalStorage(token): void {
    const jsonData = JSON.stringify(token);
    localStorage.setItem('order', jsonData);
  }

  /**
   *
   *
   * @private
   * @returns
   *
   * @memberof CheckoutService
   */
  private getOrderInLocalStorage() {
    const order = JSON.parse(localStorage.getItem('order'));
    return order;
  }

  /**
   *
   *
   * @private
   * @param {any} token
   *
   * @memberof CheckoutService
   */
  private setOrderInLocalStorage(params): void {
    const keys = Object.keys(params)
    keys.forEach(val => {
      // order[val]
    });
  }

  /**
   *
   *
   * @private
   * @param {any} []
   * @returns cartItem
   *
   * @memberof CheckoutService
   */
  private formatCartItem(item): any {
    return {
      id: item.orderItem_id,
      quantity: Number(item.quantity),
      price: item.itemPrice,
      total: Number(item.itemPrice) * item.quantity,
      item_id: item.orderItem_itemId,
      instructions: item.specialInstructions,
      item: this.formatItem(item),
      subOption: item.subOption,
      subPrice: item.subPrice,
      subQuantity: Number(item.subQuantity),
      subItemId: item.subItemId,
      isRequest: !!item.isRequest,
    };
  }

  /**
   *
   *
   * @private
   * @param {any} []
   * @returns cartItem
   *
   * @memberof CheckoutService
   */
  private formatItem(item): any {
    return {
      id: item.storeitem_id,
      code: item.code,
      name: item.name,
      brandName: item.brandName,
      price: item.itemPrice,
      displayPrice: item.displayPrice,
      // hasVat: item.hasVat,
      // isSenior: item.isSenior,
      weighted: item.weighted,
      // packaging: item.packaging,
      // packageMeasurement: item.packageMeasurement,
      // sizing: item.sizing,
      // packageMinimum: item.packageMinumum,
      // packageIntervals: item.packageIntervals,
      // availableOn: item.availableOn,
      imageKey: item.imageKey,
      slug: item.slug,
      enabled: item.enabled,
      // sellerAccount_id: item.sellerAccount_id,
      dateCreated: item.dateCreated,
      dateUpdated: item.dateUpdate,
      category1: item.category1,
      category2: item.category2,
      category3: item.category3,
      item_id: item.item_id,
      partner_id: item.partner_id,
    };
  }

  // /**
  //  *
  //  *
  //  * @private
  //  * @returns
  //  *
  //  * @memberof CheckoutService
  //  */
  // private getGCfromLocalStorage() {
  //   const gc = JSON.parse(localStorage.getGC('code'));
  //   return gc;
  // }
}
