import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AppState } from './../interfaces';
import { Globals } from './../globals';
import { getAuthStatus } from './../auth/reducers/selectors';
import { getCartItems } from './../checkout/reducers/selectors';
import { SearchActions } from './../home/reducers/search.actions';
import { ProductActions } from './../product/actions/product-actions';
import { getPartnerStore } from './../product/reducers/selectors';
import { environment } from 'environments/environment';
import { PromotionService } from './../core/services/promotion.service';
import { FilterPipeStore } from './pipes/filter.pipe';
import { SharedService } from '../shared/components/services/shared.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [FilterPipeStore],
})
export class MainComponent implements OnInit, OnDestroy {
  partnerSub: Subscription;
  bannerSub: Subscription;
  visitedSub: Subscription;
  partners: Array<any> = [];
  visitedPartners: Array<any> = [];
  selectedPartner: any;
  cartItemsSub: Subscription;
  cartItems: Array<any>;
  startVisited: number = 0;
  startNew: number = 0;
  startGrocer: number = 0;
  startGourmet: number = 0;
  startGoodness: number = 0;
  startGifts: number = 0;
  endVisited: number = 4;
  endNew: number = 4;
  endGrocer: number = 4;
  endGourmet: number = 4;
  endGoodness: number = 4;
  endGifts: number = 4;
  groceryStore: Array<any> = [];
  gourmetStore: Array<any> = [];
  giftsStore: Array<any> = [];
  goodnessStore: Array<any> = [];
  visitedStore: Array<any> = [];
  vStore: Array<any> = [];
  visitedCount: number=0;
  loggedUser: any;
  vStorePtr: number = 0;
  private componentDestroyed: Subject<any> = new Subject();
  @ViewChild('confirmModal') confirmModal;

  constructor(
    private store: Store<AppState>,
    private globals: Globals,
    private router: Router,
    private searchActions: SearchActions,
    private productActions: ProductActions,
    private promotionService: PromotionService,
    private storeFilter: FilterPipeStore,
    private sharedService: SharedService,
  ) { }

