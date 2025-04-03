import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';

import { Action } from '@ngrx/store';
import { UserService } from '../services/user.service';
import { UserActions } from '../actions/user.actions';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private userActions: UserActions
  ) { }
  // tslint:disable-next-line:member-ordering
  @Effect()
    GetUserOrders$: Observable<Action> = this.actions$
    .ofType(UserActions.GET_USER_ORDERS)
    .switchMap(() => this.userService.getOrders())
    .filter((orders) => orders.length > 0)
    .map((orders) => this.userActions.getUserOrdersSuccess(orders));
  // tslint:disable-next-line:member-ordering
  @Effect()
    GetUserLists$: Observable<Action> = this.actions$
    .ofType(UserActions.GET_USER_LISTS)
    .switchMap(() => this.userService.getLists())
    // .filter((orders) => orders.length > 0)
    .map((lists) => this.userActions.getUserListsSuccess(lists));
  // tslint:disable-next-line:member-ordering
  @Effect()
    CreateUserList$: Observable<Action> = this.actions$
    .ofType(UserActions.CREATE_USER_LIST)
    .switchMap((data) => this.userService.createNewList(data.payload))
    // .filter((orders) => orders.length > 0)
    .map((list) => this.userActions.createUserListSuccess(list));
  // tslint:disable-next-line:member-ordering
  @Effect()
    SaveCartItemsToList$: Observable<Action> = this.actions$
    .ofType(UserActions.SAVE_CART_ITEMS)
    .switchMap((data) => this.userService.createListAndAdd(data.payload))
    // .switchMap((data) => {
      // return this.userService.createNewList(data.payload.list).map(res => {
      //   for(let i = 0, delay = 0, l = data.payload.items.length, listitem; i < l; i++ ) {
      //     listitem = { list_id: res.id, item_id: data.payload.items[i]};
      //     setTimeout(() => {
      //       this.userService.addListItem(listitem).subscribe();
      //     }, (i * 300))
      //   }
      //   return res;
      // })
    // })
    .map((list) => this.userActions.createUserListSuccess(list));
}
