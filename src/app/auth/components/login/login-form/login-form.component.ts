import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../../../environments/environment';
import { AppState } from '../../../../interfaces';
import { AuthService } from '../../../../core/services/auth.service';
import { getAuthStatus } from '../../../reducers/selectors';
import { UserActions } from '../../../../user/actions/user.actions';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  signInForm: FormGroup;
  title = environment.AppName;
  loginSubs: Subscription;
  checkPartnerBuyer: Subscription;
  getPartner$: Subscription;
  returnUrl: string;
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private userActions: UserActions,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    const values = this.signInForm.value;
    if (this.signInForm.valid) {
      this.loginSubs = this.authService.login({
        username: values.email,
        password: values.password
      }).subscribe(data => {
        if (data.message === 'Found') {
          if (data.forcedReset) {
            this.router.navigate(['/auth/reset'], { queryParams: { returnUrl: this.returnUrl }});
          }
        }
      });
    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.signInForm.controls[val];
        if (!ctrl.valid) {
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
        };
      });
    }
  }

  private pushErrorFor(ctrl_name: string, msg: string) {
    this.signInForm.controls[ctrl_name].setErrors({'msg': msg});
  }

  initForm() {
    this.signInForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    if (this.loginSubs) {
      this.loginSubs.unsubscribe();
    }
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }
}
