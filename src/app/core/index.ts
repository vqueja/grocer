import { NgModule } from '@angular/core';
import { HttpModule, XHRBackend, RequestOptions, Http } from '@angular/http';
import { Router } from '@angular/router';
// Components

// Services
import { AuthService } from './services/auth.service';
import { HttpService } from './services/http';
import { ProductService } from './services/product.service';
import { PromotionService } from './services/promotion.service';
import { ThirdPartyService } from './services/thirdparty.service';
import { CheckoutService } from './services/checkout.service';
import { UserService } from '../user/services/user.service';

import { AuthActions } from '../auth/actions/auth.actions';
import { UserActions } from '../user/actions/user.actions';
import { CheckoutActions } from './../checkout/actions/checkout.actions';

import { EffectsModule } from '@ngrx/effects';
import { AuthenticationEffects } from '../auth/effects/auth.effects';
import { ProductEffects } from '../product/effects/product.effects';
import { UserEffects } from '../user/effects/user.effects';
import { CheckoutEffects } from './../checkout/effects/checkout.effects';

import { CanActivateViaAuthGuard } from './guards/auth.guard';




export function httpInterceptor(
  backend: XHRBackend,
  defaultOptions: RequestOptions,
  router: Router,
) {
  return new HttpService(backend, defaultOptions, router);
}

@NgModule({
  declarations: [
  ],
  exports: [
  ],
  imports: [
    // Were not working on modules sice update to rc-5
    // TO BE moved to respective modules.
    EffectsModule.run(AuthenticationEffects),
    EffectsModule.run(ProductEffects),
    EffectsModule.run(CheckoutEffects),
    EffectsModule.run(UserEffects)
  ],
  providers: [
    AuthService,
    {
      provide: HttpService,
      useFactory: httpInterceptor,
      deps: [ XHRBackend, RequestOptions, Router]
    },
    CheckoutService,
    ProductService,
    AuthActions,
    CheckoutActions,
    UserActions,
    UserService,
    CanActivateViaAuthGuard,
    PromotionService,
    ThirdPartyService,
  ]
})
export class CoreModule {}
