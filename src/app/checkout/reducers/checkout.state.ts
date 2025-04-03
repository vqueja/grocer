import { CartItem } from './../../core/models/cart_item';
import { Map, Record, List, fromJS } from 'immutable';

export interface CheckoutState extends Map<string, any> {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  cartItemIds: List<number>;
  cartItemEntities: Map<number, CartItem>;
  totalCartItems: number;
  totalCartValue: number;
  totalDiscount: number;
  serviceFee: number;
  deliveryFee: number;
  totalAmountPaid: number;
  totalAmountDue: number;
  coupon: any;
  grandTotal: number;
  billAddress: any;
  shipAddress: any;
  deliveryDate: any;
  paymentDetails: any;
  giftCerts: List<any>;
  addressType: number;
  requestItemIds: List<number>;
}

export const CheckoutStateRecord = Record({
  orderId: 0,
  orderNumber: null,
  orderStatus: null,
  cartItemIds: List([]),
  cartItemEntities: Map({}),
  totalCartItems: 0,
  totalCartValue: 0,
  totalDiscount: 0,
  serviceFee: 0,
  deliveryFee: 0,
  totalAmountPaid: 0,
  totalAmountDue: 0,
  grandTotal: 0,
  coupon: fromJS({}),
  billAddress: fromJS({}),
  shipAddress: fromJS({}),
  deliveryDate: fromJS({}),
  paymentDetails: fromJS({}),
  giftCerts: List([]),
  addressType: 0,
  requestItemIds: List([]),
});
