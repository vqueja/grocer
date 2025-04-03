import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-pbu-add',
  templateUrl: './pbu-add.component.html',
  styleUrls: ['./pbu-add.component.scss']
})
export class PbuAddComponent implements OnInit, OnDestroy {
  private createSubs: Subscription;
  private timerSubs: Subscription;
  private timer: Observable<any>;
  bHasFile: boolean;
  bPBUAdded: boolean;
  activeUser: any;
  partnerList: Array<any> = [];
  selectedPartnerId: number;
  @Input() loader: any;

  constructor(
    private adminService: AdminService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.bHasFile = true;
    this.bPBUAdded = true;
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    this.selectedPartnerId = this.activeUser.partner_id;
    if (this.activeUser.partner_id === 1) {
      this.partnerList = JSON.parse(localStorage.getItem('partners'));
      this.partnerList = this.partnerList.filter((a) => a.type !== 'seller').sort((a, b) => a.id - b.id);
    }
  }

  ngOnDestroy() {
    if (this.createSubs) {
      this.createSubs.unsubscribe();
    }
    if (this.timerSubs) {
      this.timerSubs.unsubscribe();
    }
  }

  enableAddBtn(csvInput: any): void {
    this.bHasFile = csvInput ? false : true;
  }

  selectPartner(id: number): void {
    this.selectedPartnerId = id;
  }

  convertFile(csvInput: any): void {
    const file = new FileReader();
    file.onload = () => {
      const dateCreated = Date.now();
      const dataArray = file.result.split('\n');
      dataArray.shift();
      const userData = dataArray.reduce((accumulator, item) => {
        item.replace(/'/g, '');
        const [username, email, firstName, lastName, credit, balance, status] = item.split(',');
        if (username) {
          accumulator.push({
            user: {
              username,
              email,
              firstName,
              lastName,
              dateCreated,
              dateUpdated: dateCreated,
            },
            pbu: {
              username,
              email,
              name: `${firstName} ${lastName}`,
              credit: Number(credit),
              availablebalance: Number(balance),
              status,
              partner_id: this.selectedPartnerId,
            },
          });
        };
        return accumulator;
      }, []);
      if (userData.length) {
        this.adminService.createUsers(userData)
          .subscribe(result => {
            if (result.message === 'Saved') {
              console.log(result.message);
            }
          });
      }
    };
    file.readAsText(csvInput.files[0]);
    this.setLoader();
  }

  setLoader() {
    this.bPBUAdded = false;
    this.timer = Observable.timer(3000); // 5000 millisecond means 5 seconds
    this.timerSubs = this.timer.subscribe(() => {
      // set showloader to false to hide loading div from view after 5 seconds
      this.bPBUAdded = true;
      this.router.navigate(['/admin/employees']);
    });
  }
}
