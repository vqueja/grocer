import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { timer } from 'rxjs/observable/timer';
import { AppState } from './interfaces';
import { Globals } from './globals';
import { getAuthStatus } from './auth/reducers/selectors';
import { AuthService } from './core/services/auth.service';
import { CheckoutService } from './core/services/checkout.service';
import { UserActions } from './user/actions/user.actions';
import { PromotionService } from './core/services/promotion.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  initSub: Subscription;
  checkSub: Subscription;
  currentUrl = '';
  currentStep: string;
  checkoutUrls = ['/checkout/cart', '/checkout/address', '/checkout/payment', '/checkout/confirm'];
  homeUrls = ['/', '/item'];
  inputPassword: string;
  isShowStore: boolean;
  hostname: string;
  partners: Array<any>;
  private partnerBuyer: Subject<any> = new BehaviorSubject({});
  private password = 'OmgLogin18!';
  private passwordList = [
    '7v5az5r1fn',
    '5clsg0ae6r',
    'b0oav3vre8',
    'gfya8ajb6q',
    'zvkl4klrxh',
    'islf4pwlng',
    'qyo1dvw0f8',
    'bgx6ekgwm6',
    'r42e2nzlec',
    'k2b2ghwozx',
    'jtzaq63ltu',
    'ny1r6nwgki',
    '7kos3q778n',
    'jdtaks7vim',
    'mguceavgrz',
    '9xnp8oe8at',
    'sn2t0ovaku',
    'xs5vtfdjux',
    'f7xzevzae0',
    '4c79b5e2s3',
    'rfnactipn2',
    'n0fuh8cswn',
    'gixszw0uep',
    '6g6aq3lfom',
    'kt7cnjja8y',
    'we3vra61qy',
    'iqj6uasnjl',
    'yajijlldt7',
    'sg00be8015',
    'tvy1xri3o3',
  ];

  constructor(
    private store: Store < AppState >,
    private router: Router,
    private authService: AuthService,
    private checkoutService: CheckoutService,
    private userActions: UserActions,
    private globals: Globals,
    private promotionService: PromotionService,
  ) {
    router.events.filter(e => e instanceof NavigationEnd)
      .subscribe((e: NavigationEnd) => {
        this.currentUrl = e.url;
        if (this.currentUrl === '/') {
          this.globals.setIsStoreSelected(false);
        }
        this.findCurrentStep(this.currentUrl);
        window.scrollTo(0, 0);
        this.serviceWorker();    
      });
    this.hostname = window.location.hostname;
  }

  ngOnInit() {
    if (window.location.pathname.indexOf('/admin') === -1) {
      this.initSub = Observable.of(this.authService.loginValidToken())
        .switchMapTo(this.authService.checkTokenExpiry())
        .switchMap(() => this.promotionService.getBanner())
        .do((banners: any) => {
          this.globals.setIsStoreSelected(false);
          this.globals.setBanners(banners);
        })
        .switchMap(() => this.promotionService.getFeaturedBanner())
        .do((banners: any) => {
          this.globals.setFeaturedBanners(banners);
        })
        .switchMap(() => this.authService.getSettings())
        .do((setting: any) =>
          localStorage.setItem('settings', setting ? JSON.stringify(setting) : '[]'))
        .switchMap(() => this.authService.getPartners({ limit: 100, sortBy: 'priority' }))
        .do((partners: any) => {
          this.globals.setPartners(partners);
          const partnerBuyer = partners.filter((partner) =>
            partner.url === window.location.hostname);
          if (partnerBuyer.length) {
            this.partnerBuyer.next(partnerBuyer[0])
          }
        })
        .switchMap(() => this.store.select(getAuthStatus))
        .do((isAuth: boolean) => {
          if (isAuth) {
            this.store.dispatch(this.userActions.getUserOrders());
            this.store.dispatch(this.userActions.getUserLists());
          }
          return isAuth;
        })
        .mergeMap((isAuth: boolean) => this.checkoutService.fetchCurrentOrder(isAuth))
        .subscribe();

      const FIVE_MINUTES = 300000;
      this.checkSub = timer(FIVE_MINUTES, FIVE_MINUTES)
        .mergeMap(() => this.authService.checkTokenExpiry())
        .subscribe();
    }
  }

  isHomeRoute(): boolean {
    if (!this.currentUrl) {
      return false;
    }
    const index = this.homeUrls.indexOf(this.currentUrl);
    if (index >= 0) {
      return true;
    } else if (this.currentUrl.indexOf('/item/') >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isStoreRoute(): boolean {
    if (this.currentUrl.indexOf('/stores/') >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isAdminRoute(): boolean {
    if (this.currentUrl.indexOf('/admin') >= 0) {
      return true;
    } else {
      return false;
    }
  }

  checkPassword(): void {
    const index = new Date().getDate() - 2;
    if ((index >= 0 && (this.passwordList[index]
      && this.inputPassword === this.passwordList[index]))
      || (this.inputPassword === this.password)) {
        this.isShowStore = true;
    }
  }

  private findCurrentStep(currentRoute): void {
    const currRouteFragments = currentRoute.split('/');
    const length = currRouteFragments.length;
    this.currentStep = currentRoute.split('/')[length - 1];
  }

  private serviceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
        registration.addEventListener('updatefound', () => {
          let worker = registration.installing;
          worker.addEventListener('statechange', () => {
            switch (worker.state) {
              case 'installed':
                window.alert('New version of the app is available. The page will be reloaded for the update to take effect.')
                worker.postMessage({action: 'skipWaiting'});
                break;
              case 'activated':
                window.location.reload();
                break;
              default:
            }
          });
        });
      });
    } 
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
    if (this.checkSub) {
      this.checkSub.unsubscribe();
    }
  }

}
