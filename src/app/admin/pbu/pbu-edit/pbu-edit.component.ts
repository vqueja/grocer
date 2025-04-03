import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-pbu-edit',
  templateUrl: './pbu-edit.component.html',
  styleUrls: ['./pbu-edit.component.scss']
})
export class PbuEditComponent implements OnInit, OnDestroy {
  @Input() email: string;
  pbuData: {
    'id': Number,
    'name': string,
    'username': string,
    'email': string,
    'availablebalance': Number,
    'outstandingbalance': Number,
    'credit': Number,
    'status': string,
    'useraccount_id': Number,
    'dateUpdated': string
  };
  routeSub: Subscription;
  updateSub: Subscription;
  status: any;
  pStatus: string;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe((params: any) => {
      if (params.id) {
        this.adminService.getPartnerBuyerUser(params.id).subscribe((pbu) => {
          this.pbuData = pbu;
          this.pStatus = this.pbuData.status;
        });
      }
    });
  }

  onCancelClick() {
    this.router.navigate(['/admin/pbu']);
  }

  save(email: string, credit: string) {
    let data;
    credit = credit.replace(/,/g,"");
    if(email && credit) {
      data = {
        name: this.pbuData.name,
        email: email,
        credit: Number(credit),
        availablebalance: Number(credit) - Number(this.pbuData.outstandingbalance),
      };
    } else if(email && !credit) {
      data = {
        name: this.pbuData.name,
        email: email,
      };
    } else if(!email && credit) {
      data = {
        name: this.pbuData.name,
        credit: Number(credit),
        availablebalance: Number(credit) - Number(this.pbuData.outstandingbalance),
      };
    }
    data = Object.assign(data, { useraccount_id: this.pbuData.useraccount_id });
    this.updateSub = this.adminService.updatePartnerBuyerUser(data).subscribe();
  }

  setStatusEnabled() {
    this.pStatus = "enabled";
  }

  setStatusDisabled() {
    this.pStatus = "disabled";
  }

  ngOnDestroy() {
    localStorage.removeItem('pbuser_selected');
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
  }

}
