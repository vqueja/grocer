import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
// import { CheckoutActions } from './../../../actions/checkout.actions';
import { getCartItems } from './../../../reducers/selectors';
import { AppState } from './../../../../interfaces';
import { CartItem } from './../../../../core/models/cart_item';
import { getAuthStatus } from './../../../../auth/reducers/selectors';
import { ProductActions } from './../../../../product/actions/product-actions';
import { getPartnerStore, getSelectedItem,
  getTaxonomies } from './../../../../product/reducers/selectors';
import { getUserLists } from './../../../../user/reducers/selector';


@Component({
  selector: 'app-cart-item-list',
  templateUrl: './cart-item-list.component.html',
  styleUrls: ['./cart-item-list.component.scss']
})
export class CartItemListComponent implements OnInit, OnDestroy {
  cartItems$: Observable<CartItem[]>;
  isAuthenticated$: Observable<boolean>;
  userLists$: Observable<any>;
  categories$: Observable<any>;
  selectedItem$: Observable<any>;
  partnerStore$: Observable<any>;
  categorySub: Subscription;
  storeSub: Subscription;
  partner: any;
  @Input() isCartSummary: boolean = false;
  @ViewChild('itemDetailsModal') itemDetailsModal;
  @ViewChild('itemRequestModal') itemRequestModal;
  requestItem: CartItem;

  constructor(
    private store: Store<AppState>,
    private productActions: ProductActions,
  ) { }

  ngOnInit() {
    this.cartItems$ = this.store.select(getCartItems);
    this.isAuthenticated$ = this.store.select(getAuthStatus);
    this.userLists$ = this.store.select(getUserLists);
    this.categories$ = this.store.select(getTaxonomies);
    this.selectedItem$ = this.store.select(getSelectedItem);
    this.partnerStore$ = this.store.select(getPartnerStore);
    this.storeSub = this.partnerStore$.subscribe((store) => {
      this.partner = store;
    });
    this.categorySub = this.categories$.subscribe((categories) => {
      if (!categories.length) {
        this.store.dispatch(this.productActions.getAllTaxonomies(this.partner.id));
      }
    });
  }

  ngOnDestroy() {
    if (this.categorySub) {
      this.categorySub.unsubscribe();
    }
  }

  openItemDialog(cartItem: CartItem): void {
    if (cartItem.isRequest) {
      this.requestItem = cartItem;
      this.itemRequestModal.open();
    } else {
      this.store.dispatch(this.productActions.addSelectedItem(cartItem.item));
      this.itemDetailsModal.open();
    }
  }

  closeItemDialog(): void {
    this.store.dispatch(this.productActions.removeSelectedItem());
    this.itemDetailsModal.close();
  }

  closeItemRequest(): void {
    this.itemRequestModal.close();
    this.requestItem = null;
  }

  trackByFn(index, item) {
    return index;
  }
}
