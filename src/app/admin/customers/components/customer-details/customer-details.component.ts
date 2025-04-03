import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AdminService } from './../../../services/admin.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  customerSub: Subscription;
  customerForm: FormGroup;
  customerData: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.routeSub = this.route.params.mergeMap((params: any) => {
      return params.id ? this.adminService.getCustomer(params.id) : Observable.of(false);
    })
      .subscribe((customerData: any) => {
        if (customerData) {
          this.customerData = customerData;
          this.customerData['name'] = customerData.firstName + ' ' + customerData.lastName;
          this.customerData.gender = customerData.gender === 'M' ? 'Male' : 'Female';
          this.customerData.birthdate = new Date(customerData.birthdate)
            .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          this.customerForm.patchValue(this.customerData);
        }
      });
  }

  ngOnDestroy() {
    if (this.customerSub) {
      this.customerSub.unsubscribe();
    }
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      username: [{value: '', disabled: true}],
      name: [{value: '', disabled: true}],
      email: [{value: '', disabled: true}],
      birthdate: [{value: '', disabled: true}],
      mobileNumber: [{value: '', disabled: true}],
      gender: [{value: '', disabled: true}],
    });
  }

}
