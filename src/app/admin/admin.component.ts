import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { timer } from 'rxjs/observable/timer';
import { AdminService } from './services/admin.service';
import { AdminVarsService } from './services/admin-vars.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

/*
1,'EOS Dev'
2,'EOS Admin'
3,'Partner Seller - Admin'
4,'Partner Seller - Coordinator'
5,'Partner Seller - Finance'
6,'Partner Seller - Management'
7,'Partner Buyer - Admin'
8,'Partner Buyer - Finance'
9,'Partner Seller - Assembly'
10,'Partner Seller - Delivery'
11, 'EOS Customer Support 1'
12, 'EOS Customer Support 2'
13, 'EOS Finance'

*/
  checkSub: Subscription;
  initSub: Subscription;
  userData: any;
  isCollapsed = true;
  userMenu: Array<any> = [];
  defaultIcon = 'glyphicon glyphicon-cog';
  menuItems = [
    {
      name: 'Assemble Order',
      routerLink: '/admin/order-assemble',
      rolesRequired: [1, 4, 9, 10],
      icon: 'glyphicon glyphicon-wrench',
    },
    {
      name: 'Orders',
      routerLink: '/admin/orders',
      rolesRequired: [1, 2, 4, 5, 6, 8, 11, 12, 13],
      icon: 'glyphicon glyphicon-shopping-cart',
    },
    {
      name: 'Partners',
      routerLink: '/admin/partners',
      rolesRequired: [1, 2],
      icon: 'fa fa-users',
      subItems: [
        {
          name: 'Partner Stores',
          routerLink: ['/admin/partners/list', 'seller'],
          rolesRequired: [1, 2],
        },
        {
          name: 'Partner Buyers',
          routerLink: ['/admin/partners/list', 'buyer'],
          rolesRequired: [1, 2],
        }
      ]
    },
    {
      name: 'Reports',
      routerLink: '/admin/reports',
      rolesRequired: [1, 2, 3, 5, 6, 13],
      icon: 'fa fa-bar-chart-o',
      subItems: [
        {
          name: 'Payment Report',
          routerLink: '/admin/reports/order-reports',
          rolesRequired: [1, 2, 5, 6, 13],
        },
        {
          name: 'Sales Report',
          routerLink: '/admin/reports/sales',
          rolesRequired: [1, 2, 3, 5, 6, 13],
        },
        {
          name: 'Store Report',
          routerLink: '/admin/reports/stores',
          rolesRequired: [1, 2, 6, 13],
        },
        {
          name: 'Buyer Report',
          routerLink: '/admin/reports/buyers',
          rolesRequired: [1, 2, 13],
        },
        {
          name: 'End-of-Day Report',
          routerLink: '/admin/reports/eod-reports',
          rolesRequired: [1, 2, 5, 13],
        }
      ]
    },
    {
      name: 'Customers',
      routerLink: '/admin/customers',
      rolesRequired: [1, 2],
      icon: 'fa fa-user'
    },
    {
      name: 'Employees',
      routerLink: '/admin/employees',
      rolesRequired: [1, 2, 8],
      icon: 'glyphicon glyphicon-tower',
    },
    {
      name: 'Admin Users',
      routerLink: '/admin/users',
      rolesRequired: [1, 2, 3, 7],
      icon: 'glyphicon glyphicon-eye-open',
    },
    {
      name: 'Admin Tools',
      rolesRequired: [1, 2, 3],
      icon: 'glyphicon glyphicon-cog',
      subItems: [
        {
          name: 'Manage Timeslot',
          routerLink: '/admin/tools/manage-timeslot',
          rolesRequired: [1, 2],
        },
        {
          name: 'Manage Items',
          routerLink: '/admin/manage-items',
          rolesRequired: [1, 2, 3],
        },
        {
          name: 'Price History',
          routerLink: '/admin/price-history',
          rolesRequired: [1, 2, 3],
          icon: 'glyphicon glyphicon-th-list',
        },
        {
          name: 'Global Settings',
          routerLink: '/admin/tools/settings',
          rolesRequired: [1, 2],
        },
        {
          name: 'Dynamic Page Content',
          routerLink: '/admin/tools/page-settings',
          rolesRequired: [1, 2],
        },
      ]
    },
    {
      name: 'Logs',
      routerLink: '/admin/logs',
      rolesRequired: [1, 2],
      icon: 'glyphicon glyphicon-th-list',
    },
  ];

  constructor(
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('selleruser'));
    document.body.classList.add('admin-body');
    const userRole = this.adminService.getUserRole();
    this.userMenu = this.menuItems.filter(menuItem => menuItem.rolesRequired.includes(userRole)
    );
    this.userMenu.forEach(menu => {
      if (menu.subItems) {
        menu.subItems = menu.subItems.filter(subItem =>
          subItem.rolesRequired.includes(userRole));
      }
    });
    this.initSub = Observable.of(this.adminService.loginValidToken())
      .mergeMap((isAuth: boolean) => {
        if (isAuth && this.userData.partner_id === 1) {
          return this.adminService.getPartners({ list: 2})
            .do((partners) => {
              localStorage.setItem('partners', JSON.stringify(partners));
              this.adminVarsService.setPartners(partners);
            });
        } else if (isAuth) {
          return this.adminService.getPartner(this.userData.partner_id)
            .do((partners) => {
              localStorage.setItem('partners', JSON.stringify([partners]));
              this.adminVarsService.setPartners([partners]);
            });
        } else {
          return Observable.of(false);
        }
      })
      .subscribe();

    const FIVE_MINUTES = 300000;
    this.checkSub = timer(0, FIVE_MINUTES)
      .mergeMap(() => this.adminService.checkTokenExpiry())
      .subscribe((result) => {
        if (!result) {
          this.logout();
        }
    });

  }

  ngOnDestroy() {
    if (this.checkSub) {
      this.checkSub.unsubscribe();
    }
  }

  logout(): void {
    this.adminService.logout();
  }

}
