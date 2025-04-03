import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { SharedService } from './../services/shared.service';


@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit, OnDestroy {
  @ViewChild('popupModal') popupModal;
  pageSetting: any;
  config: any = {};
  confirmButtonText: string;
  isChecked = true;
  popupSub: Subscription;
  contentUrl: any;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    private sharedService: SharedService,
  ) { }

  ngOnInit() {
    this.popupSub = this.router.events.filter(e => e instanceof NavigationEnd)
      .map((e: NavigationEnd) => e.url.split('?')[0])
      .mergeMap((route) => this.sharedService.getPageSettings(route))
      .subscribe((pages: any) => {       
        if (pages.length) {
          this.cd.reattach();
          this.pageSetting = pages[0];
          if (this.pageSetting.isPopup && this.pageSetting.isEnabled) {
            this.contentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pageSetting.contentUrl);
            if (this.pageSetting.isCheckbox) {
              this.isChecked = false;
            }
            if (this.pageSetting.isConfirmButton) {
              this.config = {
                backdrop: 'static',
                ignoreBackdropClick: true,
                keyboard: false
              };
              this.confirmButtonText = this.pageSetting.confirmButtonText || 'Confirm';
            } else {
              this.config = {};
            }
            
            if (!this.pageSetting.popupLimitPerSession) {
              this.popupModal.show();
            } else {
              let limit = Number(sessionStorage.getItem(`popup-limit[${this.pageSetting.route}]`)) || 0;
              if (limit < this.pageSetting.popupLimitPerSession) {
                limit += 1;
                sessionStorage.setItem(`popup-limit[${this.pageSetting.route}]`, `${limit}`);
                this.popupModal.show();
              } 
            }           
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.popupSub) {
      this.popupSub.unsubscribe();
    }
  }

  popupClosed(): void {
    this.pageSetting = null;
    this.cd.detectChanges();
  }

}
