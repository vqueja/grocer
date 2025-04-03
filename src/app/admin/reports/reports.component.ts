import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from './../services/admin.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [DatePipe],
})
export class ReportsComponent implements OnInit {
  orderPaymentsSub: Subscription;
  filterText: string = 'None';
  filterUrl: any = {};
  payments: any;
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number;
  numPages: number;
  showFilter: boolean = false;
  noData: boolean = false;
  filterStatus: any = 0;
  filterOrderId: number = null;
  filterPaymentType: string = '';
  filterPaymentDate: Array<Date> = [];

  statusArrayData: Array<string> = ['Active','Cancelled','Completed'];
  paymentTypeArrayData: Array<string> = ['CASH','SALARY_DEDUCTION','PAYPAL','CREDIT_CARD','DEBIT_CARD','GIFT_CERTIFICATE'];

  constructor(private adminService: AdminService,
  private datePipe: DatePipe,
) {
  this.filterUrl = {
    paymentStatus: null,
    order_number: null,
    paymentType: null,
    paymentDateFrom: null,
    paymentDateTo: null,
  }
}

  ngOnInit() {
    this.initPayments();
  }

  initPayments(options: any = { mode: '', limit: this.itemsPerPage }): void {
    this.orderPaymentsSub = this.adminService.getOrderPayments(options, this.filterUrl).subscribe(payments => {
      if(payments.message != 'Not Found'){
        this.payments  = payments;
        this.noData = false;
      } else {
        this.payments = [];
        this.noData = true;
      }
    });
  }

  applyFilter(): void {
    const filterText = [];
    this.filterUrl = {
      paymentStatus: null,
      order_number: null,
      paymentType: null,
      paymentDateFrom: null,
      paymentDateTo: null,
    };
    if (this.filterStatus) {
      filterText.push(`Status = <i>${this.filterStatus}</i>`);
      this.filterUrl.paymentStatus = this.filterStatus;
    }
    if (this.filterOrderId) {
      filterText.push(`Order Number = <i>${this.filterOrderId}</i>`);
      this.filterUrl.order_id = this.filterOrderId;
    }
    if (this.filterPaymentType) {
      filterText.push(`Payment Type = <i>${this.filterPaymentType}</i>`);
      this.filterUrl.paymentType = this.filterPaymentType;
    }
    if (this.filterPaymentDate.length) {
      const d1 = this.filterPaymentDate[0];
      const d2 = this.filterPaymentDate[1]
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      filterText.push(`Payment Date = <i>From: ${this.datePipe.transform(d1,'MM/dd/yyyy')} To: ${this.datePipe.transform(d2,'MM/dd/yyyy')}</i>`);
      this.filterUrl.paymentDateFrom = `${d1time}`
      this.filterUrl.paymentDateTo = `${d2time}`;
    }
    this.filterText = filterText.length ? filterText.join(', '): 'None';

    this.initPayments();
    this.currentPage = 1;
  }

  closeFilter(): void {
    this.showFilter = false;
  }

  resetFilter(): void {
    this.filterStatus = 0;
    this.filterOrderId = null;
    this.filterPaymentDate = [];
    this.filterPaymentType = null;
  }

  refreshList(): void {
    this.noData = false;
    this.initPayments({
      mode: '',
      limit: this.itemsPerPage,
      skip: (this.currentPage - 1) * this.itemsPerPage,
    });
  }

  pageChanged(event: any): void {
    this.initPayments({
      mode: '',
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
    });
  }


}
