import { Component, OnDestroy, OnInit, Input,
  Output, OnChanges, EventEmitter  } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminService } from './../services/admin.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-set-banner',
  templateUrl: './set-banner.component.html',
  styleUrls: ['./set-banner.component.scss']
})
export class SetBannerComponent implements OnInit {
  bannerSub: Subscription;
  banners: any;
  subRepo: string;
  bannerSlider = { state: 'set1', class: '' };
  substituteSlider = { state: 'set1', class: '' };
  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('selleruser'));
    this.bannerSub = this.adminService.getPartner(user.partner_id).subscribe( partner => {
      switch (partner.name) {
        case 'Nestle':
          this.subRepo = 'nestle';
          break;
        default:
          this.subRepo = '';
      }
      this.setBannerList(this.subRepo);
    });
  }

  setBannerList(subRepo: string) {

  }

  sliderNext(mode: string, items: Array<any>): void {
    let obj = mode === 'suggested' ? this.bannerSlider : this.substituteSlider;
    switch (obj.state) {
    case 'set1':
      if (items.length > 4) {
        obj = { state: 'set2', class: 'set1ToSet2' };
      }
      break;
    case 'set2':
      if (items.length > 8) {
        obj = { state: 'set3', class: 'set2ToSet3' };
      }
      break;
    case 'set3':
      if (items.length > 12) {
        obj = { state: 'set4', class: 'set3ToSet4' };
      }
      break;
    case 'set4':
      break;
    }
    if (mode === 'suggested') {
      this.bannerSlider = obj;
    } else {
      this.substituteSlider = obj;
    }
  }

}
