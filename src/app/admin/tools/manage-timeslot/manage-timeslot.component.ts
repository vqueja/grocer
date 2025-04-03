import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from './../../services/admin.service';

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
  selector: 'app-manage-timeslot',
  templateUrl: './manage-timeslot.component.html',
  styleUrls: ['./manage-timeslot.component.scss']
})
export class ManageTimeslotComponent implements OnInit, OnDestroy {
  timeslotSub: Subscription;
  updateSub: Subscription;
  timeSlotRows: Array<TimeSlot> = [];
  timeSlotData: Array<TimeSlotDay> = [];
  timeSlotMax: Array<Array<number>> = [[], [], [], [], []];
  timeSlotRawData: Array<any> = [];
  partnerList: Array<any> = [];
  selectedPartner: any;
  partnerName: string;
  partnerId: number;
  partnerData: any;
  activeUser: any;
  days: Array<any> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  @ViewChild('confirmModal') confirmModal;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.queryParams.mergeMap((params) => {
      this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
      if (this.activeUser.partner_id === 1) {
        this.partnerList = JSON.parse(localStorage.getItem('partners'));
        this.partnerList = this.partnerList
          // .filter((a) => a.type === 'buyer')
          .sort((a, b) => a.id - b.id);
        const partnerId = params.partner ? Number(params.partner) : 2;
        this.selectedPartner = this.partnerList.filter(partner => partner.id === partnerId)[0];
      } else {
        this.selectedPartner = JSON.parse(localStorage.getItem('partners'))[0];
      }
      this.partnerId = this.selectedPartner.id;
      this.partnerName = this.selectedPartner.name;
      return this.setTimeSlotData();
    })
      .mergeMap(() => this.adminService.getPartner(this.partnerId))
      .do((result) => {
        if (result.message === 'Found') {
          this.partnerData = result;
        } else {
          this.partnerData = null;
        }
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.timeslotSub) {
      this.timeslotSub.unsubscribe();
    }
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
  }

  setTimeSlotData(): Observable<any> {
    if (this.selectedPartner.type === 'seller') {
      return this.adminService.getTimeSlotsByPartnerStoreId(this.partnerId)
        .do((data: any) => {
          if (data.length) {
            this.timeSlotRawData = data;
          } else {
            this.timeSlotRawData = [];
          }
          this.timeSlotData = [];
        });
    } else {
      return this.adminService.getTimeSlotsByPartnerId(this.partnerId)
        .do((data: TimeSlotDay[]) => {
          if (data.length) {
            this.timeSlotData = data;
            this.timeSlotRows = this.timeSlotData[0].range;
            data.forEach((day, i) => {
              day.range.forEach((timeslot, j) => {
                this.timeSlotMax[j][i] = data[i].range[j].max;
              });
            });
          } else {
            this.timeSlotData = [];
          }
          this.timeSlotRawData = [];
        });
    }
  }

  saveTimeSlots(): void {
    if (this.selectedPartner.type === 'seller') {
      const apiData = this.timeSlotRawData.map((row) => {
        return {
          id: row.id,
          d1max: row.d1max,
          d2max: row.d2max,
          d3max: row.d3max,
          d4max: row.d4max,
          d5max: row.d5max,
          d6max: row.d6max,
          d7max: row.d7max,
        };
      });
      this.updateSub = this.adminService.updateTimeSlotsByPartnerId(this.partnerId, apiData)
        .switchMap(() => this.setTimeSlotData())
        .subscribe();
    } else {
      // NOTE: JS day 0 = sunday; database d1max = monday
      let day = (new Date().getDay()) - 1;
      let transposed;
      if (day === 0) {
        transposed = this.timeSlotMax;
      } else {
        if (day < 0) {
          day = 6;
        }
        const offset = 7 - day;
        transposed = this.timeSlotMax.map(row =>
          row.slice(offset).concat(row.slice(0, offset)));
      }
      const apiData = transposed.map((row, i) => {
        let id;
        const rowData = row.map((col, j) => {
          id = this.timeSlotData[j].range[i].timeslotId;
          const obj = {};
          obj[`d${(j + 1)}max`] = col;
          return obj;
        });
        return Object.assign({ id }, Object.assign({}, ...rowData));
      });
      this.updateSub = this.adminService.updateTimeSlotsByPartnerId(this.partnerId, apiData)
        .switchMap(() => this.setTimeSlotData())
        .subscribe();
    }

    this.confirmModal.hide();
  }

  updateValue(e: any, row: number, col: number): void {
    const value = Number(e.srcElement.value);
    if (isNaN(value) || !Number.isInteger(value)) {
      e.srcElement.value = this.timeSlotData[col].range[row].max;
    } else {
      e.srcElement.classList.add('changed');
      e.srcElement.value = value;
      this.timeSlotMax[row][col] = value;
    }
  }

  updateSlot(e: any, index: number, key: string): void {
    const el = e.target;
    const value = Number(el.value);
    if (el.value === '' || isNaN(value) || !Number.isInteger(value) || value < 0 ) {
      el.value = this.timeSlotRawData[index][key];
    } else if (this.timeSlotRawData[index][key] !== value) {
      el.classList.add('changed');
      el.value = value;
      this.timeSlotRawData[index][key] = value;
    }
  }

  createTimeSlots(id): void {
    this.updateSub = this.adminService.createTimeSlotsByPartnerId(this.partnerId)
      .mergeMap((result: any) => {
        if (result.message === 'Saved') {
          return this.setTimeSlotData();
        }
        return Observable.of({})
      }).subscribe();
  }

  changePartner(target: any): void {
    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams: { partner: target.value }, 
        queryParamsHandling: 'merge',
      });  
  }

  refresh(): void {
    this.updateSub = this.setTimeSlotData()
      .mergeMap(() => this.adminService.getPartner(this.partnerId))
      .do((result) => {
        if (result.message === 'Found') {
          this.partnerData = result;
        } else {
          this.partnerData = null;
        }
      })
      .subscribe();
  }

}
