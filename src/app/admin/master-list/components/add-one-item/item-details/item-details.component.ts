import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from './../../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';
import { AppState } from './../../../../../interfaces';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})

export class ItemDetailsComponent implements OnInit, OnDestroy {
  @Output() onReviewClickEmit: EventEmitter<string> = new EventEmitter();
  @ViewChild('category1Box') searchInput: ElementRef;
  itemAddForm: FormGroup;
  categories$: Subscription;
  brands$: Subscription;
  stores$: Subscription;
  itemList$: Subscription;
  autoSuggestData$: Observable<any>;
  inputString: string;
  catInputText:string;
  categoryList: any;
  brands: any;
  items: any;
  itemId: any;
  itemBrand: any;
  cat1List: Array<any> = [];
  cat2List: Array<any> = [];
  cat3List: Array<any> = [];
  bCat1Selected: boolean = false;
  bCat2Selected: boolean = false;
  bCat3Selected: boolean = false;
  bCat1Disabled: boolean = false;
  bCat2Disabled: boolean = true;
  bCat3Disabled: boolean = true;
  bItemPrice: boolean = false;
  bCustomBrand: boolean = false;
  isAdmin: boolean = false;
  partnerStoreList: Array<any>;
  previousData: any;
  loggedUser: any;
  tempItemData: {
  'id': number,
  'code': string,
  'name': string,
  'brandName': string,
  'price': string,
  'displayPrice': string,
  'hasVat': string,
  'isSenior': string,
  'weighted': Number,
  'packaging': Number,
  'packageMeasurement': string,
  'sizing': string,
  'packageMinimum': string,
  'packageIntervals': string,
  'availableOn': string,
  'slug': string,
  'imageKey': string,
  'enabled': Number,
  'category1': Number,
  'category2': Number,
  'category3': Number,
  'partner_id': Number,
  'dateCreated': Number,
  'dateUpdated': Number,
 };
 private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.loggedUser = JSON.parse(localStorage.getItem('selleruser'));
    if (this.loggedUser.role_id < 3){
      this.isAdmin = true;
    }
    this.categories$ = this.adminService.getCategories()
    .takeUntil(this.componentDestroyed)
    .subscribe(categories => {
        this.categoryList = categories;
        if (this.categoryList['categories']) {
          for (var i=0 ; i < this.categoryList['categories'].length; i++) {
              this.cat1List[i] = this.categoryList['categories'][i];
          }
        }
    });
    this.stores$ = this.adminService.getPartners({ list: 2 })
      .takeUntil(this.componentDestroyed)
      .subscribe((partnerList) => {
        this.partnerStoreList = partnerList.filter(partner => partner.type === 'seller'
          && partner.status === 1)
          .map(store => ({
              id: store.id,
              name: store.name,
              checked: false,
          }));
      });
    this.initEmptyForm();
    if (sessionStorage.getItem('showItem')) {
      this.previousData = JSON.parse(sessionStorage.getItem('showItem'));
      this.itemAddForm.patchValue({
        store: this.previousData.store,
        itemName: this.previousData.name,
        itemCode: this.previousData.code,
        itemBrand: this.previousData.brand,
        price: this.previousData.itemPrice,
        itemCategory1: this.previousData.category1,
        itemCategory2: this.previousData.category2,
        itemCategory3: this.previousData.category3,
        weighted: (this.previousData.weighted == 'YES') ? 1 : 0,
        enabled: (this.previousData.enabled == 'Yes') ? 1 : 0,
      });
    }
    this.getBrands();
  }

  initEmptyForm(): void {
    this.itemAddForm = this.fb.group({
      store: ['', Validators.required],
      itemName: ['', Validators.required],
      itemCode: '',
      customBrand: '',
      itemBrand: '',
      price: ['', Validators.required],
      itemCategory1: ['', Validators.required],
      itemCategory2: ['', Validators.required],
      itemCategory3: '',
      weighted:'',
      enabled: '',
    });
  }

  getNameCategory1(cat: any, list: any): string {
    let retVal = '';
    for (var i=0; i < list.length; i++) {
      if (list[i].id === cat) {
        retVal = list[i].name;
      }
    }
    return retVal;
  }

  getNameCategory2(cat: any, list: any): string {
    let retVal = '';
    for (var i=0; i < list.length; i++) {
      if (list[i].id === cat) {
        retVal = list[i].name;
      }
    }
    return retVal;
  }

  getNameCategory3(cat: any, list: any): string {
    let retVal = '';
    for (var i=0; i < list.length; i++) {
      if (list[i].id === cat) {
        retVal = list[i].name;
      }
    }
    return retVal;
  }

  getStoreName(store: any): string {
    let retVal = ''
    for (var i=0; i < this.partnerStoreList.length; i++){
      if(this.partnerStoreList[i].id === store) {
        retVal = this.partnerStoreList[i].name;
      }
    }
    return retVal;
  }

  generateLastItemId(): void {
    this.tempItemData = {
      id: 0,
      code: '',
      name: '',
      brandName: '',
      price: '0',
      displayPrice: '0',
      hasVat: '',
      isSenior: '',
      weighted: 0,
      packaging: 0,
      packageMeasurement: '',
      sizing: '',
      packageMinimum: '',
      packageIntervals: '',
      availableOn: '',
      slug: '',
      imageKey: '',
      enabled: 0,
      category1: 0,
      category2: 0,
      category3: 0,
      partner_id: 0,
      dateCreated: 0,
      dateUpdated:0,
    };
    this.itemList$ = this.adminService.getItemsAdmin({
      limit: 1,
      sortBy: 'id',
      sort: 'desc',
    })
    .takeUntil(this.componentDestroyed)
    .subscribe(list => {
      this.items = list['list'];
      this.tempItemData.id = this.items[0].id + 1;
      this.itemId = this.tempItemData.id;
    });
  }

  getBrands(): void  {
    this.brands$ = this.adminService.getItemBrands()
    .takeUntil(this.componentDestroyed)
    .subscribe(brands => {
      this.brands = brands;
    });
  }

  storeChange($event): void{
    this.itemAddForm.value.store = $event.target.value;
  }

  category1Change($event): void  {
    this.bCat1Selected = true;
    this.bCat2Disabled = false;
    for (var i=0; i < this.cat1List.length; i++) {
      if(this.cat1List[i].id == $event.target.value) {
        this.cat2List = this.cat1List[i].subCategories;
      }
    }
    this.itemAddForm.value.category1 = $event.target.value;
  }

  category2Change($event): void  {
    this.bCat2Selected = true;
    for (var i=0; i < this.cat2List.length; i++) {
      if(this.cat2List[i].id == $event.target.value) {
        this.cat3List = this.cat2List[i].subCategories;
      }
    }
    if(this.cat3List.length > 0) {
      this.bCat3Disabled = false;
    }
    this.itemAddForm.value.category2 = $event.target.value;
  }

  category3Change($event): void  {
    this.bCat3Selected = true;
    this.itemAddForm.value.category3 = $event.target.value;
  }

  changeBrand($event): void {
    this.itemAddForm.value.brand = $event.target.value;
  }

  onSubmit(): void {
    let values = this.itemAddForm.value;
    let brand = values.itemBrand ? values.itemBrand : values.customBrandInput;
    let store = 0;
    if(values.customBrand) {
      this.itemAddForm.removeControl('itemBrand');
    } else {
      this.itemAddForm.removeControl('customBrandInput');
    }
    if(!this.isAdmin){
      store = this.loggedUser.partner_id;
      this.itemAddForm.removeControl('store');
    } else {
      store = values.store;
    }
    if (this.itemAddForm.valid) {
      const data = {
        code: values.itemCode,
        name: values.itemName,
        brand: brand,
        price: values.price,
        category1: Number(values.itemCategory1),
        category2: Number(values.itemCategory2),
        category3: Number(values.itemCategory3),
        isWeighted: values.weighted,
        isEnabled:values.enabled,
        partner_id: Number(store),
      };
      sessionStorage.setItem('item',JSON.stringify(data));
      this.reviewDetails(data);
      this.onReviewClickEmit.emit();

    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.itemAddForm.controls[val];
        if (!ctrl.valid) {
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
        }
      });
    }
  }

  customBrandChecked(event: any){
    this.itemAddForm.addControl('customBrandInput', new FormControl(''));
    this.bCustomBrand = this.bCustomBrand ? false : true;
  }

  reviewDetails(details: any) {
    let storeData = 0;
    if (this.isAdmin) {
      storeData = details.partner_id;
    } else {
      storeData = this.loggedUser.partner_id;
    }
    const revDetails = {
       store: this.getStoreName(storeData),
       name: details.name,
       code: details.code,
       brand: details.brand,
       itemPrice: details.price,
       category1: this.getNameCategory1(details.category1, this.categoryList['categories']),
       category2: this.getNameCategory2(details.category2, this.cat2List),
       category3: this.getNameCategory3(details.category3, this.cat3List),
       weighted: (Number(details.isWeighted) > 0) ? 'YES' : 'NO',
       enabled: (Number(details.isEnabled) > 0) ? 'Yes' : 'NO',
     };

     sessionStorage.setItem('showItem',JSON.stringify(revDetails));
  }

  private pushErrorFor(ctrl_name: string, msg: string): void {
    this.itemAddForm.controls[ctrl_name].setErrors({'msg': msg});
  }

  isWeighted($event): void {
   this.itemAddForm.value.weighted = $event.target.value;
  }

  isEnabled($event): void {
   this.itemAddForm.value.enabled = $event.target.value;
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }
}
