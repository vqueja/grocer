import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AdminService } from './../services/admin.service';


@Component({
  selector: 'app-admin-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  providers: [DatePipe],
})

export class LogsComponent implements OnInit, OnDestroy {
  logs: any;
  logsSub: Subscription;
  typeList: Array<string> = ['INFO', 'ERROR'];
  // pagination
  currentPage = 1;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  // filters
  filters: any = {
    type: 0,
    action: '',
    userId: null,
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

  ngOnDestroy() {
    if (this.logsSub) {
      this.logsSub.unsubscribe();
    }
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  applyFilter(): void {
    const filterText = [];
    const filters = Object.assign({}, this.filters);
    if (filters.type) {
      filterText.push(`Type = <i>${filters.type}</i>`);
    }
    if (filters.action) {
      filterText.push(`Action = <i>${filters.action}</i>`);
    }
    if (filters.userId) {
      filterText.push(`User ID = <i>${filters.userId}</i>`);
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

    this.logsSub = combineLatest([
      this.adminService.getLogs(Object.assign(
        { limit: this.itemsPerPage },
        this.filtersUrl
      )),
      this.adminService.getLogs(Object.assign(
        { count: 1 },
        this.filtersUrl
      ))
    ]).subscribe((results: Array<any>) => {
      this.logs = results[0].map((log) => {
        log.date = new Date(log.dateCreated).toLocaleString();
        return log;
      });
      if (results[1].length) {
        this.totalItems = results[1][0].count;
      }
    });
  }

  clearFilter(): void {
    this.filters = {
      type: 0,
      action: '',
      userId: null,
      roleId: null,
      date: ''
    };
  }

  pageChanged(event: any): void {
    this.logsSub = this.adminService.getLogs(Object.assign(
      {
        limit: this.itemsPerPage,
        skip: (event.page - 1) * this.itemsPerPage,
      },
      this.filtersUrl
    )).subscribe((logs) => {
      this.logs = logs.map((log) => {
        log.date = new Date(log.dateCreated).toLocaleString();
        return log;
      });
    });
  }

}
