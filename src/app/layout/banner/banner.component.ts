import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../interfaces';
import { Globals } from '../../globals';
import { environment } from 'environments/environment';
import { ProductActions } from './../../product/actions/product-actions';
import { getPartnerStore } from './../../product/reducers/selectors';
import { Store } from '@ngrx/store';


@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})

export class BannerComponent implements OnInit, OnDestroy  {
  bannerSub: Subscription;
  partnerStoreSub: Subscription;
  bannerVal1: string;
  bannerVal2: string;
  bannerVal3: string;

  constructor(
    private globals: Globals,
    private productActions: ProductActions,
    private store: Store<AppState>,

  ) { }

  ngOnInit() {

    this.partnerStoreSub = this.store.select(getPartnerStore).subscribe(store => {
        if(Object.keys(store).length > 0) {
          setTimeout(()=> {
            this.bannerVal1 = store.id ? `${ environment.BANNER_REPO }store/${ store.id }/banner1.png` : 'assets/MAIN_01.png';
            this.bannerVal2 = store.id ? `${ environment.BANNER_REPO }store/${ store.id }/banner2.png` : 'assets/MAIN_01.png';
            this.bannerVal3 = store.id ? `${ environment.BANNER_REPO }store/${ store.id }/banner3.png` : 'assets/MAIN_01.png';
          }, 100);
        } else {
          this.bannerSub = this.globals.getBanners()
            .subscribe((banner) => {
              if (banner.length > 0) {
                setTimeout(()=> {
                  this.bannerVal1 = banner[0] ? `${ environment.BANNER_REPO }${ banner[0].name }` : 'assets/MAIN_01.png';
                  this.bannerVal2 = banner[0] ? `${ environment.BANNER_REPO }${ banner[0].name }` : 'assets/MAIN_01.png';
                  this.bannerVal3 = banner[0] ? `${ environment.BANNER_REPO }${ banner[0].name }`: 'assets/MAIN_01.png';
                }, 100);
            }
          });
        }
    });
  }

  onBannerError(e: any): void {
    e.target.src = 'assets/MAIN_01.png';
  }

  resetBanners() {
    this.ngOnInit();
  }

  ngOnDestroy() {
    if (this.bannerSub) {
      this.bannerSub.unsubscribe();
    }
  }

}
