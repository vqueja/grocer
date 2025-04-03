import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminVarsService } from './services/admin-vars.service';
import { AdminGuardService } from './guards/admin.guard';
import { RoleGuardService } from './guards/role.guard';
import { LoginComponent } from './login/login.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/components/order-details/order-details.component';
import { OrderAssemblyComponent } from './order-assembly/order-assembly.component';
import { OrderAssembleComponent } from './order-assembly/components/order-assemble/order-assemble.component';
import { OrderDeliverComponent } from './order-assembly/components/order-deliver/order-deliver.component';
import { PbuComponent } from './pbu/pbu.component';
import { PbuEditComponent } from './pbu/pbu-edit/pbu-edit.component';
import { PbuAddComponent } from './pbu/pbu-add/pbu-add.component';
import { LogsComponent } from './logs/logs.component';
import { ReportsComponent } from './reports/reports.component';
import { SalesComponent } from './reports/sales/sales.component';
import { OrderReportsComponent } from './reports/order-reports/order-reports.component';
import { MasterListComponent } from './master-list/master-list.component';
import { ItemListComponent } from './master-list/components/item-list/item-list.component';
import { AddItemsComponent } from './master-list/components/add-items/add-items.component';
import { UpdateItemsComponent } from './master-list/components/update-items/update-items.component';
import { EditItemComponent } from './master-list/components/edit-item/edit-item.component';
import { AddCategoryComponent } from './master-list/components/add-category/add-category.component';
import { UsersComponent } from './users/users.component';
import { AddEditUsersComponent } from './users/components/add-edit-users/add-edit-users.component';
import { ResetPasswordComponent } from './users/components/reset-password/reset-password.component';
import { EodReportsComponent } from './reports/eod-reports/eod-reports.component';
import { DefaultComponent } from './default/default.component';
import { UserProfileComponent } from './users/components/user-profile/user-profile.component';
import { PartnerListComponent } from './partner-list/partner-list.component';
import { PartnerDetailsComponent } from './partner-list/components/partner-details/partner-details.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customers/components/customer-details/customer-details.component';
import { AddOneItemComponent } from './master-list/components/add-one-item/add-one-item.component';
import { ReviewItemDetailsComponent } from './master-list/components/add-one-item/review-item-details/review-item-details.component';
import { SellerComponent } from './reports/sales/components/seller/seller.component';
import { BuyerComponent } from './reports/sales/components/buyer/buyer.component';
import { PriceHistoryComponent } from './price-history/price-history.component';

// import { SetBannerComponent } from './set-banner/set-banner.component';

export const AdminRoutes = [
  // { path: '', redirectTo: 'admin', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'resetPassword',
    component: ResetPasswordComponent
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuardService],
    children: [
      {
        path: 'tools',
        loadChildren: './tools/tools.module#ToolsModule'
      },
      {
        path: 'order-assemble',
        component: OrderAssemblyComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 4, 9, 10],
        }
      },
      {
        path: 'order-assemble/edit/:id',
        component: OrderAssembleComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 4, 9, 10],
        }
      },
      {
        path: 'order-assemble/view/:id',
        component: OrderDeliverComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 4, 9, 10]
        }
      },
      {
        path: 'orders',
        component: OrdersComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 4, 5, 6, 8, 11, 12, 13]
        }
      },
      {
        path: 'orders/view/:id',
        component: OrderDetailsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 4, 5, 6, 8, 11, 12, 13]
        }
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3, 7]
        }
      },
      {
        path: 'users/edit/:id',
        component: AddEditUsersComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3, 7]
        }
      },
      {
        path: 'users/add',
        component: AddEditUsersComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3, 7]
        }
      },
      {
        path: 'users/profile/:id',
        component: UserProfileComponent,
      },
      {
        path: 'logs',
        component: LogsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2]
        }
      },
      {
        path: 'employees',
        component: PbuComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 8]
        }
      },
      {
        path: 'reports/order-reports',
        component: OrderReportsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 5, 6, 13]
        }
      },
      {
        path: 'reports/sales',
        component: SalesComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3, 5, 6, 13]
        }
      },
      {
        path: 'reports/stores',
        component: SellerComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 6, 13]
        }
      },
      {
        path: 'reports/buyers',
        component: BuyerComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 5, 6, 13]
        }
      },
      {
        path: 'reports/eod-reports',
        component: EodReportsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 5, 13]
        }
      },
      {
        path: 'employees/edit/:id',
        component: PbuEditComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 7, 8]
        }
      },
      {
        path: 'employees/add',
        component: PbuAddComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 8]
        }
      },
      {
        path: 'manage-items',
        component: ItemListComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3]
        }
      },
      {
        path: 'manage-items/add-item',
        component: AddOneItemComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3]
        }
      },
      {
        path: 'manage-items/csv/add',
        component: AddItemsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3]
        }
      },
      {
        path: 'manage-items/csv/update',
        component: UpdateItemsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3]
        }
      },
      {
        path: 'manage-items/edit/:id',
        component: EditItemComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3]
        }
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 5, 6, 13]
        }
      },
      {
        path: 'partners/list/:type',
        component: PartnerListComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2]
        }
      },
      {
        path: 'partners/edit/:id',
        component: PartnerDetailsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2]
        }
      },
      {
        path: 'partners/add',
        component: PartnerDetailsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2]
        }
      },
      {
        path: 'customers',
        component: CustomersComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2]
        }
      },
      {
        path: 'customers/view/:id',
        component: CustomerDetailsComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2]
        }
      },
      {
        path: 'home',
        component: DefaultComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 4, 5, 6, 7, 8, 11, 12, 13]
        }
      },
      {
        path: 'price-history',
        component: PriceHistoryComponent,
        canActivate: [RoleGuardService],
        data: {
          expectedRole: [1, 2, 3]
        }
      },
    ],
  }
];
