import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-order-star-rating',
  templateUrl: './order-star-rating.component.html',
  styleUrls: ['./order-star-rating.component.scss'],
  providers: [UserService]
})

export class OrderStarRatingComponent implements OnInit, OnDestroy {
  @Input() orderkey: string;
  @Input() orderId: number;
  @Output() closeRatingEmit: EventEmitter<string> = new EventEmitter();
  @Output() hideFeedBackBtnEmit: EventEmitter<string> = new EventEmitter();
  bClose: boolean;
  userFeedback: string;
  starCount: number;
  ratingSub: Subscription;

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    this.bClose = false;
    this.userFeedback = '';
    this.starCount = 0;
  }

  getStarRating(value): void {
    this.starCount = Number(value);
  }

  sendFeedBack(): void {
    this.bClose = true;
    const user = JSON.parse(localStorage.getItem('user'));
    const data = {
      useraccount_id: user ? Number(user.id) : 0,
      // order_id: this.orderId,
      orderkey: this.orderkey,
      starCount: this.starCount,
      feedback: this.userFeedback
    };
    this.ratingSub = this.userService.createOrderFeedBack(data)
      .subscribe((result: any) => {
        if (result.message === 'Saved') {
          this.userService.showMessage('success', 'Thank you!');
          this.hideFeedBackBtnEmit.emit();
        } else {
          this.userService.showMessage('', 'Error occurred. Please try again later.');
        }
        this.close();
      });
  }

  close(): void {
    this.bClose =  true;
    this.closeRatingEmit.emit();
  }

  ngOnDestroy() {
    if (this.ratingSub) {
      this.ratingSub.unsubscribe();
    }
  }

}
