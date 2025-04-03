import { PaymentComponent } from './payment/payment.component';
import { AddressComponent } from './address/address.component';
import { CartComponent } from './cart/cart.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { CanActivateViaAuthGuard } from './../core/guards/auth.guard';

export const CheckoutRoutes = [
  { path: '', redirectTo: 'cart', pathMatch: 'full' },
  { path: 'cart', component: CartComponent },
  {
    path: 'address',
    component: AddressComponent,
    canActivate: [CanActivateViaAuthGuard],
  },
  { path: 'payment', component: PaymentComponent },
  { path: 'confirm/:key', component: ConfirmComponent }
];
