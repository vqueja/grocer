import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AdminService } from './../services/admin.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: any;
  activeUser: any;
  usersSub: Subscription;
  updateSub: Subscription;
  rolesSub: Subscription;
  resetSub: Subscription;
  partnerList: Array<any> = [];
  activePartner: any;
  rolesList: Array<any> = [];
  currentPage = 1;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  showFilter = false;
  filters: any = {
    status: 2,
    partner: 0,
    name: null,
    username: null,
    email: null,
    role: 0,
  };
  filterText: string;
  filtersUrl: any;

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    this.partnerList = JSON.parse(localStorage.getItem('partners'));
    this.activePartner = this.partnerList.find(partner =>
      partner.id === Number(this.activeUser.partner_id));
    this.rolesSub = this.adminService.getRolesList().subscribe((roles) => {
      this.setRolesList(roles);
      this.clearFilter();
      this.applyFilter();
    });
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
    if (this.rolesSub) {
      this.rolesSub.unsubscribe();
    }
    if (this.resetSub) {
      this.resetSub.unsubscribe();
    }
  }

  applyFilter(): void {
    const filterText = [];
    const filters = Object.assign({}, this.filters);
    if (filters.partner) {
      if (this.activeUser.partner_id === 1) {
        const partnerName = this.partnerList.find(partner =>
          partner.id === Number(filters.partner)).name;
        filterText.push(`Partner = <i>${partnerName}</i>`);
      }
      filters['partnerId'] = filters.partner;
      delete filters.partner;
    }
    if (filters.username) {
      filterText.push(`Username = <i>${filters.username}</i>`);
    }
    if (filters.name) {
      filterText.push(`Name = <i>${filters.name}</i>`);
    }
    if (filters.email) {
      filterText.push(`Email = <i>${filters.email}</i>`);
    }
    if (Number(filters.role)) {
      const roleName = this.rolesList.find(role =>
        role.id === Number(filters.role)).name;
      filterText.push(`Role = <i>${roleName}</i>`);
    } else {
      delete filters.role;
    }
    if (filters.status) {
      filterText.push(`Status = <i>${filters.status === 'enabled' ? 'Enabled' : 'Disabled'}</i>`);
    } else {
      delete filters.status;
    }
    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    this.filtersUrl = filters;

    this.usersSub = combineLatest([
      this.adminService.getAllSellerUsers(Object.assign({
        limit: this.itemsPerPage,
        partner: this.activeUser.partner_id,
      }, this.filtersUrl)),
      this.adminService.getAllSellerUsers(Object.assign({
        partner: this.activeUser.partner_id,
        count: 1,
      }, this.filtersUrl))
    ])
      .subscribe((results: Array<any>) => {
        this.users = results[0];
        if (results[1].length) {
          this.totalItems = results[1][0].count;
        }
      });
  }

  clearFilter(): void {
    this.filters = {
      status: 0,
      partner: this.activeUser.partner_id,
      name: null,
      username: null,
      email: null,
      role: 0,
    };
  }

  setRolesList(roles): void {
    switch (this.activePartner.type) {
      case 'internal':
        if (this.activeUser.role_id === 1) {
          this.rolesList = roles;
        } else {
          this.rolesList = roles;
          const index = this.rolesList.findIndex((role) => role.name === 'EOS Developer');
          this.rolesList.splice(index, 1);
          this.rolesList = this.rolesList.filter(role => role.name.indexOf('EOS') >= 0);
        }
        break;
      case 'buyer':
        this.rolesList = roles.filter(role => role.name.indexOf('Partner Buyer') >= 0);
        break;
      case 'seller':
        this.rolesList = roles.filter(role => role.name.indexOf('Partner Seller') >= 0);
        break;
    }
  }

  setUserStatus(user: any): void {
    const data = {
      id: user.id.toString(),
      enabled: !user.enabled,
    };
    this.updateSub = this.adminService.updateUser(data)
      .subscribe((res: any) => {
        if (res.message.toUpperCase() === 'UPDATED') {
          user.enabled = !user.enabled;
        }
      });
  }

  resetPassword(user: any): void {
    this.resetSub = this.adminService.resetPassword(user.email).subscribe();
  }

  pageChanged(event: any): void {
    this.usersSub = this.adminService.getAllSellerUsers(Object.assign({
      limit: this.itemsPerPage,
      partner: this.activeUser.partner_id,
      skip: (event.page - 1) * this.itemsPerPage,
    }, this.filtersUrl)).subscribe(users => this.users = users);
  }

}
