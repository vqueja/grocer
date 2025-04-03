import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AdminService } from './../services/admin.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy {
  customers: Array<any>;
  customersSub: Subscription;
  resetSub: Subscription;
  currentPage = 1;
  showFilter: boolean = false;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  filters: any = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  };
  filterText: string;
  filtersUrl: any;

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.applyFilter();
  }

  ngOnDestroy() {
    if (this.customersSub) {
      this.customersSub.unsubscribe();
    }
    if (this.resetSub) {
      this.resetSub.unsubscribe();
    }
  }

  applyFilter(): void {
    const filterText = [];
    const filters = Object.assign({}, this.filters);
    if (filters.username) {
      filterText.push(`Username = <i>${filters.username}</i>`);
    }
    if (filters.firstName) {
      filterText.push(`First Name = <i>${filters.firstName}</i>`);
    }
    if (filters.lastName) {
      filterText.push(`Last Name = <i>${filters.lastName}</i>`);
    }
    if (filters.email) {
      filterText.push(`Email = <i>${filters.email}</i>`);
    }
    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    this.filtersUrl = filters;

    this.customersSub = combineLatest([
      this.adminService.getCustomers(Object.assign({
        limit: this.itemsPerPage,
        list: 1,
      }, this.filtersUrl)),
      this.adminService.getCustomers(Object.assign({
        count: 1,
        list: 1,
      }, this.filtersUrl))
    ]).subscribe((results) => {
        this.customers = results[0];
        if (results[1].length) {
          this.totalItems = results[1][0].count;
        }
      });
  }

  clearFilter(): void {
    this.filters = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
    };
  }

  pageChanged(event: any): void {
    this.customersSub = this.adminService.getCustomers(Object.assign({
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
      list: 1,
    }, this.filtersUrl))
      .subscribe((customers) => this.customers = customers);
  }

  resetPassword(email: string): void {
    this.resetSub = this.adminService.resetPasswordCustomer(email).subscribe();
  }

}
