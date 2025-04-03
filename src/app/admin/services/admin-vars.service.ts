import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AdminVarsService {
  readonly ITEM_DEFAULT_IMG = 'assets/omg-03.png';
  readonly LOGO_DEFAULT_IMG = 'assets/omg-01.png';
  readonly ROLES: {
    EOS_DEV: 1,
    EOS_ADMIN: 2,
    SELLER_ADMIN: 3,
    EOS_COORDINATOR: 4,
    SELLER_FINANCE: 5,
    SELLER_MANAGEMENT: 6,
    BUYER_ADMIN: 7,
    BUYER_FINANCE: 8,
    SELLER_ASSEMBLY: 9,
    SELLER_DELIVERY: 10,
    EOS_CS1: 11,
    EOS_CS2: 12,
    EOS_FINANCE, 13,
  };
  readonly ORDER_STATUS: Array<string> = [
    'PENDING', 'IN-PROGRESS', 'ASSEMBLED',
    'IN-TRANSIT', 'COMPLETE', 'CANCELLED',
    'RETURNED', 'RETURNED-COMPLETE'
  ];
  readonly ORDER_TIMESLOT: Array<string> = [
    '8:00AM', '11:00AM', '2:00PM', '5:00PM', '8:00PM'
  ];
  private partners: Subject<Array<any>> = new BehaviorSubject([]);

  constructor() {}

  setPartners(data: any): void {
    this.partners.next(data);
  }

  getPartners(): Observable<any> {
    return this.partners.asObservable();
  }
}
