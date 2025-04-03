import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../../core/services/http';
import { AppState } from '../../../interfaces';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class SharedService {

  constructor(
    private http: HttpService,
    private store: Store<AppState>
  ) { }

  /**
   * Creates an instance of CheckoutService.
   * @param {HttpService} http
  /**
   *function to save star rating to db
   *
   * @returns {Observable<Order[]>}
   *
   * @memberof SharedService
   */
  createStarRating(rating): Observable<any> {
    return this.http.post(`v1/ratings`, {
      useraccount_id: rating.useraccount_id,
      orderkey: rating.orderkey,
      starCount: rating.starCount,
      feedback: rating.feedback,
      feedbacktype: rating.feedbacktype
    })
      .map((res: Response) => {
        this.http.loading.next({
          loading: false,
          isSuccess: true,
          hasMsg: `Thank you!`,
          reset: 4500
        });
      })
      .catch(() => Observable.empty());
  }

  getStarRating(orderkey: string): Observable<any> {
    return this.http.get(`v1/ratings/order/${orderkey}`)
      .map((res: Response) => res.json())
      .catch(() => Observable.empty());
  }

  getPageSettings(route: string): Observable<Array<any>> {
    return this.http.get(`v1/pagesettings?route=${encodeURIComponent(route)}`)
      .map((res: Response ) => res.json())
      .catch(() => Observable.of([]));
  }

  
}
