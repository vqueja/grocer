import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from './../../../services/user.service';


@Component({
  selector: 'app-address-edit',
  templateUrl: './address-edit.component.html',
  styleUrls: ['./address-edit.component.scss']
})
export class AddressEditComponent implements OnInit {
  routeSubscription$: Subscription;
  addressId: number;
  addressType: string;
  addressForm: FormGroup;
  userId: number;
  operation: string;
  isLoading: boolean = false;
  private fieldLabels = {
    address01: 'Address 1',
    city: 'City/Municipality',
    postalCode: 'Zip Code',
    country: 'Country',
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    let userData = JSON.parse(localStorage.getItem('user'));
    this.userId = userData.id;

    this.routeSubscription$ = this.route.params.subscribe((params: any) => {
      if(params.id) {
        this.addressId = params.id;
        this.operation = "Edit";
        this.userService.getAddressById(this.addressId).subscribe((result) => {
          if(result.length) {
            this.addressForm.patchValue({
              address01: result[0].address01,
              address02: result[0].address02,
              city: result[0].city,
              postalCode: result[0].postalCode,
              country: result[0].country
            });
            this.addressType = result[0].default.data[0] ? 'shipping': 'billing';
          }
        })
      } else if(params.type) {
        this.addressType = params.type;
        this.operation = "Add";
      }
      this.initForm();
    });
  }

  initForm(): void {
    this.addressForm = this.fb.group({
      address01: ['', Validators.required],
      address02: '',
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  onSubmit(): void {
    let values = this.addressForm.value;

    if (this.addressForm.valid) {
      values['useraccount_id'] = this.userId.toString();
      if (this.operation == 'Add') {
        this.isLoading = true;
        if (this.addressType == 'shipping') {
          values['default'] = true;
          values['billing'] = false;
        } else if (this.addressType == 'billing') {
          values['default'] = false;
          values['billing'] = true;
        }
        this.userService.saveAddress(values).subscribe((result) => {
          if(result.message == 'Saved') {
            this.userService.showMessage('address_success');
            setTimeout(() => this.router.navigate(['/user/address/']), 2000);
          } else {
            this.userService.showMessage('connection_error');
            this.isLoading = false;
          }
        });
      } else if (this.operation == 'Edit') {
        values['id'] = this.addressId;
        this.userService.updateAddress(values).subscribe((result) => {
          if(result.message.indexOf('Updated') >= 0) {
            this.userService.showMessage('address_success');
          } else {
            this.userService.showMessage('connection_error');
          }
        });
      }
    } else {
      let errorDetails = '';
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.addressForm.controls[val];
        if (!ctrl.valid) {
          ctrl.markAsTouched();
          errorDetails += `\n\u2022 ${this.fieldLabels[val]}`
        };
      });
      this.userService.showMessage('address_error', errorDetails);
    }
  }

}
