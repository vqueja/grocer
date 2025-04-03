import { Store } from '@ngrx/store';
import { AppState } from '../../../interfaces';
import { UserActions } from '../../actions/user.actions';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../../environments/environment';
import { getUserLists } from '../../reducers/selector';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {
  lists$: Observable<any>;
  newList = new FormControl;

  constructor(
    private store: Store<AppState>,
    private userActions: UserActions
  ) {
    this.lists$ = this.store.select(getUserLists);
  }

  ngOnInit() {
  }

  createNewList(): void{
    if(this.newList.value) {
      const d = new Date();
      const params = {
        name: this.newList.value,
        description: d.toLocaleDateString() +' '+ d.toLocaleTimeString()
      }
      this.store.dispatch(this.userActions.createUserList(params));
    }
  }

}
