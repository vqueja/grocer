import { Product } from './../../core/models/product';
import { Category } from './../../core/models/category';
import { ProductActions } from './../actions/product-actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';

import { ProductService } from './../../core/services/product.service';
// import { ProductDummyService } from './../../core/services/product-dummy.service';
import { Action } from '@ngrx/store';


@Injectable()
export class ProductEffects {
  constructor(
    private actions$: Actions,
    private productService: ProductService,
    // private productService: ProductDummyService,
    private productActions: ProductActions
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect()
    GetAllProducts$: Observable<Action> = this.actions$
    .ofType(ProductActions.GET_ALL_PRODUCTS)
    .switchMap((action: Action) => this.productService.getProducts(action.payload.options))
    .map((data: any) => this.productActions.getAllProductsSuccess(data));
  // tslint:disable-next-line:member-ordering
  @Effect()
    GetAllTaxonomies$: Observable<Action> = this.actions$
    .ofType(ProductActions.GET_ALL_TAXONOMIES)
    .switchMap((action: Action) => this.productService.getStoreCategories(action.payload))
    .map((data: any) => this.productActions.getAllTaxonomiesSuccess({categories: data}));
  // tslint:disable-next-line:member-ordering
  // tslint:disable-next-line:member-ordering
  // @Effect()
  //   GetAllTaxonomies$: Observable<Action> = this.actions$
  //   .ofType(ProductActions.GET_ALL_TAXONOMIES)
  //   .switchMap((action: Action) => this.productService.getTaxonomies())
  //   .map((data: any) => this.productActions.getAllTaxonomiesSuccess({taxonomies: data}));
  //
  // @Effect()
  // GetProductDetail$: Observable<Action> = this.actions$
  //   .ofType(ProductActions.GET_PRODUCT_DETAIL)
  //   .switchMap((action: Action) => this.productService.getProduct(action.payload))
  //   .map((data: any) => this.productActions.getProductDetailSuccess(data));
}
