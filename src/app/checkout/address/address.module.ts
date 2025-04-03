import { RouterModule } from '@angular/router';
import { AddressService } from './services/address.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AddressComponent } from './address.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddAddressComponent } from './add-address/add-address.component';
import { DeliveryOptionsComponent } from './delivery-options/delivery-options.component';
import { BsDropdownModule, ButtonsModule, BsDatepickerModule  } from "ngx-bootstrap";

@NgModule({
  declarations: [
    AddressComponent,
    AddAddressComponent,
    DeliveryOptionsComponent
  ],
  exports: [],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ButtonsModule.forRoot(),
  ],
  providers: [AddressService]
})
export class AddressModule {}
