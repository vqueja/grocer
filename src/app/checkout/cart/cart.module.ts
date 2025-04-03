import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';

import { CartComponent } from './cart.component';
import { CartItemListComponent } from './components/cart-item-list/cart-item-list.component';
import { CartItemComponent } from './components/cart-item-list/cart-item/cart-item.component';
import { OrderTotalSummaryComponent } from './components/order-total-summary/order-total-summary.component';
import { EmptyCartComponent } from './components/empty-cart/empty-cart.component';

// import { BrowserModule } from "@angular/platform-browser";
// import { HeaderComponent } from "../../layout/header/header.component";
// import { LayoutModule } from "../../layout/index";
import { HomeModule } from './../../home/index';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalModule as CustomModalModule } from 'angular-custom-modal';


@NgModule({
  declarations: [
    CartComponent,
    CartItemListComponent,
    CartItemComponent,
    OrderTotalSummaryComponent,
    EmptyCartComponent
  ],
  exports: [
    // HeaderComponent,
    CartItemListComponent,
    CartItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    HomeModule,
    CustomModalModule,
    // BrowserModule,
    // LayoutModule
  ],
  providers: []
})
export class CartModule {}
