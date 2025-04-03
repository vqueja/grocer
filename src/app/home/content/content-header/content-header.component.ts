import { Component, OnInit, OnChanges, Input, Output, EventEmitter,
  ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppState } from './../../../interfaces';
import { Store } from '@ngrx/store';
import { ProductActions } from './../../../product/actions/product-actions';
import { SearchActions } from './../../reducers/search.actions';

@Component({
  selector: 'app-content-header',
  templateUrl: './content-header.component.html',
  styleUrls: ['./content-header.component.scss']
})
export class ContentHeaderComponent implements OnInit, OnChanges {
  @Input() filterSettings: any;
  @Input() sortSettings: any;
  @Input() partnerStore: any;
  breadcrumbs: Array<string> = ['All'];
  sortOptions: Array<string> = ['Sort by Popularity', 'Sort by Low Price', 'Sort by High Price'];
  currentSort = '';
  bPromoExist = false;
  @ViewChild('sortList') sortList: ElementRef;

  constructor(
    private store: Store<AppState>,
    private searchActions: SearchActions,
    private productActions: ProductActions,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.bPromoExist = false;
    this.currentSort = this.sortOptions[0];
  }

  ngOnChanges() {
    this.setBreadcrumbs();
  }

  setBreadcrumbs(): void {
    this.breadcrumbs = ['All'];
    if (this.filterSettings && this.filterSettings.mode) {
      switch (this.filterSettings.mode) {
        case 'category':
          this.breadcrumbs = this.breadcrumbs.concat(this.filterSettings.breadcrumbs.map(cat => cat.name));
          break;
        case 'search':
          this.breadcrumbs[1] = 'Search Results';
          break;
        default:
      }
    }
  }

  selectBreadcrumb(breadcrumb): void {
    const params = { partnerId: this.partnerStore.id };
    let options = {};
    let filters = null;
    if (this.filterSettings.mode === 'category' && breadcrumb !== 'All') {
      const breadcrumbs = this.filterSettings.breadcrumbs;
      const index = breadcrumbs.findIndex(x => x.name === breadcrumb);
      filters = {
        mode: 'category',
        level: breadcrumbs[index].level,
        categoryId: breadcrumbs[index].id,
        breadcrumbs: breadcrumbs.slice(0, index + 1)
      };
      params[`category${filters.level}`] = filters.categoryId;
      options = this.sortSettings;
    }
    this.store.dispatch(this.productActions.getAllProducts(options, params));
    this.store.dispatch(this.searchActions.setFilter(filters ? filters : {}));
  }

  sortItems(index: number): void {
    const params = { partnerId: this.partnerStore.id };
    const sorting = { sortBy: null, sortOrder: null };
    this.currentSort = this.sortOptions[index];
    switch (index) {
      case 1:
        sorting.sortBy = 'price';
        sorting.sortOrder = 'asc';
        break;
      case 2:
        sorting.sortBy = 'price';
        sorting.sortOrder = 'desc';
        break;
      default:
        break;
    }
    if (this.filterSettings && this.filterSettings.mode) {
      const filters = this.filterSettings;
      if (filters.mode === 'category') {
        params[`category${filters.level}`] = filters.categoryId;
      } else if (filters.mode === 'search') {
        params['keyword'] = filters.keyword;
        params['search'] = 1;
      }
    }
    this.store.dispatch(this.productActions.getAllProducts(sorting, params));
    this.store.dispatch(this.searchActions.setSorting(sorting));
  }

}
