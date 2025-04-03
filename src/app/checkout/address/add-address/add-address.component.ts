import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, EventEmitter, Output, Input, OnInit, OnDestroy }
  from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { AppState } from './../../../interfaces';
import { AddressService } from './../services/address.service';
import { getShipAddress, getBillAddress, getAddressType }
  from './../../reducers/selectors';
import { AuthService } from './../../../core/services/auth.service';
import { CheckoutService } from './../../../core/services/checkout.service';
import { UserService } from './../../../user/services/user.service';


@Component({
  selector: "app-add-address",
  templateUrl: "./add-address.component.html",
  styleUrls: ["./add-address.component.scss"]
})
export class AddAddressComponent implements OnInit, OnDestroy {
  @Output() onProceedClickEmit: EventEmitter<string> = new EventEmitter();
  @Input() partnerStore: any;
  @Input() isAuthenticated: boolean;
  addressForm: FormGroup;
    shipAddress$: Observable<any>;
  billAddress$: Observable<any>;
  checkBilling: boolean = false;
  prefix: any[] = ['+63'];
  _selectedVal: any[] = ['+63'];
  shipAddressDB: any;
  billAddressDB: any;
  shipAddrStore: any;
  billAddrStore: any;
  partnerAddrDB: any;
  userData: any;
  addressType: number = 1; //1 = personal, 2 = office, 3 = store pick-up
  isOfficeAddrOnly: boolean;
  isPickUpOption: boolean = false;
  private componentDestroyed: Subject<any> = new Subject();
  private fieldLabels = {
    firstname: 'First Name',
    lastname: 'Last Name',
    email: 'Email',
    phone: 'Mobile Number',
    shippingAddress01: 'Address 1',
    city: 'City/Municipality',
    postalcode: 'Zip Code',
    country: 'Country',
    billingAddress01: 'Address 1 (billing)',
    billCity: 'City/Municipality (billing)',
    billPostalcode: 'Zip Code (billing)',
    billCountry: 'Country (billing)',
  };

  constructor(
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private addrService: AddressService,
    private userService: UserService,
    private authService: AuthService,
    private store: Store<AppState>,
  ) {
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.addressForm = this.addrService.initAddressForm(this.isAuthenticated);
    this.isPickUpOption = this.partnerStore && this.partnerStore.pickUpDelivery;
    forkJoin([
      this.store.select(getShipAddress).take(1),
      this.store.select(getBillAddress).take(1),
      this.userService.getAddress(this.userData.id),
      this.userData.partner_id ? this.authService.getPartner(this.userData.partner_id) : Observable.of([]),
      this.store.select(getAddressType).take(1)
    ]).takeUntil(this.componentDestroyed)
      .subscribe((results) => {
        const [_storeShipAddr, _storeBillAddr, dbAddr, partnerData, addressType] = results;
        if (addressType) {
          this.addressForm.controls['addressType'].setValue(addressType);
        }
        if (addressType === 1) {
          const storeShipAddr = _storeShipAddr as any;
          if(storeShipAddr && storeShipAddr.shippingAddress01 && storeShipAddr.userAccountId == this.userData.id) {
            const mobileNumber = storeShipAddr.phone ? storeShipAddr.phone.split(" "): ['',''];
            this.shipAddrStore = Object.assign({}, storeShipAddr, { prefix: mobileNumber[0], phone: mobileNumber[1]});
          }
          const storeBillAddr = _storeBillAddr as any;
          if (storeBillAddr && storeBillAddr.billingAddress01 && storeShipAddr.userAccountId == this.userData.id) {
            this.billAddrStore = Object.assign({}, storeBillAddr, { isBilling: true });
          }
        }
        this.initPartnerBuyerAddress(partnerData);
        this.initUserAddress(dbAddr);
        this.changeAddressType();
      });
  }

