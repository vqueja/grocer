import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd party imports
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';

// components
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { NotificationComponent } from './components/notification/notification.component';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { StaticPagesComponent } from './components/static-pages/static-pages.component';
import { PopupComponent } from './components/popup/popup.component';
import { SharedService } from './components/services/shared.service';


@NgModule({
  declarations: [
    // components
    LoadingIndicatorComponent,
    NotificationComponent,
    StarRatingComponent,
    StaticPagesComponent,
    PopupComponent,
  ],
  exports: [
    // components
    LoadingIndicatorComponent,
    NotificationComponent,
    StarRatingComponent,
    StaticPagesComponent,
    PopupComponent,
    // modules
    CommonModule,
    BsDropdownModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [
    SharedService,
  ]
})
export class SharedModule {}
