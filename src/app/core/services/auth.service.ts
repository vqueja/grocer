import { Injectable } from '@angular/core';
import { Response, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { HttpService } from './http';
import { Auth } from '../models/user';
import { AppState } from '../../interfaces';
import { AuthActions } from '../../auth/actions/auth.actions';
import { UserActions } from '../../user/actions/user.actions';
import { CheckoutActions } from '../../checkout/actions/checkout.actions';


@Injectable()
export class AuthService {

  /**
   * Creates an instance of AuthService.
   * @param {HttpService} http
   * @param {AuthActions} actions
   * @param {Store<AppState>} store
   *
   * @memberof AuthService
   */
  constructor(
    private http: HttpService,
    private actions: AuthActions,
    private userActions: UserActions,
    private checkoutActions: CheckoutActions,
    private store: Store<AppState>,
  ) {

  }


  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  loginFB(data: any): Observable<any> {
    return this.http.post('v1/users/login', data)
      .map((res: Response) => {
        data = res.json();
        if (data.message === 'Found') {
        // Setting token after login
          this.setTokenInLocalStorage(data);
          this.store.dispatch(this.actions.loginSuccess());
        } else {
          data.error = true;
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: 'Please enter valid Credentials'
          });
        }
        return data;
      });
  }

  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  login(data: any): Observable<any> {
    let userData;
    return this.http.post('v1/users/login', data)
      .map((res: Response) => {
        userData = res.json();
        return userData;
      })
      .mergeMap(() => {
        if (userData.id) {
          return this.getPartnerBuyerUser(userData.id)
            .catch((err) => Observable.of(err));
        }
        return Observable.of({ message: '' });
      })
      .mergeMap((pbuData: any) => {
        if (pbuData.message === 'Found') {
          localStorage.setItem('PBUser', JSON.stringify(pbuData));
          return this.getPartner(pbuData.partner_id)
            .catch((err) => Observable.of(err));
        } else {
          localStorage.removeItem('PBUser');
        }
        return Observable.of({ message: '' });
      })
      .map((partner: any) => {
        if (partner.message === 'Found') {
          localStorage.setItem('partner', JSON.stringify(partner));
        } else {
          localStorage.setItem('partner', '[]');
        }
        if (userData.message === 'Found') {
          userData.forcedReset = userData.forcedReset === '1' ? true : false;
          this.setTokenInLocalStorage(userData);
          if (!userData.forcedReset) {
            this.store.dispatch(this.actions.loginSuccess());
          }
        } else {
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: 'Please enter valid Credentials'
          });
        }
        return userData;
      })
      .catch((err) => Observable.of(err));
  }

  /**
   * @param {object} data
   * @param {boolean} isMsg
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  checkUser(data: object, isMsg: boolean = false): Observable<any> {
    return this.http.post('v1/users/login', data)
      .map((res: Response) => {
        let isFound = false;
        const resData = res.json();
        if (resData.message === 'Found') {
          isFound = true;
        } else {
          if (isMsg) {
            this.http.loading.next({
              loading: false,
              hasError: true,
              hasMsg: 'Please enter valid Credentials'
            });
          }
        }
        return isFound;
      });
  }

  /**
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  checkPartnerBuyer(id: number): Observable<any> {
    return this.http.get(`v1/partnerbuyerusers/user/${id}`)
      .map((res: Response) => {
        const data = res.json();
        if (data.message === 'Found') {
          if (data.status === 'enabled') {
            return true;
          }
        } else {
          return false;
        }
      });
  }

  /**
   * @param {any} filters
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  getPartners(options: any): Observable<any> {
    const optionsText = [];
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        optionsText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/partners?${optionsText.join('&')}`)
      .map((res: Response) => {
        return res.json();
      })
      .catch(err => Observable.of({ error: err}));
  }

  /**
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  getPartner(id: number): Observable<any> {
    return this.http.get(`v1/partners/${id}`)
      .map((res: Response) => {
        return res.json();
      })
      .catch(err => Observable.of({ error: err}));
  }

  /**
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  getPartnerBuyerUser(id: number): Observable<any> {
    return this.http.get(`v1/partnerbuyerusers/user/${id}`)
      .map((res: Response) => {
        return res.json();
      });
  }

  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  updatePartnerBuyerUser(data): Observable<any> {
    return this.http.put(`v1/partnerbuyerusers/user/${data.useraccount_id}`, data)
      .map(res => {
        return res.json();
      })
      .catch(err => Observable.of({}));
  }

  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  register(data): Observable<any> {
    return this.http.post('v1/users', data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message === 'Saved') {
          this.http.loading.next({
            loading: false,
            isSuccess: true,
            hasMsg: 'Registration successful',
          });
        } else {
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: response.message === 'Existing' ? 'Email already in use' : response.message,
          });
        }
        return response;
      });
  }

  /**
   * @param {number} id
   * @param {any} data
   * @param {boolean} isMsg
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  update(id, data, isMsg = true): Observable<any> {
    return this.http.put(`v1/users/${id}`, data)
      .map((res: Response) => {
        const result = res.json();
        if (result.message.indexOf('Updated') >= 0) {
          const storedData = JSON.parse(localStorage.getItem('user'));
          data.message = result.message;
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              storedData[key] = data[key];
            }
          }
          this.setTokenInLocalStorage(storedData);
          if (isMsg) {
            this.http.loading.next({
              loading: false,
              isSuccess: true,
              hasMsg: `Profile was successfully updated.`,
              reset: 4500,
            });
          }
        } else {
          if (isMsg) {
            let errorMsg = 'Error occurred. Please try again later.';
            if (result.message === 'Not Found') {
              errorMsg = 'User does not exist.';
            } else if (result.message === 'Email Already Taken') {
              errorMsg = 'Email already in use. Please provide another one.';
            }
            this.http.loading.next({
              loading: false,
              hasError: true,
              hasMsg: errorMsg,
              reset: 4500,
            });
          }
        }
        return result;
      });
  }

  /**
   * @param {any} data
   * @param {boolean} isForcedReset optional
   * @param {number} isSendEmail optional
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  changePassword(data: any, isForcedReset?: boolean, isSendEmail?: number): Observable<any> {
    return this.http.put(`v1/users/${data.id}/changepassword?notify=${isSendEmail ? 1 : 0}`, data)
      .map((res: Response) => {
        const result = res.json();
        if (result.message.indexOf('Updated') >= 0) {
          this.http.loading.next({
            loading: false,
            isSuccess: true,
            hasMsg: `Password was successfully updated.`,
            reset: 4500,
          });
          if (isForcedReset) {
            const userData = JSON.parse(localStorage.getItem('user'));
            userData.forcedReset = false;
            this.setTokenInLocalStorage(userData);
            setTimeout(() => this.store.dispatch(this.actions.loginSuccess()), 2000);
          }
        } else {
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: 'Error occurred. Please try again later.',
            reset: 4500,
          });
        }
        return result;
      });
  }

  /**
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  view(id: number): Observable<any> {
    return this.http.get(`v1/users/${id}`)
      .map((res: Response) => {
        const data = res.json();
        if (data.message === 'Found') {
          this.setTokenInLocalStorage(res.json());
        } else {
          data.error = true;
        }
        return data;
      });
  }

  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  checkToken(data): Observable<any> {
    return this.http.post('v1/users/token', data)
      .map((res: Response) => {
        return res.json();
      });
  }

  /**
   * @memberof AuthService
   */
  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.store.dispatch(this.actions.logoutSuccess());
  }

  /**
   * @param {string} email
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  requestPasswordReset(email): Observable<any> {
    return this.http.post(`v1/users/${email}/forgotpassword`, {
      email: email
    }).map((res: Response) => {
      const data = res.json();
      this.http.loading.next({
        loading: false,
        isSuccess: true,
        hasMsg: `If a matching account was found, an email was sent to ${email}`,
        reset: 4500,
      });
      return data;
    });
  }

  /**
   * @param {void}
   * @returns {any}
   *
   * @memberof AuthService
   */
  getTokenInLocalStorage(): any {
    return localStorage.getItem('omg_token');
  }

  /**
   * @private
   * @param {any} data
   *
   * @memberof AuthService
   */
  private setTokenInLocalStorage(data): void {
    if (data.token) {
      localStorage.setItem('omg_token', data.token);
      delete data.token;
    }
    const jsonData = JSON.stringify(data);
    localStorage.setItem('user', jsonData);
  }

  /**
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  getSettings(): Observable<any> {
    return this.http.get(`v1/settings`)
    .map((res: Response) => {
      return res.json();
    });
  }

  /**
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  authorize(): Observable<any> {
    this.store.dispatch(this.actions.logoutSuccess());
    const headers = new Headers({
      'Content-Type': 'text/plain',
    });
    return this.http.get(`v1/users/authorize`, { headers })
      .map((res: Response) => {
        const data = res.json();
        localStorage.setItem('omg_token', data.token);
        return data;
      });
  }

  /**
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  renewToken(): Observable<any> {
    return this.http.get(`v1/users/renew`)
      .map((res: Response) => {
        const data = res.json();
        localStorage.setItem('omg_token', data.token);
        return data;
      });
  }

  /**
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  checkTokenExpiry(): Observable<any> {
    const token = localStorage.getItem('omg_token');
    if (token) {
      const FIVE_MINUTES = 300000;
      const TEN_MINUTES = 600000;
      const jwtHelper: JwtHelperService = new JwtHelperService();
      try {
        const decoded = jwtHelper.decodeToken(token);
        const isCustomer = decoded.role === 'customer';
        const isGuest = decoded.role === 'guest';
        const difference = (decoded.exp * 1000) - new Date().getTime();
        if ((difference > TEN_MINUTES && isCustomer
          || (difference > FIVE_MINUTES && isGuest))) {
          console.log('%cTOKEN VALID', 'color: blue; font-size: 20px');
          return Observable.of(true);
        } else if (difference > 0 && ((difference <= TEN_MINUTES && isCustomer)
          || (difference <= FIVE_MINUTES && isGuest))) {
          console.log('%cTOKEN RENEW', 'color: red; font-size: 20px');
          return this.renewToken();
        } else {
          console.log('%cTOKEN INVALID', 'color: orange; font-size: 20px');
          return this.authorize();
        }
      } catch (err) {
        console.log('%cTOKEN INVALID2', 'color: orange; font-size: 20px');
        return this.authorize();
      }
    } else {
      console.log('%cTOKEN NEW', 'color: black; font-size: 20px');
      return this.authorize();
    }
  }

  /**
   * @memberof AuthService
   */
  loginValidToken(): void {
    const jwtHelper: JwtHelperService = new JwtHelperService();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('omg_token');
    try {
      const decoded = jwtHelper.decodeToken(token);
      if (user && !user.forcedReset && !jwtHelper.isTokenExpired(token) && decoded.role === 'customer') {
        this.store.dispatch(this.actions.loginSuccess());
      }
    } catch (err) {};
  }

}
