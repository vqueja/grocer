import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AdminService } from './../services/admin.service';

@Component({
  selector: 'app-price-history',
  templateUrl: './price-history.component.html',
  styleUrls: ['./price-history.component.scss'],
  providers: [DatePipe],
})

export class PriceHistoryComponent implements OnInit, OnDestroy {
  history: any;
  historySub: Subscription;
  typeList: Array<string> = ['INFO', 'ERROR'];
  // pagination
  currentPage = 1;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  // filters
  filters: any = {
    itemId: 0,
    user: '',
    date: ''
  };
  filterText: string;
  filtersUrl: any;
  showFilter = false;
  loggedUser: any;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private adminService: AdminService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.loggedUser = JSON.parse(localStorage.getItem('selleruser'));
    this.clearFilter();
    this.applyFilter();
  }

  applyFilter(): void {
    const filterText = [];
    const filters = Object.assign({}, this.filters);
    if (filters.type) {
      filterText.push(`item_Id = <i>${filters.itemId}</i>`);
    }
    if (filters.userId) {
      filterText.push(`User = <i>${filters.user}</i>`);
    }
    if (filters.date.length) {
      const d1 = this.filters.date[0];
      const d2 = this.filters.date[1];
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      filterText.push(`Order Date = <i>From: ${this.datePipe.transform(d1, 'MM/dd/yyyy')} `
        + `To: ${this.datePipe.transform(d2, 'MM/dd/yyyy')}</i>`);
      filters.date = `${d1time}|${d2time}`;
    }
    this.filtersUrl = filters;
    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    this.currentPage = 1;

    this.historySub = combineLatest([
      this.adminService.getItemHistory(Object.assign(
        { limit: this.itemsPerPage },
        this.filtersUrl
      )),
      this.adminService.getItemHistory(Object.assign(
        { count: 1 },
        this.filtersUrl
      ))
    ])
    .takeUntil(this.componentDestroyed)
    .subscribe((results: Array<any>) => {
      this.history = results[0].map((record) => {
        const date = new Date(record.dateUpdated);
        record.date = date.toLocaleString();
        return record;
      });
      if (results[1].length) {
        this.totalItems = results[1][0].count;
      }
    });
  }

  clearFilter(): void {
    this.filters = {
      itemId: 0,
      user: '',
      date: ''
    };
  }

  pageChanged(event: any): void {
    this.historySub = this.adminService.getItemHistory(Object.assign(
      {
        limit: this.itemsPerPage,
        skip: (event.page - 1) * this.itemsPerPage,
      },
      this.filtersUrl
    ))
    .takeUntil(this.componentDestroyed)
    .subscribe((record) => {
      this.history = record.map((record) => {
        record.date = new Date(record.dateUpdated).toLocaleString();
        return record;
      });
    });
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }
}