  initPartnerBuyerAddress(data: any): void {
    if (data.id) {
      if (data.restricted) {
        this.addressForm.controls['addressType'].setValue('2');
        this.addressForm.controls['addressType'].disable();
      }
      this.partnerAddrDB = {
        shippingAddress01: data.address,
        shippingAddress02: '',
        city: data.city,
        postalcode: data.postalCode,
        country: data.country,
      };
    }
  }

  initUserAddress(data: any): void {
    if (data.length == 1) {
      this.shipAddressDB = data[0];
    } else if (data.length == 2) {
      if(data[0].default.data[0]) {
        [this.shipAddressDB, this.billAddressDB] = data;
      } else {
        [this.billAddressDB, this.shipAddressDB] = data;
      }
    }
    if (this.shipAddressDB){
      this.shipAddressDB = {
        id: this.shipAddressDB.id,
        shippingAddress01: this.shipAddressDB.address01,
        shippingAddress02: this.shipAddressDB.address02,
        city: this.shipAddressDB.city,
        postalcode: this.shipAddressDB.postalCode,
        country: this.shipAddressDB.country,
      }
    } else {
      this.shipAddressDB = {
        id: 0,
        shippingAddress01: '',
        shippingAddress02: '',
        city: '',
        postalcode: '',
        country: '',
      }
    }
    if (this.billAddressDB) {
      this.billAddressDB = {
        id: this.billAddressDB.id,
        billingAddress01: this.billAddressDB.address01,
        billingAddress02: this.billAddressDB.address02,
        billCity: this.billAddressDB.city,
        billPostalcode: this.billAddressDB.postalCode,
        billCountry: this.billAddressDB.country,
        isBilling: false,
      }
    } else {
      this.billAddressDB = {
        id: 0,
        billingAddress01: '',
        billingAddress02: '',
        billCity: '',
        billPostalcode: '',
        billCountry: '',
        isBilling: false,
      }
    }
  }

  changeAddressType(): void {
    switch (this.addressForm.get('addressType').value) {
      case 1: // NOTE: Personal Address
        this.addressForm.controls['shippingAddress01'].enable();
        this.addressForm.controls['city'].enable();
        this.addressForm.controls['postalcode'].enable();
        this.addressForm.controls['country'].enable();
        if(this.shipAddrStore && this.shipAddrStore.shippingAddress01 && this.shipAddrStore.userAccountId == this.userData.id) {
          this.addressForm.patchValue(this.shipAddrStore);
          if (this.billAddrStore && this.billAddrStore.isBilling) {
            this.addressForm.patchValue(this.billAddrStore);
            this.checkBilling = true;
          }
        } else {
          this.addressForm.patchValue(this.shipAddressDB);
          if (this.billAddressDB && this.billAddressDB.isBilling) {
            this.addressForm.patchValue(this.billAddressDB);
            this.checkBilling = true;
          }
        }
        break;
      case 2: // NOTE: Office Address | Partner Buyer Address
        this.addressForm.controls['shippingAddress01'].disable();
        this.addressForm.controls['city'].disable();
        this.addressForm.controls['postalcode'].disable();
        this.addressForm.controls['country'].disable();
        this.addressForm.controls['isBilling'].setValue(false);
        this.checkBilling = false;
        this.addressForm.patchValue(this.partnerAddrDB);
        break;
      case 3: // NOTE: Pick-Up | Partner Store Address
        this.addressForm.controls['shippingAddress01'].disable();
        this.addressForm.controls['city'].disable();
        this.addressForm.controls['postalcode'].disable();
        this.addressForm.controls['country'].disable();
        this.addressForm.controls['isBilling'].setValue(false);
        this.checkBilling = false;
        this.addressForm.patchValue({
          shippingAddress01: this.partnerStore.address,
          city: this.partnerStore.city,
          postalcode: this.partnerStore.postalCode,
          country: this.partnerStore.country,
        });
        break;
    }
  }

