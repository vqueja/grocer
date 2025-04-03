/*
 * Order model
 * Detailed info http://guides.spreecommerce.org/developer/orders.html
 * Public API's http://guides.spreecommerce.org/api/orders.html
 */

import { CartItem } from './cart_item';

export class Order {
  id: number;
  orderkey: string;
  number: string;
  total: string;
  itemTotal: string;
  shipmentTotal: string;
  adjustmentTotal: string;
  dateCompleted: number;
  paymentTotal: string;
  shipmentStatus: string;
  paymentStatus: string;
  status: string;
  email: string;
  specialInstructions: string;
  includedTaxTotal: string;
  additionalTaxTotal: string;
  displayIncludedTaxTotal: string;
  displayAdditionalTaxTotal: string;
  taxTotal: string;
  currency: string;
  totalQuantity: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
  payment_total: string;
  billingAddress01: string;
  billingAddress02: string
  shippingAddress01: string;
  dateCreated: number;
  dateUpdated: number;
  userAccount_id: number;
  cartItems: CartItem[];
}

// NOTE: This just mimics the serializer exposed in the API
// Not sure if it is required, review it in APRIL
export class LightOrder {
  number: string;
  payment_state: string;
  completed_at: string;
  state: string;
  total: string;
  shipment_state: string;
}
