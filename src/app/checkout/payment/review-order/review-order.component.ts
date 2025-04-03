import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from './../../../core/models/cart_item';
import { Globals } from './../../../globals';
import { getTotalAmtPaid } from './../../reducers/selectors';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from './../../../interfaces';

@Component({
  selector: 'app-review-order',
  templateUrl: './review-order.component.html',
  styleUrls: ['./review-order.component.scss']
})
export class ReviewOrderComponent implements OnInit {
  @Input() shipAddress: any = {};
  @Input() billAddress: any = {};
  @Input() orderTotal: any = {};
  @Input() cartTotal: any = {};
  @Input() amountDue: any = {};
  @Input() cartItems: CartItem[];
  @Input() deliveryDate: any = {};
  @Input() paidAmount: number;
  @Input() discount: number;
  @Input() serviceFees: number;
  @Input() deliveryFees: number;
  @Input() isAuthenticated: boolean;
  // serviceFee: number = 0;
  // deliveryFee: number = 0;
  promoSFee: number = 9999.99;
  promoDFee: number = 9999.99;
  isPromo: boolean = false;
  grandTotal: number = 0;
  totalAmountPaid$: Subscription;


  constructor(
    private store: Store<AppState>,
    private globals: Globals,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  getTimeSlotLabel(index: number): string {
    return this.globals.TIMESLOT_LABELS[(index - 1) % 5];
  }

}
