import { Injectable } from "@angular/core";
import { HttpService } from "./http";
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from './../../interfaces';

@Injectable()
export class ThirdPartyService {

  constructor(
    private http: HttpService,
    private store: Store<AppState>
  ) {

  }

  postPaymaya(data: any): Observable<any> {
    return this.http.post3rdParty('paymaya', 'v1/checkouts', data)
      .map((res: Response) => res.json())
      .catch(err => Observable.of({}));
  }
}