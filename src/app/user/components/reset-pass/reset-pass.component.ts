import { Component, Directive, Input, Attribute, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { INVALID } from '@angular/forms/src/model';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AppState } from '../../../interfaces';
import { getAuthStatus } from '../../../auth/reducers/selectors';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.scss']
})
export class ResetPassComponent {
  resetForm: FormGroup
  isAuthenticated: boolean = false;
  formSubmit = false;
  model: any = {};
  token: string;
  userId: string;
  email: string;
  isValid: boolean = false;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
  }

  ngOnInit() {
    this.route.queryParams.takeUntil(this.componentDestroyed).subscribe((params: any) => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      this.userId = params['i'] || '';
      this.authService.checkToken({
        accountId: this.userId,
        token: this.token,
        type: 'PASSWORD_RESET'
      }).takeUntil(this.componentDestroyed).subscribe(res => {
        if(res.message == 'Valid') {
          this.isValid = true;
        } else {
          this.isValid = false;
        }
      })
      if(this.token) {
        this.authService.logout();
      }
    });

    this.initForm();
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  initForm() {
    this.resetForm = this.formBuilder.group({
      old_password: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      verify: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    },{
      validator: this.matchingPasswords('password', 'verify'),
    });
  }

  onSubmit(){
    const values = this.resetForm.value;
    const keys = Object.keys(values);
    this.formSubmit = true;

    if(this.resetForm.valid) {
      if(this.token) { // Reset password via email
        this.authService.changePassword({
          password: values.password,
          email: this.email,
          id: this.userId,
          newPassword: true
        }).takeUntil(this.componentDestroyed).subscribe((res)=> {
          if(res.message.indexOf('Updated') >= 0) {
            this.router.navigate(['/auth/login']);
          }
        })
      } else { // Change password via user profile
        const userData = JSON.parse(localStorage.getItem('user'));
        this.authService.changePassword({
          password: values.old_password,
          email: userData.email,
          id: userData.id,
          newPassword: values.password
        }).takeUntil(this.componentDestroyed).subscribe();
      }
    } else {
      keys.forEach(val => {
        const ctrl = this.resetForm.controls[val];
        if(!ctrl.valid){
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
          this.formSubmit = false;
        }
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

  private pushErrorFor(ctrl_name: string, msg: string) {
    this.resetForm.controls[ctrl_name].setErrors({'msg': msg});
  }
}
