import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AppState } from './../interfaces';
import { Globals } from './../globals';
import { getFilters, getSortSettings } from './reducers/selectors';
import { ProductActions } from './../product/actions/product-actions';
import { getProducts, getTaxonomies, getPartnerStore } from './../product/reducers/selectors';
import { getCartItems } from './../checkout/reducers/selectors';
import { CheckoutActions } from './../checkout/actions/checkout.actions';
import { CheckoutService } from '../core/services/checkout.service';


@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <ng-container *ngIf="(partnerStore$ | async).requestItemFlag; else regularStore">
      <app-request-store
        [partnerStore]="partnerStore$ | async">
      </app-request-store>
      </ng-container>
      <ng-template #regularStore>
        <app-content
          [items]="items$ | async"
          [categories]="categories$ | async"
          [cartItemsArr]="cartItems$ | async"
          [filters]="filters$ | async"
          [sorting]="sorting$ | async"
          [partnerStore]="partnerStore$ | async" >
          <!-- [taxonIds]="selectedTaxonIds$ | async"> -->
        </app-content>
      </ng-template>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  items$: Observable<any>;
  categories$: Observable<any>;
  cartItems$: Observable<any>;
  filters$: Observable<any>;
  sorting$: Observable<any>;
  partnerStore$: Observable<any>;
  initSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productActions: ProductActions,
    private checkoutActions: CheckoutActions,
    private checkoutService: CheckoutService,
    private globals: Globals,
    private store: Store<AppState>
  ) {
    this.cartItems$ = this.store.select(getCartItems);
    this.items$ = this.store.select(getProducts);
    this.categories$ = this.store.select(getTaxonomies);
    this.filters$ = this.store.select(getFilters);
    this.sorting$ = this.store.select(getSortSettings);
    this.partnerStore$ = this.store.select(getPartnerStore);
  }

  ngOnInit() {
    let store;
    this.initSub = combineLatest([
      this.globals.getPartners(),
      this.route.params
    ])
      .do((results) => {
        const [ partners, params] = results;
        const partnerStore = partners.filter(partner => {
          const name = params.slug.replace(/-/g, ' ');
          return partner.type === 'seller' && partner.name.toLowerCase() === name;
        });
        if (partnerStore.length) {
          this.store.dispatch(this.productActions.setPartnerStore(partnerStore[0]));
          this.store.dispatch(this.productActions.getAllProducts({}, { partnerId: partnerStore[0].id }));
          this.store.dispatch(this.productActions.getAllTaxonomies( partnerStore[0].id ));
          store = partnerStore[0];
        }
      })
      .switchMap(() => this.cartItems$)
      .mergeMap((cartItems) => {
          // NOTE: temporary solution. remove cart items if different store
          // TODO: remove once multiple order (suborders) implemented
          if (store && cartItems.length && cartItems[0].item.partner_id !== store.id) {
            this.store.dispatch(this.checkoutActions.removeCartItems());
            return this.checkoutService.deleteCartItems();
          }
          return Observable.of(false)
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }

}
