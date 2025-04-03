import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ViewChildren, QueryList, Input, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { environment } from './../../../environments/environment';
import { AppState } from './../../interfaces';
import { Globals } from './../../globals';
import { getAuthStatus } from './../../auth/reducers/selectors';
import { AuthActions } from './../../auth/actions/auth.actions';
import { getTotalCartValue, getTotalCartItems } from './../../checkout/reducers/selectors';
import { Item } from './../../core/models/item';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from './../../core/services/product.service';
import { SearchActions } from './../../home/reducers/search.actions';
import { getSortSettings } from './../../home/reducers/selectors';
import { getTaxonomies, getPartnerStore } from './../../product/reducers/selectors';
import { ProductActions } from './../../product/actions/product-actions';
import { UserService } from './../../user/services/user.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { AccordionModule } from 'ngx-bootstrap/accordion';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() currentStep: string;
  @Input() isHomeRoute: boolean;
  @Input() partnerBuyer: any;
  @ViewChild('searchbox') searchInput: ElementRef;
  categories: Array<any>;
  selectedItem: Item;
  isAuthenticated: Observable<boolean>;
  totalCartItems: Observable<number>;
  totalCartValue: Observable<number>;
  categories$: Observable<any>;
  searchText: string;
  typeaheadLoading: boolean;
  typeaheadNoResults: boolean;
  autoSuggestData$: Observable<any>;
  searchData: Object = {};
  sortSettings: any;
  sortSub: Subscription;
  catSub: Subscription;
  inputString: string;
  oneAtATime = true;
  isShowCategories: false;
  @ViewChild('categoryMenuMobile') categoryMenuMobile;
  clickEventSub: Subscription;
  @ViewChildren('category3Container') category3Container: QueryList<any>;
  @ViewChild('referralModal') referralModal;
  referralCode: string;
  referralLink: string;
  authSub: Subscription;
  referredUsers: Array<any> = [];
  referredUserSub: Subscription;
  toggleReferralModal$ = new Subject<boolean>();
  userData: any;
  partnerStore: any;
  partnerSub: Subscription;
  currentUrl: any;
  // mobile: false;
  // show: boolean = false;
  // menuDelay: {'show': Array<any>, 'hide': Array<any>, 'clicked': Array<any>} = {show:[], hide:[], clicked: []};
  // @ViewChildren('dpmenu') dpmenus: QueryList<any>;


  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private authActions: AuthActions,
    private productService: ProductService,
    private productActions: ProductActions,
    private searchActions: SearchActions,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private globals: Globals,
  ) {
  }

  ngOnInit() {
    this.isAuthenticated = this.store.select(getAuthStatus);
    this.totalCartItems = this.store.select(getTotalCartItems);
    this.totalCartValue = this.store.select(getTotalCartValue);
    this.categories$ = this.store.select(getTaxonomies);
    this.sortSub = this.store.select(getSortSettings).subscribe(sort => {
      this.sortSettings = sort;
    });
    this.catSub = this.categories$.subscribe(data => {
      // NOTE: flatten level 1 and 2 categories
      this.categories = data.concat([].concat.apply([], data.map(cat => cat.subCategories)));
    });
    this.partnerSub = this.store.select(getPartnerStore).subscribe(partner => {
      partner['logoRetries'] = 0;
      this.partnerStore = partner;
      localStorage.setItem('partnerStore', JSON.stringify(this.partnerStore));
      this.cd.markForCheck();
    });
    this.clickEventSub = Observable.fromEvent(document, 'click').subscribe((e: any) => {
      if (this.isShowCategories && !this.categoryMenuMobile.nativeElement.contains(e.target)) {
        this.isShowCategories = false;
        this.cd.markForCheck();
      }
    });
    this.authSub = this.isAuthenticated
      .subscribe((isAuth: boolean) => {
        if (!isAuth) {
          return Observable.of([]);
        }
        this.userData = JSON.parse(localStorage.getItem('user'));
        this.referralCode = this.userData.referralCode || '';
        this.referralLink = `${ window.location.protocol }//${ window.location.host }/${''
          }auth/signup/pb/${ this.userData.partner_id }${ this.userData.partnerCode }${''
          }?referrer=${ this.referralCode }`;
      });
    this.referredUserSub = this.toggleReferralModal$
      .mergeMap((isShow) => {
        if (isShow && this.userData && this.userData.id) {
          return this.userService.getReferredUserList(this.userData.id);
        }
        return Observable.of([]);
      })
      .subscribe((userList) => {
        this.referredUsers = userList;
        this.cd.markForCheck();
        this.referralModal.show();
      });
    this.initAutoSuggest();
  }

  ngOnDestroy() {
    if (this.catSub) {
      this.catSub.unsubscribe();
    }
    if (this.sortSub) {
      this.sortSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.clickEventSub) {
      this.clickEventSub.unsubscribe();
    }
  }

  selectCategory(...categories): void {
    const params = { partnerId: this.partnerStore.id };
    let options = {};
    let filters = null;
    this.isShowCategories = false;
    if (categories.length) {
      filters = {
        mode: 'category',
        level: categories[0].level,
        categoryId: categories[0].id,
        breadcrumbs: categories.map(cat => {
            return { id: cat.id, name: cat.name, level: cat.level };
          }).reverse()
      };
      params[`category${filters.level}`] = filters.categoryId;
      options = this.sortSettings;
    }
    this.store.dispatch(this.productActions.getAllProducts(options, params));
    this.store.dispatch(this.searchActions.setFilter(filters ? filters : {}));
    window.scrollTo(0, 0);
  }

  toggleCategory3(id: number): void {
    const el = this.category3Container.toArray().find((category) => {
      return Number(category.nativeElement.dataset['category-2id']) === id;
    });
    if (el) {
      if (el.nativeElement.style.display === 'block') {
        el.nativeElement.style.display = 'none';
      } else {
        el.nativeElement.style.display = 'block';
      }
    }
  }

  searchKeyword(): void {
    if (this.searchText && this.searchText.length > 1) {
      const filters = {
        mode: 'search',
        keyword: this.searchText
      };
      this.store.dispatch(this.searchActions.setFilter(filters));
      const options = Object.assign({}, this.sortSettings);
      const params = {
        partnerId: this.partnerStore.id,
        keyword: this.searchText,
        search: 1,
      };
      // this.store.dispatch(this.productActions.getItemsByKeyword(filters, this.sortSettings));
      this.store.dispatch(this.productActions.getAllProducts(options, params));
      window.scrollTo(0, 0);
    }
    setTimeout(() => this.inputString = '', 300);
  }

  // NOTE: AUTO SUGGEST CODE - START
  initAutoSuggest(): void {
    this.autoSuggestData$ = Observable.create((observer: any) => {
      // Runs on every searchBar
      if (this.searchText && this.searchText.length > 1) {
        observer.next(this.searchText);
      }
    })
      .mergeMap((searchText: string) =>
        this.productService.getSearchItems(searchText, this.partnerStore.id))
      .map(results => {
        const data = [];
        results.items.forEach(item => {
          data.push(Object.assign({ group: 'ITEMS' }, item));
        });
        results.categories.forEach(category => {
          data.push(Object.assign({ group: 'CATEGORIES' }, category));
        });
        return data;
      });
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  typeaheadOnSelect(e): void {
    if (e.key) {
      this.inputString = this.searchText;
      this.searchKeyword();
    }
    if (!this.inputString) {
      if (e.item.group.toUpperCase() === 'ITEMS') {
        this.searchText = e.item.name;
        // if (this.isHomeRoute) {
        //   const slug = `/item/${ e.item.id }/${ e.item.slug ? e.item.slug : e.item.name.toLowerCase().replace(/ /g, '-') }`;
        //   window.history.pushState('item-slug', 'Title', slug);
          this.store.dispatch(this.productActions.addSelectedItem(e.item));
        // } else {
        //   this.router.navigateByUrl(`/item/${e.item.id}/${e.item.slug}`);
        // }
      } else {
        this.searchText = e.item.name.replace(/\b\w/g, l => l.toUpperCase());
        let category1, category2;
        switch (e.item.level) {
          case '1':
            this.selectCategory(e.item);
            break;
          case '2': // selectCategory(level2, level1)
            category1 = this.categories.find(cat => cat.id === e.item.category_id);
            this.selectCategory(e.item, category1);
            break;
          case '3': // selectCategory(level3, level2, level1)
            category2 = this.categories.find(cat => cat.id === e.item.category_id);
            category1 = this.categories.find(cat => cat.id === category2.category_id);
            this.selectCategory(e.item, category2, category1);
            break;
          }
        }
      } else {
        this.searchText = this.inputString;
      }
    }
  // NOTE: AUTO SUGGEST CODE - END

  clearSearchText(): void {
    this.searchText = '';
  }

  selectItem(item: Item): void {
    this.selectedItem = item;
    this.store.dispatch(this.productActions.addSelectedItem(item));
  }

  getItemImageUrl(key: string): string {
    return !key ? this.globals.ITEM_DEFAULT_IMG : `${ environment.IMAGE_REPO }${ key }.jpg`;
  }

  onImageError(e: any): void {
    e.target.src = this.globals.ITEM_DEFAULT_IMG;
    this.cd.markForCheck();
  }

  checkStoreURL(): boolean {
    return (this.router.url.indexOf('/stores') >= 0);
  }

  getLogoUrl(): string {
    if (this.partnerStore.logo) {
      const jpg = (this.partnerStore.logo.indexOf('.png') < 0 && this.partnerStore.logo.indexOf('.jpg') < 0 ) ? '.jpg' : '';
      return `${environment.S3_REPOSITORY.LOGOS}${this.partnerStore.logo}${jpg}`;    
    }
    return this.globals.LOGO_DEFAULT_IMG;
  }

  onLogoLoad(): void {
    this.cd.markForCheck();
  }

  onLogoError(e: any): void {
    const key = `${ environment.LOGO_REPO }${ this.partnerStore.logo }`;
    this.partnerStore.logoRetries += 1;
    switch (this.partnerStore.logoRetries) {
      case 1:
        e.src = `${ key }.jpg`;
        break;
      case 2:
        e.src = `${ key }.png`;
        break;
      default:
        e.src = this.globals.LOGO_DEFAULT_IMG;
    }
    this.cd.markForCheck();
  }

  openReferralModal(): void {
    this.toggleReferralModal$.next(true);
  }

  closeReferralModal(): void {
    // this.toggleReferralModal$.next('false');
  }

  copyReferralURL(textArea: any): void {
    textArea.select();
    document.execCommand('copy');
    textArea.setSelectionRange(0, 0);
  }

  logout() {
    this.authService.logout();
    window.location.href = './index.html';
  }

  //  NOTE: MEGA MENU DELAY CODE - START
  /*
  onMenuOver(e: any, index: number): void{
    e.stopPropagation();
    if(!this.menuDelay.clicked[index]) {
      const dpmenu = this.dpmenus.toArray()[index];
      const prev = this.dpmenus.find(data => data.isOpen);
      if(!prev) {
        this.menuDelay.show[index] = setTimeout(() => {
          dpmenu.show();
        }, 200)
      } else {
        clearTimeout(this.menuDelay.hide[index]);
        prev.hide();
        dpmenu.show();
      }
    }
  }

  onMenuLeave(e: any, index: number): void{
    e.stopPropagation();
    const dpmenu = this.dpmenus.toArray()[index];
    clearTimeout(this.menuDelay.show[index]);
    this.menuDelay.hide[index] = setTimeout(() => {
      dpmenu.hide();
    }, 50);
    this.menuDelay.clicked[index] = false;
  }

  onSubMenuOver(e: any, index: number): void{
    e.stopPropagation();
    clearTimeout(this.menuDelay.hide[index]);
  }

  onSubMenuLeave(e: any, index: number): void{
    e.stopPropagation();
    const dpmenu = this.dpmenus.toArray()[index];
    this.menuDelay.hide[index] = setTimeout(() => {
      dpmenu.hide();
    }, 50);
  }
  */
  //  NOTE: MEGA MENU DELAY CODE - END
}
