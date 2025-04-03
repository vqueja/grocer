import { Product } from './../../core/models/product';
import { Item } from './../../core/models/item';
import { AppState } from './../../interfaces';
import { ProductState } from './product-state';
import { createSelector } from 'reselect';
import { Map, List, fromJS } from 'immutable';

// Base product state selector function
export function getProductState(state: AppState): ProductState {
  return state.products;
}

// ******************** Individual selectors ***************************
export function fetchProducts(state: ProductState) {
  const ids = state.productIds.toJS();
  const productEntities = state.productEntities.toJS();
  return ids.map(id => productEntities[id]);
}

export function fetchAllTaxonomies(state: ProductState) {
  return state.categories.toJS();
}

export function fetchSelectedItem(state: ProductState) {
  return state.selectedProduct ? state.selectedProduct.toJS() : state.selectedProduct;
}

export function fetchPartnerStore(state: ProductState) {
  return state.partnerStore ? state.partnerStore.toJS() : state.partnerStore;
}

// *************************** PUBLIC API's ****************************
export const getSelectedItem = createSelector(getProductState, fetchSelectedItem);
export const getProducts = createSelector(getProductState, fetchProducts);
export const getTaxonomies = createSelector(getProductState, fetchAllTaxonomies);
export const getPartnerStore = createSelector(getProductState, fetchPartnerStore);
