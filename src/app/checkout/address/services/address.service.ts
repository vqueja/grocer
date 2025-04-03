import { FormBuilder, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { getShipAddress,getBillAddress } from './../../reducers/selectors';
import { AppState } from './../../../interfaces';
import { Store } from '@ngrx/store';

@Injectable()
export class AddressService {
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
  }

  initAddressForm(auth) {
    let lastname = '';
    let firstname = '';
    let prefix = '';
    let phone = '';
    let email = '';
    if(auth){
      const userData = JSON.parse(localStorage.getItem('user'));
      const mobileNumber = userData.mobileNumber ? userData.mobileNumber.split(" "): ['+63',''];
      lastname = userData.lastName;
      firstname = userData.firstName;
      prefix = mobileNumber[0];
      phone = mobileNumber[1];
      email = userData.email;
    }
    return this.fb.group({
      lastname: [lastname, Validators.required],
      firstname: [firstname, Validators.required],
      shippingAddress01: ['', Validators.required],
      shippingAddress02: '',
      city: ['', Validators.required],
      prefix: [prefix, Validators.required],
      phone: [phone, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]{10}')]) ],
      landline: '',
      email: [email, Validators.compose([Validators.required, Validators.email]) ],
      postalcode: ['', Validators.required],
      country: ['Philippines', Validators.required],
      isBilling: false,
      billingAddress01: ['', Validators.required],
      billingAddress02: '',
      billCity: ['', Validators.required],
      billPostalcode: ['', Validators.required],
      billCountry: ['Philippines', Validators.required],
      specialInstructions: '',
      addressType: 1,
    });
  }


  initEmailForm() {
    return this.fb.group({
      'email': ['', Validators.required]
    });
  }

  createAddresAttributes(address) {
    return {
      'order': {
        'bill_address_attributes': address,
        'ship_address_attributes': address
      }
    };
  }

  createGuestAddressAttributes(address, email) {
    return {
      'order': {
        'email': email,
        'bill_address_attributes': address,
        'ship_address_attributes': address
      }
    };
  }

}
