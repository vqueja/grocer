import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../services/user.service';
import { Globals } from '../../../../globals';
import { CheckoutActions } from '../../../../checkout/actions/checkout.actions';
import { getCartItems } from '../../../../checkout/reducers/selectors';
import { ProductService } from '../../../../core/services/product.service';
import { ProductActions } from '../../../../product/actions/product-actions';
import { AppState } from '../../../../interfaces';


@Component({
  selector: 'app-order-list-item',
  templateUrl: './order-list-item.component.html',
  styleUrls: ['./order-list-item.component.scss']
})
export class OrderListItemComponent implements OnInit, OnDestroy {
  @Input() order: any;
  partnerStore: any = {};
  currentStoreId: 0;
  storeItems: Array<any>;
  orderItemsSub: Subscription;
  
  constructor(
    private store: Store<AppState>,
    private globals: Globals,
    private checkoutActions: CheckoutActions,
    private productActions: ProductActions,
    private productService: ProductService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.order['displayItemQty'] = Number(this.order.finalTotalQuantity)
      ? Number(this.order.finalTotalQuantity) : Number(this.order.totalQuantity);
  }

  initData(): Observable<any> {
    return forkJoin([
      this.userService.getOrderItems(this.order.id),
      this.globals.getPartners().take(1),
      this.store.select(getCartItems).take(1),
    ])
      .map(([items, partners, cartItems]) => {
        if (cartItems.length) {
          this.currentStoreId = cartItems[0].item.partner_id;
        }
        this.partnerStore = partners.find(store => store.id === this.order.partner_id);
        const markup = this.partnerStore ? this.partnerStore.markup : null;
        const data = items.filter((item: any) => item.replaced_orderitem_id === 0)
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
      })
  }

  reorder(): void {
    if (typeof(this.storeItems) === 'undefined') {
      this.orderItemsSub = this.initData().subscribe(() => this.dispatchActions());
    } else {
      this.dispatchActions();
    }
  }

  dispatchActions(): void {
    if (!this.currentStoreId || this.currentStoreId === this.order.partner_id) {
      this.store.dispatch(this.productActions.setPartnerStore(this.partnerStore));
      this.store.dispatch(this.checkoutActions.addItemsToCart(this.storeItems));
    } else {
      this.userService.showMessage('', 'Cannot mix items from different stores.');
    }   
  }

  ngOnDestroy() {
    if (this.orderItemsSub) {
      this.orderItemsSub.unsubscribe();
    }
  }

}
