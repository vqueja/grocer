import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../../../interfaces';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  @Output() onCancelClickEmit: EventEmitter<string> = new EventEmitter();
  profileEditForm: FormGroup;
  profileEditSubs: Subscription;
  isPBU = false;
  userData: any;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.isPBU = this.userData.partner_id ? true : false;
    const mobileNumber = this.userData.mobileNumber ? this.userData.mobileNumber.split(' ') : ['+63', ''];
    const birthdate = new Date(this.userData.birthdate);
    this.profileEditForm = this.fb.group({
      'email': [{value: this.userData.email, disabled: this.isPBU}, Validators.compose([Validators.required, Validators.email]) ],
      'lastName': [this.userData.lastName, Validators.required],
      'firstName': [this.userData.firstName, Validators.required],
      'gender': [this.userData.gender, Validators.required],
      'mobileNumber': [mobileNumber[1],
        Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]{10}')]) ],
      'prefix': [mobileNumber[0], Validators.required],
      'month': [this.userData.birthdate ? birthdate.toLocaleDateString('en-US', { month: '2-digit' }) : '', Validators.required],
      'day': [this.userData.birthdate ? birthdate.getDate() : '', Validators.required],
      'year': [this.userData.birthdate ? birthdate.getFullYear() : '',
        Validators.required],
    }, {
      validator: this.isValidDate()
    });
  }

  onCancelClick() {
    window.scrollTo(0, 0);
    this.onCancelClickEmit.emit();
  }

  onSubmit() {
    const values = this.profileEditForm.value;
    if (this.profileEditForm.valid) {
      const data = {
        'email': values.email ? values.email : this.userData.email,
        'lastName': values.lastName,
        'firstName': values.firstName,
        'gender': values.gender,
        'mobileNumber': `${values.prefix} ${values.mobileNumber}`,
        'birthdate': new Date(`${values.year}-${values.month}-${values.day}`).getTime(),
      };
      this.profileEditSubs = this.authService.update(this.userData.id, data).subscribe();
    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.profileEditForm.controls[val];
        if (!ctrl.valid) {
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
        };
      });
    }
  }

  isValidDate() {
    return (group: FormGroup): {[key: string]: any } => {
      const today = new Date().getTime();
      const date = Date.parse((`${group.controls['year'].value}-${group.controls['month'].value}-${group.controls['day'].value}`));
      if (Number.isNaN(date) || date > today) {
        return {
          invalidDate: true,
        };
      }
    };
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US');
  }

  private pushErrorFor(ctrl_name: string, msg: string) {
    this.profileEditForm.controls[ctrl_name].setErrors({'msg': msg});
  }

  ngOnDestroy() {
    if (this.profileEditSubs) {
      this.profileEditSubs.unsubscribe();
    }
  }
}