  onSubmit(): void {
    let errorDetails = '';
    let values = this.addressForm.getRawValue();
    const isBilling = this.checkBilling && values.addressType === 1;

    let addressFields = ['firstname','lastname','email','phone','shippingAddress01',
      'city','postalcode','country','prefix'];
    let requiredFields = !isBilling ? addressFields
      : addressFields.concat(['billingAddress01','billCity','billPostalcode','billCountry'])
    let hasError = false;

    requiredFields.forEach(val => {
      const ctrl = this.addressForm.controls[val];
      if (!ctrl.valid && ctrl.enabled) {
        ctrl.markAsTouched();
        hasError = true;
        errorDetails += `\n\u2022 ${this.fieldLabels[val]}`
      };
    });

    if(!hasError) {
      let observablesArr = [];
      values.phone = `${this._selectedVal} ${values.phone}`;
      values['useraccount_id'] = this.userData.id;
      observablesArr.push(this.saveUserProfile(values));
      if (values.addressType === 1) {
        observablesArr = observablesArr.concat(this.saveAddress(values));
      }
      if (!isBilling) {
        values.billingAddress01 = '';
        values.billCity = '';
        values.billPostalcode = '';
        values.billCountry = '';
      }
      delete values.isBilling;
      delete values.prefix;
      values.status = 'address';
      observablesArr.push(this.checkoutService.updateOrder(values));
      forkJoin(observablesArr)
        .takeUntil(this.componentDestroyed)
        .subscribe(() => this.onProceedClickEmit.emit());
      
    } else {
      this.checkoutService.showErrorMsg('address', errorDetails);
    }
  }

  showBillingAddr(): void {
    this.checkBilling = !this.checkBilling;
    if (this.checkBilling) {
      if (this.billAddrStore) {
        this.addressForm.patchValue(this.billAddrStore);
        this.billAddrStore.isBilling = true;
      } else {
        this.addressForm.patchValue(this.billAddressDB);
        this.billAddressDB.isBilling = true;
      }
      this.addressForm.patchValue({ isBilling: true});
    } else {
      this.addressForm.patchValue({
        billingAddress01: '',
        billingAddress02: '',
        billCity: '',
        billPostalcode: '',
        billCountry: '',
        isBilling: false,
      });
      if (this.billAddrStore) {
        this.billAddrStore.isBilling = false;
      }
      if (this.billAddressDB) {
        this.billAddressDB.isBilling = false;
      }
    }
  }

  saveAddress(values: any): Array<Observable<any>> {
    let observables$ = [];
    let shipAddrData = {
      address01: values.shippingAddress01,
      address02: values.shippingAddress02,
      city: values.city,
      country: values.country,
      postalCode: values.postalcode,
      default: true,
      billing: false,
      useraccount_id: this.userData.id.toString()
    }
    if (this.shipAddressDB && this.shipAddressDB.id) {
      shipAddrData['id'] = this.shipAddressDB.id;
      observables$.push(this.userService.updateAddress(shipAddrData));
    } else {
      observables$.push(this.userService.saveAddress(shipAddrData));
    }

    if (this.checkBilling && values.addressType === 1) {
      let billAddrData = {
        address01: values.billingAddress01,
        address02: values.billingAddress02,
        city: values.billCity,
        country: values.billCountry,
        postalCode: values.billPostalcode,
        default: false,
        billing: true,
        useraccount_id: this.userData.id.toString()
      }
      if (this.billAddressDB && this.billAddressDB.id) {
        billAddrData['id'] = this.billAddressDB.id;
        observables$.push(this.userService.updateAddress(billAddrData));
      } else {
        observables$.push(this.userService.saveAddress(billAddrData));
      }
    }
    return observables$;
  }

  saveUserProfile(values: any): Observable<any> {
    if (!this.userData.firstName || !this.userData.lastName || !this.userData.mobileNumber ) {
      const data = {
        id: this.userData.id,
        email: this.userData.email,
      };
      if (!this.userData.firstName) {
        data['firstName'] = values.firstname;
      }
      if (!this.userData.lastName) {
        data['lastName'] = values.lastname;
      }
      if (!this.userData.mobileNumber) {
        data['mobileNumber'] = values.phone;
      }
      return this.authService.update(this.userData.id, data, false);
    }
    return Observable.of(false);
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }
}
