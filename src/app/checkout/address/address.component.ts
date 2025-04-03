import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AppState } from './../../interfaces';
import { getDeliveryDate, getCartItems } from './../reducers/selectors';
import { getAuthStatus } from './../../auth/reducers/selectors';
import { getPartnerStore } from './../../product/reducers/selectors';


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {
  deliveryDate$: Observable<any>;
  partnerStore$: Observable<any>;
  isAuth$: Observable<any>;
  cartItemsSub: Subscription;
  isShowDeliveryOption = false;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.isAuth$ = this.store.select(getAuthStatus);
    this.partnerStore$ = this.store.select(getPartnerStore);
    this.deliveryDate$ = this.store.select(getDeliveryDate);
    this.cartItemsSub = this.store.select(getCartItems).subscribe((cartItems) => {
      if (!cartItems.length) {
        this.router.navigate(['/']);
      }
    });    
    const isDeliveryOption = this.route.snapshot.paramMap.get('deliveryOptions');
    if (isDeliveryOption != null) {
      this.isShowDeliveryOption = true;
    }
  }

  toggleShowDeliveryDateOption(): void {
    this.isShowDeliveryOption = true;
    this.router.navigate(['/checkout', 'address', {deliveryOptions: true}]);
  }

  toggleShowDeliveryAddressOption(): void {
    this.isShowDeliveryOption = false;
    this.router.navigate(['/checkout', 'address']);
  }

  ngOnDestroy() {
    if (this.cartItemsSub) {
      this.cartItemsSub.unsubscribe();
    }
  }

}
