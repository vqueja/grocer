import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { AppState } from './../../../interfaces';
import { getAuthStatus } from './../../../auth/reducers/selectors';
// declare var $zopim: any;

@Component({
  selector: 'app-static-pages',
  templateUrl: './static-pages.component.html',
  styleUrls: ['./static-pages.component.scss']
})
export class StaticPagesComponent implements OnInit, OnDestroy {
  currentPage: string;
  isAuthenticated$: Observable<boolean>;

  constructor(
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.currentPage = router.url;
  }

  ngOnInit() {
    this.isAuthenticated$ = this.store.select(getAuthStatus);
  }

  ngOnDestroy() {
    // if ($zopim.livechat) {
    //   $zopim.livechat.hideAll();
    // }
  }

  showChat() {
    // const user = JSON.parse(localStorage.getItem('user'));
    // $zopim.livechat.set({
    //   name: `${user.firstName} ${user.lastName}`,
    //   email: user.email,
    // });
    // $zopim.livechat.window.show();
  }

}
