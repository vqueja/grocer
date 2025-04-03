import { Component, OnInit, OnChanges, OnDestroy,
  Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import { AppState } from './../../../../../interfaces';
import { Globals } from './../../../../../globals';
import { environment } from './../../../../../../environments/environment';
import { CheckoutActions } from './../../../../actions/checkout.actions';
import { CheckoutService } from './../../../../../core/services/checkout.service';
import { CartItem } from './../../../../../core/models/cart_item';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent implements OnInit, OnChanges, OnDestroy {
  image: string;
  name: string;
  quantity: number;
  amount: number;
  quantityControl = new FormControl();
  deleteSub: Subscription;
  quantitySub: Subscription;
  readonly MIN_VALUE = 0;
  readonly MAX_VALUE = 9999;
  @Input() cartItem: CartItem;
  @Input() isCartSummary: boolean = false;
  @Input() storeLogo: string = '';
  @Output() onOpenModalEmit: EventEmitter<any> = new EventEmitter<any>();
  private imageRetries: number = 0;
  requestItemData: any = {};

  constructor(
    private store: Store<AppState>,
    private actions: CheckoutActions,
    private checkoutService: CheckoutService,
    private checkoutActions: CheckoutActions,
    private globals: Globals,
  ) {}

  ngOnInit() {
    this.quantity = this.cartItem.quantity;
    this.quantitySub = this.quantityControl.valueChanges
      .debounceTime(300)
      .subscribe(value => {
        if (isNaN(value) || !Number.isInteger(value) || value < this.MIN_VALUE || value > this.MAX_VALUE) {
          // do nothing;
        } else {
          if (value > 0) {
            const cart = this.cartItem;
            this.quantity = value;
            this.cartItem.quantity = value;
            this.store.dispatch(this.checkoutActions.updateCartItem(this.cartItem));
          } else {
            this.removeCartItem();
          }
        }
      });
  }

  ngOnChanges() {
    if (typeof this.cartItem !== 'undefined') {
      this.quantity = this.cartItem.quantity;
      if (this.cartItem.isRequest) {
        let priceSpecific = 0
        let [description, priceRange, instructions] = this.cartItem.instructions.split(';')
        .map((str) => str.split(':')[1].trim());
        if (priceRange.indexOf('Specific Price') >= 0) {
          let price = priceRange.split('=')[1];
          priceSpecific = price ? Number(price.trim()) : 1;
          priceRange = '';
        }
        this.requestItemData = {
          description,
          priceRange,
          instructions,
          priceSpecific,
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.deleteSub) {
      this.deleteSub.unsubscribe();
    }
    if (this.quantitySub) {
      this.quantitySub.unsubscribe();
    }
  }

  selectItem() {
    this.onOpenModalEmit.emit(this.cartItem);
  }

  getItemImageUrl(key: string) {
    return key ? `${environment.IMAGE_REPO}${key}.jpg`: this.globals.ITEM_DEFAULT_IMG;
  }

  onImageError(e: any): void {
    this.imageRetries += 1;
    let url = '';
    switch (this.imageRetries) {
      case 1:
      if (this.cartItem.isRequest) {
          const jpg = (this.storeLogo.indexOf('.png') < 0 && this.storeLogo.indexOf('.jpg') < 0 ) ? '.jpg' : '';
          url = `${environment.S3_REPOSITORY.LOGOS}${this.storeLogo}${jpg}`;
        } else {
          url = this.globals.ITEM_DEFAULT_IMG;
        }
        break;
      case 2: {
        url = this.cartItem.isRequest ? this.globals.LOGO_DEFAULT_IMG : this.globals.ITEM_DEFAULT_IMG;
        break;
      }
      default: {
        url = this.globals.ITEM_DEFAULT_IMG;
      }
    }
    e.target.src = url;
  }

  // Change this method once angular releases RC4
  // Follow this linke to know more about this issue https://github.com/angular/angular/issues/12869
  removeCartItem() {
    // if (this.cartItem.isRequest) {
    //   this.store.dispatch(this.actions.deleteRequestItem(this.cartItem));
    // } else {
      this.store.dispatch(this.actions.removeCartItem(this.cartItem.id));
      this.deleteSub = this.checkoutService.deleteCartItem(this.cartItem).subscribe();
    // }    
  }

  incrementQuantity() {
    if (this.quantity < this.MAX_VALUE) {
      this.quantity++;
      this.quantityControl.setValue(this.quantity);
    }
  }

  decrementQuantity() {
    if (this.quantity > this.MIN_VALUE) {
      this.quantity--;
      this.quantityControl.setValue(this.quantity);
    }
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  checkIfValid(e) {
    const value = e.target.value;
    if (isNaN(value) || !Number.isInteger(value)) {
      this.quantityControl.setValue(this.quantity);
    }
    if (value < this.MIN_VALUE) {
      this.quantityControl.setValue(this.MIN_VALUE);
    }
    if (value > this.MAX_VALUE) {
      this.quantityControl.setValue(this.MAX_VALUE);
    }
  }
}
