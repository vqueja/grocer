import { CheckoutState } from './checkout.state';
import { AppState } from './../../interfaces';
import { createSelector } from 'reselect';
import { Map, Record, List, fromJS } from 'immutable';

// Base Cart State function
export function getCheckoutState(state: AppState): CheckoutState {
  return state.checkout;
}

// ******************** Individual selectors ***************************
export function fetchCartItems(state: CheckoutState) {
  const ids = state.cartItemIds.toJS();
  const cartItemEntities = state.cartItemEntities.toJS();
  return ids.map(id => cartItemEntities[id]);
}

export function fetchOrderId(state: CheckoutState) {
  return state.orderId;
}

export function fetchOrderNumber(state: CheckoutState) {
  return state.orderNumber;
}

export function fetchTotalCartItems(state: CheckoutState) {
  return state.totalCartItems;
}

export function fetchTotalCartValue(state: CheckoutState) {
  return state.totalCartValue;
}

export function fetchGrandTotal(state: CheckoutState) {
  return state.grandTotal;
}

export function fetchTotalDiscount(state: CheckoutState) {
  return state.totalDiscount;
}

export function fetchGiftCerts(state: CheckoutState) {
  return state.giftCerts ? state.giftCerts.toJS() : state.giftCerts;
}

export function fetchTotalAmtPaid(state: CheckoutState) {
  return state.totalAmountPaid;
}

export function fetchTotalAmtDue(state: CheckoutState) {
  return state.totalAmountDue;
}

export function fetchShipAddress(state: CheckoutState) {
  return state.shipAddress ? state.shipAddress.toJS() : state.shipAddress;
}

export function fetchBillAddress(state: CheckoutState) {
  return state.billAddress ? state.billAddress.toJS() : state.billAddress;
}

export function fetchDeliveryDate(state: CheckoutState) {
  return state.deliveryDate ? state.deliveryDate.toJS() : state.deliveryDate;
}

export function fetchOrderState(state: CheckoutState) {
  return state.orderStatus;
}

export function fetchCoupon(state: CheckoutState) {
  return state.coupon ? state.coupon.toJS() : state.coupon;
}

export function fetchPaymentDetails(state: CheckoutState) {
  return state.paymentDetails ? state.paymentDetails.toJS() : state.paymentDetails;
}

export function fetchServiceFee(state: CheckoutState) {
  return state.serviceFee;
}

export function fetchDeliveryFee(state: CheckoutState) {
  return state.deliveryFee;
}

export function fetchAddressType(state: CheckoutState) {
  return state.addressType;
}

export function fetchRequestItems(state: CheckoutState) {
  const ids = state.requestItemIds.toJS();
  const cartItemEntities = state.cartItemEntities.toJS();
  return ids.map(id => cartItemEntities[id]);
}

// *************************** PUBLIC API's ****************************
export const getCartItems = createSelector(getCheckoutState, fetchCartItems);
export const getOrderId = createSelector(getCheckoutState, fetchOrderId);
export const getOrderNumber = createSelector(getCheckoutState, fetchOrderNumber);
export const getTotalCartItems = createSelector(getCheckoutState, fetchTotalCartItems);
export const getTotalCartValue = createSelector(getCheckoutState, fetchTotalCartValue);
export const getGrandTotal = createSelector(getCheckoutState, fetchGrandTotal);
export const getTotalDiscount = createSelector(getCheckoutState, fetchTotalDiscount);
export const getServiceFee = createSelector(getCheckoutState, fetchServiceFee);
export const getDeliveryFee = createSelector(getCheckoutState, fetchDeliveryFee);
export const getTotalAmtPaid = createSelector(getCheckoutState, fetchTotalAmtPaid);
export const getTotalAmtDue = createSelector(getCheckoutState, fetchTotalAmtDue);
export const getShipAddress = createSelector(getCheckoutState, fetchShipAddress);
export const getBillAddress = createSelector(getCheckoutState, fetchBillAddress);
export const getOrderState = createSelector(getCheckoutState, fetchOrderState);
export const getDeliveryDate = createSelector(getCheckoutState, fetchDeliveryDate);
export const getGiftCerts = createSelector(getCheckoutState, fetchGiftCerts);
export const getCoupon = createSelector(getCheckoutState, fetchCoupon);
export const getPaymentDetails = createSelector(getCheckoutState, fetchPaymentDetails);
export const getAddressType = createSelector(getCheckoutState, fetchAddressType);
export const getRequestItems = createSelector(getCheckoutState, fetchRequestItems);
