import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../../interfaces';
import { getAuthStatus } from '../../reducers/selectors';
import { Globals } from '../../../globals';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy  {
  returnUrl: string;
  initSub: Subscription;
  partnerBuyer: any;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private globals: Globals,
  ) {
    this.redirectIfUserLoggedIn();
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initSub = this.globals.getPartners().subscribe((partners) => {
      const partnerBuyer = partners.filter((partner) =>
      partner.url === window.location.hostname);
      if (partnerBuyer.length) {
        this.partnerBuyer = partnerBuyer[0];
      }
    });
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }

  redirectIfUserLoggedIn() {
    this.store.select(getAuthStatus).subscribe(data => {
      if (data === true) {
        this.router.navigate([this.returnUrl]);
        // setTimeout(() => this.router.navigate([this.returnUrl]), 2500);
      }
    });
  }

  checkUrl(): boolean {
    if (this.partnerBuyer && this.partnerBuyer.signUpFlag) {
      return true;
    }
    return false;
   }

  registerLink(): Array<string> {
    let link = ['/'];
    if (this.partnerBuyer && this.partnerBuyer.signUpFlag) {
      link = ['/auth/signup/pb', `${this.partnerBuyer.id}${this.partnerBuyer.code}`];
    }
    return link;
  }

}
