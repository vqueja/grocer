import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from '../../../../services/admin.service';
import { AdminVarsService } from '../../../../services/admin-vars.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
  providers: [DatePipe],
})
export class SellerComponent implements OnInit, OnDestroy {
  ordersSub: Subscription;
  ordersCountSub: Subscription;
  showFilter: boolean = false;
  filterUrl: any = {};
  readonly itemsPerPage = 15;
  numPages: number;
  orders: any;
  partnerId = 1;
  currentPage = 1;
  partnerList: Array<any> = [];
  storeList: Array<any> = [];
  activeUser: any;
  totalItems: number;
  filterDate: Array<Date> = [];
  filterPartner: any = 0;
  filterText: string;
  storeText: string = 'All';
  grandTotal: number;
  isAllOrders: boolean;

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
        if(partner.type==="seller") {
          this.storeList.push(partner);
        }
      });
    } else {
      this.isAllOrders = false
      this.partnerList = JSON.parse(localStorage.getItem('partners'));
      this.partnerList.forEach(partner => {
        if(partner.id === this.activeUser.partner_id) {
          this.storeList.push(partner);
        }
      });

    }
    this.filterUrl = {
      orderStatus: 'complete',
    };
    this.initOrders();
    this.initOrdersCount();

  }

  initOrders(options: any = { mode: 'sellerReport', limit: this.itemsPerPage }): void {
    this.grandTotal = 0;
    if (this.isAllOrders) {
      this.ordersSub = this.adminService.getOrdersellerList(this.partnerId, options, this.filterUrl).subscribe(orders => {
        this.orders = orders.map(order => {
          order.finalItemTotal = Number(order.finalItemTotal);
          order['partnerstore'] = this.partnerList.length && order.partner_id ?
          this.partnerList.find(partner => partner.id === order.partner_id).name : '';
          return order;
        });
        this.initGrandTotals(this.orders);
      });
    } else {
      this.ordersSub = this.adminService.getOrdersellerList(this.activeUser.partner_id, options, this.filterUrl).subscribe(orders => {
        this.orders = orders.map(order => {
          order.finalItemTotal = Number(order.finalItemTotal);
          order['partnerstore'] = this.storeList[0].name;
          return order;
        });

        this.storeText = this.storeList[0].name;;
        this.initGrandTotals(this.orders);
      });
    }
  }

  initOrdersCount(): void {
    this.ordersCountSub = this.adminService.getOrdersellerList(this.activeUser.partner_id, {
      mode: 'sellerReport',
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
      this.grandTotal = this.grandTotal + arr[i].finalItemTotal;
    }
  }

  refreshList(): void {
    this.initOrders({
      mode: 'sellerReport',
      limit: this.itemsPerPage,
      skip: (this.currentPage - 1) * this.itemsPerPage,
    });
    this.initOrdersCount();
  }

  pageChanged(event: any): void {
    this.initOrders({
      mode: 'sellerReport',
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
    });
  }

  applyFilter(): void {
    const filterText = [];
    this.filterUrl = {
      date: null,
      partnerSeller: null,
    };
    if (this.filterPartner) {
      const tempPartner = Number(this.filterPartner);
      const partnerSeller = this.partnerList.find(partner =>
        partner.id === tempPartner).name;
      filterText.push(`Partner Seller = ${partnerSeller}`);
      this.filterUrl.partnerSeller = this.filterPartner;
      this.storeText = partnerSeller;
    }
    if (this.filterDate.length) {
      const d1 = this.filterDate[0];
      const d2 = this.filterDate[1];
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      filterText.push(`date = <i>From: ${this.datePipe.transform(d1,'MM/dd/yyyy')} To: ${this.datePipe.transform(d2,'MM/dd/yyyy')}</i>`);
      this.filterUrl.date = `${d1time}|${d2time}`;
    }

    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    this.initOrders();
    this.initOrdersCount();
    this.currentPage = 1;
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
