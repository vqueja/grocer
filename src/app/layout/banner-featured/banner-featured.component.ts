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
  selector: 'app-banner-featured',
  templateUrl: './banner-featured.component.html',
  styleUrls: ['./banner-featured.component.scss']
})
export class BannerFeaturedComponent implements OnInit, OnDestroy {

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
    this.bannerSub = this.globals.getFeaturedBanners()
      .subscribe((banner) => {
        if (banner.length > 0) {
          setTimeout(()=> {
            this.bannerVal1 = banner[0] ? `${ environment.BANNER_REPO }${ banner[0].name }` : 'assets/MAIN_01.png';
            this.bannerVal2 = banner[1] ? `${ environment.BANNER_REPO }${ banner[1].name }` : 'assets/MAIN_01.png';
            this.bannerVal3 = banner[2] ? `${ environment.BANNER_REPO }${ banner[2].name }`: 'assets/MAIN_01.png';
          }, 100);
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
