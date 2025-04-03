import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from './../services/admin.service';

@Component({
  selector: 'app-admin-masterlist',
  templateUrl: './master-list.component.html',
  styleUrls: ['./master-list.component.scss']
})
export class MasterListComponent implements OnInit {
  orders: any;
  ordersSub: Subscription;
  orderSub: Subscription;
  orderItem$: Subscription;
  orderIndex$: any;
  orderItems: any;
  itemList: any;
  ordersShow: any;
  statusContainer: string[] = [];
  selected: string = "All";

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    //NOTE: dummy ID
    if(sessionStorage.getItem('item')) {
      sessionStorage.removeItem('item');
    }
  }

  filterStatus(status){

  }





  ngOnDestroy() {

    // localStorage.removeItem('order');
  }

}
