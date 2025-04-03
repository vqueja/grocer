import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { UserActions } from '../../../actions/user.actions';
import { getUserLists } from '../../../reducers/selector';
import { UserService } from '../../../services/user.service';
import { AppState } from '../../../../interfaces';
import { Globals } from '../../../../globals';
import { getAuthStatus } from '../../../..//auth/reducers/selectors';
import { getCartItems } from '../../../../checkout/reducers/selectors';
import { CheckoutActions } from '../../../../checkout/actions/checkout.actions';
import { ProductActions } from '../../../../product/actions/product-actions';
import { Item } from '../../../../core/models/item';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss']
})
export class ListDetailComponent implements OnInit, OnDestroy {
  listId: number;
  items: Array<any> = [];
  list: any = { id: null, name: '', description: '', userId: null };
  listName = new FormControl;
  listNote = new FormControl;
  cartItems: Array<any> = [];
  partnerStore: any;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private userActions: UserActions,
    private checkoutActions: CheckoutActions,
    private productActions: ProductActions,
    private route: ActivatedRoute,
    private router: Router,
    private globals: Globals,
  ) { }

  ngOnInit() {
    combineLatest([
      this.route.params,
      this.store.select(getUserLists),
      this.globals.getPartners(),
    ])
      .map(([params, lists, partners]) => {
        this.listId = Number(params.id);
        const list = lists.find(_list => _list.id === this.listId);
        if (list) {
          this.list = list;
          this.listName.setValue(list.name);
          this.listNote.setValue(list.description);
          this.partnerStore = partners.find(_store => _store.id === list.partnerId);
        }
        return params.id;
      })
      .mergeMap(listId => this.userService.getListItems(listId,
        this.partnerStore ? this.partnerStore.markup : null))
      .do(items => this.items = items)
      .takeUntil(this.componentDestroyed)
      .subscribe();
    this.store.select(getCartItems)
      .takeUntil(this.componentDestroyed)
      .subscribe(cartItems => this.cartItems = cartItems);
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  addToCart(item: any): void {
    if (!this.checkIfMixed()) {
      const _item = Object.assign({}, item);
      delete _item.item_id;
      delete _item.list_id;
      delete _item.listitem_id;
      this.store.dispatch(this.productActions.setPartnerStore(this.partnerStore));
      this.store.dispatch(this.checkoutActions.addToCart(_item));
    }
  }

  addAllToCart(): void {
    if (!this.checkIfMixed()) {
      this.store.dispatch(this.productActions.setPartnerStore(this.partnerStore));
      this.store.dispatch(this.checkoutActions.addItemsToCart(this.items));
    }
  }

  removeItem(item: any, index: number): void {
    this.userService.removeListItem(item.listitem_id, item.name)
      .takeUntil(this.componentDestroyed)
      .subscribe(result => {
        if (result.message === 'Deleted') {
          const items = Array.from(this.items);
          items.splice(index, 1);
          this.items = items;
        }
      });
  }

  updateList(): void {
    if (this.list.id && (this.list.name !== this.listName.value || this.list.description !== this.listNote.value)) {
      this.userService.updateList({
        id: this.list.id,
        name: this.listName.value,
        description: this.listNote.value
      })
        .takeUntil(this.componentDestroyed)
        .subscribe(result => {
          if (result.message.indexOf('Updated') >= 0) {
          }
        });
    }
  }

  deleteList(): void {
    if (this.list.id) {
      this.userService.deleteList(this.list.id)
        .takeUntil(this.componentDestroyed)
        .subscribe(result => {
          if (result.message === 'Deleted') {
            this.router.navigateByUrl('/user/lists');
          }
        });
    }
  }

  checkIfMixed(): boolean {
    if (this.cartItems.length && this.cartItems[0].item.partner_id !== this.items[0].partner_id) {
      this.userService.showMessage('', 'Cannot mix items from different stores.');
      return true;
    }
    return false;
  }

  getItemImageUrl(key: string): string {
    return key ? `${environment.IMAGE_REPO}${key}.jpg` : this.globals.ITEM_DEFAULT_IMG;
  }

  onImageError(e: any): void {
    e.target.src = this.globals.ITEM_DEFAULT_IMG;
  }
}
