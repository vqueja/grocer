import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../services/admin.service';


@Component({
  selector: 'app-order-deliver',
  templateUrl: './order-deliver.component.html',
  styleUrls: ['./order-deliver.component.scss']
})
export class OrderDeliverComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  orderSub: Subscription;
  actionSub: Subscription;
  orderSeller: any;
  orderItems: Array<any> = [];
  replacedItems: Array<any> = [];
  userData: any;
  isReturnReason: boolean = false;
  @ViewChild('returnModal') returnModal;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('selleruser'));
    this.routeSub = this.route.params
      .switchMap((params: any) => this.adminService.getSellerOrder(params.id))
      .map((orderSeller: any) => {
        this.orderSeller = orderSeller;
        return orderSeller.order_id;
      })
      .switchMap((orderId: number) => this.adminService.getOrderItems(orderId))
      .subscribe((orderItems: Array<any>) => {
        orderItems.forEach((item) => {
          if (item.status === 'replaced') {
            this.replacedItems.push(item);
          } else {
            this.orderItems.push(item);
          }
        });
        this.replacedItems.forEach((replaced) => {
          const index = this.orderItems.map((item) => item.replaced_orderitem_id)
            .indexOf(replaced.orderItem_id);
          if (index >= 0) {
            this.orderItems[index]['replaced'] = replaced;
          }
        });
      });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.orderSub) {
      this.orderSub.unsubscribe();
    }
    if (this.actionSub) {
      this.actionSub.unsubscribe();
    }
  }

  completeOrder(): void {
    this.orderSeller.status = 'complete';
    this.actionSub = this.adminService.updateOrderSeller({
      id: this.orderSeller.id,
      selleraccount_id: 0,
      status: 'complete',
      updatedBy: this.userData.id,
    })
      .subscribe((response: any) => {
        if (response && response.message.indexOf('Updated') >= 0) {
          this.router.navigate(['/admin/order-assemble']);
        }
      });
  }

  returnOrder(comments: string): void {
    if (!comments) {
      this.isReturnReason = true;
    } else {
      this.orderSeller.status = 'returned';
      this.actionSub = this.adminService.updateOrderSeller({
        id: this.orderSeller.id,
        selleraccount_id: this.userData.id,
        status: 'returned',
        updatedBy: this.userData.id,
        comments: comments,
      }).subscribe(() => this.returnModal.hide());
    }
  }

  returnComplete(): void {
    this.orderSeller.status = 'returned-complete';
    this.actionSub = this.adminService.updateOrderSeller({
      id: this.orderSeller.id,
      selleraccount_id: 0,
      status: 'returned-complete',
      updatedBy: this.userData.id,
    }).subscribe();
  }
}