  ngOnInit() {
    if( localStorage.getItem('PBUser') ){
      this.loggedUser = JSON.parse(localStorage.getItem('PBUser'));
    }
    if(localStorage.getItem('partnerStore')){
      localStorage.removeItem('partnerStore');
    }
    this.store.dispatch(this.searchActions.setFilter({}));
    this.store.dispatch(this.searchActions.setSorting({}));
    this.cartItemsSub = this.store.select(getCartItems)
      .subscribe((cartItems) => this.cartItems = cartItems);
    this.partnerSub = combineLatest(
      this.globals.getPartners(),
      this.store.select(getAuthStatus)
    )
      .do(([partners, isAuth]) => {
        const partnerBuyerData = JSON.parse(localStorage.getItem('partner'));
        let stores = partners.filter(partner => partner.type === 'seller' && partner.status === 1);
        if (isAuth && partnerBuyerData && partnerBuyerData.storeList) {
          const storeList = JSON.parse(partnerBuyerData.storeList);
          const hiddenStores = partners.filter(partner => (partner.type === 'seller' && partner.status === 2 && storeList.indexOf(partner.id) > -1));
          stores = stores.concat(hiddenStores);
        }
        stores.forEach(store => this.partners.push(Object.assign({ imgRetries: 0 }, store)));
      })
      .switchMap(() => {
        if (!this.loggedUser) {
          return Observable.of(false);
        }
        return this.promotionService.getUserVisitedStores(this.loggedUser.useraccount_id)
          .do((visitedStores) => {
            if (visitedStores.message === 'Found') {
              if (this.visitedStore.length <= 4) {
                this.visitedStore.push(visitedStores['recentStore1']);
                this.visitedStore.push(visitedStores['recentStore2']);
                this.visitedStore.push(visitedStores['recentStore3']);
                this.visitedStore.push(visitedStores['recentStore4']);
                this.visitedStore.push(visitedStores['recentStore5']);
              }
              this.vStorePtr = Number(visitedStores['pointer']);
              this.visitedStore.forEach((visitedStore) => {
                const store = this.partners.find((a) => a.id === visitedStore);
                if (store) {
                  this.visitedPartners.push(Object.assign({ imgRetries: 0, visited: 1 }, store));
                }
              });
            }
          });
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.partnerSub) {
      this.partnerSub.unsubscribe();
    }
    if (this.cartItemsSub) {
      this.cartItemsSub.unsubscribe();
    }
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  confirmOpenStore(partner: any): void {
    this.selectedPartner = partner;
    if (this.cartItems.length && this.cartItems[0].item.partner_id !== partner.id) {
      this.confirmModal.show();
    } else {
      this.openStore();
    }
  }

  nextButton(filter: string): void {
    switch (filter) {
      case 'visited':
        if (this.endVisited < this.partners.length) {
          this.startVisited = this.startVisited + 4;
          this.endVisited = this.endVisited + 4;
        }
        break;
      case 'new':
        if (this.endNew < this.partners.length) {
          this.startNew = this.startNew + 4;
          this.endNew = this.endNew + 4;
        }
        break;
      case 'grocer':
        if (this.endGrocer < this.partners.length) {
          this.startGrocer = this.startGrocer + 4;
          this.endGrocer = this.endGrocer + 4;
        }
        break;
      case 'gourmet':
        if (this.endGourmet < this.partners.length) {
          this.startGourmet = this.startGourmet + 4;
          this.endGourmet = this.endGourmet + 4;
        }
        break;
      case 'goodness':
        if (this.endGoodness < this.partners.length) {
          this.startGoodness = this.startGoodness + 4;
          this.endGoodness = this.endGoodness + 4;
        }
        break;
      case 'gifts':
        if (this.endGifts < this.partners.length) {
          this.startGifts = this.startGifts + 4;
          this.endGifts = this.endGifts + 4;
        }
        break;
      default:
      //do nothing
    }
  }

  previousButton(filter:string): void {
    switch (filter) {
      case 'visited':
        this.startVisited = (this.startVisited > 4) ? this.startVisited - 4 : 0;
        this.endVisited = (this.endVisited !== 4) ? this.endVisited - 4 : 4;
        break;
      case 'new':
        this.startNew = (this.startNew > 4) ? this.startNew - 4 : 0;
        this.endNew = (this.endNew !== 4) ? this.endNew - 4 : 4;
        break;
      case 'grocer':
        this.startGrocer = (this.startGrocer > 4) ? this.startGrocer - 4 : 0;
        this.endGrocer = (this.endGrocer !== 4) ? this.endGrocer - 4 : 4;
        break;
      case 'gourmet':
        this.startGourmet = (this.startGourmet > 4) ? this.startGourmet - 4 : 0;
        this.endGourmet = (this.endGourmet !== 4) ? this.endGourmet - 4 : 4;
        break;
      case 'goodness':
        this.startGoodness = (this.startGoodness > 4) ? this.startGoodness - 4 : 0;
        this.endGoodness = (this.endGoodness !== 4) ? this.endGoodness - 4 : 4;
        break;
      case 'gifts':
        this.startGifts = (this.startGifts > 4) ? this.startGifts - 4 : 0;
        this.endGifts = (this.endGifts !== 4) ? this.endGifts - 4 : 4;
        break;
      default:
      //do nothing
    }
  }

  getImageUrl(store: any) {
    return !store.logo ? this.globals.LOGO_DEFAULT_IMG : `${ environment.LOGO_REPO }${ store.logo }`;
  }

  onImageError(e: any, store: any): void {
    const key = `${ environment.LOGO_REPO }${ store.logo }`;
    store.imgRetries += 1;
    switch (store.imgRetries) {
      case 1:
        e.target.src = `${ key }.jpg`;
        break;
      case 2:
        e.target.src = `${ key }.png`;
        break;
      default:
        e.target.src = this.globals.LOGO_DEFAULT_IMG;
        e.onerror = null;
    }
  }

  openStore(): void {
    let bFoundMatch = false;
    this.globals.setIsStoreSelected(true);
    const slug = this.selectedPartner.name.toLowerCase().replace(/\s+/g, '-');
    if ( localStorage.getItem('PBUser') ) {
      this.loggedUser = JSON.parse(localStorage.getItem('PBUser'));
      let objStores = {user_id: this.loggedUser.useraccount_id};
      let ctr = this.vStorePtr ? this.vStorePtr: 1;
      if (this.visitedStore.length > 0) {
        let forEachCtr = this.visitedStore.length;
        for(var i=0; i < this.visitedStore.length; i++){
          if (this.selectedPartner.id === this.visitedStore[i]) {
            bFoundMatch=true;
          }
        }
        if (!bFoundMatch) {
          switch (ctr) {
            case 1:
              objStores['recentStore1'] = this.selectedPartner.id;
              break;
            case 2:
              objStores['recentStore2'] = this.selectedPartner.id;
              break;
            case 3:
              objStores['recentStore3'] = this.selectedPartner.id;
              break;
            case 4:
              objStores['recentStore4'] = this.selectedPartner.id;
              break;
            case 5:
              objStores['recentStore5'] = this.selectedPartner.id;
              break;
            default:
              //do nothing
            }
         ctr++;
        }
      } else {
        switch (ctr) {
          case 1:
            objStores['recentStore1'] = this.selectedPartner.id;
            break;
          case 2:
            objStores['recentStore2'] = this.selectedPartner.id;
            break;
          case 3:
            objStores['recentStore3'] = this.selectedPartner.id;
            break;
          case 4:
            objStores['recentStore4'] = this.selectedPartner.id;
            break;
          case 5:
            objStores['recentStore5'] = this.selectedPartner.id;
            break;
          default:
            //do nothing
          }
       ctr++;
      }
      this.vStorePtr = (ctr <= 5) ? ctr : 1;
      objStores['pointer'] = this.vStorePtr;
      this.promotionService.setUserVisitedStores(this.loggedUser.useraccount_id, objStores)
      .takeUntil(this.componentDestroyed)
      .subscribe(() => {
        this.router.navigate(['/stores', slug]);
      });
    } else {
      this.router.navigate(['/stores', slug]);
    }
  }

}
