import { Component, OnDestroy, OnInit, Input,
  Output, OnChanges, EventEmitter  } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
// import 'rxjs/add/operator/distinctUntilChanged';
import { AppState } from './../../../../interfaces';
import { Globals } from './../../../../globals';
import { environment } from './../../../../../environments/environment';
import { SearchActions } from './../../../reducers/search.actions';
import { CartItem } from './../../../../core/models/cart_item';
import { Item } from './../../../../core/models/item';
import { CheckoutService } from './../../../../core/services/checkout.service';
import { ProductService } from './../../../../core/services/product.service';
import { ProductActions } from './../../../../product/actions/product-actions';
import { getSelectedItem } from './../../../../product/reducers/selectors';
import { CheckoutActions } from './../../../../checkout/actions/checkout.actions';
import { UserActions } from './../../../../user/actions/user.actions';
import { UserService } from './../../../../user/services/user.service';


@Component({
  selector: 'app-item-details-dialog',
  templateUrl: './item-details-dialog.component.html',
  styleUrls: ['./item-details-dialog.component.scss']
})
export class ItemDetailsDialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() item: any;
  @Input() categories: any;
  @Input() cartItems: CartItem[];
  @Input() isAuthenticated: boolean;
  @Input() userLists: any;
  @Input() partnerStore: any;
  @Input() sortSettings: any;
  @Input() modalContainer: any;
  @Output() onCloseModalEmit: EventEmitter<string> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  itemCategories: Array<any> = [null, null, null];
  itemQuantity = 0;
  includedLists: Array<any> = [];
  inputNewList = new FormControl();
  isCreateList = false;
  listState: Array<any> = [];
  quantityControl = new FormControl();
  searchSubstitute = new FormControl();
  selectedSubItem: any;
  specialInstructions = new FormControl();
  subItemQuantity = 0;
  subQuantityControl = new FormControl();
  substituteItems: Array<any> = [];
  substituteOptions = 0;
  substituteSlider = { state: 'set1', class: '' };
  suggestedItems: Array<Object> = [];
  suggestedSlider = { state: 'set1', class: '' };
  readonly MIN_VALUE = 0;
  readonly MAX_VALUE = 9999;
  private componentDestroyed: Subject<any> = new Subject();


  constructor(
    private router: Router,
    private productService: ProductService,
    private productActions: ProductActions,
    private checkoutService: CheckoutService,
    private checkoutActions: CheckoutActions,
    private searchActions: SearchActions,
    private userActions: UserActions,
    private userService: UserService,
    private globals: Globals,
    private store: Store<AppState>
  ) {
  }

  ngOnInit() {
    this.initCartItem();
    this.quantityControl.valueChanges
      .debounceTime(300)
      .takeUntil(this.componentDestroyed)
      .subscribe(value => {
        if (isNaN(value) || !Number.isInteger(value) || value < this.MIN_VALUE || value > this.MAX_VALUE) {
          // do nothing
        } else {
          const item = this.getCartItem(this.item.id);
          if (value > 0) {
            item.quantity = value;
            this.itemQuantity = value;
            this.store.dispatch(this.checkoutActions.updateCartItem(item));
          } else {
            this.store.dispatch(this.checkoutActions.removeCartItem(item.id));
            this.checkoutService.deleteCartItem(item)
              .takeUntil(this.componentDestroyed)
              .subscribe();
          }
        }
    });
    this.subQuantityControl.valueChanges
      .debounceTime(300)
      .takeUntil(this.componentDestroyed)
      .subscribe((value: number) => {
        if (isNaN(value) || !Number.isInteger(value) || value < this.MIN_VALUE || value > this.MAX_VALUE) {
          // do nothing
        } else if (value === this.MIN_VALUE) {
          this.changeSubstitute();
        } else {
          const cartItem = Object.assign({}, this.getCartItem(this.item.id), {
            subQuantity: value,
          });
          this.store.dispatch(this.checkoutActions.updateCartItem(cartItem));
        }
      });
    this.searchSubstitute.valueChanges
      .debounceTime(300)
      .switchMap((searchString: string) => {
        if (!searchString.length) {
          searchString = this.item.name;
        }
        return this.productService.getSubstituteItems(this.item.id, searchString, this.partnerStore.id);
      })
      .takeUntil(this.componentDestroyed)
      .subscribe((items: any) => {
        this.substituteItems = items;
        this.substituteSlider = { state: 'set1', class: '' };
      });
    this.initLists();
    this.initSuggestedItems();
    this.initBreadCrumbs();
    // Observable.fromEvent(window, 'wheel')
    //   .map((event: any) => {
    //     event.preventDefault();
    //     event.stopPropagation();
    //   })
    //   .takeUntil(this.componentDestroyed)
    //   .subscribe();
  }

  ngOnChanges() {
    this.initCartItem();
  }

  ngOnDestroy() {
    this.store.dispatch(this.productActions.removeSelectedItem());
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  initCartItem(): void {
    const cartItem = this.getCartItem(this.item.id);
    if (typeof cartItem !== 'undefined') {
      this.itemQuantity = cartItem.quantity;
      this.specialInstructions.setValue(cartItem.instructions);
      this.substituteOptions = this.substituteOptions === 1 ? 1 : cartItem.subOption;
      
      if (cartItem.subOption === 1) {
        this.subItemQuantity = cartItem.subQuantity;
        if (!this.selectedSubItem) {
          this.productService.getProduct(cartItem.subItemId)
            .takeUntil(this.componentDestroyed)
            .subscribe((item: any) => this.selectedSubItem = item);
        }
      }
    } else {
      this.itemQuantity = 0;
      this.substituteOptions = 0;
      this.specialInstructions.setValue('');
    }
  }

  initBreadCrumbs(): void {
    this.itemCategories = [null, null, null];
    if (this.categories.length && this.item) {
      let index1, index2, index3;
      index1 = this.categories.findIndex(cat => cat.id === this.item.category1);
      this.itemCategories[0] = this.categories[index1];
      if (this.item.category2) {
        index2 = this.categories[index1].subCategories.findIndex(cat => cat.id === this.item.category2);
        this.itemCategories[1] = index2 >= 0 ? this.categories[index1].subCategories[index2] : null;
      }
      if (this.item.category3) {
        index3 = this.categories[index1].subCategories[index2].subCategories.findIndex(cat => cat.id === this.item.category3);
        this.itemCategories[2] = index3 >= 0 ? this.categories[index1].subCategories[index2].subCategories[index3] : null;
      }
    }
  }

  initSuggestedItems(): void {
    this.productService.getSuggestedItems(this.item.id, this.partnerStore.id)
      .takeUntil(this.componentDestroyed)
      .subscribe(items => {
        this.suggestedItems = items;
      });
  }

  initLists(): void {
    this.userService.getListsOfItem(this.item.id)
      .takeUntil(this.componentDestroyed)
      .subscribe(result => {
        this.includedLists = result.map(list => {
          return {
            list_id: list.list_id,
            listitem_id: list.listitem_id
          };
        });
        this.setListCheckbox();
      });
  }

  hideSavings(displayPrice, price) {
    return displayPrice - price !== 0 && displayPrice > price;
  }

  hideListPrice(displayPrice, price) {
    return displayPrice !== price && displayPrice > price;
  }

  getItemImageUrl(key) {
    return !key ? this.globals.ITEM_DEFAULT_IMG : `${environment.IMAGE_REPO}${key}.jpg`;
  }

  onImageError(e: any): void {
    e.target.src = this.globals.ITEM_DEFAULT_IMG;
  }

  onCloseModal() {
    this.onCloseModalEmit.emit();
  }

  addToCart() {
    this.itemQuantity = 1;
    this.store.dispatch(this.checkoutActions.addToCart(this.item));
  }

  incrementQuantity() {
    if (this.itemQuantity < this.MAX_VALUE) {
      this.itemQuantity += 1;
      this.quantityControl.setValue(this.itemQuantity);
    }
  }

  decrementQuantity() {
    if (this.itemQuantity > this.MIN_VALUE) {
      this.itemQuantity -= 1;
      this.quantityControl.setValue(this.itemQuantity);
    }
  }

  incrementSubQuantity() {
    if (this.subItemQuantity < this.MAX_VALUE) {
      this.subItemQuantity += 1;
      this.subQuantityControl.setValue(this.subItemQuantity);
    }
  }

  decrementSubQuantity() {
    if (this.subItemQuantity > this.MIN_VALUE) {
      this.subItemQuantity -= 1;
      this.subQuantityControl.setValue(this.subItemQuantity);
    }
  }

  getCartItem(id: number) {
    return this.cartItems.find(cartItem => cartItem.item_id === id);
  }

  toggleCreateNewList(): void {
    this.isCreateList = true;
  }

  selectList(index: number, id: number) {
    let state;
    if (this.listState[id] === 'undefined') {
      this.listState[id] = true;
      state = true;
    } else {
      state = !this.listState[id];
      this.listState[id] = state;
    }
    if (state) {
      const listitem = {
        list_id: id,
        item_id: this.item.id
      };
      this.userService
        .addListItem(listitem)
        .takeUntil(this.componentDestroyed)
        .subscribe(res => {
          if (res.message === 'Saved') {
            this.includedLists.push({ list_id: id, listitem_id: res.id });
            this.setListCheckbox();
          }
        });
    } else {
      index = this.includedLists.findIndex(x => x.list_id === id);
      if (index >= 0) {
        this.userService
          .removeListItem(this.includedLists[index].listitem_id)
          .takeUntil(this.componentDestroyed)
          .subscribe(res => {
            if (res.message === 'Deleted') {
              this.includedLists.splice(index, 1);
              this.setListCheckbox();
            }
          });
      }
    }
  }

  createNewList(): void {
    if (this.inputNewList.value) {
      const d = new Date();
      const params = {
        name: this.inputNewList.value,
        description: `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`,
        partner_id: this.partnerStore.id,
      };
      this.store.dispatch(this.userActions.createUserList(params));
      this.inputNewList.setValue('');
      this.isCreateList = false;
      this.setListCheckbox();
    }
  }

  setListCheckbox(): void {
    this.userLists.forEach(list => {
      if (this.includedLists.find(x => x.list_id === list.id)) {
        this.listState[list.id] = true;
      } else {
        this.listState[list.id] = false;
      }
    });
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // NOTE: invalid character, prevent input
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

  selectCategory(...categories): void {
    const params = { partnerId: this.partnerStore.id };
    let options = {};
    let filters = null;
    if (categories[0] !== 'all') {
      filters = {
        mode: 'category',
        level: categories[0].level,
        categoryId: categories[0].id,
        breadcrumbs: categories.map(cat => {
            return { id: cat.id, name: cat.name, level: cat.level };
          }).reverse()
      };
      params[`category${filters.level}`] = filters.categoryId;
      options = this.sortSettings;
    }
    this.store.dispatch(this.productActions.getAllProducts(options, params));
    this.store.dispatch(this.searchActions.setFilter(filters ? filters : {}));
    this.onCloseModal();
    window.scrollTo(0, 0);
  }

  sliderBack(mode: string): void {
    let obj = mode === 'suggested' ? this.suggestedSlider : this.substituteSlider;
    switch (obj.state) {
    case 'set1':
      break;
    case 'set2':
      obj = { state: 'set1', class: 'set2ToSet1' };
      break;
    case 'set3':
      obj = { state: 'set2', class: 'set3ToSet2' };
      break;
    case 'set4':
      obj = { state: 'set3', class: 'set4ToSet3'};
      break;
    }
    if (mode === 'suggested') {
      this.suggestedSlider = obj;
    } else {
      this.substituteSlider = obj;
    }
  }

  sliderNext(mode: string, items: Array<any>): void {
    let obj = mode === 'suggested' ? this.suggestedSlider : this.substituteSlider;
    switch (obj.state) {
    case 'set1':
      if (items.length > 4) {
        obj = { state: 'set2', class: 'set1ToSet2' };
      }
      break;
    case 'set2':
      if (items.length > 8) {
        obj = { state: 'set3', class: 'set2ToSet3' };
      }
      break;
    case 'set3':
      if (items.length > 12) {
        obj = { state: 'set4', class: 'set3ToSet4' };
      }
      break;
    case 'set4':
      break;
    }
    if (mode === 'suggested') {
      this.suggestedSlider = obj;
    } else {
      this.substituteSlider = obj;
    }
  }

  openSuggestedItem(item: Item): void {
    // const slug = `/item/${ item.id }/${ item.slug ? item.slug : item.name.toLowerCase().replace(/ /g, '-') }`;
    // window.history.pushState('item-slug', 'Title', slug);
    this.store.dispatch(this.productActions.addSelectedItem(item));
    this.suggestedSlider = { state: 'set1', class: '' };
    this.substituteOptions = 0;
    this.selectedSubItem = null;
    this.specialInstructions.setValue('');
    this.initSuggestedItems();
    setTimeout(() => {
      this.modalContainer.elementRef.nativeElement.querySelector('div.modal.fade').scrollTo(0, 1);
      this.initLists();
      this.initBreadCrumbs();
    }, 0);
  }

  addInstructions(): void {
    const text = this.specialInstructions.value;
    const cartItem = this.getCartItem(this.item.id);
    if (text !== cartItem.instructions) {
      cartItem.instructions = text;
      this.store.dispatch(this.checkoutActions.updateCartItem(cartItem));
    }
  }

  selectSubsitution(): void {
    let cartItem;
    switch (this.substituteOptions) {
      case 0:
        cartItem = Object.assign({}, this.getCartItem(this.item.id), {
          subOption: 0,
          subQuantity: null,
          subPrice: null,
          subItemId: null,
        });
        this.store.dispatch(this.checkoutActions.updateCartItem(cartItem));
        break;
      case 1:
        if (this.selectedSubItem) {
          this.productService.getProduct(this.selectedSubItem.id)
            .takeUntil(this.componentDestroyed)
            .subscribe((item: any) => this.selectSubstituteItem(item, true));
        } else {
          this.productService.getSubstituteItems(this.item.id, this.item.name, this.partnerStore.id)
            .takeUntil(this.componentDestroyed)
            .subscribe((items: any) => this.substituteItems = items);
        }
        break;
      case 2:
        cartItem = Object.assign({}, this.getCartItem(this.item.id), {
          subOption: 2,
          subQuantity: null,
          subPrice: null,
          subItemId: null,
        });
        this.store.dispatch(this.checkoutActions.updateCartItem(cartItem));
        break;
      default:
    }
  }

  selectSubstituteItem(item: Item, isSelected = false): void {
    this.selectedSubItem = item;
    this.subItemQuantity = isSelected ? this.subItemQuantity : 1;
    const cartItem = Object.assign({}, this.getCartItem(this.item.id), {
      subOption: 1,
      subQuantity: this.subItemQuantity,
      subPrice: Number(item.price),
      subItemId: item.id,
    });
    this.store.dispatch(this.checkoutActions.updateCartItem(cartItem));
  }

  changeSubstitute() {
    this.selectedSubItem = null;
    this.subItemQuantity = 0;
    const cartItem = Object.assign({}, this.getCartItem(this.item.id), {
      subOption: 0,
      subQuantity: null,
      subPrice: null,
      subItemId: null,
    });
    this.store.dispatch(this.checkoutActions.updateCartItem(cartItem));
    this.productService.getSubstituteItems(this.item.id, this.item.name, this.partnerStore.id)
      .takeUntil(this.componentDestroyed)
      .subscribe((items: any) => {
        this.substituteItems = items;
      });
  }
}
