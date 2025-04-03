import { CartItem } from './../../core/models/cart_item';
import { CheckoutActions } from './../actions/checkout.actions';
import { CheckoutState, CheckoutStateRecord } from './checkout.state';
import { Action, ActionReducer } from '@ngrx/store';


export const initialState: CheckoutState = new CheckoutStateRecord() as CheckoutState;

export const checkoutReducer: ActionReducer<CheckoutState> =
  (state: CheckoutState = initialState, { type, payload }: Action): CheckoutState => {
    let _cartItems, _cartItemEntities, _cartItemIds, _cartItem, _cartItemEntity, _cartItemId,
      _totalCartItems = 0, _totalCartValue, _totalDiscount = 0, _totalAmountPaid = 0, _totalAmountDue = 0,
      _ship_address, _bill_address, _giftCerts, _grandTotal = 0, _orderStatus, _orderId, _deliveryDate,
      _deliveryFee = 0.00, _serviceFee = 0.00, _fees, _requestItemIds;

    switch (type) {
      case CheckoutActions.FETCH_CURRENT_ORDER_SUCCESS:
        _orderId = payload.id;
        _cartItems = payload.cartItems;
        _cartItemIds = _cartItems.map(cartItem => cartItem.id);
        _totalCartItems = Number(payload.totalQuantity);
        _totalCartValue = parseFloat(payload.itemTotal);

        if (_totalCartValue > 0) {
          _totalCartValue = _totalCartValue - _totalDiscount;
        } else {
          _totalCartValue = 0;
        }
        if (payload.totalDiscount != null) {
          _totalDiscount = parseFloat(payload.totalDiscount);
        } else {
          _totalDiscount = 0;
        }
        if (payload.totalAmtPaid != null) {
          _totalAmountPaid = parseFloat(payload.totalAmtPaid);
        } else {
          _totalAmountPaid = state.totalAmountPaid;
        }

        _ship_address = {
          firstname: payload.firstname,
          lastname: payload.lastname,
          email: payload.email,
          phone: payload.phone,
          shippingAddress01: payload.shippingAddress01,
          shippingAddress02: payload.shippingAddress02,
          city: payload.city,
          country: payload.country,
          postalcode: payload.postalcode,
          specialInstructions: payload.specialInstructions,
          userAccountId: payload.useraccount_id,
        };
        _bill_address = {
          billingAddress01: payload.billingAddress01,
          billingAddress02: payload.billingAddress02,
          billCity: payload.billCity,
          billCountry: payload.billCountry,
          billPostalcode: payload.billPostalcode,
        };

        _fees = checkoutReducerHelper.calculateFees(_totalCartValue, payload.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _orderStatus = payload.status;
        _deliveryDate = payload.deliveryDate;
        _grandTotal = _totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;
        _totalAmountDue = _grandTotal - _totalAmountPaid;

        _cartItemEntities = _cartItems.reduce((cartItems: { [id: number]: CartItem }, cartItem: CartItem) => {
          return Object.assign(cartItems, {
            [cartItem.id]: cartItem
          });
        }, { });

        return state.merge({
          orderId: _orderId,
          orderStatus: _orderStatus,
          cartItemIds: _cartItemIds,
          cartItemEntities: _cartItemEntities,
          totalCartItems: _totalCartItems,
          totalCartValue: _totalCartValue,
          totalDiscount: _totalDiscount,
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          totalAmountPaid: _totalAmountPaid,
          totalAmountDue: _totalAmountDue,
          grandTotal: _grandTotal,
          shipAddress: _ship_address,
          billAddress: _bill_address,
          deliveryDate: _deliveryDate,
          addressType: payload.addressType,
          // giftCerts: _giftCerts
        }) as CheckoutState;

      case CheckoutActions.ADD_TO_CART_SUCCESS:
        _cartItem = payload;
        _cartItemId = _cartItem.id;

        // return the same state if the item is already included.
        if (state.cartItemIds.includes(_cartItemId) || !_cartItem.id) {
          return state;
        }

        _totalCartItems = state.totalCartItems + _cartItem.quantity;
        _totalCartValue = state.totalCartValue + parseFloat(_cartItem.total);

        _fees = checkoutReducerHelper.calculateFees(_totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _grandTotal = _totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;

        _cartItemEntity = { [_cartItemId]: _cartItem };
        _cartItemIds = state.cartItemIds.push(_cartItemId);
        _totalAmountDue = _grandTotal - _totalAmountPaid;

        return state.merge({
          cartItemIds: _cartItemIds,
          cartItemEntities: state.cartItemEntities.merge(_cartItemEntity),
          totalCartItems: _totalCartItems,
          totalCartValue: _totalCartValue,
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          grandTotal: _grandTotal,
          totalAmountDue: _totalAmountDue,
          // giftCerts: _giftCerts
        }) as CheckoutState;

      case CheckoutActions.ADD_ITEMS_TO_CART_SUCCESS:
        _cartItems = payload.cartItems;
        _cartItemIds = _cartItems.map(cartItem => cartItem.id);

        if (!_cartItems.length) {
          return state;
        }
        _totalCartItems = state.totalCartItems + payload.quantity;
        _totalCartValue = state.totalCartValue + parseFloat(payload.total);

        _fees = checkoutReducerHelper.calculateFees(_totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _grandTotal = _totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;
        _totalAmountDue = _grandTotal - _totalAmountPaid;
        _cartItemIds = state.cartItemIds.concat(_cartItemIds);
        _cartItemEntities = _cartItems.reduce((cartItems: { [id: number]: CartItem }, cartItem: CartItem) => {
          return Object.assign(cartItems, {
            [cartItem.id]: cartItem
          });
        }, { });

        return state.merge({
          cartItemIds: _cartItemIds,
          cartItemEntities: state.cartItemEntities.merge(_cartItemEntities),
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          totalCartItems: _totalCartItems,
          totalCartValue: _totalCartValue < 0 ? 0 : _totalCartValue,
          grandTotal: _grandTotal,
          totalAmountDue: _totalAmountDue,
        }) as CheckoutState;

      case CheckoutActions.REMOVE_CART_ITEM_SUCCESS:

        _cartItem = payload;
        _cartItemId = _cartItem.id;
        const index = state.cartItemIds.indexOf(_cartItemId);

        if (index < 0) {
          return state;
        }

        _cartItemIds = state.cartItemIds.splice(index, 1);
        _cartItemEntities = state.cartItemEntities.delete(_cartItemId.toString());
        _totalCartItems = state.totalCartItems - _cartItem.quantity;

        _totalCartValue = state.totalCartValue - parseFloat(_cartItem.total);

        _fees = checkoutReducerHelper.calculateFees(_totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _grandTotal = _totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;
        _totalAmountDue = _grandTotal - _totalAmountPaid ;
        const _index = state.requestItemIds.indexOf(_cartItemId);
        if (_index >= 0) {
          _requestItemIds = state.requestItemIds.splice(_index, 1);
        } else {
          _requestItemIds = state.requestItemIds;
        }

        return state.merge({
          cartItemIds: _cartItemIds,
          requestItemIds: _requestItemIds,
          cartItemEntities: _cartItemEntities,
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          totalCartItems: _totalCartItems,
          totalCartValue: _totalCartValue,
          totalAmountPaid: _totalAmountPaid,
          totalAmountDue: _totalAmountDue,
          totalDiscount: _totalDiscount,
          grandTotal: _grandTotal,
          giftCerts: _giftCerts,
        }) as CheckoutState;

      case CheckoutActions.REMOVE_CART_ITEMS_SUCCESS:
        if (_totalCartValue === 0) {
          _totalAmountPaid = 0.00;
        }

        _grandTotal = _totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;
        _totalAmountDue = _grandTotal - _totalAmountPaid;

        return state.merge({
          cartItemIds: [],
          requestItemIds: [],
          cartItemEntities: {},
          serviceFee: 0,
          deliveryFee: 0,
          totalCartItems: 0,
          totalCartValue: 0,
          totalAmountPaid: _totalAmountPaid,
          totalAmountDue: _totalAmountDue,
          totalDiscount: _totalDiscount,
          grandTotal: _grandTotal,
          giftCerts: _giftCerts,
        }) as CheckoutState;

      case CheckoutActions.UPDATE_CART_ITEM_SUCCESS:
        _cartItemId = payload.cartItem.id;
        if (!_cartItemId) {
          return state;
        }
        _cartItemEntities = state.cartItemEntities;
        _cartItem = _cartItemEntities.get(_cartItemId.toString()).toJS();
        const quantity = payload.cartItem.quantity;
        const quantityDifference = quantity - _cartItem['quantity'];
        const total = _cartItem['item'].price * quantityDifference;
        _cartItem['quantity'] = quantity;
        _cartItem['total'] = _cartItem['item'].price * quantity;
        _cartItem['instructions'] = payload.cartItem.instructions;
        _cartItem['subOption'] = payload.cartItem.subOption;
        _cartItem['subItemId'] = payload.cartItem.subItemId;
        _cartItem['subPrice'] = payload.cartItem.subPrice;
        _cartItem['subQuantity'] = payload.cartItem.subQuantity;
        if (_cartItem.isRequest) {
          _cartItem.item.name = payload.cartItem.item.name;
        }
        _cartItemEntity = { [_cartItemId]: _cartItem };
        _totalCartItems = state.totalCartItems + quantityDifference;
        _totalCartValue = state.totalCartValue + total;

        _fees = checkoutReducerHelper.calculateFees(_totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _grandTotal = _totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;
        _totalAmountDue = _grandTotal - _totalAmountPaid;

        return state.merge({
          cartItemEntities: state.cartItemEntities.merge(_cartItemEntity),
          totalCartItems: _totalCartItems,
          totalCartValue: _totalCartValue,
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          grandTotal: _grandTotal,
          totalAmountDue: _totalAmountDue,
          // giftCerts: _giftCerts
        }) as CheckoutState;

      // case APPLY COUPON
      case CheckoutActions.APPLY_COUPON:
        _fees = checkoutReducerHelper.calculateFees(state.totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _totalAmountPaid = state.totalAmountPaid;
        _totalDiscount = payload.value;
        _grandTotal = state.totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;
        if (_grandTotal < 0) {
          _grandTotal = 0;
          _totalAmountDue = 0;
          _totalAmountPaid = 0;
        } else {
          _totalAmountDue = _grandTotal - _totalAmountPaid;
          if (_totalAmountDue < 0) {
            _totalAmountDue = 0;
            _totalAmountPaid -= _totalDiscount;
          }
        }

        return state.merge({
          coupon: payload,
          totalDiscount: _totalDiscount,
          totalAmountDue: _totalAmountDue,
          totalAmountPaid: _totalAmountPaid,
          grandTotal: _grandTotal,
        }) as CheckoutState;

      // case REMOVE COUPON when input changed
      case CheckoutActions.REMOVE_COUPON:
        _fees = checkoutReducerHelper.calculateFees(state.totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _totalAmountPaid = state.totalAmountPaid;
        _grandTotal = state.totalCartValue + _serviceFee + _deliveryFee;
        _totalAmountDue = _grandTotal - _totalAmountPaid;
        if (_totalAmountDue === state.totalDiscount) {
          _totalAmountPaid += state.totalDiscount;
          _totalAmountDue = 0;
        }
        return state.merge({
          coupon: {},
          totalDiscount: 0,
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          totalAmountDue: _totalAmountDue,
          totalAmountPaid: _totalAmountPaid,
          grandTotal: _grandTotal,
        }) as CheckoutState;

      // case APPLY GC
      case CheckoutActions.APPLY_GC:
        if  (state.giftCerts) {
          _giftCerts = state.giftCerts.push(payload.gCerts);
        } else {
          _giftCerts = [];
          _giftCerts.push(payload.gCerts);
        }
        return state.merge({
          giftCerts: _giftCerts
      }) as CheckoutState;

      // case REMOVE GC
      case CheckoutActions.REMOVE_GC:
        let gcIndex = 0;
        if (state.giftCerts) {
          gcIndex = state.giftCerts.indexOf(payload.gCerts);
          state.giftCerts.splice(gcIndex, 1);
          _giftCerts = state.giftCerts;
        }
        return state.merge({
          giftCerts: _giftCerts
      }) as CheckoutState;

      case CheckoutActions.RESET_GC:
        _giftCerts = [];
        return state.merge({
          giftCerts: _giftCerts
      }) as CheckoutState;

      // case CheckoutActions.CHANGE_ORDER_STATE:

      case CheckoutActions.CHANGE_ORDER_STATE_SUCCESS:
        _orderStatus = payload.status;

        return state.merge({
          orderStatus: _orderStatus
        }) as CheckoutState;

      case CheckoutActions.UPDATE_ORDER_SUCCESS:
        _orderStatus = payload.status;

        return state.merge({
          orderStatus: _orderStatus
        }) as CheckoutState;

      case CheckoutActions.UPDATE_ADDRESS_SUCCESS:
        _orderStatus = payload.status;
        _ship_address = payload.shippingAddress;
        _bill_address = payload.billingAddress;
        const _addressType = payload.addressType;

        return state.merge({
          orderStatus: _orderStatus,
          shipAddress: _ship_address,
          billAddress: _bill_address,
          addressType: _addressType
        }) as CheckoutState;

      case CheckoutActions.UPDATE_DELIVERY_OPTIONS_SUCCESS:
        _orderStatus = payload.status;
        _deliveryDate = payload.date;

        return state.merge({
          orderStatus: _orderStatus,
          deliveryDate: _deliveryDate
        }) as CheckoutState;

      case CheckoutActions.UPDATE_AMOUNT_PAID:

        const _paymentDetails = state.paymentDetails.toJS();
        if (payload.type !== 'refresh') {
          _paymentDetails[payload.type] = payload.balance;
          if (payload.type === 'paymaya') {
            delete _paymentDetails['salary'];
            delete _paymentDetails['salaryBalance'];
            delete _paymentDetails['gc'];
            delete _paymentDetails['gcList'];
          } else {
            delete _paymentDetails['paymaya'];
            if (payload.type === 'salary' && !payload.balance) {
              delete _paymentDetails['salaryBalance'];
            }
            if (payload.type === 'gc') {
              _paymentDetails['gcList'] = payload.gcList;
            }
          }
        }

        _totalCartValue = state.totalCartValue;

        _fees = checkoutReducerHelper.calculateFees(_totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;

        _grandTotal = state.totalCartValue + _serviceFee + _deliveryFee - state.totalDiscount;

        if (_grandTotal < 0) {
          _grandTotal = 0;
          _totalAmountDue = 0;
          _totalAmountPaid = 0;
          if (_paymentDetails.salary) {
            _paymentDetails['salaryBalance'] = _paymentDetails.salary;
          }
        } else {
          _totalAmountDue = _grandTotal;
          _totalAmountPaid = 0;
          let difference = 0;
          // NOTE: calculate gift certificate
          if (_paymentDetails.gc) {
            // if (_totalAmountDue < _paymentDetails.gc) {
            //   NOTE: order total changed, reset GC if order total lower than GC amount
            //   _paymentDetails.gc = 0;
            //   _paymentDetails.gcList = [];
            // } else {
            difference = _totalAmountDue - _paymentDetails.gc;
            if (difference < 0) {
              _totalAmountPaid = _paymentDetails.gc + difference;
              _totalAmountDue = 0;
            } else {
              _totalAmountPaid += _paymentDetails.gc;
              _totalAmountDue = _grandTotal - _totalAmountPaid;
            }
            // }
          }
          // NOTE: calculate salary deduction
          if (_paymentDetails.salary && _totalAmountDue) {
            difference = _totalAmountDue - _paymentDetails.salary;
            if (difference < 0) {
              const salaryUsed = _paymentDetails.salary + difference;
              _paymentDetails['salaryBalance'] = _paymentDetails.salary - salaryUsed;
              _totalAmountPaid += salaryUsed;
              _totalAmountDue = 0;
            } else {
              _paymentDetails['salaryBalance'] = 0;
              _totalAmountPaid += _paymentDetails.salary;
              _totalAmountDue = _grandTotal - _totalAmountPaid;
            }
          }
          if (_paymentDetails.paymaya) {
            _totalAmountDue = 0;
            _totalAmountPaid = _grandTotal;
          }
        }

        return state.merge({
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          paymentDetails: _paymentDetails,
          totalAmountPaid: _totalAmountPaid,
          totalAmountDue: _totalAmountDue
        }) as CheckoutState;

      case CheckoutActions.ADD_REQUEST_ITEM_SUCCESS:
        _cartItem = payload;
        _cartItemId = _cartItem.id;

        if (state.cartItemIds.includes(_cartItemId) || !_cartItem.id) {
          return state;
        }

        _fees = checkoutReducerHelper.calculateFees(_totalCartValue, state.addressType);
        _serviceFee = _fees._serviceFee;
        _deliveryFee = _fees._deliveryFee;
        _totalCartValue = state.totalCartValue + parseFloat(_cartItem.total);
        _grandTotal = _totalCartValue + _serviceFee + _deliveryFee - _totalDiscount;

        _totalCartItems = state.totalCartItems + _cartItem.quantity;
        _cartItemEntity = { [_cartItemId]: _cartItem };
        _cartItemIds = state.cartItemIds.push(_cartItemId);
        _requestItemIds = state.requestItemIds.push(_cartItemId);

        return state.merge({
          cartItemIds: _cartItemIds,
          cartItemEntities: state.cartItemEntities.merge(_cartItemEntity),
          requestItemIds: _requestItemIds,
          totalCartItems: _totalCartItems,
          serviceFee: _serviceFee,
          deliveryFee: _deliveryFee,
          grandTotal: _grandTotal,
        }) as CheckoutState;
        
      // case CheckoutActions.DELETE_REQUEST_ITEM_SUCCESS:
      //   break;

      case CheckoutActions.ORDER_COMPLETE_SUCCESS:
        return initialState;

      default:
        return state;
    }
  };

  export class checkoutReducerHelper {
    static calculateFees(totalCartValue: number, addressType: number): any {
      const isPickUp = addressType === 3;
      let partner = null;
      let store = null;
      let data = null;
      let _serviceFee = 0;
      let _deliveryFee = 0;
      if (localStorage.getItem('partner')) {
        partner = JSON.parse(localStorage.getItem('partner'));
      }
      if (localStorage.getItem('partnerStore')) {
        store = JSON.parse(localStorage.getItem('partnerStore'));
      }
      if (store && store.useStoreFees < 1) {
        data = partner;
      } else {
        data = store;
      }

      if (data) {
        if (data.hasOwnProperty('serviceFee') ) {
          if (data.isZeroServiceFee === 0) {
            if (data.serviceFee > 0) {
              _serviceFee = data.serviceFee;
            }
            if (data.promoServiceFee > 0){
              _serviceFee = data.promoServiceFee;
            }
          }
          if (data.isZeroDeliveryFee === 0 && !isPickUp) {
            if (data.deliveryFee > 0) {
              _deliveryFee = data.deliveryFee;
            }
            if (data.promoDeliveryFee > 0) {
              _deliveryFee = data.promoDeliveryFee;
            }
          }
        }
        if (data.threshold > 0 && totalCartValue > data.threshold) {
          const checkThreshold = Math.floor(totalCartValue / data.threshold);
          if (checkThreshold > 0) {
            _serviceFee += data.serviceIncrement * checkThreshold;
            if (!isPickUp) {
              _deliveryFee += data.deliveryIncrement * checkThreshold;
            }
          }
        }
      }
      return {
        _serviceFee,
        _deliveryFee,
      };
    }
  };
