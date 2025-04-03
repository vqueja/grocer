import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      'email': ['', Validators.compose([Validators.required, Validators.email]) ]
    });
  }

  onSubmit(){
    if(this.forgotPasswordForm.valid) {
      this.forgotPasswordForm.disable();
      this.isLoading = true;
      this.authService.requestPasswordReset(this.forgotPasswordForm.controls['email'].value).subscribe(() => {
        this.forgotPasswordForm.enable();
        this.isLoading = false;
      });
    } else {
      const ctrl = this.forgotPasswordForm.controls['email'];
      if(!ctrl.valid){
        ctrl.markAsTouched();
      }
    }
  }

}
