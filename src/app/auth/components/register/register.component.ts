import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { getAuthStatus } from '../../reducers/selectors';
import { AppState } from '../../../interfaces';
import { environment } from '../../../../environments/environment';


@Component({
   selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  title = environment.AppName;

  constructor(
    private store: Store<AppState>,
    private router: Router,
  ) {
    this.redirectIfUserLoggedIn();
  }

  ngOnInit() {
  }

  redirectIfUserLoggedIn() {
    this.store.select(getAuthStatus).subscribe(data => {
      if (data === true) {
        this.router.navigateByUrl('/');
      }
    });
  }

}
