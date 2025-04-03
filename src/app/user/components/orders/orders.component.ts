import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from '../../../interfaces';
import { getUserOrders } from '../../reducers/selector';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders$: Observable<any[]>;

  constructor(
    private store: Store<AppState>,
  ) {
  }

  ngOnInit() {
    this.orders$ = this.store.select(getUserOrders);
  }

}
