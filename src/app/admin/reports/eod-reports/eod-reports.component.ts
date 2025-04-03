import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from './../../services/admin.service';

@Component({
  selector: 'app-eod-reports',
  templateUrl: './eod-reports.component.html',
  styleUrls: ['./eod-reports.component.scss'],
  providers: [DatePipe],
})

export class EodReportsComponent implements OnInit {
  orderPaymentsSub: Subscription;
  ordersCountSub: Subscription;
  salesReportSub: Subscription;
  loggedUser: any;
  filterText: string = 'Day';
  salesFilterUrl: any = {};
  paymentFilterUrl: any = {};
  payments: any;
  sales: any;
  currentPage: number = 1;
  itemsPerPage: number = 99;
  totalItems: number;
  numPages: number;
  showFilter: boolean = false;
  noData: boolean = false;
  filterStatus: any = 0;
  filterOrderId: number = null;
  filterPaymentType: string = '';
  filterDate: Date = new Date();
  totalPayments: number = 0;
  totalCash: number = 0.00;
  totalCC: number = 0.00;
  totalDC: number = 0.00;
  totalPaypal: number = 0.00;
  totalEV: number = 0.00;
  totalGC: number = 0.00;
  totalSales: number = 0.00;
  totalDeliveryFee: number = 0.00;
  totalServiceFee: number = 0.00;
  totalDiscount: number = 0.00;
  netSales: number = 0.00;
  today: Date = new Date();
  statusArrayData: Array<string> = ['Active','Cancelled','Completed'];
  paymentTypeArrayData: Array<string> = ['CASH','SALARY_DEDUCTION','PAYPAL','CREDIT_CARD','DEBIT_CARD','GIFT_CERTIFICATE'];

  constructor(private adminService: AdminService,
  private datePipe: DatePipe,
) {

  this.salesFilterUrl = {
    status: 'complete',
    order_number: null,
    type: null,
    dateToday: null,
    roleId: 0,
    partnerId: 0,
  }
  this.paymentFilterUrl = {
    status: 'Active',
    order_number: null,
    type: null,
    dateToday: null,
    roleId: 0,
    partnerId: 0,
  }
}

