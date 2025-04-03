import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Component, OnInit, OnDestroy, ViewChild, Input, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { PromotionService } from './../../../core/services/promotion.service';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
  providers: [PromotionService]
})
export class PromotionsComponent implements OnInit {

  promotions$: Subscription;
  compareDate: any;
  timer: any;
  countdownDays: any;
  countdownHours: any;
  countdownMinutes: any;
  countdownSeconds: any;
  isPromo: boolean;
  startTime: string;
  endTime: string;
  discount: number;
  startDate: string = 'Day 1';
  endDate: string = 'Day 2';
  bClose: boolean;
  promoDetails: any;
  months: Array<string> = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor(
    private promoService: PromotionService
  ) {

  }

  ngOnInit() {
    this.startTime = 'HH:MM';
    this.endTime = 'HH:MM';
    this.bClose = false;
    this.isPromo = false;
    this.compareDate = new Date("Dec 25, 2018 00:00:00").getTime();
    // this.compareDate.setDate(this.compareDate.getDate() + 7); //just for this demo today + 7 days
    this.timer = setInterval(() => {
      this.timeBetweenDates(this.compareDate);
    }, 1000);
    this.checkPromotions();


  }

  checkPromotions() {
    this.promotions$ = this.promoService.getPromotions().subscribe( promo => {
      if (promo) {
        this.isPromo = false; // set to true once promotions are finalized
        this.promoDetails = promo;
        var Obj = {...this.promoDetails[0]};
        this.startTime = Obj.startTime;
        this.endTime = Obj.endTime;
        var day1 = new Date(Number(Obj.startDate));
        var day2 = new Date(Number(Obj.endDate));
        var month1 = day1.getMonth();
        var month2 = day2.getMonth();
        var sDate = this.months[month1] + ' ' + day1.getDate();
        var eDate = this.months[month2] + ' ' + day2.getDate();
        // this.startDate = `${day1.getMonth()} ${day1.getDate()}`;
        this.startDate = sDate;
        this.endDate = eDate;
        this.discount = Obj.amount;
      }
    });
  }

  timeBetweenDates(toDate) {
    var dateEntered = toDate;
    var now = new Date();
    var difference = dateEntered - now.getTime();

    if (difference <= 0) {
    // Timer done
      clearInterval(this.timer);

    } else {
      var seconds = Math.floor(difference / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      var days = Math.floor(hours / 24);

      hours %= 24;
      minutes %= 60;
      seconds %= 60;

      this.countdownDays = days;
      this.countdownHours = hours;
      this.countdownMinutes = minutes;
      this.countdownSeconds = seconds;
    }
  }

  close(){
    this.bClose =  true;
  }
}
