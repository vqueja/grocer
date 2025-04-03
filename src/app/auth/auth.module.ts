import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';

import { AuthRoutes as routes } from './auth.routes';
import { SharedModule } from '../shared/index';
import { RegisterComponent } from './components/register/register.component';
import { LoginFacebookComponent } from './components/login/login-facebook/login-facebook.component';
import { LoginFormComponent } from './components/login/login-form/login-form.component';
import { RegisterFacebookComponent } from './components/register/register-facebook/register-facebook.component';
import { RegisterFormComponent } from './components/register/register-form/register-form.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

import { BsDatepickerModule  } from "ngx-bootstrap";


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    BsDatepickerModule.forRoot(),
  ],
  declarations: [
    LoginComponent,
    SignUpComponent,
    RegisterComponent,
    LoginFacebookComponent,
    LoginFormComponent,
    RegisterFacebookComponent,
    RegisterFormComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
  ]
})
export class AuthModule { }
