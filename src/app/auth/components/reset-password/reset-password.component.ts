import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AppState } from '../../../interfaces';
import { getAuthStatus } from '../../reducers/selectors';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  userData: any;
  resetForm: FormGroup;
  returnUrl: string;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.redirectIfUserLoggedIn();
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initForm();
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  initForm() {
    this.resetForm = this.formBuilder.group({
      'old_password': ['', Validators.required],
      'new_password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'confirm_password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    }, { validator: this.matchingPasswords('new_password', 'confirm_password') });
  }

  onSubmit() {
    const values = this.resetForm.value;
    const keys = Object.keys(values);

    if (this.resetForm.valid) {
      this.resetForm.disable();
      this.authService.changePassword({
        password: values.old_password,
        email: this.userData.email,
        id: this.userData.id,
        forcedReset: 0,
        newPassword: values.new_password,
      }, true, 1)
        .takeUntil(this.componentDestroyed)
        .subscribe((res) => {
          if (res.message.indexOf('Updated') >= 0) {
            this.initForm();
          } else {
            this.resetForm.enable();
          }
        });
    } else {
      keys.forEach(val => {
        const ctrl = this.resetForm.controls[val];
        if (!ctrl.valid) {
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
        }
      });
    }
  }

  redirectIfUserLoggedIn() {
    this.store.select(getAuthStatus)
      .takeUntil(this.componentDestroyed)
      .subscribe(data => {
        if (data === true) {
          setTimeout(() => this.router.navigate([this.returnUrl]), 2500);
        }
      });
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return(group: FormGroup): {[key: string]: any} => {
      const password = group.controls[passwordKey];
      const confirm = group.controls[confirmPasswordKey];
      if (password.value !== confirm.value) {
        return {
          mismatchedPasswords: true
        };
      }
    };
  }

  private pushErrorFor(ctrl_name: string, msg: string) {
    this.resetForm.controls[ctrl_name].setErrors({'msg': msg});
  }

}
