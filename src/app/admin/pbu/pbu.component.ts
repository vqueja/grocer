import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AdminService } from './../services/admin.service';


@Component({
  selector: 'app-admin-pbu',
  templateUrl: './pbu.component.html',
  styleUrls: ['./pbu.component.scss']
})
export class PbuComponent implements OnInit, OnDestroy {
  pbuSub: Subscription;
  updateSub: Subscription;
  pbuData: Array<any> = [];
  activeUser: any;
  partnerList: Array<any> = [];
  currentPage = 1;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  showFilter = false;
  filters: any = {
    status: 0,
    partner: 0,
    name: null,
    username: null,
    email: null,
  };
  filtersUrl: any;
  filterText: string;

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    if (this.activeUser.partner_id === 1) {
      this.partnerList = JSON.parse(localStorage.getItem('partners'));
      this.partnerList = this.partnerList.filter((a) => a.type !== 'seller').sort((a, b) => a.id - b.id);
    }
    this.clearFilter();
    this.applyFilter();
  }

  ngOnDestroy() {
    if (this.pbuSub) {
      this.pbuSub.unsubscribe();
    }
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
  }

  applyFilter(): void {
    const filterText = [];
    const filters = Object.assign({}, this.filters);
    if (this.activeUser.partner_id === 1) {
      const partnerName = this.partnerList.find(partner =>
        partner.id === Number(filters.partner)).name;
      filterText.push(`Partner = <i>${partnerName}</i>`);
    }
    delete filters.partner;
    if (filters.name) {
      filterText.push(`Name = <i>${filters.name}</i>`);
    }
    if (filters.username) {
      filterText.push(`Username = <i>${filters.username}</i>`);
    }
    if (filters.email) {
      filterText.push(`Email = <i>${filters.email}</i>`);
    }
    if (filters.status) {
      filterText.push(`Status = <i>${filters.status === 'enabled' ? 'Enabled' : 'Disabled'}</i>`);
    } else {
      delete filters.status;
    }
    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    this.filtersUrl = Object.assign({}, filters);

    this.pbuSub = combineLatest([
      this.adminService.getPBUsers(Object.assign({
        partnerId: this.filters.partner,
        limit: this.itemsPerPage,
      }, this.filtersUrl)),
      this.adminService.getPBUsers(Object.assign({
        partnerId: this.filters.partner,
        count: 1,
      }, this.filtersUrl))
    ])
    .subscribe((results: Array<any>) => {
      this.pbuData = results[0];
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
    };
  }

  pageChanged(event: any): void {
    this.pbuSub = this.adminService.getPBUsers(Object.assign({
      partnerId: this.filters.partner,
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
    }, this.filtersUrl)).subscribe(pbu => {
      this.pbuData = pbu;
    });
  }

  setStatus(pbu: any): void {
    const data = {
      useraccount_id: pbu.useraccount_id,
      status: pbu.status === 'enabled' ? 'disabled' : 'enabled',
    };
    this.updateSub = this.adminService.updatePartnerBuyerUser(data)
      .subscribe((res: any) => {
        if (res.message.toUpperCase() === 'UPDATED') {
          pbu.status = data.status;
        }
      });
  }

}
