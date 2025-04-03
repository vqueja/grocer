import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '../../../core/services/http';
import { SharedService } from './../services/shared.service';


@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  providers: [SharedService]
})

export class StarRatingComponent implements OnInit, OnDestroy {
  @Input() orderkey: string;
  @Input() userId: number;
  bClose: boolean;
  ratingSub: Subscription;
  rating: {
    'useraccount_id': number;
    'orderkey': string,
    'starCount': number,
    'feedback': string,
    'feedbacktype': number
  };

  constructor(
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.bClose = true;
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && Number(user.id) === this.userId) {
      this.bClose = false;
      this.rating = {
        'useraccount_id': Number(user.id),
        'orderkey': this.orderkey,
        'starCount': 0,
        'feedback': '',
        'feedbacktype': 0
      };
    }
  }

  getRating(value) {
    this.rating['feedbacktype'] = value;
  }

  sendFeedBack(feedback: string) {
    this.bClose = true;
    this.rating['orderkey'] = this.orderkey;
    this.rating['feedback'] = feedback;
    this.ratingSub = this.sharedService.createStarRating(this.rating).subscribe();
  }

  close() {
    this.bClose = true;
  }

  ngOnDestroy() {
    if (this.ratingSub) {
      this.ratingSub.unsubscribe();
    }
  }

}
