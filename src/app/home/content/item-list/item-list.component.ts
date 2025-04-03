import { Component, OnInit, Input, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { filter, take, map, debounceTime } from 'rxjs/operators';
import { AppState } from './../../../interfaces';
import { Globals } from './../../../globals';
import { getFilters } from './../../reducers/selectors';
import { getAuthStatus } from './../../../auth/reducers/selectors';
import { CheckoutActions } from './../../../checkout/actions/checkout.actions';
import { Item } from './../../../core/models/item';
import { CheckoutService } from './../../../core/services/checkout.service';
import { ProductService } from './../../../core/services/product.service';
import { ProductActions } from './../../../product/actions/product-actions';
import { getSelectedItem } from './../../../product/reducers/selectors';
import { getUserLists } from './../../../user/reducers/selector';
import { environment } from './../../../../environments/environment';


@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
  @Input() items;
  @Input() toggleLayout;
  @Input() cartItems;
  @Input() sortSettings;
  @Input() categories;
  @Input() partnerStore;
  @Input() filterSettings: any;
  @ViewChild('itemDetailsModal') itemDetailsModal;
  @ViewChild('itemRequestModal') itemRequestModal;
  selectedItem$: Observable<any>;
  isAuthenticated$: Observable<boolean>;
  userLists$: Observable<Array<any>>;
  userLists: Array<any> = [];
  selectedItem: Item;
  autoLoadCtr = 0;
  itemsPerPage: number = this.globals.ITEMS_PER_PAGE;
  itemCtr: number = this.itemsPerPage;
  prevFilter: string = 'all';
  storeUrl: string = '';
  // storeLogo: string = '';
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private store: Store<AppState>,
    private actions: ProductActions,
    private productService: ProductService,
    private checkoutActions: CheckoutActions,
    private checkoutService: CheckoutService,
    private globals: Globals,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {
  }

  ngOnInit() {
    this.storeUrl = this.router.url;
    this.isAuthenticated$ = this.store.select(getAuthStatus);
    this.userLists$ = this.store.select(getUserLists);
    // if (this.partnerStore && this.partnerStore.logo) {
    //   const jpg = (this.partnerStore.logo.indexOf('.png') < 0 && this.partnerStore.logo.indexOf('.jpg') < 0 ) ? '.jpg' : '';
    //   this.storeLogo = `${environment.S3_REPOSITORY.LOGOS}${this.partnerStore.logo}${jpg}`;
    // }
    // NOTE: open item dialog based on item id in url path
    // Observable.combineLatest([this.route.params, this.route.url])
    //   .map((results) => {
    //     const params = (results[0] as any);
    //     const url = (results[1] as any);
    //     return { id: params.id, url: url[0].path };
    //   })
    //   .switchMap((route) => {
    //     if (route.id && route.url === 'item') {
    //       return this.productService.getProduct(route.id);
    //     }
    //     return Observable.of(false);
    //   })
    //   .takeUntil(this.componentDestroyed)
    //   .subscribe((item) => {
    //     if (item) {
    //       this.store.dispatch(this.actions.addSelectedItem(item));
    //     }
    //   });
    this.store.select(getSelectedItem)
      .takeUntil(this.componentDestroyed)
      .subscribe((item) => {
        if (item.id) {
          this.selectedItem = item;
          this.itemDetailsModal.open();
        }
      });
    Observable.fromEvent(window, 'scroll')
      .pipe(
        filter(() => ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 225)
          && this.items.length % this.itemsPerPage === 0)),
        debounceTime(300),
        map(() => this.loadMoreItems(true))
      )
      .takeUntil(this.componentDestroyed)
      .subscribe();
    this.location.subscribe((location) => {
      this.closeItemDialog(true);
    });
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  openItemDialog(item: Item): void {
    const slug = `${ this.storeUrl }/${ item.id }/${ item.slug ? item.slug : item.name.toLowerCase().replace(/ /g, '-') }`;
    window.history.pushState('item-slug', 'Title', slug);
    this.store.dispatch(this.actions.addSelectedItem(item));
  }

  closeItemDialog(isBackButton = false): void {
    if (!isBackButton) {
      window.history.pushState('item-slug', 'Title', this.storeUrl);
    }
    this.store.dispatch(this.actions.removeSelectedItem());
    this.itemDetailsModal.close();
  }

  loadMoreItems(isAutoLoad: boolean = false): void {
    const options = Object.assign({ limit: this.itemCtr }, this.sortSettings);
    const params = { partnerId: this.partnerStore.id };
    let filter = '';
    if (this.filterSettings && this.filterSettings.mode) {
      if (this.filterSettings.mode === 'search') {
        filter = `search${this.filterSettings.keyword}`;
        params['keyword'] = this.filterSettings.keyword;
        params['search'] = 1;
      } else if (this.filterSettings.mode === 'category') {
        filter = `categoryId${this.filterSettings.categoryId}`;
        params[`category${this.filterSettings.level}`] = this.filterSettings.categoryId;
      }
    }
    if (this.resetLoadMoreVariables(filter, isAutoLoad)) {
      options.limit = this.itemCtr;
      this.store.dispatch(this.actions.getAllProducts(options, params));
    }
  }

  resetLoadMoreVariables(filter: string, autoLoad: boolean = false): boolean {
    let isAutoLoad = true;
    if (this.prevFilter === filter) {
      if (this.autoLoadCtr < 3 && this.items.length >= this.itemsPerPage) {
        this.autoLoadCtr++;
        this.itemCtr += this.itemsPerPage;
      } else if (autoLoad) {
        isAutoLoad = false;
      } else {
        this.itemCtr += this.itemsPerPage;
      }
    } else {
      this.itemCtr = this.itemsPerPage * 2;
      this.prevFilter = filter;
      this.autoLoadCtr = 1;
    }
    return isAutoLoad;
  }

  getCartItem(id) {
    return this.cartItems.find(cartItem => cartItem.item_id === id);
  }

  openItemRequest() {
    this.itemRequestModal.open();
  }

  closeItemRequest() {
    this.itemRequestModal.close();
  }

  onImageError(e: any): void {
    e.target.src = this.globals.LOGO_DEFAULT_IMG;
  }

  // @HostListener('window:scroll', [])
  // onScroll(): void {
  //   if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 225)
  //   && this.items.length % this.itemsPerPage === 0) {
  //       this.autoLoad$.next();
  //   }
  // }
}
