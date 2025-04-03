import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { timer } from 'rxjs/observable/timer';
import { AppState } from '../../../../interfaces';
import { getAuthStatus } from '../../../reducers/selectors';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit, OnDestroy {
  signUpForm: FormGroup;
  registerSub: Subscription;
  timerSub: Subscription;
  initSub: Subscription;
  returnUrl: string;
  partnerData: any;
  referrer: string;
  isEnabled: boolean = false;
  birthday: string;
  displayDate: string;
  private isTokenInit: Subject<boolean> = new BehaviorSubject(false);

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.timerSub = timer(0, 100)
      .do(() => {
        const token = this.authService.getTokenInLocalStorage();
        if (token) {
          this.isTokenInit.next(true)
          this.timerSub.unsubscribe();
        }
      })
      .subscribe();

    this.initSub = this.isTokenInit
      .asObservable()
      .mergeMap((value) => {
        if (value) {
          let code;
          return this.route.params
            .switchMap((params: any) => {
              if (params.id) {
                const index = params.id.length - 3;
                const id = Number(params.id.slice(0, index));
                code = params.id.slice(index);
                return this.authService.getPartner(id);
              } else {
                this.isEnabled = true;
                return Observable.of(false);
              }
            })
            .do((partnerData: any) => {
              if (partnerData) {
                if (partnerData.message === 'Found') {
                  if (partnerData.code !== code) {
                    this.router.navigateByUrl('/');
                  } else {
                    this.isEnabled = true;
                    this.partnerData = partnerData;
                  }
                } else {
                  this.router.navigateByUrl('/');
                }
              }
            });
        } else {
          return Observable.of(false);
        }
      })
      .subscribe();

    this.referrer = this.route.snapshot.queryParamMap.get('referrer');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initForm();
  }

  initForm() {
    this.signUpForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      password_confirmation: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      mobile: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]{10}')])],
      gender: ['', Validators.required],
      prefix: ['+63', Validators.required],
      month: ['', Validators.required],
      day: ['', Validators.required],
      year: ['', Validators.required],
      referrer: [this.referrer ? this.referrer : '']
    }, {
      validator: Validators.compose([this.matchingPasswords('password', 'password_confirmation'), this.isValidDate()])
    });
  }

  onSubmit() {
    const values = this.signUpForm.value;
    if (this.signUpForm.valid) {
      const data = {
        username: values.email,
        email: values.email,
        password: values.password,
        uiid: '',
        mobileNumber: `${values.prefix} ${values.mobile}`,
        gender: values.gender,
        lastName: values.last_name || '',
        firstName: values.first_name || '',
        birthdate: new Date(`${values.year}/${values.month}/${values.day}`).getTime(),
      };
      let pbuData;
      if (this.partnerData.id) {
        pbuData = {
          username: values.email,
          email: values.email,
          name: `${values.first_name || ''} ${values.last_name || ''}`,
          credit: 0.00,
          availablebalance: 0.00,
          outstandingbalance: 0.00,
          status: 'enabled',
          partner_id: this.partnerData.id,
        };
      } else {
        pbuData = {};
      }
      this.registerSub = this.authService.register({
        user: data,
        pbu: pbuData,
        referrer: values.referrer,
      }).subscribe((res) => {
        if (res.message === 'Saved') {
          this.initForm();
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.signUpForm.controls[val];
        if (!ctrl.valid) {
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
        };
      });
    }
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): { [key: string]: any } => {
      const password = group.controls[passwordKey];
      const confirmPassword = group.controls[confirmPasswordKey];
      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true,
        };
      }
    };
  }

  isValidDate() {
    return (group: FormGroup): {[key: string]: any } => {
      const today = new Date().getTime();
      const date = Date.parse((`${group.controls['year'].value}/${group.controls['month'].value}/${group.controls['day'].value}`));
      if (Number.isNaN(date) || date > today) {
        return {
          invalidDate: true,
        };
      }
    };
  }

  // changeDate() {
  //   let year = this.signUpForm.get('year').value;
  //   let month = this.signUpForm.get('month').value;
  //   let day = this.signUpForm.get('day').value;
  //
  //   if (Number.isNaN(year) || year > new Date().getFullYear()) {
  //     year = new Date().getFullYear() - 18;
  //   } else if(year < (new Date().getFullYear() - 80)) {
  //     year = new Date().getFullYear() - 80;
  //   }
  //
  //   const d = new Date();
  //   d.setFullYear(year);
  //   d.setMonth(Number(month))
  //   d.setDate(-1);
  //   const maxDay = d.getDate() + 1;
  //   if (Number.isNaN(day) || day < 1) {
  //     day = 1;
  //   } else if (day > maxDay) {
  //     day = maxDay;
  //   }
  //
  //   this.birthday = `${year}-${month}-${day}`;
  //   this.birthday = this.birthday.replace(/-/g, "/");
  //   console.log(this.birthday);
  //   this.displayDate = new Date(this.birthday).toLocaleString('en', { month: 'long', day: 'numeric', year: 'numeric' });
  // }

  ngOnDestroy() {
    if (this.registerSub) {
      this.registerSub.unsubscribe();
    }
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }

  private pushErrorFor(ctrl_name: string, msg: string) {
    this.signUpForm.controls[ctrl_name].setErrors({ 'msg': msg });
  }

}
