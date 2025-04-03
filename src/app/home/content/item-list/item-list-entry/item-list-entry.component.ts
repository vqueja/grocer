import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy,
   ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import { AppState } from './../../../../interfaces';
import { Globals } from './../../../../globals';
import { environment } from './../../../../../environments/environment';
import { Item } from './../../../../core/models/item';
import { CartItem } from './../../../../core/models/cart_item';
import { CheckoutService } from './../../../../core/services/checkout.service';
import { CheckoutActions } from './../../../../checkout/actions/checkout.actions';
import { ProductActions } from './../../../../product/actions/product-actions';


@Component({
  selector: 'app-item-list-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './item-list-entry.component.html',
  styleUrls: ['./item-list-entry.component.scss']
})
export class ItemListEntryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item: Item;
  @Input() cartItem: CartItem;
  @Input() isClickable: boolean = true;
  @Input() isSubstitute: boolean = false;
  @Output() onOpenModalEmit: EventEmitter<any> = new EventEmitter<any>();
  itemQuantity: number = 0;
  quantityControl = new FormControl();
  readonly MIN_VALUE = 0;
  readonly MAX_VALUE = 9999;
  private imageRetries: number = 0;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private store: Store<AppState>,
    private checkoutActions: CheckoutActions,
    private checkoutService: CheckoutService,
    private productActions: ProductActions,
    private cdr: ChangeDetectorRef,
    private globals: Globals,
  ) {}

  ngOnInit() {
    if (typeof this.cartItem !== 'undefined') {
      this.itemQuantity = this.cartItem.quantity;
    }
    this.quantityControl.valueChanges
      .debounceTime(300)
      .takeUntil(this.componentDestroyed)
      .subscribe(value => {
        if (isNaN(value) || !Number.isInteger(value) || value < this.MIN_VALUE || value > this.MAX_VALUE) {
          // do nothing
        } else {
          this.cdr.detectChanges();
          if (value > 0) {
            this.itemQuantity = value;
            this.cartItem.quantity = value;
            this.store.dispatch(this.checkoutActions.updateCartItem(this.cartItem));
          } else {
            this.store.dispatch(this.checkoutActions.removeCartItem(this.cartItem.id));
            this.checkoutService.deleteCartItem(this.cartItem)
              .takeUntil(this.componentDestroyed)
              .subscribe();
          }
        }
      });
  }

  ngOnChanges() {
    if (typeof this.cartItem !== 'undefined') {
      this.itemQuantity = this.cartItem.quantity;
    }
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  getItemImageUrl(key) {
    let url = '';
    if (!key) {
      url = this.globals.ITEM_DEFAULT_IMG;
    } else {
      switch (this.imageRetries) {
        case 0: {
          url = `${environment.IMAGE_REPO}${key}.jpg`;
          break;
        }
        default: {
          url = this.globals.ITEM_DEFAULT_IMG;
        }
      }
    }
    return url;
  }

  private detach() {
    // this.cdr.detach();
  }

  onImageLoaded() {
    this.detach();
  }

  onImageError() {
    this.imageRetries++;
  }

  addToCart(e) {
    e.stopPropagation();
    this.itemQuantity = 1;
    this.store.dispatch(this.checkoutActions.addToCart(this.item));
    this.cdr.detectChanges();
  }

  selectItem() {
    if (this.isClickable) {
      this.onOpenModalEmit.emit(this.item);
    }
  }

  incrementQuantity(e) {
    if (this.itemQuantity < this.MAX_VALUE) {
      this.itemQuantity += 1;
      this.quantityControl.setValue(this.itemQuantity);
      this.cdr.detectChanges();
    }
  }

  decrementQuantity(e) {
    if (this.itemQuantity > this.MIN_VALUE) {
      this.itemQuantity -= 1;
      this.quantityControl.setValue(this.itemQuantity);
      this.cdr.detectChanges();
    }
  }

  inputQuantity(e) {
    e.stopPropagation();
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
      this.quantityControl.setValue(this.itemQuantity);
    }
    if (value < this.MIN_VALUE) {
      this.quantityControl.setValue(this.MIN_VALUE);
    }
    if (value > this.MAX_VALUE) {
      this.quantityControl.setValue(this.MAX_VALUE);
    }
  }
}
