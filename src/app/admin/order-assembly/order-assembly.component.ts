import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from './../services/admin.service';
import { AdminVarsService } from '../services/admin-vars.service';

@Component({
  selector: 'app-order-assembly',
  templateUrl: './order-assembly.component.html',
  styleUrls: ['./order-assembly.component.scss']
})
export class OrderAssemblyComponent implements OnInit, OnDestroy {
  orders: Array<any> = [];
  ordersCount: Array<any> = [];
  ordersSub: Subscription;
  actionSub: Subscription;
  userData: any;
  selectedValue = 'ALL';
  toDate = new Date();
  fromDate = new Date();
  maxDate = new Date();
  showFilter = false;
  activeTab: number;
  unassignOrder: any;
  timeslotHours: Array<string> = ['8AM', '11AM', '2PM', '5PM', '8PM'];
  statusArray: Array<string> = [];
  partnerList: Array<any> = [];
  @ViewChild('unassignModal') unassignModal;

  constructor(
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('selleruser'));
    if (this.userData.partner_id === 1) {
      this.partnerList = JSON.parse(localStorage.getItem('partners'));
    }
    switch (this.userData.role_id) {
      case 9: // shoppers
        this.statusArray.push(this.adminVarsService.ORDER_STATUS[0]);
        this.statusArray.push(this.adminVarsService.ORDER_STATUS[1]);
        break;
      case 10: // drivers
        this.statusArray.push(this.adminVarsService.ORDER_STATUS[2]);
        this.statusArray.push(this.adminVarsService.ORDER_STATUS[3]);
        this.statusArray.push(this.adminVarsService.ORDER_STATUS[6]);
        break;
      case 14: // ps coordinator
          this.statusArray.push(this.adminVarsService.ORDER_STATUS[0]);
          this.statusArray.push(this.adminVarsService.ORDER_STATUS[1]);
          break;
      default: // coordinator
        this.statusArray = this.adminVarsService.ORDER_STATUS;
    }
    this.initOrders();
  }

  initOrders(): void {
    const now = new Date().getHours();
    this.activeTab = now < 5 ? 0 : Math.floor((now - 5) / 3);
    this.activeTab = this.activeTab > 4 ? 4 : this.activeTab;
    this.ordersSub = this.adminService.getAssembleOrders(this.userData.partner_id, {
      orderStatus: this.selectedValue,
      mode: 'assembly',
    })
      .map(orders => {
        this.orders = [];
        let timeslotOrders = [];
        switch (this.userData.role_id) {
          case 9: // shoppers
            timeslotOrders = orders.filter(({ status, selleraccount_id: sid }) => {
              const stat = status.toUpperCase();
              return (stat === 'PENDING' || (stat === 'IN-PROGRESS' && sid === this.userData.id));
            });
            break;
          case 10: // drivers
            timeslotOrders = orders.filter(({ status, selleraccount_id: sid }) => {
              const stat = status.toUpperCase();
              return (stat === 'ASSEMBLED' || ((stat === 'IN-TRANSIT' || stat === 'RETURNED') && sid === this.userData.id));
            });
            break;
          default:
            timeslotOrders = orders.map((order) => {
              order['partnerstore'] = this.partnerList.length && order.partner_id ?
                this.partnerList.find(partner => partner.id === order.partner_id).name : '';
              return order;
            });
        }
        this.timeslotHours.forEach((timeslot, index) => {
          const filteredOrders = timeslotOrders
            .filter(order => (this.calculateTimeslot(order.timeslot_id) === index))
            .map(order => {
              order['time'] = this.adminVarsService.ORDER_TIMESLOT[this.calculateTimeslot(order.timeslot_id)];
              return order;
            })
          this.orders.push({
            timeslot: timeslot,
            orders: filteredOrders,
            pending: filteredOrders.filter(order => order.status.toUpperCase() === 'PENDING').length,
          });
        });
        return orders;
      })
      .switchMapTo(this.adminService.getFreshFrozenCount(this.userData.partner_id))
      .subscribe(result => this.ordersCount = result);
  }

  takeOrder(orderSeller: any): void {
    this.actionSub = this.adminService.updateOrderSeller({
      id: orderSeller.id,
      selleraccount_id: this.userData.id,
      assembledBy: this.userData.id,
      updatedBy: this.userData.id,
      status: 'in-progress',
    })
      .subscribe((response: any) => {
        if (response && response.message.indexOf('Updated') >= 0) {
          this.orders[this.calculateTimeslot(orderSeller.timeslot_id)].pending--;
          this.router.navigate(['/admin/order-assemble/edit', orderSeller.id]);
        } else {
          this.initOrders();
        }
      });
  }

  deliverOrder(orderSeller: any): void {
    this.actionSub = this.adminService.updateOrderSeller({
      id: orderSeller.id,
      selleraccount_id: this.userData.id,
      deliveredBy: this.userData.id,
      updatedBy: this.userData.id,
      status: 'in-transit',
    })
      .subscribe((response: any) => {
        if (response && response.message.indexOf('Updated') >= 0) {
          this.router.navigate(['/admin/order-assemble/view', orderSeller.id]);
        } else {
          this.initOrders();
        }
      });
  }

  refresh(): void {
    this.initOrders();
  }

  setUnassign(orderSeller: any): void {
    this.unassignOrder = orderSeller;
    this.unassignModal.show();
  }

  cancelUnassign(): void {
    this.unassignOrder = null;
    this.unassignModal.hide();
  }

  confirmUnassign(): void {
    const order = this.unassignOrder;
    const data = {
      id: order.id,
      selleraccount_id: 0,
      updatedBy: this.userData.id,
      status: '',
      assembledBy: 0,
      deliveredBy: 0,
    };
    if (order.status.toUpperCase() === 'IN-PROGRESS') {
      data.status = 'pending';
      delete data.deliveredBy;
    } else if (order.status.toUpperCase() === 'IN-TRANSIT') {
      data.status = 'assembled';
      delete data.assembledBy;
    }
    this.actionSub = this.adminService.updateOrderSeller(data)
      .subscribe((response: any) => {
        this.initOrders();
        this.unassignModal.hide();
      });
  }

  showButton(orderSeller: any, button: string): boolean {
    switch (button) {
      case 'TAKE':
        return orderSeller.status.toUpperCase() === 'PENDING';
      case 'CONTINUE':
        return (orderSeller.status.toUpperCase() === 'IN-PROGRESS'
          && orderSeller.assembledBy === this.userData.id);
      case 'DELIVER':
        return orderSeller.status.toUpperCase() === 'ASSEMBLED';
      case 'VIEW':
        return ((orderSeller.status.toUpperCase() !== 'PENDING'
            && orderSeller.status.toUpperCase() !== 'IN-PROGRESS'
            && orderSeller.status.toUpperCase() !== 'ASSEMBLED')
          || (this.userData.role_id !== 9 && this.userData.role_id !== 10));
      case 'UNASSIGN':
        return (orderSeller.selleraccount_id && this.userData.role_id !== 9 && this.userData.role_id !== 10);
    }
  }

  applyFilter(): void {
    const filters = {
      status: this.selectedValue !== 'ALL' ? this.selectedValue : '',
      minDate: new Date(this.fromDate.getFullYear(), this.fromDate.getMonth(), this.fromDate.getDate()).getTime(),
      maxDate: new Date(this.toDate.getFullYear(), this.toDate.getMonth(), this.toDate.getDate()).getTime(),
    };
    this.initOrders();
    this.showFilter = false;
  }

  isPerishable(orderSeller: any): boolean {
    const index = this.ordersCount.findIndex((order) => orderSeller.order_id === order.order_id);
    if (index >= 0) {
      return this.ordersCount[index].itemCount ? true : false;
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    }
    if (this.actionSub) {
      this.actionSub.unsubscribe();
    }
  }

  private sortCompare(a, b) {
    if (a.selleraccount_id > b.selleraccount_id) {
      return -1;
    }
    if (a.selleraccount_id < b.selleraccount_id) {
      return 1;
    }
    return 0;
  }

  private calculateTimeslot(num: number): number {
    return (Number(num) - 1) % 5;
  }
}
