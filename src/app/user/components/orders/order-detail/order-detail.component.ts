import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { AppState } from '../../../../interfaces';
import { environment } from '../../../../../environments/environment';
import { getUserOrders } from '../../../reducers/selector';
import { UserService } from '../../../services/user.service';
import { Order } from '../../../../core/models/order';
import { Globals } from '../../../../globals';
import { ProductService } from '../../../../core/services/product.service';
import { ProductActions } from '../../../../product/actions/product-actions';
import { CheckoutActions } from '../../../../checkout/actions/checkout.actions';
import { getCartItems } from '../../../../checkout/reducers/selectors';


@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  order: any;
  payments: any;
  deliveryInfo: any = {};
  orderItems: Array<any> = [];
  replacementItem: Map<string, any> = new Map();
  storeItems: Array<any>;
  partnerStore: any;
  currentStoreId: 0;
  bHasFeedback = false;
  showFeedBackTemplate = false;
  isCash = false;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private globals: Globals,
    private userService: UserService,
    private productService: ProductService,
    private productActions: ProductActions,
    private checkoutActions: CheckoutActions
  ) { }

  ngOnInit() {
    this.routeSub = combineLatest([
      this.route.params,
      this.store.select(getUserOrders)
    ])
      .mergeMap(([params, orders]) => {
        const orderKey = params['orderkey'];
        this.order = orders.find(order => order.orderkey === orderKey);
        if (this.order) {
          this.order['displayItemTotal'] = Number(this.order.finalItemTotal)
            ? Number(this.order.finalItemTotal) : Number(this.order.itemTotal);
          this.order.discountTotal = Number(this.order.discountTotal);
          this.order.paymentTotal = Number(this.order.paymentTotal);
          this.order.grandTotal = Number(this.order.total);
          this.order.amountDue = Number(this.order.total) - this.order.paymentTotal;
          this.order.status = this.order.status;
          return this.orderInitStream(this.order.id, orderKey, this.order.status);
        }
        return Observable.of([]);
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  orderInitStream(orderId: number, orderKey: string, status: string): Observable<any> {
    let timeslot$: Observable<any>;
    let feedback$: Observable<boolean>;
    if (status === 'complete') {
      timeslot$ = Observable.of({});
      feedback$ = this.userService.checkOrderFeedBack(orderKey);
    } else {
      timeslot$ = this.userService.getTimeSlotOrder(orderId);
      feedback$ = Observable.of(false);
    }
    return forkJoin([
      timeslot$,
      feedback$,
      this.userService.getOrderPaymentDetail(orderId),
      this.userService.getOrderItems(orderId),
      this.globals.getPartners().take(1),
      this.store.select(getCartItems).take(1)
    ])
      .map((results: Array<any>) => {
        const [timeslotorder, feedback, payments, items, partners, cartItems] = results;
        if (cartItems.length) {
          this.currentStoreId = cartItems[0].item.partner_id;
        }
        this.partnerStore = partners.find(store => store.id === this.order.partner_id);   
        this.bHasFeedback = feedback;
        if (timeslotorder.date) {
          this.deliveryInfo = {
            day: timeslotorder.date,
            hours: this.globals.TIMESLOT_LABELS[(timeslotorder.timeslot_id - 1) % 5],
          };
        }
        this.initOrderItems(items);
        this.initOrderPaymentsData(payments);
      });
  }

  initOrderPaymentsData(data: any): void {
    this.payments = data;
    this.order.payments = [];
    let gcTotal = 0.00;
    data.forEach((payment) => {
      switch (payment.paymentType) {
        case 'SALARY_DEDUCTION':
          this.order.payments.push({
            type: 'Salary Voucher',
            amount: payment.amount,
          })
          break;
        case 'GIFT_CERTIFICATE':
          gcTotal += Number(payment.amount);
          break;
        case 'CASH':
          this.isCash = true;
          this.order.payments.push({
            // NOTE: temporary rename
            // type: 'Cash',
            type: 'Fund Transfer',
            amount: payment.amount,
          })
          break;
        case 'PAYMAYA':
          this.order.payments.push({
            type: 'PayMaya',
            amount: payment.amount,
          })
          break;
        default:
      };
    });
    if (gcTotal) {
      this.order.payments.push({
        type: 'Gift Certificate',
        amount: gcTotal.toString(),
      })
    }
  }

  initOrderItems(items: Array<any>): void {
    const orderItems = []
    const replacementItems = new Map();
    items.forEach((item: any) => {
      if (item.finalPrice) {
        item['displayPrice'] = Number(item.finalPrice);
        item['displayQty'] = Number(item.finalQuantity);
      } else {
        item['displayPrice'] = Number(item.itemPrice);
        item['displayQty'] = Number(item.quantity);
      }
      item['displayTotal'] = item.displayPrice * item.displayQty;
      if (item.replaced_orderitem_id === 0) {
        orderItems.push(item);
      } else {
        replacementItems.set(item.replaced_orderitem_id, item);
      }
    });
    this.orderItems = orderItems.map((item: any) => {
      if (item.status === 'replaced') {
        item['replacement'] = replacementItems.get(item.id);
      }
      return item;
    });
    
    this.initStoreItems(items);
  }

  initStoreItems(items: Array<any>): void {
    const markup = this.partnerStore ? this.partnerStore.markup : null;
    const data =  items.filter((item: any) => item.replaced_orderitem_id === 0)
      .map((item: any) => {
        return {
          brandName: item.brandName,
          category1: item.category1,
          category2: item.category2,
          category3: item.cateogry3,
          code: item.code,
          displayPrice: item.displayPrice,
          id: item.item_id,
          imageKey: item.imageKey,
          name: item.name,
          partner_id: item.partner_id,
          price: item.price,
          slug: item.slug,
          weighted: item.weighted,
          quantity: Number(item.status === 'confirmed' ? item.finalQuantity : item.quantity),
        };
      });
    this.storeItems = this.productService.markUpPrice(data, markup);
  }

  getItemImageUrl(key: string): string {
    return key ? `${environment.IMAGE_REPO}${key}.jpg` : this.globals.ITEM_DEFAULT_IMG;
  }

  onImageError(e: any): void {
    e.target.src = this.globals.ITEM_DEFAULT_IMG;
  }

  toggleFeedBack(mode: boolean): void {
    if (typeof(mode) !== 'undefined') {
      this.showFeedBackTemplate = mode;
    } else {
      this.showFeedBackTemplate = !this.showFeedBackTemplate;
    }
  }

  hideFeedBackBtn(): void {
    this.bHasFeedback = false;
  }

  reorder(): void {
    if (!this.currentStoreId || this.currentStoreId === this.order.partner_id) {
      this.store.dispatch(this.productActions.setPartnerStore(this.partnerStore));
      this.store.dispatch(this.checkoutActions.addItemsToCart(this.storeItems));
    } else {
      this.userService.showMessage('', 'Cannot mix items from different stores.');
    }
  }

}
