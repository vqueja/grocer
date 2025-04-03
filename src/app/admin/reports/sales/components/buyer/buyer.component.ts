import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from '../../../../services/admin.service';
import { AdminVarsService } from '../../../../services/admin-vars.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-buyer',
  templateUrl: './buyer.component.html',
  styleUrls: ['./buyer.component.scss'],
  providers: [DatePipe],
})
export class BuyerComponent implements OnInit, OnDestroy {
  ordersSub: Subscription;
  ordersCountSub: Subscription;
  showFilter: boolean = false;
  filterUrl: any = {};
  readonly itemsPerPage = 15;
  orders: any;
  partnerId = 1;
  currentPage = 1;
  partnerList: Array<any> = [];
  buyerList: Array<any> = [];
  activeUser: any;
  totalItems: number;
  filterDate: Array<Date> = [];
  filterSubType: any = '';
  filterText: string;
  dateText: string = 'All';
  buyerText: string = 'All';
  grandTotal: number;
  isAllOrders: boolean;
  buyerSubType: Array<string> = ['individual', 'corporate', 'hotel & resto', 'reseller'];
  totalIndividual: number = 0.00;
  totalCorporate: number = 0.00;
  totalHotelResto: number = 0.00;
  totalReseller: number = 0.00;

  constructor(
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.isAllOrders = true;
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    if (this.activeUser.partner_id === 1) {
      this.partnerList = JSON.parse(localStorage.getItem('partners'));
      this.partnerList.forEach(partner => {
        if(partner.type==="buyer") {
          this.buyerList.push(partner);
        }
      });
    } else {
      this.isAllOrders = false
      this.partnerList = JSON.parse(localStorage.getItem('partners'));
      this.partnerList.forEach(partner => {
        if(partner.id === this.activeUser.partner_id) {
          this.buyerList.push(partner);
        }
      });
    }
    this.filterUrl = {
      orderStatus: 'complete',
    };
    this.initOrders();
    this.initOrdersCount();

  }

  initOrders(options: any = { mode: 'buyerReport', limit: this.itemsPerPage }): void {
    this.grandTotal = 0;
    if (this.isAllOrders) {
      this.ordersSub = this.adminService.getOrdersellerList(this.partnerId, options, this.filterUrl).subscribe(orders => {
        this.orders = orders.map(order => {
          order.total = Number(order.total);
          return order;
        });
        this.totalBySubtype(this.orders);
        this.initGrandTotals(this.orders);
      });
    } else {
      this.ordersSub = this.adminService.getOrdersellerList(this.activeUser.partner_id, options, this.filterUrl).subscribe(orders => {
        this.orders = orders.map(order => {
          order.total = Number(order.total);
          return order;
        });
        this.buyerText = this.buyerList[0].subType;
        this.totalBySubtype(this.orders);
        this.initGrandTotals(this.orders);
      });
    }
  }

  initOrdersCount(): void {
    this.ordersCountSub = this.adminService.getOrdersellerList(this.activeUser.partner_id, {
      mode: 'buyerReport',
      count: 1,
    }, this.filterUrl)
      .subscribe(result => {
        if (result.length) {
          this.totalItems = result[0].count;
        }
      });
  }

  initGrandTotals(arr: any): void{
    for(let i=0; i < arr.length; i++ ){
      this.grandTotal = this.grandTotal + arr[i].total;
    }
  }

  totalBySubtype(arr: any): void {
    for(let i=0; i < arr.length; i++ ){
      if (arr[i].subType == "individual" ) {
        this.totalIndividual = this.totalIndividual + arr[i].total;
      } else if (arr[i].subType == "corporate" ) {
        this.totalCorporate = this.totalCorporate + arr[i].total;
      } else if (arr[i].subType == "hotel & resto") {
        this.totalHotelResto = this.totalHotelResto + arr[i].total;
      } else {
        this.totalReseller = this.totalReseller + arr[i].total;
      }
    }
  }

  refreshList(): void {
    this.totalIndividual = this.totalCorporate = this.totalHotelResto = this.totalReseller = 0.00;
    this.isAllOrders = true;
    this.filterUrl = {};
    this.initOrders({
      mode: 'buyerReport',
      limit: this.itemsPerPage,
      skip: (this.currentPage - 1) * this.itemsPerPage,
    });
    this.initOrdersCount();
  }

  pageChanged(event: any): void {
    this.initOrders({
      mode: 'buyerReport',
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
    });
  }

  applyFilter(): void {
    this.totalIndividual = this.totalCorporate = this.totalHotelResto = this.totalReseller = 0.00;
    const filterText = [];
    const dateText = [];
    this.filterUrl = {
      date: null,
      pbSubType: null,
    };
    if (this.filterSubType) {
      const tempPartner = this.filterSubType;
      this.filterUrl.pbSubType = this.filterSubType;
      this.buyerText = tempPartner;
      filterText.push(tempPartner);
    }
    if (this.filterDate.length) {
      const d1 = this.filterDate[0];
      const d2 = this.filterDate[1];
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      filterText.push(`date = <i>From: ${this.datePipe.transform(d1,'MM/dd/yyyy')} To: ${this.datePipe.transform(d2,'MM/dd/yyyy')}</i>`);
      dateText.push(`date = <i>From: ${this.datePipe.transform(d1,'MM/dd/yyyy')} To: ${this.datePipe.transform(d2,'MM/dd/yyyy')}</i>`);
      this.filterUrl.date = `${d1time}|${d2time}`;
    }
    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    this.dateText = dateText.length ? dateText.join(', ') : 'None';
    this.initOrders();
    this.initOrdersCount();
    this.currentPage = 1;
  }

  clearFilter(): void {
    this.filterUrl = {};
    this.filterText = '';
  }

  printReport(): void {
    window.print();
  }

  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
    if (this.ordersCountSub) {
      this.ordersCountSub.unsubscribe();
    }
  }

}
