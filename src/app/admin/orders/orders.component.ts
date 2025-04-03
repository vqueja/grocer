import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { AdminService } from './../services/admin.service';
import { AdminVarsService } from './../services/admin-vars.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  providers: [DatePipe],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any;
  showFilter: boolean = false;
  ordersSub: Subscription;
  initSub: Subscription;
  partnersSub: Subscription;
  partnerId = 1;
  currentPage = 1;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  filterText: string;
  filterUrl: any = {};
  filterForm: any = {};
  activeUser: any;
  partnerList: Array<any> = [];
  test: any;

  constructor(
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.filterText = 'None';
    this.test = [new Date(), new Date()];
    this.initFilterForm();
    this.initFilterUrl();
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    this.filterUrl.userRole = this.activeUser.role_id;
    this.partnerId = this.activeUser.partner_id;
    if (this.activeUser.partner_id === 1) {
      this.partnersSub = this.adminVarsService.getPartners()
        .subscribe((partners) => this.partnerList = partners);
    }
    this.initSub = this.route.queryParams.do((params) => {
      this.filterUrl = params;
      this.setFilterForm();
      this.parseFilterText();
    })
      .switchMap(() => forkJoin([
        this.initOrders().take(1),
        this.initOrdersCount().take(1)
      ]))
      .subscribe();
  }

  initOrders(options: any = { mode: 'orderlist', limit: this.itemsPerPage }): Observable<any> {
    return this.adminService.getOrdersellerList(
      this.partnerId,
      options,
      this.filterUrl
    ).map(orders => {
      this.orders  = orders.map(order => {
        order.finalItemTotal = Number(order.finalItemTotal);
        order['partnerbuyer'] = this.partnerList.length && order.partnerbuyer_id ?
          this.partnerList.find(partner => partner.id === order.partnerbuyer_id).name : '';
        order['partnerstore'] = this.partnerList.length && order.partner_id ?
          this.partnerList.find(partner => partner.id === order.partner_id).name : '';
        order['time'] = this.adminVarsService.ORDER_TIMESLOT[Number(order.timeslot_id - 1) % 5];
        return order;
      });
    });
  }

  initOrdersCount(): Observable<any> {
    return this.adminService.getOrdersellerList(this.partnerId, {
      mode: 'orderlist',
      count: 1,
    }, this.filterUrl)
      .map(result => {
        if (result.length) {
          this.totalItems = result[0].count;
        }
      });
  }

  initFilterForm(): void {
    this.filterForm = {
      status: 0,
      number: null,
      orderDate: [],
      deliverDate: [],
      firstName: '',
      lastName: '',
      buyer: 0,
      store: 0,
      timeslot: 0,
    };
  }

  initFilterUrl(): void{
    this.filterUrl = {
      orderStatus: null,
      orderNumber: null,
      orderDate: null,
      deliverDate: null,
      timeslotId: null,
      userRole: null,
      firstName: null,
      lastName: null,
      partnerBuyer: null,
      partnerSeller: null,
    };
  }

  parseFilterText(): void {
    const filterText = [];
    if (this.filterForm.status) {
      filterText.push(`Status = <i>${this.filterForm.status}</i>`);
    }
    if (this.filterForm.number) {
      filterText.push(`Order Number = <i>${this.filterForm.number}</i>`);
    }
    if (this.filterForm.firstName || this.filterForm.lastName) {
      const filterTextName = [];
      filterTextName.push('Customer Name =');
      if (this.filterForm.firstName) {
        filterTextName.push(this.filterForm.firstName);
      }
      if (this.filterForm.lastName) {
        filterTextName.push(this.filterForm.lastName);
      }
      filterText.push(`<i>${filterTextName.join(' ')}</i>`);
    }
    if (this.filterForm.store) {
      this.filterForm.store = Number(this.filterForm.store);
      const store = this.partnerList.find(partner =>
        partner.id === this.filterForm.store).name;
      filterText.push(`Store = <i>${store}</i>`);
    }
    if (this.filterForm.buyer) {
      this.filterForm.buyer = Number(this.filterForm.buyer);
      const buyer = this.partnerList.find(partner =>
        partner.id === this.filterForm.buyer).name;
      filterText.push(`Partner Buyer = <i>${buyer}</i>`);
    }
    if (this.filterForm.orderDate.length) {
      const [d1, d2] = this.filterForm.orderDate;
      filterText.push(`Order Date = <i>From: ${this.datePipe.transform(d1,'MM/dd/yyyy')} To: ${this.datePipe.transform(d2,'MM/dd/yyyy')}</i>`);
    }
    if (this.filterForm.deliverDate.length) {
      const [d1, d2] = this.filterForm.deliverDate;
      let deliveryText = '';
      deliveryText = `Delivery Date = <i>From: ${this.datePipe.transform(d1,'MM/dd/yyyy')} To: ${this.datePipe.transform(d2,'MM/dd/yyyy')}</i>`;
      if (this.filterForm.timeslot) {
        deliveryText += ` <i>Slot: ${this.adminVarsService.ORDER_TIMESLOT[(this.filterForm.timeslot - 1) % 5]}</i>`;
      }
      filterText.push(deliveryText);
    }
    this.filterText = filterText.length ? filterText.join(', ') : 'None';
  }

  setFilterUrl(): void {
    this.filterUrl = {};
    if (this.filterForm.status) {
      this.filterUrl.orderStatus = this.filterForm.status;
    }
    if (this.filterForm.number) {
      this.filterUrl.orderNumber = this.filterForm.number;
    }
    if (this.filterForm.firstName) {
      this.filterUrl.firstName = this.filterForm.firstName;
    }
    if (this.filterForm.lastName) {
      this.filterUrl.lastName = this.filterForm.lastName;
    }
    if (this.filterForm.store) {
      this.filterUrl.partnerSeller = this.filterForm.store;
    }
    if (this.filterForm.buyer) {
      this.filterUrl.partnerBuyer = this.filterForm.buyer;
    }
    if (this.activeUser.role_id) {
      this.filterUrl.userRole = this.activeUser.role_id;
    }
    if (this.filterForm.orderDate.length) {
      const [d1, d2] = this.filterForm.orderDate;
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      this.filterUrl.orderDate = `${d1time}|${d2time}`;
    }
    if (this.filterForm.deliverDate.length) {
      const [d1, d2] = this.filterForm.deliverDate;
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      this.filterUrl.deliverDate = `${d1time}|${d2time}`;
      if (this.filterForm.timeslot) {
        this.filterUrl.timeslotId = this.filterForm.timeslot;
      }
    }
  }

  setFilterForm(): void {
    if (this.filterUrl.orderStatus) {
      this.filterForm.status = this.filterUrl.orderStatus;
    }
    if (this.filterUrl.orderNumber) {
       this.filterForm.number = this.filterUrl.orderNumber;
    }
    if (this.filterUrl.firstName) {
      this.filterForm.firstName = this.filterUrl.firstName;
    }
    if (this.filterUrl.lastName) {
      this.filterForm.lastName = this.filterUrl.lastName;
    }
    if (this.filterUrl.partnerSeller) {
      this.filterForm.store = this.filterUrl.partnerSeller;
    }
    if (this.filterUrl.partnerBuyer) {
      this.filterForm.buyer = this.filterUrl.partnerBuyer;
    }
    if (this.filterUrl.orderDate) {
      const [d1, d2] = this.filterUrl.orderDate.split('|');
      const d = new Date(Number(d2));
      this.filterForm.orderDate = [new Date(Number(d1)), new Date(d.setDate(d.getDate() - 1))];
    }
    if (this.filterUrl.deliverDate) {
      const [d1, d2] = this.filterUrl.deliverDate.split('|');
      const d = new Date(Number(d2));
      this.filterForm.deliverDate = [new Date(Number(d1)), new Date(d.setDate(d.getDate() - 1))];
      if (this.filterUrl.timeslotId) {
        this.filterForm.timeslot = this.filterUrl.timeslotId;
      }
    }
  }

  applyFilter(): void {
    this.setFilterUrl();
    this.currentPage = 1;
    if (Object.keys(this.filterUrl).length) {
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: this.filterUrl,
        });
    } else {
      this.router.navigate([], {});
    }
  }

  clearFilter(): void {
    this.initFilterForm();
  }

  refreshList(): void {
    this.ordersSub = forkJoin([
      this.initOrders({
        mode: 'orderlist',
        limit: this.itemsPerPage,
        skip: (this.currentPage - 1) * this.itemsPerPage,
      }),
      this.initOrdersCount()
    ]).subscribe();

  }

  pageChanged(event: any): void {
    this.ordersSub = this.initOrders({
      mode: 'orderlist',
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
    }).subscribe();
  }

  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
    if (this.partnersSub) {
      this.partnersSub.unsubscribe();
    }
  }

}
