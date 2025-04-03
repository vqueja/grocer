import { Component, OnInit, OnChanges, Input, ViewChild,
  Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-dropdown',
  templateUrl: './profile-dropdown.component.html',
  styleUrls: ['./profile-dropdown.component.scss']
})
export class ProfileDropdownComponent implements OnInit, OnChanges {
  @Input() isAuthenticated: boolean;
  @Input() totalCartItems: number;
  @Input() totalCartValue: number;
  @Input() currentStep: string;
  @Input() partnerBuyer: any;
  @Input() partnerStore: any;
  @Output() onOpenReferralEmit: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('cartDropdown') cartDropdown;
  cartPreviewSub: Subscription;
  userData: any;
  returnUrl: string;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.returnUrl = '/';

  }

  ngOnChanges() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.returnUrl = this.router.url.indexOf('/stores') >= 0 ? this.router.url : '/';
  }

  logout() {
    this.authService.logout();
    window.location.href = './index.html';
  }

  showCartPreview(): void {
    this.cartPreviewSub = Observable.fromEvent(document, 'click').subscribe((e: any) => {
      if (!this.cartDropdown._elementRef.nativeElement.contains(e.target)) {
        this.cartDropdown.hide();
      }
    });
  }

  hideCartPreview(): void {
    this.cartPreviewSub.unsubscribe();
  }

  isCheckoutPage(): boolean {
    if (!this.currentStep || this.currentStep === '') {
      return false;
    }
    return (this.currentStep === 'cart' || this.currentStep === 'payment'
      || this.currentStep.indexOf('address') >= 0);
  }

  checkUrl(): boolean {
    if (this.partnerBuyer && this.partnerBuyer.signUpFlag) {
      return true;
    }
    return false;
   }

  registerLink(): Array<string> {
    let link = ['/'];
    if (this.partnerBuyer && this.partnerBuyer.signUpFlag) {
      link = ['/auth/signup/pb', `${this.partnerBuyer.id}${this.partnerBuyer.code}`];
    }
    return link;
  }

  onMobileCartToggle(): void {
    if (this.currentStep === 'cart') {
      if (this.partnerStore && this.partnerStore.name) {
        const slug = this.partnerStore.name.toLowerCase().replace(/\s+/g, '-');
        this.router.navigateByUrl(`/stores/${slug}`);
      } else {
        this.router.navigateByUrl('/');
      }
    } else {
      this.router.navigateByUrl('/checkout/cart');
    }
  }
}
