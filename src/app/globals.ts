import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from 'environments/environment';


@Injectable()
export class Globals {

  readonly TIMESLOT_LABELS = ['8:00AM - 10:00AM', '11:00AM - 1:00PM', '2:00PM - 4:00PM', '5:00PM - 7:00PM', '8:00PM - 10:00PM'];
  readonly TIMESLOT_LABELS_SHORT = ['8AM-10AM', '11AM-1PM', '2PM-4PM', '5PM-7PM', '8PM-10PM'];
  readonly ITEMS_PER_PAGE = 18;
  readonly ITEM_DEFAULT_IMG = 'assets/omg-03.png';
  readonly LOGO_DEFAULT_IMG = 'assets/omg-01.png';
  private partners: Subject<Array<any>> = new BehaviorSubject([]);
  private banners: Subject<Array<any>> = new BehaviorSubject([]);
  private storeBanners: Subject<Array<any>> = new BehaviorSubject([]);
  private selectedStore: Subject<Array<any>> = new BehaviorSubject([]);
  private pageSettings: Subject<Array<any>> = new BehaviorSubject([]);
  private featuredBanners: Subject<Array<any>> = new BehaviorSubject([]);
  private isStoreSelected: boolean = false;

  constructor() { }

  setPartners(data: any): void {
    this.partners.next(data);
  }

  getPartners(): Observable<any> {
    return this.partners.asObservable();
  }

  setSelectedStore(data: any): void {
    this.selectedStore.next(data);
  }

  getSelectedStore(): Observable<any> {
    return this.selectedStore.asObservable();
  }

  setBanners(data: any): void {
    this.banners.next(data);
  }

  getBanners(): Observable<any> {
    return this.banners.asObservable();
  }

  setStoreBanners(data: any): void {
    this.storeBanners.next(data);
  }

  getStoreBanners(): Observable<any> {
    return this.storeBanners.asObservable();
  }

  setFeaturedBanners(data: any): void {
    this.featuredBanners.next(data);
  }

  getFeaturedBanners(): Observable<any> {
    return this.featuredBanners.asObservable();
  }

  setIsStoreSelected(flag: boolean): void {
    this.isStoreSelected = flag;
  }

  getIsStoreSelected(): boolean {
    return this.isStoreSelected;
  }

}
