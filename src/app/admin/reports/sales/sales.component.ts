import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { AdminService } from './../../services/admin.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  providers: [DatePipe],
})
export class SalesComponent implements OnInit, OnDestroy {
  salesReportSub: Subscription;
  salesCountSub: Subscription;
  partnerStoreSub: Subscription;
  loggedUser: any;
  filterText: string = 'None';
  filterStatus: any = 0;
  filterDate: Array<Date> = [];
  filterPartner: any;
  sales: any;
  totalItems: number;
  numPages: number;
  showFilter: boolean = false;
  currentPage: number = 1;
  readonly itemsPerPage: number = 15;
  noData: boolean = true;
  filterUrl: any = {};
  filterTextArr: any = [];
  totalSales: number = 0.00;
  subTotals: number = 0.00;
  totalServiceFee: number = 0.00;
  totalDeliveryFee: number = 0.00;
  stores: any;
  storeSelected: any;
  worksheet: any;
  workbook: any;
  newObj: any = [];
  isAdmin: boolean;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private adminService: AdminService,
    private datePipe: DatePipe,
  ) {
    this.filterUrl = {
      dateFrom: null,
      dateTo: null,
      partnerId: 0,
    };
    this.filterText = 'None';
    this.isAdmin = false;
  }

  ngOnInit() {
    this.loggedUser = JSON.parse(localStorage.getItem('selleruser'));
    if (this.loggedUser.role_id < 3) {
      this.initGetPartnerStores();
      this.isAdmin = true;
    } else {
      this.filterUrl.partnerId = this.loggedUser.partner_id;
    }
    this.initSalesCount();
    this.initSalesReport();
  }

  initGetPartnerStores() {
    this.partnerStoreSub = this.adminService.getPartners({ type: 'seller' })
    .takeUntil(this.componentDestroyed)
    .subscribe(stores => {
      if(stores.message !== 'Not Found') {
        this.stores = stores;
      }
    });
  }

  generateReportExcel(): void {
    this.allSalesReport();
  }

  excelSheetGenerator(): void {
    let wscols = [
      {wch:30},
      {wch:30},
      {wch:30},
      {wch:30},
      {wch:30},
      {wch:30},
      {wch:30},
      {wch:30},
      {wch:30}
    ];
    let colSum = 0;
    let wb: XLSX.WorkBook = XLSX.utils.book_new();
    let colNum1 = XLSX.utils.decode_col('F'); //decode_col converts Excel col name to an integer for col #
    let colNum2 = XLSX.utils.decode_col('G'); //decode_col converts Excel col name to an integer for col #
    let colNum3 = XLSX.utils.decode_col('H'); //decode_col converts Excel col name to an integer for col #
    let colNum4 = XLSX.utils.decode_col('I'); //decode_col converts Excel col name to an integer for col #
    let range = XLSX.utils.decode_range(this.worksheet['!ref']);
    let monetaryFormat = '0.00';
    this.worksheet.A1.v = 'Order Number';
    this.worksheet.B1.v = 'Customer Name';
    this.worksheet.C1.v = 'Number of Items';
    this.worksheet.D1.v = 'Date Completed';
    this.worksheet.E1.v = 'Date Delivered';
    this.worksheet.F1.v = 'Subtotal';
    this.worksheet.G1.v = 'Service Fee';
    this.worksheet.H1.v = 'Delivery Fee';
    this.worksheet.I1.v = 'Total';
    this.worksheet['!cols'] = wscols;
    for(var i = range.s.r + 1; i <= range.e.r + 1; ++i) {
      /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
      let ref = XLSX.utils.encode_cell({r:i, c:colNum1});
      /* if the particular row did not contain data for the column, the cell will not be generated */
      if(!this.worksheet[ref]) continue;
      /* `.t == "n"` for number cells */
      if(this.worksheet[ref].t != 'n') continue;
      /* assign the `.z` number format */
      this.worksheet[ref].z = monetaryFormat;
      const tempNum =  Number(this.worksheet[ref].v).toFixed(2);
      colSum = colSum + Number(tempNum);
      if(i == range.e.r) {
        let num = i+1;
        let newRef = XLSX.utils.encode_cell({r:num, c:colNum1});
        var formula  = {f: `SUM(F1:F${num})`};
        this.worksheet[newRef] = {t: 0};
        this.worksheet[newRef].v = colSum.toString();
        this.worksheet[newRef].z = monetaryFormat;
        this.worksheet[newRef].f = formula;
        this.addCellToSheet(this.worksheet,newRef,colSum);
      }
    }
    colSum = 0;
    for(var i = range.s.r + 1; i <= range.e.r; ++i) {
      /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
      let ref = XLSX.utils.encode_cell({r:i, c:colNum2});
      /* if the particular row did not contain data for the column, the cell will not be generated */
      if(!this.worksheet[ref]) continue;
      /* `.t == "n"` for number cells */
      if(this.worksheet[ref].t != 'n') continue;
      /* assign the `.z` number format */
      this.worksheet[ref].z = monetaryFormat;
      const tempNum =  Number(this.worksheet[ref].v).toFixed(2);
      colSum = colSum + Number(tempNum);
      if(i == range.e.r) {
        let num = i+1;
        let newRef = XLSX.utils.encode_cell({r:num, c:colNum2});
        var formula  = {f: `SUM(G1:G${num})`};
        this.worksheet[newRef] = {t: 0};
        this.worksheet[newRef].v = colSum.toString();
        this.worksheet[newRef].z = monetaryFormat;
        this.worksheet[newRef].f = formula;
        this.addCellToSheet(this.worksheet,newRef,colSum);
      }
    }
    colSum = 0;
    for(var i = range.s.r + 1; i <= range.e.r; ++i) {
      /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
      let ref = XLSX.utils.encode_cell({r:i, c:colNum3});
      /* if the particular row did not contain data for the column, the cell will not be generated */
      if(!this.worksheet[ref]) continue;
      /* `.t == "n"` for number cells */
      if(this.worksheet[ref].t != 'n') continue;
      /* assign the `.z` number format */
      this.worksheet[ref].z = monetaryFormat;
      const tempNum =  Number(this.worksheet[ref].v).toFixed(2);
      colSum = colSum + Number(tempNum);
      if(i == range.e.r) {
        let num = i+1;
        let newRef = XLSX.utils.encode_cell({r:num, c:colNum3});
        var formula  = {f: `SUM(H1:H${num})`};
        this.worksheet[newRef] = {t: 0};
        this.worksheet[newRef].v = colSum.toString();
        this.worksheet[newRef].z = monetaryFormat;
        this.worksheet[newRef].f = formula;
        this.addCellToSheet(this.worksheet,newRef,colSum);
      }
    }
    colSum = 0;
    for(var i = range.s.r + 1; i <= range.e.r; ++i) {
      /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
      let ref = XLSX.utils.encode_cell({r:i, c:colNum4});
      /* if the particular row did not contain data for the column, the cell will not be generated */
      if(!this.worksheet[ref]) continue;
      /* `.t == "n"` for number cells */
      if(this.worksheet[ref].t != 'n') continue;
      /* assign the `.z` number format */
      this.worksheet[ref].z = monetaryFormat;
      const tempNum =  Number(this.worksheet[ref].v).toFixed(2);
      colSum = colSum + Number(tempNum);
      if(i == range.e.r) {
        let num = i+1;
        let newRef = XLSX.utils.encode_cell({r:num, c:colNum4});
        var formula  = {f: `SUM(I1:I${num})`};
        this.worksheet[newRef] = {t: 0};
        this.worksheet[newRef].v = colSum.toString();
        this.worksheet[newRef].z = monetaryFormat;
        this.worksheet[newRef].f = formula;
        this.addCellToSheet(this.worksheet,newRef,colSum);
      }
    }
    XLSX.utils.book_append_sheet(wb, this.worksheet, 'Sales');
    // /* save to file */
    XLSX.writeFile(wb, 'SalesReport.xlsx');
  }

  addCellToSheet(worksheet: any, address: any, value:any): void {
	  // cell object
	  var cell = {t:'?', v:value};
    // assign type
	  if (typeof value == "string") {
      cell.t = 's'; // string
    } else if (typeof value == "number") {
      cell.t = 'n'; // number
    } else if (value === true || value === false) {
      cell.t = 'b'; // boolean
    } else if (value instanceof Date) {
      cell.t = 'd';
    } else {
      throw new Error("cannot store value");
    }
	  // add to worksheet, overwriting a cell if it exists
	  this.worksheet[address] = cell;
	  // find the cell range
	  var range = XLSX.utils.decode_range(this.worksheet['!ref']);
	  var addr = XLSX.utils.decode_cell(address);

	  // extend the range to include the new cell
	  if(range.s.c > addr.c) {
       range.s.c = addr.c;
    }
	  if(range.s.r > addr.r) {
      range.s.r = addr.r;
    }
	  if(range.e.c < addr.c) {
     range.e.c = addr.c;
    }
	  if(range.e.r < addr.r){
     range.e.r = addr.r;
    }
	  // update range
    this.worksheet['!ref'] = XLSX.utils.encode_range(range);

  }

  allSalesReport(): void {
    this.worksheet = null;
    let storeName = {};
    this.filterUrl = {
      dateFrom: null,
      dateTo: null,
      partnerId: this.loggedUser.partner_id,
      count: 0,
    };
    if (this.filterDate.length) {
      const d1 = this.filterDate[0];
      const d2 = this.filterDate[1]
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      this.filterUrl.dateFrom = `${d1time}`
      this.filterUrl.dateTo = `${d2time}`;
    }
    if (this.storeSelected > 0) {
      storeName = this.getStoreName(this.storeSelected);
    }
    this.filterUrl.partnerId = Number(this.storeSelected);
    let mergedSalesOrderItems = [];
    this.salesReportSub = this.adminService.getSalesReport({mode: 'salesListNoLimit'}, this.filterUrl)
    .takeUntil(this.componentDestroyed)
    .subscribe(reports => {
      mergedSalesOrderItems = reports;
      let arrExcel = this.formatForExcel(mergedSalesOrderItems);
      this.worksheet = XLSX.utils.json_to_sheet(arrExcel);
      this.excelSheetGenerator();
    });
  }

  initSalesReport(options: any = { mode: 'salesList', limit: this.itemsPerPage } ): void {
    this.filterUrl.count = 0;
    this.salesReportSub = this.adminService.getSalesReport(options, this.filterUrl)
    .takeUntil(this.componentDestroyed)
    .subscribe(reports => {
      if(reports.message !== 'Not Found'){
        this.setCustomerNames(reports);
        this.setTotalSales(reports);
        this.setTotalSubTotals(reports);
        this.setTotalServiceFee(reports);
        this.setTotalDeliveryFee(reports);
        this.noData = false;
      } else {
        this.sales = [];
        this.setCustomerNames(this.sales);
        this.setTotalSales(this.sales);
        this.setTotalSubTotals(this.sales);
        this.setTotalServiceFee(this.sales);
        this.setTotalDeliveryFee(this.sales);
        this.noData = true;
      }
    });
  }

  initSalesCount(options: any = { mode: 'salesList', limit: this.itemsPerPage },filter?: any ): void {
    this.salesReportSub = this.adminService.getSalesReport({
      mode: 'salesList',
      count: 1,
    },this.filterUrl)
    .takeUntil(this.componentDestroyed)
    .subscribe(result => {
      let totalText = [];
      if(result.message !== 'Not Found') {
        if (result.length) {
          this.totalItems = result[0].count;
          this.filterTextArr.push(`Number of Orders: ${this.totalItems}` );
        }
      } else {
        this.totalItems = 0;
        this.filterTextArr.push(`Number of Orders: ${this.totalItems}` );
      }
      this.filterText = this.filterTextArr.length ? this.filterTextArr.join(' | '): 'None';
    });
  }

  setCustomerNames(sales: any): void {
    if (sales.length > 0) {
      sales.forEach(sale => {
        sale.customer = `${sale.firstname} ${sale.lastname}`;
      });
      this.sales = sales;
    }
  }

  setTotalSubTotals(sales:any): void {
    var i;
    this.subTotals = 0.00;
    for(i = 0; i < sales.length; i ++ ){
      this.subTotals = this.subTotals + Number(sales[i].finalItemTotal);
    }
  }

  formatForExcel(data: any): any {
    this.newObj = [];
    data.forEach(item => {
      const d1 = new Date(item.dateCompleted)
      const d2 = new Date(item.datetime);
      this.newObj.push({
        ordernumber: item.number,
        customer: `${item.firstname} ${item.lastname}`,
        items: item.finalTotalQuantity,
        dateCompleted: d1,
        dateDelivered: d2,
        subtotal: Number(item.finalItemTotal),
        serviceFee: Number(item.serviceFee),
        deliveryFee: Number(item.deliveryFee),
        total: Number(item.total)
      });
    });
    return this.newObj;
  }

  setTotalServiceFee(sales:any): void {
    var i;
    this.totalServiceFee = 0.00;
    for(i = 0; i < sales.length; i ++ ){
      this.totalServiceFee = this.totalServiceFee + Number(sales[i].serviceFee);
    }
  }

  setTotalDeliveryFee(sales:any): void {
    var i;
    this.totalDeliveryFee = 0.00
    for(i = 0; i < sales.length; i ++ ){
      this.totalDeliveryFee = this.totalDeliveryFee + Number(sales[i].deliveryFee);
    }
  }

  setTotalSales(sales:any): void{
    var i;
    this.totalSales = 0;
    for(i = 0; i < sales.length; i ++ ){
      this.totalSales = this.totalSales + Number(sales[i].total);
    }
  }

  resetFilter(): void {
    this.filterUrl = {
      dateFrom: null,
      dateTo: null,
      partnerId: 0,
      count: 0,
    };
    this.filterTextArr = [];
    this.initGetPartnerStores();
    this.initSalesReport();
    this.initSalesCount();
    this.filterStatus = 0;
    this.filterDate = null;
    this.filterPartner = null;
    this.filterText = '';
    this.currentPage = 1;
    this.totalItems = 0;
    this.storeSelected = 0;
  }

  refreshList(): void {
    this.initGetPartnerStores();
    this.initSalesReport();
    this.initSalesCount();
  }

  setStoreFilter(e): void {
    this.storeSelected = e.target.value;
  }

  applyFilter(): void {
    this.filterTextArr = [];
    let storeName = {};
    this.filterUrl = {
      dateFrom: null,
      dateTo: null,
      partnerId: 0,
      count:0
    };
    if (this.filterDate && this.filterDate.length) {
      const d1 = this.filterDate[0];
      const d2 = this.filterDate[1]
      const d1time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
      const d2time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).getTime();
      this.filterTextArr.push(`Date: ${this.datePipe.transform(d1,'MM/dd/yyyy')} - ${this.datePipe.transform(d2,'MM/dd/yyyy')}`);
      this.filterUrl.dateFrom = `${d1time}`
      this.filterUrl.dateTo = `${d2time}`;
    }
    if (this.storeSelected > 0) {
      storeName = this.getStoreName(this.storeSelected);
      this.filterTextArr.push(`STORE: ${storeName['storeName']}`);
    }
    this.filterText = this.filterTextArr.length ? this.filterTextArr.join(' | '): 'None';
    this.filterUrl.partnerId = (Number(this.storeSelected)) ? Number(this.storeSelected): this.loggedUser.partner_id;
    this.initSalesReport({ mode: 'salesList', limit: this.itemsPerPage });
    this.initSalesCount({ mode: 'salesList', limit: this.itemsPerPage });
    this.currentPage = 1;
  }

  pageChanged(event: any): void {
    this.initSalesReport({
      mode: 'salesList',
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
    });
  }

  closeFilter(): void {
    this.showFilter = false;
  }

  getStoreName(id: number): {} {
    let ret = '';
    this.stores.forEach((store) => {
      if (id == Number(store.id)){
        ret = store.name;
      }
    });
    return {
      storeName:ret
    }
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

}
