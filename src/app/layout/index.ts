import { NgModule } from '@angular/core';

// Components
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ProfileDropdownComponent } from './header/profile-dropdown/profile-dropdown.component';
import { BannerComponent } from './banner/banner.component';
import { BannerMainComponent } from './banner-main/banner-main.component';
import { BannerFeaturedComponent } from './banner-featured/banner-featured.component';
// Modules
import { SharedModule } from '../shared/index';
import { RouterModule } from '@angular/router';
import { CartModule } from './../checkout/cart/cart.module';

// 3rd party
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ModalModule } from 'ngx-bootstrap/modal';


@NgModule({
  declarations: [
    // components
    HeaderComponent,
    FooterComponent,
    BannerComponent,
    BannerMainComponent,
    BannerFeaturedComponent,
    // sub components
    ProfileDropdownComponent,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    BannerComponent,
    BannerMainComponent,
    BannerFeaturedComponent,
  ],
  imports: [
    SharedModule,
    RouterModule,
    CartModule,
    TypeaheadModule,
    AccordionModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [],
})
export class LayoutModule {}
