import { Inject } from '@angular/core';
import { Action } from '@ngrx/store';
import { Taxonomy } from './../../core/models/taxonomy';
import { Product } from './../../core/models/product';
import { Globals } from './../../globals';
import { environment } from './../../../environments/environment';

export class ProductActions {
  static GET_ALL_PRODUCTS = 'GET_ALL_PRODUCTS';
  static GET_ALL_PRODUCTS_SUCCESS = 'GET_ALL_PRODUCTS_SUCCESS';
  static GET_PRODUCT_DETAIL = 'GET_PRODUCT_DETAIL';
  static GET_PRODUCT_DETAIL_SUCCESS = 'GET_PRODUCT_DETAIL_SUCCESS';
  static CLEAR_SELECTED_PRODUCT = 'CLEAR_SELECTED_PRODUCT';
  static GET_ALL_TAXONOMIES = 'GET_ALL_TAXONOMIES';
  static GET_ALL_TAXONOMIES_SUCCESS = 'GET_ALL_TAXONOMIES_SUCCESS';
  static ADD_SELECTED_ITEM = 'ADD_SELECTED_ITEM';
  static REMOVE_SELECTED_ITEM = 'REMOVE_SELECTED_ITEM';
  static SET_PARTNER_STORE = 'SET_PARTNER_STORE';
  private globals;

  constructor(@Inject(Globals) _globals: Globals) {
    this.globals = _globals;
  }

  getAllProducts(options: any = {}, params: any = {}): Action {
    return {
      type: ProductActions.GET_ALL_PRODUCTS,
      payload: {
        options: Object.assign({
          limit: options.limit || this.globals.ITEMS_PER_PAGE,
          skip: options.offset || 0,
          sortBy: options.sortBy ? options.sortBy : null,
          sort: options.sortOrder ? options.sortOrder : null
        }, params)
      }
    };
  }

  getProductDetail(id: string): Action {
    return {
      type: ProductActions.GET_PRODUCT_DETAIL,
      payload: id
    };
  }

  // change products type to Product[]
  getAllProductsSuccess(products: any): Action {
    return {
      type: ProductActions.GET_ALL_PRODUCTS_SUCCESS,
      payload: products
     };
  }

  getProductDetailSuccess(product: Product): Action {
    return {
      type: ProductActions.GET_PRODUCT_DETAIL_SUCCESS,
      payload: product
    };
  }

  clearSelectedProduct(): Action {
    return { type: ProductActions.CLEAR_SELECTED_PRODUCT };
  }

  getAllTaxonomies(storeId: any): Action {
    return {
      type: ProductActions.GET_ALL_TAXONOMIES,
      payload: storeId
    };
  }

  getAllTaxonomiesSuccess(taxonomies: any): Action {
    return {
      type: ProductActions.GET_ALL_TAXONOMIES_SUCCESS,
      payload: taxonomies
    };
  }

  addSelectedItem(item: any): Action {
    return {
      type: ProductActions.ADD_SELECTED_ITEM,
      payload: item
    };
  }

  removeSelectedItem(): Action {
    return {
      type: ProductActions.REMOVE_SELECTED_ITEM
    };
  }

  setPartnerStore(partnerStore: any): Action {
    return {
      type: ProductActions.SET_PARTNER_STORE,
      payload: partnerStore
    };
  }

  // setStoreBanners(id: any): Action {
  //   return {
  //     type: ProductActions.SET_STORE_BANNERS,
  //     payload: id,
  //   };
  // }

}
