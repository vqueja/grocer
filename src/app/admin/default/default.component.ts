import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AdminService } from './../services/admin.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Chart } from 'chart.js';

interface donutValues {
  value: number;
}

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit, AfterViewInit  {
  orderPaymentsSub: Subscription;
  salesReportSub: Subscription;
  usersSub: Subscription;
  ordersSub: Subscription;
  pbuSub: Subscription;
  pbSub: Subscription;
  users: any;
  orders: any;
  ordersList: any;
  activeUser: any;
  activeUsers: any;
  userCount: number = 0;
  activeUserCount: number = 0
  usersOnline: number = 0;
  totalItems: any;
  sales: any;
  totalSales: number = 0.00;
  stringTotalSales: string = '';
  stringOrderSubTotal: string = '';
  totalOrders: number = 0;
  orderTotals: number = 0.00;
  filterUrl: any = {};
  noData: boolean;
  partnerList: Array<any> = [];
  pbuArray: Array<any> = [];
  doughnutLabels: any = {};
  doughnutValues: any = {};
  chartValues: Array<any> = [];
  doughnutChart1: any;
  lineChart1: any;
  barChart1: any;
  currentMonth: any;
  firstDay: any;
  lastDay: any
  colors: string[] = ['#ff4d7d','#00ff00','#7cbe88','#e67157','#007bff','#28a745','#333333','#c3e6cb','#dc3545','#6c757d'];


  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    if (this.activeUser.partner_id === 1) {
      this.partnerList = JSON.parse(localStorage.getItem('partners'));
    }
    this.currentMonth = new Date();
    this.currentMonth.setDate(1);
    this.currentMonth.setHours(0);
    this.firstDay = this.currentMonth.getTime();
    this.currentMonth = new Date();
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.currentMonth.setDate(0);
    this.currentMonth.setHours(23);
    this.lastDay = this.currentMonth.getTime();
    if (this.activeUser.role_id === 1) {
      this.getUsers();
      this.getActiveUsers();
    } else {
      if (this.activeUser.role_id === 8) {
        this.getPBUsersOnInit();
        this.getActivePBUsers();
      }
    }
    this.getPartners();
    this.getOrdersCount();
  }

  ngAfterViewInit() {
    this.initOrders();
    if (this.activeUser.role_id === 1 || this.activeUser.role_id === 5) {
      if(this.activeUser.role_id > 1) {
        this.getSales(null, this.activeUser.partner_id);
      } else {
        this.getSales();
      }
    }
  }

  setOrderSalesBarGraph(label: any, data: any): void {
    var chBar = document.getElementById("chBar1");
    if (chBar) {
      if (label == 'Order Totals') {
        this.barChart1 = new Chart(chBar, {
          type: 'bar',
          data: {
            labels: ['Order Totals & Sales'],
            datasets: [{
              backgroundColor: '#00ff00',
              label: label,
              data: [data],
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
              display: true,
            },
            scales: {
              yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            }
          });
      } else {
        this.barChart1.data.datasets.push({
          backgroundColor: '#ff4d7d',
          label: label,
          data: [data]
        });
        this.barChart1.update();
      }
    }
  }

  donutAddData(arrLabels: any, arrValues: any): void{
    var chPie = document.getElementById("chDonut1");
    if (chPie) {
      this.doughnutChart1 = new Chart(chPie, {
        type: 'pie',
        data: {
          labels: ['',''],
          datasets: [{
            data: [0,0],
            backgroundColor: this.colors.slice(0,2)
          }]
        },
        options: {
          legend: {
            display: true
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    for (var i=0; i < Object.keys(arrLabels).length; i++) {
      this.doughnutChart1.data.labels[i] = arrLabels[i];
    }
    for(var j=0; j < Object.keys(arrValues).length; j++){
      this.doughnutChart1.data.datasets[0].data[j] = arrValues[j];
    }
    this.doughnutChart1.update();
  }

  getUsers (){
    this.usersSub = this.adminService.getUsers({
      limit: 0,
      count: 1,
    })
      .subscribe((results: Array<any>) => {
        this.users = results;
        if (results.length) {
          this.userCount = results.length;
        }
    });
  }

  getActiveUsers() {
    this.usersSub = this.adminService.getUsersNoFilter({
      active: 1,
    }).subscribe((results: Array<any>) => {
      this.activeUsers = results;
      if (this.activeUsers.length > 0) {
        this.activeUserCount = this.activeUsers.length;
      }
      this.donutAddData(['Registered Users', 'Active Users'],[this.userCount,this.activeUserCount]);
    });
  }

  getActivePBUsers() {
    this.usersSub = this.adminService.getPBUsersNoFilter({
      active: 1,
      partner_id: this.activeUser.partner_id
    }).subscribe((results: Array<any>) => {
      this.activeUsers = results;
      if (this.activeUsers.length > 0) {
        this.activeUserCount = this.activeUsers.length;
      }
    });
  }

  getPartners(options: any = { limit: 0 }) {
    var tempLabels = [];
    var tempValues = [];
    var ctr = 0;
    this.pbSub = this.adminService.getPartners({partner_id:this.activeUser.partner_id,}).subscribe(pb => {
      let i;
      if (pb) {
        for(i=0; i < pb.length; i++) {
          if(pb[i].type === 'buyer'){
            this.partnerList[i] = pb[i];
          }
        }
        var Obj1 = {...this.partnerList};
        Object.keys(Obj1).forEach(function(key){
          tempLabels[ctr] = Obj1[key].name;
          ctr++;
        });

        var Obj2 = {...tempLabels}
        this.doughnutLabels = Obj2;
        this.getPBUsers(this.doughnutLabels);
      }
    });
  }

  getPBUsers(arrVal: any) {
    var tempArr = [];
    this.pbuSub = this.adminService.getPBUsers({partner_id:this.activeUser.partner_id,}).subscribe(pbu => {
      this.pbuArray = pbu;
      this.partnerList.forEach((num) => {
        tempArr.push(this.countPerUser(num.id,this.pbuArray));
      });
      var Obj = {...tempArr};
      this.doughnutValues = Obj;
    });
  }

  getPBUsersOnInit() {
    var tempArr = [];
    this.pbuSub = this.adminService.getPBUsers({partner_id:this.activeUser.partner_id,}).subscribe(pbu => {
      this.doughnutValues = pbu;
      this.userCount = this.doughnutValues.length;
    });
  }

  countPerUser(partnerId: any, pbuList: any): number {
    var ctr, count = 0;
    for (ctr = 0; ctr < pbuList.length; ctr ++) {
      if(pbuList[ctr].partner_id == partnerId){
        count++;
      }
    }
    return count;
  }

  initOrders(options: any = { mode: 'orderlist', limit: 10 }): void {
    this.filterUrl = {
      roleId: this.activeUser.role_id
    };
    this.ordersSub = this.adminService.getOrdersellerList(this.activeUser.partner_id, options, this.filterUrl).subscribe(orders => {
      this.orders  = orders.map(order => {
        order.finalItemTotal = Number(order.finalItemTotal);
        return order;
      });
      this.setOrderTotals(this.orders);
      this.setOrderSalesBarGraph('Order Totals',this.orderTotals);
    });
  }

  getOrdersCount(options: any = { mode: 'orderlist', limit: 0 }): void {
    this.ordersSub = this.adminService.getOrdersellerList(this.activeUser.partner_id, options, this.filterUrl).subscribe(orders => {
      this.ordersList  = orders.map(order => {
        return order;
      });
      this.initOrdersCount(this.ordersList);
    });

  }

  getSales(options : any = { mode: '', limit: 0 }, partner ?: number):void {
    this.filterUrl = {
      partnerId: partner,
      roleId: this.activeUser.role_id
    };
    this.salesReportSub = this.adminService.getSalesReport(options, this.filterUrl).subscribe(reports => {
      if(reports.message !== 'Not Found'){
        this.sales = reports;
        this.setTotalSales(this.sales);
        this.setOrderSalesBarGraph('Sales',this.totalSales);
        this.noData = false;
      } else {
        this.sales = [];
        this.noData = true;
      }
    });
  }

  initOrdersCount(orders:any): void{
    this.totalOrders = orders.length;
  }

  initSalesCount(filter ?: any ): void {
    this.salesReportSub = this.adminService.getSalesReport({ count: 1 }, this.filterUrl).subscribe(result => {
      if (result.length) {
        this.totalItems = Number(result[0].count);
      } else {
        this.totalItems = 0;
      }
    });
  }

  setTotalSales(sales:any): void {
    for(var i = 0; i < sales.length; i ++ ) {
      var newNum = Number(sales[i].total).toFixed(2);
      this.totalSales = this.totalSales + Number(newNum);
    }
    var roundedSales = this.totalSales.toString();
    roundedSales = Number(roundedSales).toFixed(2);
    this.totalSales = Number(roundedSales);
    var stringFormat = this.totalSales.toString();

    this.stringTotalSales = Number(stringFormat).toLocaleString('us-US', { style: 'currency', currency: 'PHP' });
  }

  setOrderTotals(orders:any): void {
    for (var i = 0; i < orders.length; i++) {
      var newNum = Number(orders[i].total).toFixed(2);
      this.orderTotals = this.orderTotals + Number(newNum);
    }
  }

  ngOnDestroy() {
    if (this.salesReportSub) {
      this.salesReportSub.unsubscribe();
    } if (this.ordersSub) {
      this.ordersSub.unsubscribe();
    } if (this.pbuSub) {
      this.pbuSub.unsubscribe();
    } if (this.pbSub) {
      this.pbSub.unsubscribe();
    } if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
  }

}
