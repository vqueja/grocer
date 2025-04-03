import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ToolsService } from '../services/tools.service';


@Component({
  selector: 'app-page-settings',
  templateUrl: './page-settings.component.html',
  styleUrls: ['./page-settings.component.scss']
})
export class PageSettingsComponent implements OnInit, OnDestroy {
  initSub: Subscription;
  paginateSub: Subscription;
  pageSettings: Array<any> = [];
  // pagination variables
  currentPage = 1;
  readonly itemsPerPage = 15;
  totalItems: number;
  numPages: number;
  // filter variables
  showFilter =  false;
  filters: any = {};
  filterText: string;
  filterUrl: any;

  constructor(
    private toolsService: ToolsService
  ) { }

  ngOnInit() {
    this.initSub = forkJoin([
      this.toolsService.getPageSettingList({ limit: this.itemsPerPage }),
      this.toolsService.getPageSettingList({ count: 1})
    ]).subscribe(([list, count]) => {
      this.pageSettings = list;
      this.totalItems = count[0].count;
    })
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
    if (this.paginateSub) {
      this.paginateSub.unsubscribe();
    }
  }
  
  applyFilter(): void {

  }

  clearFilter(): void {

  }

  pageChanged(event: any): void {
    this.paginateSub = this.toolsService.getPageSettingList(Object.assign({
      limit: this.itemsPerPage,
      skip: (event.page - 1) * this.itemsPerPage,
    })).subscribe((result: any) => this.pageSettings = result);
  }
}
