import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild,
  ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { AppState } from './../../../../interfaces';
import { CheckoutActions } from './../../../../checkout/actions/checkout.actions';
import { CheckoutService } from './../../../../core/services/checkout.service';
import { ProductService } from './../../../../core/services/product.service';
import { CartItem } from '../../../../core/models/cart_item';
import { Globals } from './../../../../globals';
import { environment } from './../../../../../environments/environment';


@Component({
  selector: 'app-item-request',
  templateUrl: './item-request.component.html',
  styleUrls: ['./item-request.component.scss']
})
export class ItemRequestComponent implements OnInit, AfterViewInit {
  @Output() onCloseModalEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() partnerStore: any;
  @Input() requestItem: CartItem;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @ViewChild('renameOutput') renameOutput: ElementRef;
  @ViewChild('imagePreview') imagePreview: ElementRef;
  @ViewChild('selectedImg') selectedImg: ElementRef;
  itemRequestForm: FormGroup;
  uploadSub: Subscription;
  itemCode: string;
  private componentDestroyed: Subject<any> = new Subject();
  catalog: Array<string> = [];
  storeLogo: string;
  isOpenConfirm: boolean;
  confirmMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private checkoutActions: CheckoutActions,
    private checkoutService: CheckoutService,
    private productSerivce: ProductService,
    private globals: Globals,
    private store: Store<AppState>,
    private updates$: Actions,
  ) { 
    updates$
      .ofType(CheckoutActions.ADD_REQUEST_ITEM_SUCCESS)
      .takeUntil(this.componentDestroyed)
      .do((result: any) => {
        if (this.itemRequestForm) {
          if (result.payload.id) {
            this.itemRequestForm.patchValue({
              name: '',
              description: '',
              priceRange: '',
              quantity: 1,
              instructions: '',
              file: null,
              priceSpecific: 1,
            });
            this.itemRequestForm.markAsPristine();
            this.itemRequestForm.markAsUntouched();
          }
          this.generateItemCode();
        }
      })
      .subscribe();
      updates$
        .ofType(CheckoutActions.UPDATE_CART_ITEM_SUCCESS)
        .takeUntil(this.componentDestroyed)
        .do(() => {
          if (this.itemRequestForm) {
            this.itemRequestForm.markAsPristine();
          }
        })
        .subscribe();
  }

  ngOnInit() {
    this.initForm();
    if (this.requestItem) {
      let [description, priceRange, instructions] = this.requestItem.instructions.split(';')
        .map((str) => str.split(':')[1].trim());
      let priceSpecific = 1;
      if (priceRange.indexOf('Specific Price') >= 0) {
        let price = priceRange.split('=')[1];
        priceSpecific = price ? Number(price.trim()) : 1;
        priceRange = 'Specific Price';
      }
      this.itemRequestForm.patchValue({
        name: this.requestItem.item.name,
        quantity: this.requestItem.quantity,
        description,
        priceRange,
        instructions,
        priceSpecific,
      });
      this.itemCode = this.requestItem.item.code;
      this.confirmMessage = 'You made changes to your request. Do you want to review the changes before closing?';
    } else {
      this.generateItemCode();
      this.confirmMessage = 'You have an unsaved request. Do you want to review this request before closing?';
    }
    this.productSerivce.getStoreCatalog(this.partnerStore.id)
      .takeUntil(this.componentDestroyed)
      .subscribe((result: any) => {
        if (result.length) {
          this.catalog = result.map((data) => `${environment.S3_REPOSITORY.CATALOGS}${this.partnerStore.id}/${data.name}`);
        }
      });
    const jpg = (this.partnerStore.logo.indexOf('.png') < 0 && this.partnerStore.logo.indexOf('.jpg') < 0 ) ? '.jpg' : '';
    this.storeLogo = `${environment.S3_REPOSITORY.LOGOS}${this.partnerStore.logo}${jpg}`;
  }

  ngAfterViewInit() {
    const image = this.imagePreview.nativeElement; 
    if (this.requestItem) {
      image.src = `${environment.S3_REPOSITORY.ITEMS}${this.itemCode}.jpg`;
    } else {
      image.src = this.storeLogo;
    }
  }

  initForm(): void {
    this.itemRequestForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.maxLength(250)],
      priceRange: ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      quantity: [1, Validators.compose([Validators.required, Validators.min(1), Validators.max(9999)])],
      instructions: ['', Validators.maxLength(250)],
      file: null,
      priceSpecific: [1, Validators.compose([Validators.required, Validators.min(1)])],
    }, {
      validator: this.validateFile()
    });
  }
  
  addToCart(): void {
    const values = this.itemRequestForm.value;
    if (!this.itemRequestForm.valid) {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.itemRequestForm.controls[val];
        if (!ctrl.valid) {
          ctrl.markAsTouched();
        };
      });
      return;
    }
    let price = `Price Range: ${values.priceRange}`;
    if (values.priceRange === 'Specific Price') {
      price += ` = ${values.priceSpecific}`;
    }
    const data = {
      name: values.name,
      quantity: Number(values.quantity),
      image: this.itemCode,
      instructions: `Description: ${values.description.replace(/;/g, ",")}; `
        + `${price}; `
        + `Instructions: ${values.instructions.replace(/;/g, ",")}`,
      code: this.itemCode,
      storeId: this.partnerStore.id,
      brand: this.partnerStore.name,
    };
    this.store.dispatch(this.checkoutActions.addRequestItem(data));
    this.uploadImage();
  }

  loadImage(): void {
    if (this.fileUpload.nativeElement.files.length) {
      const output = this.imagePreview.nativeElement;
      output.src = URL.createObjectURL(this.fileUpload.nativeElement.files[0]);
      output.onload = () => {
        URL.revokeObjectURL(output.src);
      };
    }
  }

  uploadImage(): void {
    if (this.fileUpload.nativeElement.files.length) {
      const file = this.fileUpload.nativeElement.files[0];
      // const type = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);
      const rename = `omg-images/${this.itemCode}.jpg`;
      this.uploadSub = this.checkoutService.uploadFileToS3(file, rename)
        .takeUntil(this.componentDestroyed)
        .subscribe();
      const image = this.imagePreview.nativeElement; 
      image.src = this.storeLogo;
    }
  }

  updateItem(): void {
    const values = this.itemRequestForm.value;
    if (!this.itemRequestForm.valid) {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.itemRequestForm.controls[val];
        if (!ctrl.valid) {
          ctrl.markAsTouched();
        };
      });
      return;
    }
    this.requestItem.item.name = values.name;
    this.requestItem.quantity = Number(values.quantity);
    let price = `Price Range: ${values.priceRange}`;
    if (values.priceRange === 'Specific Price') {
      price += ` = ${values.priceSpecific}`;
    }
    this.requestItem.instructions = `Description: ${values.description.replace(/;/g, ",")}; `
      + `${price}; Instructions: ${values.instructions.replace(/;/g, ",")}`;
    this.store.dispatch(this.checkoutActions.updateRequestItem(this.requestItem));
    this.uploadImage();
  }

  deleteItem(): void {
    this.store.dispatch(this.checkoutActions.removeCartItem(this.requestItem.id));
    this.checkoutService.deleteCartItem(this.requestItem).takeUntil(this.componentDestroyed)
      .subscribe(() => this.onCloseModal());
  }

  previousItem(): void {

  }

  nextItem(): void {

  }

  onCloseModal(isRedirect = false): void {
    this.onCloseModalEmit.emit(isRedirect);
  }

  selectPriceRange(): void {
    const value = this.itemRequestForm.get('priceRange').value;
    if (value !== 'Specific Price') {
      this.itemRequestForm.get('priceSpecific').setValue(1);
    }
  }

  selectImg(image): void {
    const el = this.selectedImg.nativeElement;
    el.classList.remove('image-ease-in');
    el.classList.add('image-ease-out');
    setTimeout(() => {
      const el = this.selectedImg.nativeElement;
      el.onload = (e: any) => {
        e.target.classList.remove('image-ease-out');
        e.target.classList.add('image-ease-in');
      };
      el.src = image;
    }, 400);
  }

  generateItemCode(): void {
    const rand = Math.floor(Math.random() * 10000) + '';
    this.itemCode = `R${Date.now()}${('0000'+rand).substring(rand.length)}`;
  }

  onImageError(e: any): void {
    e.target.src = this.globals.LOGO_DEFAULT_IMG;
  }

  openConfirm(isClose = false): void {
    if (this.itemRequestForm.dirty) {
      this.isOpenConfirm = true;
      this.selectedImg.nativeElement.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
      this.onCloseModal(isClose);
    }
  }

  onDestroy() {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  private validateFile(): object {
    return (group: FormGroup): {[key: string]: any } => {
      if(this.fileUpload && this.fileUpload.nativeElement.files.length) {
        const file = this.fileUpload.nativeElement.files[0];
        // NOTE: 1MB
        if (file.size > 1048576) {
          return {
            exceedMaxFileSize: true,
          }
        } else if (file.type !== 'image/jpeg') {
          return {
            incorrectFileType: true,
          }
        }
      }
    };
  }

}
