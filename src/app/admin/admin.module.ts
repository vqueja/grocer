import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Modules
import { SharedModule } from '../shared/index';
import { ToolsModule } from './tools/tools.module';

// 3rd party Modules
// import { ModalModule as CustomModalModule } from 'angular-custom-modal';
import { BsDropdownModule } from 'ngx-bootstrap';
import { ButtonsModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';

// Routes/Guards
import { AdminRoutes as routes } from './admin.routes';
import { AdminGuardService } from './guards/admin.guard';
import { RoleGuardService } from './guards/role.guard';

// Services
import { AdminService } from './services/admin.service';
import { AdminVarsService } from './services/admin-vars.service';

// Components
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { LogsComponent } from './logs/logs.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/components/order-details/order-details.component';
import { OrderAssemblyComponent } from './order-assembly/order-assembly.component';
import { OrderDeliverComponent } from './order-assembly/components/order-deliver/order-deliver.component';
import { OrderAssembleComponent } from './order-assembly/components/order-assemble/order-assemble.component';
import { MasterListComponent } from './master-list/master-list.component';
import { AddItemsComponent } from './master-list/components/add-items/add-items.component';
import { UpdateItemsComponent } from './master-list/components/update-items/update-items.component';
import { EditItemComponent } from './master-list/components/edit-item/edit-item.component';
import { AddCategoryComponent } from './master-list/components/add-category/add-category.component';
import { ItemListComponent } from './master-list/components/item-list/item-list.component';
import { AddOneItemComponent } from './master-list/components/add-one-item/add-one-item.component';
import { ItemDetailsComponent } from './master-list/components/add-one-item/item-details/item-details.component';
import { ReviewItemDetailsComponent } from './master-list/components/add-one-item/review-item-details/review-item-details.component';
import { PbuComponent } from './pbu/pbu.component';
import { PbuEditComponent } from './pbu/pbu-edit/pbu-edit.component';
import { PbuAddComponent } from './pbu/pbu-add/pbu-add.component';
import { UsersComponent } from './users/users.component';
import { AddEditUsersComponent } from './users/components/add-edit-users/add-edit-users.component';
import { ResetPasswordComponent } from './users/components/reset-password/reset-password.component';
import { UserProfileComponent } from './users/components/user-profile/user-profile.component';
import { ReportsComponent } from './reports/reports.component';
import { SalesComponent } from './reports/sales/sales.component';
import { OrderReportsComponent } from './reports/order-reports/order-reports.component';
import { EodReportsComponent } from './reports/eod-reports/eod-reports.component';
import { PartnerListComponent } from './partner-list/partner-list.component';
import { PartnerDetailsComponent } from './partner-list/components/partner-details/partner-details.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customers/components/customer-details/customer-details.component';
import { DefaultComponent } from './default/default.component';
import { SetBannerComponent } from './set-banner/set-banner.component';
import { SellerComponent } from './reports/sales/components/seller/seller.component';
import { BuyerComponent } from './reports/sales/components/buyer/buyer.component';
import { PriceHistoryComponent } from './price-history/price-history.component';

@NgModule({
  declarations: [
    AdminComponent,
    OrdersComponent,
    UsersComponent,
    PbuComponent,
    PbuEditComponent,
    PbuAddComponent,
    OrderDetailsComponent,
    LoginComponent,
    LogsComponent,
    LoginComponent,
    MasterListComponent,
    ItemListComponent,
    AddItemsComponent,
    UpdateItemsComponent,
    EditItemComponent,
    AddCategoryComponent,
    OrderAssemblyComponent,
    OrderDeliverComponent,
    OrderAssembleComponent,
    AddEditUsersComponent,
    ResetPasswordComponent,
    ReportsComponent,
    SalesComponent,
    OrderReportsComponent,
    UserProfileComponent,
    EodReportsComponent,
    DefaultComponent,
    PartnerListComponent,
    PartnerDetailsComponent,
    CustomersComponent,
    CustomerDetailsComponent,
    AddOneItemComponent,
    ItemDetailsComponent,
    ReviewItemDetailsComponent,
    SetBannerComponent,
    SellerComponent,
    BuyerComponent,
    PriceHistoryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    TypeaheadModule,
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    ToolsModule,
  ],
  exports: [ ],
  providers: [
    AdminService,
    AdminGuardService,
    RoleGuardService,
    AdminVarsService,
  ]
})
export class AdminModule { }
