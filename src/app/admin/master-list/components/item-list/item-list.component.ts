import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-admin-itemlist',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
  items: Array<any> = [];
  categories: Array<any> = [];
  brands: Array<any> = [];
  stores: Array<any> = [];
  userData: any = null;
  isEOSUser: boolean = false;
  categoryData: Array<any> = [];
  category1List: Array<any> = [];
  category2List: Array<any> = [];
  category3List: Array<any> = [];
  categoryNames: any;
  isDisabledCategory2: boolean = true;
  isDisabledCategory3: boolean = true;
  filters = {
    keyword: null,
    code: null,
    brand: null,
    category1: null,
    category2: null,
    category3: null,
    status: null,
    partnerId: 0,
  }
  itemCount: number;
  totalItems: number;
  currentPage: number = 1;
  readonly itemsPerPage: number = 15;
  numPages: number;
  showFilter: boolean = false;
  filterText: string = 'None';
  showColumn: boolean = false;
  preserveFilters: any;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('selleruser'));
    if (this.userData.partner_id === 1) {
      this.isEOSUser = true;
      this.filters.partnerId = 0;
      this.stores = JSON.parse(localStorage.getItem('partners'))
        .filter((p: any) => p.type === 'seller');
    } else {
      this.isEOSUser = false;
      this.filters.partnerId = this.userData.partner_id;
      this.showColumn = true;
    }
    this.getBrands();
    this.route.queryParams
      .do((params) => this.setFilters(params))
      .mergeMap(() => this.getCategories())
      .switchMap(() => this.generateItemList(this.getFilters()))
      .switchMap(() => this.generateTotalItemCount(this.getFilters()))
      .takeUntil(this.componentDestroyed)
      .subscribe();
  }

  getItems(options: any): Observable<any> {
    return this.isEOSUser && this.filters.partnerId === 0
      ? this.adminService.getItemsAdmin(options)
      : this.adminService.getStoreItems(Object.assign({
          partnerId: this.userData.partner_id,
          sortBy: 'item_id'
        }, options));
  }

  generateItemList(filters?: any): Observable<any> {
    return this.getItems(Object.assign({
      admin: 1,
      list: 1,
      skip: (this.currentPage - 1) * this.itemsPerPage,
      limit: this.itemsPerPage,
    }, filters))
      .do((result: any) => {
        this.items = result.list ? result.list: result;
      })
  }

  generateTotalItemCount(filters?: any): Observable<any> {
    return this.getItems(Object.assign({
      admin: 1,
      list: 1,
      count: 1,
    }, filters))
      .do((result: any) => {
        this.totalItems = result.list ? result.list[0].count: result[0].count;
      })
  }

  getBrands(): void {
    this.adminService.getItemBrands()
      .do((brands) => this.brands = brands.map((brand: any) => brand.brand))
      .takeUntil(this.componentDestroyed)
      .subscribe();
  }

  getCategories(): Observable<any> {
    const storeId = this.filters.partnerId;
    return this.adminService.getCategories(storeId)
      .do((results: any) => {
        this.categoryData = results.categories;
        this.category1List = this.categoryData.map((c) => {
          return { 
            id: c.id,
            name: c.name,
          };
        });
        this.categoryNames = this.flattenCategories(results.categories);
      });
  }

  flattenCategories(array: Array<any>): any {
    return array.reduce((acc, cur) => { 
      acc[cur.id] = { id: cur.id, name: cur.name, level: Number(cur.level) };
      if (cur.subCategories && Array.isArray(cur.subCategories)) {
        Object.assign(acc, this.flattenCategories(cur.subCategories));
      }
      return acc;
    }, { 0: { id: 0, name: 'Others', level: 1 }});
  }

  changeCategory1(): void {
    this.filters.category2 = null;
    this.isDisabledCategory2 = true;
    this.filters.category3 = null;
    this.isDisabledCategory3 = true;
    const c1 = Number(this.filters.category1);
    const category1 = this.categoryData.find((c: any) => c.id === c1);

    if (category1 && category1.subCategories.length) {
      this.isDisabledCategory2 = false;
      this.category2List = category1.subCategories.map((c: any) => ({
        id: c.id,
        name: c.name,
      }));
    }
  }

  changeCategory2(): void {
    this.filters.category3 = null;
    this.isDisabledCategory3 = true;
    const c1 = Number(this.filters.category1);
    const c2 = Number(this.filters.category2);
    const category1 = this.categoryData.find((c: any) => c.id === c1);

    if (category1 && category1.subCategories.length) {
      const category2 = category1.subCategories.find((c: any) => c.id === c2);
      if (category2 && category2.subCategories.length) {
        this.isDisabledCategory3 = false;
        this.category3List = category2.subCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
        }));
      }
    }
  }

  pageChanged(event: any): void {
    this.currentPage = event.page;
    this.filters = Object.assign({}, this.preserveFilters);
    this.loadData();
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadData();
  }

  loadData(): void {
    const filters = this.getFilters();
    if (Object.keys(filters).length) {
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: filters,
        });
    } else {
      this.router.navigate([], {});
    }
  }

  getFilters(): any {
    const filters = Object.assign({}, this.filters);
    if (filters.partnerId === 0) {
      filters.status = null;
      filters.category1 = null;
      filters.category2 = null;
      filters.category3 = null;
    } else {
      if (filters.status !== null) {
        filters.status = filters.status ? 'enabled' : 'disabled';
      }
    }
    filters['currentPage'] = this.currentPage;
    return filters;
  }

  setFilters(filters: any): void {
    this.clearFilter();
    const filterText = [];
    if (filters.currentPage) {
      this.currentPage = Number(filters.currentPage);
    }    
    if (this.isEOSUser && filters.partnerId) {
      this.filters.partnerId = Number(filters.partnerId);
      if (this.filters.partnerId) {
        const storeName = this.stores.find((s: any) => s.id === this.filters.partnerId).name;
        filterText.push(`Store = <i>${storeName}</i>`);
        this.showColumn = true;
      } else {
        this.showColumn = false;
      }
    }
    if (filters.keyword) {
      this.filters.keyword = filters.keyword;
      filterText.push(`Name = <i>${filters.keyword}</i>`);
    }
    if (filters.code) {
      this.filters.code = filters.code;
      filterText.push(`Code = <i>${filters.code}</i>`);
    }
    if (filters.status) {
      this.filters.status = filters.status === 'enabled' ? 1 : 0;
      filterText.push(`Status = <i>${filters.status}</i>`);
    }
    if (filters.brand) {
      this.filters.brand = filters.brand;
      filterText.push(`Brand = <i>${filters.brand}</i>`);
    }
    if (filters.category1) {
      this.filters.category1 = Number(filters.category1);
      filterText.push(`Category1 = <i>${this.categoryNames[filters.category1].name}</i>`);
      this.changeCategory1();
    }
    if (filters.category2) {
      this.filters.category2 = Number(filters.category2);
      filterText.push(`Category2 = <i>${this.categoryNames[filters.category2].name}</i>`);
      this.changeCategory2();
    }
    if (filters.category3) {
      this.filters.category3 = Number(filters.category3);
      filterText.push(`Category3 = <i>${this.categoryNames[filters.category3].name}</i>`);
    }
    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    if (filterText.length) {
      this.showFilter = true;
    }
    this.preserveFilters = Object.assign({}, this.filters);
  }

  closeFilter(): void {
    this.showFilter = false;
  }

  refreshList(): void {
    this.currentPage = 1;
    this.clearFilter();
    this.loadData();
  }

  clearFilter(): void {
     this.filters = {
      keyword: null,
      code: null,
      brand: null,
      category1: null,
      category2: null,
      category3: null,
      status: null,
      partnerId: this.isEOSUser ? 0: this.userData.partner_id,
    }
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

}
