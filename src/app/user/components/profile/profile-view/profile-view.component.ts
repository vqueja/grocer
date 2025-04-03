import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../../../interfaces';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  @Output() onUpdateClickEmit: EventEmitter<string> = new EventEmitter();
  profileViewSubs: Subscription;
  userData: {
    'id': string,
    'email': string,
    'lastName': string,
    'firstName': string,
    'gender': string,
    'mobileNumber': string,
    'birthdate': string,
  };

  constructor(
    private store: Store<AppState>,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    if(typeof(this.userData.email) == 'undefined' && typeof(this.userData.id) != 'undefined') {
      this.authService.view(Number(this.userData.id)).subscribe(data => {
        const error = data.error;
        if (error) {
        } else {
          this.userData = data;
          this.userData.birthdate = data.birthdate ? this.formatDate(data.birthdate): data.birthdate;
        }
      });
    } else {
      this.userData.birthdate = this.userData.birthdate? this.formatDate(this.userData.birthdate): this.userData.birthdate;
    }
  }

  onUpdateClick() {
    window.scrollTo(0,0);
    this.onUpdateClickEmit.emit();
  }

  ngOnDestroy() {
    if (this.profileViewSubs) {
      this.profileViewSubs.unsubscribe();
    }
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US',{ month:'long', day:'numeric', year:'numeric' });
  }

}
