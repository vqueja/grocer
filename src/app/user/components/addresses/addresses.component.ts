import { Component, OnInit } from '@angular/core';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {
  userId: number;
  address: any = { shipping: '', billing: ''};

  constructor(
    private userService: UserService
  ) {
  }

  ngOnInit() {
    let userData = JSON.parse(localStorage.getItem('user'));
    this.userId = userData.id;

    this.userService.getAddress(this.userId).subscribe(result => {
      if(result.length == 1) {
        this.address.shipping = result[0];
      } else if (result.length == 2) {
        if(result[0].default) {
          [this.address.shipping, this.address.billing] = result;
        } else {
          [this.address.billing, this.address.shipping] = result;
        }
      }
    });
  }

}