  ngOnInit() {
    this.loggedUser = JSON.parse(localStorage.getItem('selleruser'));
    this.salesFilterUrl.roleId = this.loggedUser.roleId;
    this.salesFilterUrl.partnerId = this.loggedUser.partner_id;
    this.paymentFilterUrl.roleId = this.loggedUser.roleId;
    this.paymentFilterUrl.partnerId = this.loggedUser.partner_id;
    console.log(this.salesFilterUrl);
    this.today.setHours(0,0,0,0);
    const d1 = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()).getTime();
    let todayBeforeMidNight = this.today;
    todayBeforeMidNight.setHours(23,59,59,59);
    const d2 = new Date(todayBeforeMidNight).getTime();
    this.paymentFilterUrl.dateToday = this.salesFilterUrl = `${d1}|${d2}`;
    const filterDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    this.filterText = this.datePipe.transform(filterDate,'MM/dd/yyyy');
    this.initPayments();
    this.initSalesReport();
    this.initOrdersCount();
  }

  initPayments(options: any = { mode: '', limit: this.itemsPerPage }): void {
    this.orderPaymentsSub = this.adminService.getOrderPaymentsEOD(options, this.paymentFilterUrl).subscribe(payments => {
      if(payments.message !== 'Not Found'){
        this.payments  = payments;
        this.setTotalPayments(this.payments);
        this.noData = false;
      } else {
        this.totalPayments = this.totalCash = this.totalEV = this.totalGC = 0.00;
        this.payments = [];
        this.noData = true;
      }
    });
  }

  initSalesReport(options: any = { mode: '', limit: this.itemsPerPage }): void {
    this.salesReportSub = this.adminService.getSalesReport(options, this.salesFilterUrl).subscribe(reports => {
      if(reports.message !== 'Not Found'){
        this.sales = reports;
        this.setTotalSales(this.sales);
        this.netSales = this.setNetSales();
        this.noData = false;
      } else {
        this.totalSales = this.totalServiceFee = this.totalDeliveryFee = this.totalDiscount = 0.00;
        this.sales = [];
        this.netSales = this.setNetSales();
        this.noData = true;
      }
    });
  }

  initOrdersCount(): void {
    this.ordersCountSub = this.adminService.getOrderPayments({ count: 1 }, this.paymentFilterUrl).subscribe(result => {
      if (result.length) {
        this.totalItems = result[0].count;
      } else {
        this.totalItems = 0;
      }
    });
  }

  setTotalPayments(payments:any): void {
    var i;
    this.totalPayments = this.totalCash = this.totalEV = this.totalGC = 0.00;
    for(i = 0; i < payments.length; i ++ ){
      this.totalPayments = this.totalPayments + Number(payments[i].amount);
      if(payments[i].paymentType === 'CASH'){
        this.totalCash = this.totalCash + Number(payments[i].amount);
      } else if (payments[i].paymentType === 'SALARY_DEDUCTION') {
        this.totalEV = this.totalEV + Number(payments[i].amount);
      } else if (payments[i].paymentType === 'GIFT_CERTIFICATE') {
        this.totalGC = this.totalGC + Number(payments[i].amount);
      }
    }

  }

  setTotalSales(sales:any): void {
    var i;
    this.totalSales = this.totalServiceFee = this.totalDeliveryFee = this.totalDiscount = 0.00;
    for(i = 0; i < sales.length; i ++ ){
      this.totalSales = this.totalSales + Number(sales[i].total);
      this.totalServiceFee = this.totalServiceFee + Number(sales[i].serviceFee);
      this.totalDeliveryFee = this.totalDeliveryFee + Number(sales[i].deliveryFee);
      this.totalDiscount = this.totalDiscount + Number(sales[i].discountTotal);
    }
  }

  setNetSales(): number {
    var netSales = this.totalSales - this.totalServiceFee - this.totalDeliveryFee;
    return netSales;
  }

  applyFilter(): void {
    const filterText = [];
    this.salesFilterUrl = {
      status:"complete" ,
      order_number: null,
      type: null,
      dateToday: null,
    };
    this.paymentFilterUrl = {
      status: "Active",
      order_number: null,
      type: null,
      dateToday: null,
    };
    // if (this.filterStatus) {
    //   filterText.push(`Status = <i>${this.filterStatus}</i>`);
    //   this.salesFilterUrl.status = this.filterStatus;
    // }
    // if (this.filterOrderId) {
    //   filterText.push(`Order Number = <i>${this.filterOrderId}</i>`);
    //   this.filterUrl.order_id = this.filterOrderId;
    // }
    // if (this.filterPaymentType) {
    //   filterText.push(`Payment Type = <i>${this.filterPaymentType}</i>`);
    //   this.filterUrl.type = this.filterPaymentType;
    // }
    if (this.filterDate) {
      var fDate = new Date(this.filterDate.getFullYear(), this.filterDate.getMonth(), this.filterDate.getDate()).getTime();
      var dayBeforeMidNight = new Date(fDate);
      dayBeforeMidNight.setHours(23,59,59,59);
      const d1 = new Date(fDate).getTime();
      const d2 = new Date(dayBeforeMidNight).getTime();
      this.salesFilterUrl.dateToday = `${d1}|${d2}`;
      this.paymentFilterUrl.dateToday = `${d1}|${d2}`;
      this.filterText = this.datePipe.transform(d1,'MM/dd/yyyy');
    }

    this.initPayments();
    this.initSalesReport();
    this.currentPage = 1;
  }

  closeFilter(): void {
    this.showFilter = false;
  }

  resetFilter(): void {
    this.filterStatus = 0;
    this.filterOrderId = null;
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
