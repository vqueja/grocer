import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { AppState } from './../../../interfaces';
import { CheckoutActions } from './../../actions/checkout.actions';
import { CheckoutService } from './../../../core/services/checkout.service';
import { Globals } from './../../../globals';

interface TimeSlotDay {
  date: string;
  partnerId: number;
  range: Array<TimeSlot>;
}

interface TimeSlot {
  range: string;
  timeslotId: number;
  booked: number;
  max: number;
}

@Component({
  selector: 'app-delivery-options',
  templateUrl: './delivery-options.component.html',
  styleUrls: ['./delivery-options.component.scss']
})

export class DeliveryOptionsComponent implements OnInit, OnDestroy {
  private componentDestroyed: Subject<any> = new Subject();
  @Output() onBackClickEmit: EventEmitter<string> = new EventEmitter();
  @Input() deliveryDate: any = {};
  @Input() partnerStore: any;
  timeSlotsData: Array<TimeSlotDay> = [];
  storeTimeSlotsData: Array<TimeSlotDay> = [];
  timeSlotHours: Array<TimeSlot> = [];
  selectedTimeSlot: Array<number> = [null, null];
  timeSlotTable: Array<Array<number>>;
  storeTimeSlotTable: Array<Array<number>>;
  userData: any;
  partnerId: number;
  isStoreClose: boolean = false;
  readonly CLOSE = 0;
  readonly OPEN = 1;
  readonly FULL = 2;

  constructor(
    private checkoutAction: CheckoutActions,
    private checkoutService: CheckoutService,
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private router: Router,
    private globals: Globals,
  ) { }

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('user'));
    // NOTE: default account is 2
    this.partnerId = userData.partner_id ? userData.partner_id : 2;
    forkJoin([
      this.checkoutService.getTimeSlotOrder({
        partnerId: this.partnerId
      }),
      this.checkoutService.getTimeSlotOrder({
        storeId: this.partnerStore.id
      }),
      this.checkoutService.getPartner(this.partnerStore.id)
    ])
      .takeUntil(this.componentDestroyed)
      .subscribe((results) => {
        this.timeSlotsData = (results[0] as Array<TimeSlotDay>);
        this.storeTimeSlotsData = (results[1] as Array<TimeSlotDay>);
        const storeData = (results[2] as any);
        this.isStoreClose = storeData && storeData.availability ? false : true;
        this.timeSlotHours = this.timeSlotsData[0].range;
        if (this.storeTimeSlotsData.length && this.timeSlotsData.length) {
          this.setTimeSlotTable();
          const col = this.timeSlotsData.findIndex(day => day.date === this.deliveryDate.date);
          if (col >= 0) {
            const row = this.timeSlotsData[col].range.findIndex(slot =>
              Number(slot.timeslotId) === Number(this.deliveryDate.timeslotId));
            if (row >= 0) {
              if (this.timeSlotTable[row][col] === this.OPEN) {
                this.selectedTimeSlot = [row, col];
              }
            }
          }
        }
      });
  }

  onBackBtn(): void {
    this.onBackClickEmit.emit();
  }

  setTimeSlotTable(): void {
    const isSameDay = this.partnerStore.sameDayDelivery;
    const BUFFER_HOUR = 3;
    const now = new Date().getHours() + BUFFER_HOUR;
    this.timeSlotTable = [[], [], [], [], []];
    for(let col = 0, len = this.timeSlotsData.length; col < len; col++) {
      for(let row = 0; row < 5; row++) {
        const storeSlot = this.storeTimeSlotsData[col].range[row];
        const buyerSlot = this.timeSlotsData[col].range[row];
        if (this.isStoreClose) {
          this.timeSlotTable[row][col] = this.CLOSE;
        } else if (col === 0 && isSameDay) { // NOTE: same day
          if ((now > (8 + row * 3)) || !storeSlot.max || !buyerSlot.max) {
            this.timeSlotTable[row][col] = this.CLOSE;
          } else if (storeSlot.booked >= storeSlot.max || buyerSlot.booked >= buyerSlot.max) {
            this.timeSlotTable[row][col] = this.FULL;
          } else {
            this.timeSlotTable[row][col] = this.OPEN;
          }
        } else if (col === 0 || !storeSlot.max || !buyerSlot.max) {
          this.timeSlotTable[row][col] = this.CLOSE;
        } else if (storeSlot.booked >= storeSlot.max || buyerSlot.booked >= buyerSlot.max) {
          this.timeSlotTable[row][col] = this.FULL;
        } else {
          this.timeSlotTable[row][col] = this.OPEN;
        }
      }
    }
  }

  isClosedSlot(col, row): boolean {
    if (col !== 0) {
      return false;
    }
    // console.log(col, row)
    // console.log(new Date(this.timeSlotsData[col].date));
    // NOTE: 3 hour buffer
    // BUFFER_HOUR = 3;
    // let timeslot = new Date(`${this.timeSlotsData[col].date} ${this.timeSlotsData[col].range[row].range}`);
    // timeslot.setHours(timeslot.getHours() - BUFFER_HOUR);
    // const now = new Date();
    // if(now < timeslot) {
    //   return false;
    // } else {
    //   return true;
    // }
    // NOTE: 1 day buffer
    if (new Date(this.timeSlotsData[col].date.replace(/-/g, "/")).setHours(0, 0, 0, 0)
      === new Date().setHours(0, 0, 0, 0)) {
      return true;
    } else {
      return false;
    }
  }

  checkoutToPayment(): void {
    const row = this.selectedTimeSlot[0];
    const col = this.selectedTimeSlot[1];
    if (col != null) {
      this.checkoutService.getTimeSlotOrderByPartnerId(this.partnerId)
        .takeUntil(this.componentDestroyed)
        .subscribe((data: TimeSlotDay[]) => {
          if (data[col].range[row].booked < data[col].range[row].max) {
            const d = this.timeSlotsData[col].date.split('-').map(n => Number(n));
            const datetime = new Date(d[0], d[1]-1, d[2], 0, 0, 0);
            datetime.setHours(8 + (row % 5) * 3);
            this.store.dispatch(this.checkoutAction.updateOrderDeliveryOptionsSuccess({
              status: 'timeslot',
              date: {
                date: this.timeSlotsData[col].date,
                timeslotId: Number(this.timeSlotsData[col].range[row].timeslotId),
                storeTimeslotId: Number(this.storeTimeSlotsData[col].range[row].timeslotId),
                datetime: datetime.getTime(),
              },
            }));
            this.router.navigate(['/checkout', 'payment']);
          } else {
            this.timeSlotsData = data;
            this.setTimeSlotTable();
            this.selectedTimeSlot = [null, null];
            this.checkoutService.showErrorMsg('timeslot', '');
          }
        });
    } else {
      this.checkoutService.showErrorMsg('timeslot', '');
    }
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

}
