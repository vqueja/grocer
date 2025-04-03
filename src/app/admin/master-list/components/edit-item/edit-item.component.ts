import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { AdminService } from '../../../services/admin.service';
import { AdminVarsService } from '../../../services/admin-vars.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-update-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent implements OnInit, OnDestroy {
  itemEditForm: FormGroup;
  userData: any;
  itemId: number;
  itemData: any;
  partnerStoreList: Array<any> = [];
  categoryData: Array<any> = [];
  category1List: Array<any> = [];
  category2List: Array<any> = [];
  category3List: Array<any> = [];
  brands: Array<any> = [];
  isEOSUser: boolean = false;
  isStoreItem: boolean = false;
  priceHistory: Array<any> = [];
  masterItemFields: Array<string> = [];
  storeItemFields: Array<string> = [];
  storesData: Array<any> = [];
  addStoreList: Array<any> = [];
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @ViewChild('itemImage') itemImage: ElementRef;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
    private route: ActivatedRoute,
  ) { }


  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('selleruser'));
    this.storesData = JSON.parse(localStorage.getItem('partners')).filter((p) => p.type === 'seller');
    this.isEOSUser = this.userData.partner_id === 1 ? true: false;  
    this.initForm();
    this.route.params
      .do((params: any) => this.itemId = params.id)
      .switchMap(() => this.route.queryParams)
      .switchMap((params: any) => {
        if (this.isEOSUser && params && params.partnerId !== '0') {
          return this.initMasterItem(params.masterId)
            .switchMap(() => this.initStoreItem(this.itemId));
        } else if (this.isEOSUser && params && params.partnerId === '0'){
          return this.initMasterItem(this.itemId);
        } else {
          return this.initStoreItem(this.itemId);
        }
      })
      .switchMap(() => this.initCategories())
      .takeUntil(this.componentDestroyed)
      .subscribe();
    this.adminService.getItemBrands()
      .do((brands) => this.brands = brands.map((brand: any) => brand.brand))
      .takeUntil(this.componentDestroyed)
      .subscribe();      
  }

  initForm(): void {
    this.itemEditForm = this.fb.group({
      itemId: 0,
      itemName: ['', Validators.compose([Validators.required, Validators.maxLength(300)])],
      itemCode: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
      brand: ['', Validators.maxLength(50)],
      price: [0.00, Validators.required],
      category1: -1,
      category2: -1,
      category3: -1,
      enabled: 0,
      store: 0,
      weighted: 0,
      customName: ['', Validators.maxLength(300)],
      slug: ['', Validators.maxLength(255)],
      file: '',
      addStore: 0,
    });
    this.masterItemFields = ['itemName', 'itemCode', 'brand', 'weighted', 'slug', 'file'];
    this.storeItemFields = ['price', 'category1', 'category2', 'category3', 'enabled', 'customName'];
  }

  initMasterItem(id: number): Observable<any> {
    this.isStoreItem = false;
    return this.adminService.getItemAdmin(id)
      .do((item: any) => {
        item.partners = JSON.parse(`[${item.partners}]`)
          .map((partner) => {
            const i = this.storesData.find(p => p.id === partner.partner_id);
            partner['name'] = i ? i.name: '';
            if (i) {
              this.partnerStoreList.push(i);
            }
            return partner;
          })
          .reduce((acc, cur) => {
            acc[cur.partner_id] = cur;
            return acc;
          }, {});
        this.partnerStoreList.sort((a, b) => a.name.localeCompare(b.name));
        this.addStoreList = this.storesData.filter((store) => {
            const i = this.partnerStoreList.find(p => p.id === store.id);
            return i ? false: true;
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        this.itemData = item;
        this.itemData['imageUrl'] = `${environment.S3_REPOSITORY.ITEMS}${item.imageKey}.jpg`;
        const form = this.itemEditForm;
        form.patchValue({
          itemId: item.id,
          itemName: item.name,
          itemCode: item.code,
          brand: item.brandName,
          slug: item.slug,
        });
        this.toggleFields(this.masterItemFields, 'enable');
        this.toggleFields(this.storeItemFields, 'disable');
        this.priceHistory = [];
      });
  }

  initStoreItem(id: number): Observable<any> {
    this.isStoreItem = true;
    return this.adminService.getStoreItem(id)
      .do((item: any) => {
        const form = this.itemEditForm;
        form.patchValue({
          itemId: item.id,
          customName: item.storeItemName,
          price: Number(item.price),
          enabled: item.enabled ? 1: 0,
          category1: item.category1,
          category2: item.category2,
          category3: item.category3,
          store: item.partner_id,
        });
        if (!this.isEOSUser) {
          this.itemData = item;
          this.itemData['imageUrl'] = `${environment.S3_REPOSITORY.ITEMS}${item.imageKey}.jpg`;
          form.patchValue({
            store: item.partner_id,
            itemName: item.masterItemName,
            itemCode: item.code,
            brand: item.brandName,
          });
        }
        this.populateCategory2List(item.category1);
        this.populateCategory3List(item.category2);
        this.toggleFields(this.masterItemFields, 'disable');
        this.toggleFields(this.storeItemFields, 'enable');
        form.get('addStore').disable();
        form.get('addStore').setValue(0);
      })
      .switchMapTo(this.initPriceHistory(id));
  }

  initPriceHistory(id: number): Observable<any> {
    return this.adminService.getItemHistory({ 
      item_id: id,
      limit: 10,
      priceDiffOnly: 1,
    })
    .do((prices: any) => this.priceHistory = prices.map((price) => {
      price['date'] = new Date(price.dateUpdated).toLocaleString();
      return price;
    }));
  }

  initCategories(): Observable<any> {
    const storeId = this.itemEditForm.get('store').value;
    return this.adminService.getCategories(storeId)
      .do((categories: any) => {
        this.categoryData = categories.categories;
        this.category1List = this.categoryData.map((c) => {
          return {
            id: c.id,
            name: c.name,
          };
        });
        this.populateCategory2List(this.itemEditForm.get('category1').value);
        this.populateCategory3List(this.itemEditForm.get('category2').value);
      });
  }

  onCancelClick(): void {
    history.back();
  }

  saveChanges(): void {
    const form = this.itemEditForm;
    const values = form.value;
    if (!form.valid) {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = form.controls[val];
        if (!ctrl.valid) {
          ctrl.markAsTouched();
        };
      });
      this.adminService.showErrorMsg('Validation Error');
      return;
    }
    if (!Number(form.get('store').value) && Number(form.get('addStore').value)) {
      this.createStoreItem(values);
    } else {
      this.updateItem(values);
    }
  }

  createStoreItem(values: any): void {
    const storeId = Number(values.addStore);
    const data = {
      item_id: values.itemId,
      price: Number(values.price),
      displayPrice: Number(values.price),
      name: values.customName || '',
      enabled: values.enabled ? 1: 0,
      category1: Number(values.category1),
      category2: Number(values.category2) || 0,
      category3: Number(values.category3) || 0,
      partner_id: storeId,
    };
    this.adminService.createStoreItem(data)
      .do((result: any) => {
        if (result.message === 'Saved') {
          this.adminService.showSuccessMsg('Saved');
          const index = this.addStoreList.findIndex((s) => s.id === storeId);
          if (index) {
            const store = this.addStoreList[index];
            this.partnerStoreList.push(store);
            this.itemData.partners[storeId] = {
              id: result.id,
              partner_id: storeId,
              name: store.name,
            };
            this.addStoreList.splice(index, 1);
          }
          const form = this.itemEditForm;
          form.get('itemId').setValue(result.id)
          form.get('store').setValue(storeId);
          form.get('addStore').setValue(0);
          form.get('addStore').disable();
          this.isStoreItem = true;
        } else {
          const msg = result.message === 'Failed' ? result.error : result.message;
          this.adminService.showErrorMsg(msg);
        }
      })
      .takeUntil(this.componentDestroyed)
      .subscribe();
  }

  updateItem(values: any): void {
    if (Number(values.store) === 0) {
      const data = {
        id: values.itemId,
        name: values.itemName,
        code: values.itemCode,
        brandName: values.brand,
        weighted: values.weighted ? 1: 0,
      };
      this.adminService.updateItem(data)
        .mergeMap((result: any) => {
          if (result.message.includes('Updated')) {
            this.itemData.name = data.name;
            this.itemData.code = data.code;
            this.itemData.brandName = data.brandName;
            this.itemData.weighted = data.weighted;
            this.adminService.showSuccessMsg('Updated');
            return this.uploadImage();
          } else {
            const msg = result.message === 'Failed' ? result.error : result.message;
            this.adminService.showErrorMsg(msg);
            return Observable.of(false);
          }
        })
        .takeUntil(this.componentDestroyed)
        .subscribe();
    } else {
      const data = {
        id: values.itemId,
        price: Number(values.price),
        displayPrice: Number(values.price),
        name: values.customName || '',
        enabled: values.enabled ? 1: 0,
        category1: Number(values.category1),
        category2: Number(values.category2) || 0,
        category3: Number(values.category3) || 0,
        user: `${this.userData.name} (ID: ${this.userData.id})`,
      };
      this.adminService.updateStoreItem(data)
        .mergeMap((result: any) => {
          if (result.message.includes('Updated')) {
            return this.initPriceHistory(values.itemId)
              .do(() => this.adminService.showSuccessMsg('Updated'));
          } else {
            const msg = result.message === 'Failed' ? result.error : result.message;
            return Observable.of(msg)
              .do((_msg: string) => this.adminService.showErrorMsg(_msg));
          }
        })
        .takeUntil(this.componentDestroyed)
        .subscribe();
    }
  }

  changeStore(e: Event): void {
    const target = event.target as HTMLInputElement;
    const storeId = Number(target.value);
    const form = this.itemEditForm;
    form.patchValue({      
      itemId: this.itemData.id,
      itemName: this.itemData.name,
      itemCode: this.itemData.code,
      brand: this.itemData.brandName,
      weighted: this.itemData.weighted,
    });
    if (storeId === 0) {
      this.isStoreItem = false;
      form.patchValue({
        customName: '',
        price: 0.00,
        enabled: 0,
        category1: 0,
        category2: 0,
        category3: 0,
      });
      this.toggleFields(this.masterItemFields, 'enable');
      this.toggleFields(this.storeItemFields, 'disable');
      form.get('addStore').enable();
      this.priceHistory = [];
    } else {
      const id = this.itemData.partners[storeId].id;
      this.initStoreItem(id)
        .switchMap(() => this.initCategories())
        .takeUntil(this.componentDestroyed)
        .subscribe();
    }
  }

  changeCategory1(e: Event): void {
    const form = this.itemEditForm;
    const target = event.target as HTMLInputElement;
    form.get('category2').setValue(0);
    form.get('category3').setValue(0);
    const c1 = Number(target.value);
    this.populateCategory2List(c1);
  }

  populateCategory2List(c1: number): void {
    const form = this.itemEditForm;
    form.get('category2').disable();
    form.get('category3').disable();
    const category1 = this.categoryData.find((c: any) => c.id === c1);

    if (category1 && category1.subCategories.length) {
      form.get('category2').enable();
      this.category2List = category1.subCategories.map((c: any) => ({
        id: c.id,
        name: c.name,
      }));
    }
  }

  changeCategory2(e: Event): void {
    const target = event.target as HTMLInputElement;
    const form = this.itemEditForm;
    form.get('category3').setValue(0);
    const c2 = Number(target.value);
    this.populateCategory3List(c2);
  }

  populateCategory3List(c2: number): void {
    const form = this.itemEditForm;
    form.get('category3').disable();
    const c1 = Number(this.itemEditForm.get('category1').value);
    const category1 = this.categoryData.find((c: any) => c.id === c1);

    if (category1 && category1.subCategories.length) {
      const category2 = category1.subCategories.find((c: any) => c.id === c2);
      if (category2 && category2.subCategories.length) {
        form.get('category3').enable();
        this.category3List = category2.subCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
        }));
      }
    }
  }

  uploadImage(): Observable<any> {
    if (this.fileUpload.nativeElement.files.length) {
      const file = this.fileUpload.nativeElement.files[0];
      const code = this.itemEditForm.get('itemCode').value;
      const rename = `omg-images/${code}.jpg`;
      return this.adminService.uploadFileToS3(file, rename)
        .do((results: any) => {
          this.itemEditForm.get('file').setValue('');
          this.itemImage.nativeElement.src = `${environment.S3_REPOSITORY.ITEMS}${code}.jpg?${new Date().getTime()}`;
        });
    }
    return Observable.of(false)
  }

  changeAddStore(e: Event): void {
    const form = this.itemEditForm;
    const target = e.target as HTMLInputElement;
    const storeId = Number(target.value)
    if (storeId === 0) {
      this.toggleFields(this.masterItemFields, 'enable');
      this.toggleFields(this.storeItemFields, 'disable');
      form.patchValue({
        customName: '',
        price: 0.00,
        enabled: 0,
        category1: 0,
        category2: 0,
        category3: 0,
      });
    } else {
      this.toggleFields(this.masterItemFields, 'disable');
      this.toggleFields(this.storeItemFields, 'enable');
    };
  }

  private toggleFields(fields: Array<string>, mode: string): void {
    if (mode === 'enable') {
      fields.forEach((field) => {
        this.itemEditForm.get(field).enable();
      });
    } else if (mode === 'disable') {
      fields.forEach((field) => {
        this.itemEditForm.get(field).disable();
      });
    }
  }

  private onImageError(e: any): void {
    e.target.src = this.adminVarsService.ITEM_DEFAULT_IMG;
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

}
