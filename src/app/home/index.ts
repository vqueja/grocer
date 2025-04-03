import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProductActions } from './../product/actions/product-actions';
import { CheckoutActions } from './../checkout/actions/checkout.actions';
import { SearchActions } from './reducers/search.actions';
import { SharedModule } from './../shared/index';

// Components
import { HomeComponent } from './home.component';
// import { BannerComponent } from './banner/components/banner/banner.component';
// Breadcrumb components
// import { BreadcrumbComponent } from './breadcrumb/components/breadcrumb/breadcrumb.component';

// Content components
import { ItemListComponent } from './content/item-list/item-list.component';
import { ItemListEntryComponent } from './content/item-list/item-list-entry/item-list-entry.component';
import { ItemDetailsDialogComponent } from './content/item-list/item-details-dialog/item-details-dialog.component';
import { ItemRequestComponent } from './content/item-list/item-request/item-request.component';
// import { FilterSummaryComponent } from './content/filter-summary/filter-summary.component';
// import { CustomizeComponent } from './content/customize/customize.component';
import { ContentHeaderComponent } from './content/content-header/content-header.component';
import { PromotionsComponent } from './content/promotions/promotions.component';
import { ContentComponent } from './content/content';
// Sidebar components
// import { TaxonsComponent } from './sidebar/taxons/taxons.component';
// import { FilterComponent } from './sidebar/filter/filter.component';
// Routes
import { HomeRoutes as routes } from './home.routes';

// import { FilterPipe } from './content/item-list/item-list-filter.pipe';

import { ModalModule as CustomModal } from 'angular-custom-modal';
import { CarouselModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RequestStoreComponent } from './request-store/request-store.component';


@NgModule({
  declarations: [
    // components
    HomeComponent,
    ItemListComponent,
    ItemListEntryComponent,
    ItemDetailsDialogComponent,
    // TaxonsComponent,
    // FilterComponent,
    // BreadcrumbComponent,
    // BannerComponent,
    ContentHeaderComponent,
    // CustomizeComponent,
    // FilterSummaryComponent,
    ContentComponent,
    PromotionsComponent,
    ItemRequestComponent,
    RequestStoreComponent,
    // pipes
    // FilterPipe
  ],
  exports: [
    ItemDetailsDialogComponent,
    ItemRequestComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CustomModal,
    ModalModule,
    CarouselModule,
  ],
  providers: [
    ProductActions,
    CheckoutActions,
    SearchActions,
  ]
})
export class HomeModule {}
