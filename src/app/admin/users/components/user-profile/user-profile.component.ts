import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AdminService } from './../../../services/admin.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  routeSubscription$: Subscription;
  profileSub$: Subscription;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  userData: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('selleruser'));
    this.initForms();
    this.adminService.getRolesList().subscribe((roleList) => {
      this.profileForm.patchValue({
        role: roleList.find((role) => {
          return role.id == this.userData.role_id;
        }).name,
      });
    });
  }

  ngOnDestroy() {
    if (this.profileSub$) {
      this.profileSub$.unsubscribe();
    }
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      username: [{value: this.userData.username, disabled: true}],
      name: [this.userData.name, Validators.required],
      email: [this.userData.email, Validators.compose([Validators.required, Validators.email])],
      role: [{value: '', disabled: true}],
    });
    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirm: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    },{
      validator: this.matchingPasswords('new_password', 'confirm'),
    });
  }

  profileSubmit(): void {
    const values = this.profileForm.value;
    if (this.profileForm.valid) {
      const data = {
        id: this.userData.id.toString(),
        email: values.email,
        name: values.name,
      }
      this.profileSub$ = this.adminService.updateUser(data).subscribe();
    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.profileForm.controls[val];
        if (!ctrl.valid) {
          ctrl.markAsTouched();
        };
      });
      this.adminService.showErrorMsg('Validation Error');
    }
  }

  passwordSubmit(): void {
    const values = this.passwordForm.value;
    if (this.passwordForm.valid) {
      const data = {
        id: this.userData.id.toString(),
        email: this.userData.email,
        password: values.old_password,
        newPassword: values.new_password
      }
      this.profileSub$ = this.adminService.changePassword(data).subscribe();
    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.passwordForm.controls[val];
        if (!ctrl.valid) {
          ctrl.markAsTouched();
        };
      });
      this.adminService.showErrorMsg('Validation Error');
    }
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return(group: FormGroup): {[key: string]: any} => {
      const password = group.controls[passwordKey];
      const verify = group.controls[confirmPasswordKey];
      if(password.value !== verify.value) {
        return {
            mismatchedPasswords: true
        };
      }
    }
  }

}
