// import { Product } from './../../core/models/product';
import { Item } from './../../core/models/item';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-content',
  template: `
    <app-content-header
      [partnerStore]="partnerStore"
      [filterSettings]="filters"
      [sortSettings]="sorting" >
    </app-content-header>
    <app-item-list
      [items]="items"
      [categories]="categories"
      [cartItems]="cartItemsArr"
      [partnerStore]="partnerStore"
      [sortSettings]="sorting"
      [filterSettings]="filters" >
    </app-item-list>
  `,
//   styleUrls: ['./content-header.component.scss']
})
export class ContentComponent implements OnInit {
  @Input() items: Item[];
  @Input() categories: any;
  @Input() cartItemsArr: Item[];
  @Input() filters: any;
  @Input() sorting: any;
  @Input() partnerStore: any;
  toggleLayout = {size: 'COZY'};

  constructor() { }

  ngOnInit() {
  }

  toggleSize(layoutInfo) {
    this.toggleLayout = layoutInfo;
  }

}


// <app-content-header (toggleSize)="toggleSize($event)"></app-content-header>
// <app-filter-summary></app-filter-summary>
// <app-customize></app-customize>
// <app-item-list [(toggleLayout)]='toggleLayout' [items]='products' [taxonIds]="taxonIds"></app-item-list>
