import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from './../../../services/admin.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  returnUrl: string;
  resetSubs: Subscription;
  token: string;
  email: string;
  userId: string;
  isValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {
    this.redirectIfUserLoggedIn();
  }

  ngOnInit() {
    document.body.classList.add('admin-body');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
    this.resetForm = this.fb.group({
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'verify': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    }, { validator: this.matchingPasswords('password', 'verify') });
    this.route.queryParams.subscribe((params: any) => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      this.userId = params['i'] || '';
      this.adminService.checkToken({
        accountId: this.userId,
        token: this.token,
        type: 'PASSWORD_RESET'
      }).subscribe(res => {
        if(res.message == 'Valid') {
          this.isValid = true;
        } else {
          this.isValid = false;
        }
      })
    });
  }

  ngOnDestroy() {
    if (this.resetSubs) {
      this.resetSubs.unsubscribe();
    }
  }

  onSubmit(): void {
    const values = this.resetForm.value;
    const data = {
      'username': values.username,
      'password': values.password
    };

    if (this.resetForm.valid) {
      if(this.token) { // Reset password via email
        this.adminService.changePassword({
          password: values.password,
          email: this.email,
          id: this.userId,
          newPassword: true
        }).subscribe((res)=> {
          if(res.message.indexOf('Updated') >= 0) {
            setTimeout(() => {
              this.router.navigate(['/admin/login']);
            }, 4000);
          }
        })
      }
    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.resetForm.controls[val];
        if (!ctrl.valid) {
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
        };
      });
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

  private pushErrorFor(ctrl_name: string, msg: string): void {
    this.resetForm.controls[ctrl_name].setErrors({'msg': msg});
  }

  redirectIfUserLoggedIn(): void {
    // this.store.select(getAuthStatus).subscribe(
    //   data => {
    //     if (data === true) { this.router.navigate([this.returnUrl]); }
    //   }
    // );
  }

}
