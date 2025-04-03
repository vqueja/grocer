import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AdminService } from './../../../services/admin.service';
import { environment } from 'environments/environment';
import { AdminVarsService } from '../../../services/admin-vars.service';

@Component({
  selector: 'app-partner-details',
  templateUrl: './partner-details.component.html',
  styleUrls: ['./partner-details.component.scss']
})
export class PartnerDetailsComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  partnerSub: Subscription;
  partnerForm: FormGroup;
  partnerData: any;
  partnerType: string;
  partnerSubtypes: Array<any>;
  partnerPriority: string;
  operation: string;
  partnerStoreList: Array<any>;
  logoUrl: string;
  imgRetries: 0;
  newSubTypes: Array<any>;
  priorityNum: Array<number> = [];
  subTypes = [
   { name:'ohmygrocery', value:1, checked:false },
   { name:'ohmygourmet', value:2, checked:false },
   { name:'ohmygifts', value:3, checked:false} ,
   { name:'ohmygoodness', value:4, checked:false }
 ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private adminVarsService: AdminVarsService,
  ) { }

  ngOnInit() {
    for (let i = 1; i < 100; i++) {
      this.priorityNum.push(i);
    }
    this.initForm();
    this.routeSub = this.adminService.getPartners({ list: 2 })
      .do((partnerList) => {
        this.partnerStoreList = partnerList.filter(partner => partner.type === 'seller'
          && partner.status === 2)
          .map(store => ({
              id: store.id,
              name: store.name,
              checked: false,
          }));
      })
      .switchMapTo(this.route.params)
      .mergeMap((params: any) => {
        if (params.id) {
          this.operation = 'Edit';
          return this.adminService.getPartner(params.id);
        } else {
          this.operation = 'Add';
          return Observable.of(false);
        }
      })
      .subscribe((partnerData: any) => {
        // let tmp;
        if (partnerData) {
          partnerData.address = partnerData.address || '';
          partnerData.city = partnerData.city || '';
          partnerData.postalCode = partnerData.postalCode || '';
          this.partnerData = partnerData;
          this.partnerForm.patchValue(partnerData);
          this.partnerType = this.partnerData.type;
          if( this.partnerData.subType && this.partnerData.type === 'seller') {
            const tmp = JSON.parse(this.partnerData.subType);
            for (let i=0; i < tmp.length; i++) {
              this.subTypes.forEach(type => {
                if (tmp[i] === type.value) {
                  type.checked = true;
                }
              });
            }
          }
          this.partnerSubtypes = this.subTypes;
          this.partnerPriority = this.partnerData.priority.toString();
          if (this.partnerData.storeList) {
            const storeList = JSON.parse(this.partnerData.storeList);
            this.partnerStoreList.forEach(store => {
              if (storeList.indexOf(store.id) > -1) {
                store.checked = true;
              }
            });
          }
          this.imgRetries = 0
          this.logoUrl = partnerData.logo ?
            `${ environment.LOGO_REPO }${ partnerData.logo }` : this.adminVarsService.LOGO_DEFAULT_IMG;
        } else {
          this.partnerType = 'buyer';
        }
      });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.partnerSub) {
      this.partnerSub.unsubscribe();
    }
  }

  initForm(): void {
    this.partnerForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      code: ['', Validators.required],
      address: '',
      city: '',
      postalCode: '',
      country: 'Philippines',
      internalName: '',
      contactPerson: '',
      contactEmail: ['', Validators.email],
      // partner buyer fields
      subType: '',
      url: '',
      salaryDeduction: 0,
      restricted: 0,
      signUpFlag: 0,
      serviceFee: 0,
      deliveryFee: 0,
      promoServiceFee: 0,
      promoDeliveryFee: 0,
      isZeroServiceFee: 0,
      isZeroDeliveryFee: 0,
      serviceIncrement: 0,
      deliveryIncrement: 0,
      threshold: 0,
      // partner seller/store fields
      sameDayDelivery: 0,
      pickUpDelivery: 0,
      markup: 0,
      status: 0,
      priority: 0,
      availability: 0,
      logo: '',
      isNew: 0,
      useStoreFees: 0,
      requestItemFlag: 0,
    });
  }

  onSubmit(option?: string): void {
    const values = this.partnerForm.getRawValue();
    if (values.type === 'seller') {
      // NOTE: partner seller/store
      values.sameDayDelivery = values.sameDayDelivery ? 1 : 0;
      values.useStoreFees = values.useStoreFees ? 1 : 0;
      values.isNew = values.isNew ? 1 : 0;
      values.subType = JSON.stringify(this.newSubTypes);
      values.requestItemFlag = values.requestItemFlag ? 1: 0;
      // NOTE: reset buyer options
      values.url = '';
      values.salaryDeduction = 0;
      values.restricted = 0;
      values.signUpFlag = 0;
    } else if (values.type === 'buyer'){
      // NOTE: partner buyer
      values.salaryDeduction = values.salaryDeduction ? 1 : 0;
      values.restricted = values.restricted ? 1 : 0;
      values.signUpFlag = values.signUpFlag ? 1 : 0;
      // NOTE: reset seller/store options
      values.sameDayDelivery = 0;
      values.pickUpDelivery = 0;
      values.markup = 0.00;
      values.logo = '';
      values.requestItemFlag = 0;
      values.useStoreFees = 0;
      values.isNew = 0;
    }
    values.isZeroServiceFee = values.isZeroServiceFee ? 1 : 0;
    values.isZeroDeliveryFee = values.isZeroDeliveryFee ? 1 : 0;
    if (this.operation === 'Add') {
      this.partnerSub = this.adminService
        .addPartner(values)
        .subscribe((result) => {
          if (result.message === 'Saved') {
            if (option === 'Add&Edit') {
              this.router.navigate(['admin/partners/edit', result.id]);
            } else {
              this.initForm();
            }
          }
        });
    } else {
      this.partnerSub = this.adminService
        .updatePartner(Object.assign(values, {
          id : this.partnerData.id
        }))
        .subscribe((res: any) => {
          if (res.message.toUpperCase() === 'UPDATED') {
            if (values.type === 'seller' && values.logo) {
              this.imgRetries = 0;
              this.logoUrl = `${ environment.LOGO_REPO }${ values.logo }`;
            }
          }
        });
    }
  }

  updatePartnerCategories(option: any): void {
    this.newSubTypes = [];
    this.partnerSubtypes.forEach( store => {
      if (store.value === option) {
        store.checked = !store.checked;
      }
      if (store.checked ) {
        if(!this.newSubTypes.includes(store.value)){
          this.newSubTypes.push(store.value);
        }
      }
    });
  }

  saveStoreList(): void {
    const storeList = [];
    this.partnerStoreList.forEach(store => {
      if (store.checked) {
        storeList.push(store.id);
      }
    });
    this.partnerSub = this.adminService
      .updatePartner({
        id: this.partnerData.id,
        storeList: JSON.stringify(storeList),
      })
      .subscribe();
  }

  onImageError(e: any): void {
    const key = `${ environment.LOGO_REPO }${ this.partnerForm.get('logo').value }`;
    this.imgRetries += 1;
    switch(this.imgRetries) {
      case 1:
        e.target.src = `${ key }.jpg`;
        break;
      case 2:
        e.target.src = `${ key }.png`;
        break;
      default:
        e.target.src = this.adminVarsService.LOGO_DEFAULT_IMG;
    }
  }

}
