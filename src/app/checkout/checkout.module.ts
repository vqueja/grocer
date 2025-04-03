import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';

import { AddressModule } from './address/address.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { LayoutModule } from './../layout/index';
import { SharedModule } from './../shared/index';

import { CheckoutActions } from './actions/checkout.actions';

import { CheckoutRoutes as routes } from './checkout.routes';

import { CheckoutEffects } from './effects/checkout.effects';
import { ProductEffects } from './../product/effects/product.effects';

import { ConfirmComponent } from './confirm/confirm.component';
import { HeaderComponent } from './../layout/header/header.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // EffectsModule.run(CheckoutEffects),
    CartModule,
    AddressModule,
    PaymentModule,
    LayoutModule,
    FormsModule,
    SharedModule,
  ],
  exports: [
    HeaderComponent,
  ],
  declarations: [
    ConfirmComponent,
  ],
  providers: [
    CheckoutActions,
  ]
})
export class CheckoutModule {}
