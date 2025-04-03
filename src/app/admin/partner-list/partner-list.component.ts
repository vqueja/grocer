import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AdminService } from './../services/admin.service';
import { AdminVarsService } from '../services/admin-vars.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.scss']
})
export class PartnerListComponent implements OnInit, OnDestroy {
  partners: Array<any>;
  partnersSub: Subscription;
  routeSub: Subscription;
  updateSub: Subscription;
  storeTypesSub: Subscription;
  partnerType: string;
  currentPage = 1;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  showFilter = false;
  showGroups = false;
  filters: any = {
    name: null,
    // type: 0,
    url: null,
  };
  filterText: string;
  filtersUrl: any;
  groupedStores: any;
  priorityNum: Array<number> = [];
  private componentDestroyed: Subject<any> = new Subject();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private adminVarsSevice: AdminVarsService
  ) { }

  ngOnInit() {
    for (let i = 1; i < 100; i++) {
      this.priorityNum.push(i);
    }
    this.routeSub = this.route.params.map((params: any) => {
      this.partnerType = params.type.toLowerCase();
    })
      .subscribe(() => {
        this.clearFilter();
        this.applyFilter();
      });
  }

  ngOnDestroy() {
    if (this.partnersSub) {
      this.partnersSub.unsubscribe();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  applyFilter(): void {
    const filterText = [];
    const filters = Object.assign({ type: this.partnerType }, this.filters);
    if (filters.name) {
      filterText.push(`Name = <i>${filters.name}</i>`);
    }
    if (filters.code) {
      filterText.push(`Code = <i>${filters.code}</i>`);
    }
    if (filters.url) {
      filterText.push(`URL = <i>${filters.url}</i>`);
    }
    if (filters.status > -1) {
      filterText.push(`Status = <i>${this.getStatusText(filters.status)}</i>`);
    } else {
      delete filters['status'];
    }

    this.filterText = filterText.length ? filterText.join(', ') : 'None';
    this.filtersUrl = filters;
    this.partnersSub = combineLatest([
      this.adminService.getPartners(Object.assign({
        limit: this.itemsPerPage,
        list: 1,
      }, this.filtersUrl)),
      this.adminService.getPartners(Object.assign({
        count: 1,
        list: 1,
      }, this.filtersUrl))
    ])
      .subscribe((results) => {
        this.partners = results[0].map(partner => {
          partner['statusText'] = this.getStatusText(partner.status);
          partner['availableText'] = this.getAvailableText(partner.availability);
          partner['imgRetries'] = 0;
          return partner;
        });
        if (results[1].length) {
          this.totalItems = results[1][0].count;
        }
      });
      this.getStoreTypes();
  }

  clearFilter(): void {
    this.filters = {
      name: null,
      // type: 0,
      code: null,
      url: null,
      status: -1,
    };
  }

  pageChanged(event: any): void {
    this.partnersSub = this.adminService.getPartners(Object.assign({
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
      list: 1,
    }, this.filtersUrl)).subscribe((partners) => {
      this.partners = partners.map(partner => {
        partner['statusText'] = this.getStatusText(partner.status);
        partner['availableText'] = this.getAvailableText(partner.availability);
        partner['imgRetries'] = 0;
        return partner;
      });
    });
  }

  getStatusText(value: number): string {
    let statusText = '';
    switch (Number(value)) {
      case 0:
        statusText = 'Disabled';
        break;
      case 1:
        statusText = 'Show';
        break;
      case 2:
        statusText = 'Hidden';
        break;
      default:
    }
    return statusText;
  }

  setStatus(partner: any, value: number): void {
    const data = {
      id: partner.id,
      status: value,
    };
    this.updateSub = this.adminService.updatePartner(data)
      .subscribe((res: any) => {
        if (res && res.message.toUpperCase() === 'UPDATED') {
          partner.status = value;
          partner.statusText = this.getStatusText(value);
        }
      });
  }

  setPriority(partner: any, value: number): void {  
    const data = {
      id: partner.id,
      priority: value,
    };
    this.updateSub = this.adminService.updatePartner(data)
      .subscribe((res: any) => {
        if (res && res.message.toUpperCase() === 'UPDATED') {
          partner.priority = value;
        }
      });
  }

  getAvailableText(value: number): string {
    return value ? 'Open': 'Close';
  }

  setAvailability(partner: any): void {
    const value = partner.availability ? 0 : 1;
    const data = {
      id: partner.id,
      availability: value,
    };
    this.updateSub = this.adminService.updatePartner(data)
      .subscribe((res: any) => {
        if (res && res.message.toUpperCase() === 'UPDATED') {
          partner.availability = value;
          partner.availableText = this.getAvailableText(value);
        }
      });
  }


  getImageUrl(store: any) {
    return !store.logo ? this.adminVarsSevice.LOGO_DEFAULT_IMG : `${ environment.LOGO_REPO }${ store.logo }`;
  }

  onImageError(e: any, store: any): void {
    const key = `${ environment.LOGO_REPO }${ store.logo }`;
    store.imgRetries += 1;
    switch (store.imgRetries) {
      case 1:
        e.target.src = `${ key }.jpg`;
        break;
      case 2:
        e.target.src = `${ key }.png`;
        break;
      default:
        e.target.src = this.adminVarsSevice.LOGO_DEFAULT_IMG;
        e.onerror = null;
    }
  }

  getStoreTypes(): void {
    let found = false;
    this.storeTypesSub = this.adminService.getStoreTypes()
        .takeUntil(this.componentDestroyed)
        .subscribe((res: any) => {
          this.groupedStores = res;
          this.groupedStores.forEach(store => {
            let tempPartner = [];
            this.partners.forEach(partner => {
              if (partner.type == 'seller') {
                let tmpArr =  JSON.parse(partner.subType);
                if(tmpArr.length > 0) {
                  if(tmpArr.includes(store.id)) {
                    if(tempPartner.length ==  0){
                      tempPartner.push(partner);
                    } else {
                      tempPartner.forEach(tmp => {
                        if (tmp === partner) {
                          found = true;
                        }
                      });
                      if (!found) {
                        tempPartner.push(partner);
                      }
                    }
                  }
                }
              }
            });
          store = Object.assign(store,{ stores: tempPartner });
        });
      });
  }

}
