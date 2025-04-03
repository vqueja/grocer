import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs/Observable';
import { AdminVarsService } from './admin-vars.service';
import { HttpService } from '../../core/services/http';
import { environment } from './../../../environments/environment';


@Injectable()
export class AdminService {

  hasError: boolean;

  constructor(
    private http: HttpService,
    private router: Router,
    private adminVarsService: AdminVarsService,
  ) { }

  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  login(data): Observable<any> {
    return this.http.post('v1/admin/login', data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message.toUpperCase() === 'FOUND') {
          // Setting token after login
          if (response.token) {
            localStorage.setItem('omg_token', response.token);
            delete response.token;
          }
          localStorage.setItem('selleruser', JSON.stringify(response));
        } else {
          const msg = response.message.toUpperCase();
          let errMsg = '';
          if (msg === 'NOT FOUND') {
            errMsg = 'Please enter valid credentials';
          } else if (msg === 'DISABLED') {
            errMsg = 'Account disabled. Please contact our administrator';
          } else if (msg === 'FAILED') {
            errMsg = 'Server error. Please try again later.';
          }
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: errMsg,
          });
        }
        return response;
      });
  }

  /**
   * @param void
   * @returns void
   *
   * @memberof AdminService
   */
   logout(): void {
     localStorage.removeItem('selleruser');
     localStorage.removeItem('partners');
     localStorage.removeItem('partner');
     localStorage.removeItem('omg_token');
     sessionStorage.clear();
     this.router.navigate(['/admin/login']);
   }

   /**
    * @param void
    * @returns boolean
    *
    * @memberof AdminService
    */
  loginValidToken(): boolean {
    const jwtHelper: JwtHelperService = new JwtHelperService();
    const user = JSON.parse(localStorage.getItem('selleruser'));
    const token = localStorage.getItem('omg_token');
    try {
      const decoded = jwtHelper.decodeToken(token);
      if (user && !jwtHelper.isTokenExpired(token)
        && decoded.role !== 'customer' && decoded.role !== 'guest') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    };
  }

   /**
    * @param void
    * @returns void
    *
    * @memberof AdminService
    */
   renewToken(): Observable<any> {
     return this.http.get(`v1/users/renew`)
       .map((res: Response) => {
         const data = res.json();
         localStorage.setItem('omg_token', data.token);
         return true;
       });
   }

   checkTokenExpiry(): Observable<any> {
     const token = localStorage.getItem('omg_token');
     if (token) {
       const FIVE_MINUTES = 300000;
       const jwtHelper: JwtHelperService = new JwtHelperService();
       try {
        const decoded = jwtHelper.decodeToken(token);
        const difference = (decoded.exp * 1000) - new Date().getTime();
        if (difference > FIVE_MINUTES) {
          console.log('%cTOKEN VALID', 'color: blue; font-size: 20px');
          return Observable.of(true);
        } else if (difference > 0 && difference <= FIVE_MINUTES) {
          console.log('%cTOKEN RENEW', 'color: red; font-size: 20px');
          return this.renewToken();
        } else {
          console.log('%cTOKEN INVALID2', 'color: orange; font-size: 20px');
          return Observable.of(false);
        }
       } catch (err) {
        console.log('%cTOKEN INVALID3', 'color: orange; font-size: 20px');
        return Observable.of(false);
       }
     } else {
      console.log('%cTOKEN INVALID1', 'color: orange; font-size: 20px');
       return Observable.of(false);
     }
   }

   /**
    * @param {id} number
    * @returns {Observable<any>}
    *
    * @memberof AdminService
    */
   getUser(id: number): Observable<any> {
     return this.http.get(`v1/admin/${id}`)
       .map((res: Response) => {
         const response = res.json();
         return response;
       });
   }

   getAllSellerUsers(options ?: any): Observable<any> {
     const optionText = [];
     const keys = Object.keys(options);
     keys.forEach(key => {
       if (options[key]) {
         optionText.push(`${key}=${options[key]}`);
       }
     });
     return this.http.get(`v1/admin?${optionText.join('&')}`)
       .map((res: Response) => {
         const response = res.json();
         return response;
       });
   }
   /**
    *
    *
    * @returns {Observable<user[]>}
    *
    * @memberof AdminService
    */
   getUsers(options ?: any): Observable<any> {
     const optionText = [];
     const keys = Object.keys(options);
     keys.forEach(key => {
       if (options[key]) {
         optionText.push(`${key}=${options[key]}`);
       }
     });
     return this.http.get(`v1/users?${optionText.join('&')}`)
       .map((res: Response) => {
         return res.json();
       }
      )
       .catch(res => Observable.of([]));
   }

   /**
    *
    *
    * @returns {Observable<user[]>}
    *
    * @memberof AdminService
    */
   getUsersNoFilter(options ?: any): Observable<any> {
     const optionText = [];
     const keys = Object.keys(options);
     keys.forEach(key => {
       if (options[key]) {
         optionText.push(`${key}=${options[key]}`)
       }
     });
     return this.http.get(`v1/users?${optionText.join('&')}`)
        .map((res: Response) => res.json())
        .catch(res => Observable.of([]));
   }

   /**
   *
   *
   * @returns {Observable<user[]>}
   *
   * @memberof AdminService
   */
   getPBUsersNoFilter(options ?: any): Observable<any> {
     const optionText = [];
     const keys = Object.keys(options);
     keys.forEach(key => {
       if (options[key]) {
         optionText.push(`${key}=${options[key]}`)
       }
     });
     return this.http.get(`v1/partnerbuyerusers?${optionText.join('&')}`)
        .map((res: Response) => res.json())
        .catch(res => Observable.of([]));
   }

   /**
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
   addUser(data: any): Observable<any> {
      return this.http.post(`v1/admin`, data)
        .map((res: Response) => {
          const response = res.json();
          if (response.message === 'Saved') {
            this.http.loading.next({
              loading: false,
              isSuccess: true,
              hasMsg: response.message,
              reset: 4500
            });
          } else {
            this.http.loading.next({
              loading: false,
              hasError: true,
              hasMsg: response.message,
              reset: 4500
            });
          }
          return response;
        });
    }

   /**
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
   updateUser(data: any): Observable<any> {
     return this.http.put(`v1/admin/${data.id}`, data)
       .map((res: Response) => {
         const response = res.json();
         if (response.message.indexOf('Updated') >= 0) {
           this.http.loading.next({
             loading: false,
             isSuccess: true,
             hasMsg: response.message,
             reset: 4500
           });
         } else {
           this.http.loading.next({
             loading: false,
             hasError: true,
             hasMsg: response.message,
             reset: 4500
           });
         }
         return response;
       });
   }

  /**
  *
  * @param {void}
  * @returns {Observable<any>}
  *
  * @memberof AdminService
  */
  getRolesList(): Observable<any> {
      return this.http.get('v1/admin/roles')
        .map((res: Response) => res.json());
    }

   /**
   *
   * @param void
   * @returns boolean
   *
   * @memberof AdminService
   */
   isAuthenticated(): boolean {
     const token = localStorage.getItem('omg_token');
     if (!token) {
       return false;
     } else {
       const jwtHelper: JwtHelperService = new JwtHelperService();
       const decoded = jwtHelper.decodeToken(token);
       const isAdmin = (decoded.role !== 'customer' && decoded.role !== 'guest');
       return !jwtHelper.isTokenExpired(token) && isAdmin;
     }
   }

  /**
   *
   * @param void
   * @returns any
   *
   * @memberof AdminService
   */
  getUserRole(): any {
    const jwtHelper: JwtHelperService = new JwtHelperService();
    const token = localStorage.getItem('omg_token');
    const tokenPayload = jwtHelper.decodeToken(token);
    return tokenPayload.role;
  }

  /**
   *
   *
   * @returns {Observable<any[]>}
   *
   * @memberof AdminService
   */
  getAssembleOrders(partner_id: number, filters?: any): Observable<any> {
    const filterText = [];
    if (filters.orderStatus) {
      filterText.push(`orderStatus=${filters.orderStatus}`);
    }
    if (filters.mode) {
      filterText.push(`mode=${filters.mode}`);
    }
    return this.http.get(`v1/ordersellers?partnerId=${partner_id}&${filterText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<any[]>}
   *
   * @memberof AdminService
   */
  getOrdersellerList(partner_id: number, options?: any, filters?: any): Observable<any> {
    const filterText = [];
    let keys = Object.keys(filters);
    keys.forEach(key => {
      if (filters[key]) {
        filterText.push(`${key}=${filters[key]}`);
      }
    });
    keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        filterText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/ordersellers?partnerId=${partner_id}&${filterText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<any[]>}
   *
   * @memberof AdminService
   */
  getAllOrders(options?: any, filters?: any): Observable<any> {
    const filterText = [];
    let keys = Object.keys(filters);
    keys.forEach(key => {
      if (filters[key]) {
        filterText.push(`${key}=${filters[key]}`);
      }
    });
    keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        filterText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/ordersellers?${filterText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<any[]>}
   *
   * @memberof AdminService
   */
  getFreshFrozenCount(partnerId): Observable<any[]> {
    return this.http.get(`v1/ordersellers/count/fresh-frozen?partnerId=${partnerId}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<Logs[]>}
   *
   * @memberof AdminService
   */
  getLogs(options ?: any): Observable<any[]> {
    const optionText = [];
    if (options) {
      const keys = Object.keys(options);
      keys.forEach(key => {
        if (options[key]) {
          optionText.push(`${key}=${options[key]}`);
        }
      });
    }
    return this.http.get(`v1/logs?${optionText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.of([]));
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getSellerOrder(orderseller_id: number): Observable<any> {
    return this.http.get(`v1/ordersellers/${orderseller_id}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   * @param {data} any
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updateOrderSeller(data: any): Observable<any> {
    return this.http.put(`v1/ordersellers/${data.id}/updates`, data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message && response.message.indexOf('Updated') === -1) {
          let errMsg = '';
          switch (response.message) {
            // case 'User Assigned':
            //   errMsg = 'You are already handling an order';
            //   break;
            case 'Already Taken':
              errMsg = 'Order already handled by another user';
              break;
            case 'Failed':
            default:
              errMsg = 'Server error. Please try again later.';
          }
          this.showErrorMsg(errMsg);
        } else if (!response.message && response.type === 'error') {
         this.showErrorMsg('Unable to connect to server. Please try again later.');
        }
        return response;
      })
      .catch(res => Observable.of([]));
  }

  /**
   * @param {data} any
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  processOrder(data: any): Observable<any> {
    return this.http.put(`v1/ordersellers/${data.orderseller.id}/process`, data)
      .map((res: Response) => res.json())
      .catch(res => Observable.of([]));
  }

  /**
   * @param {id} number
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  sendPurchaseOrder(id: number): Observable<any> {
    return this.http.post(`v1/order/${id}/sendpurchaseorder`, { id })
      .map((res: Response) => {
        const result = res.json();
        if (result.message === 'Success') {
          this.showSuccessMsg('Email succesfully sent.');
        } else {
          this.showErrorMsg('Error occurred. Please try again later.');
        }
      })
      .catch(res => Observable.of([]));
  }

  /**
   * @param {id} number
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  sendConfirmationEmail(id: number): Observable<any> {
    return this.http.post(`v1/order/${id}/sendconfirmemail`, { id })
      .map((res: Response) => {
        const result = res.json();
        if (result.message === 'Success') {
          this.showSuccessMsg('Email succesfully sent.');
        } else {
          this.showErrorMsg('Error occurred. Please try again later.');
        }
      })
      .catch(res => Observable.of([]));
  }

  /**
   * @param {data} any
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getSettings(): Observable<any> {
    return this.http.get(`v1/settings`)
      .map((res: Response) => {
        return res.json();
      }).catch(res => Observable.empty());
  }

  /**
   *
   *
   * @param {data} any
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  saveSettings(data: any): Observable<any> {
    return this.http.put(`v1/settings`, data)
      .map((res: Response) => {
        return res.json();
      }).catch(res => Observable.empty());
  }

  /**
   *
   *
   * @param {any} orderNumber
   * @returns {Observable<Order>}
   *
   * @memberof AdminService
   */
  getOrderDetail(orderkey): Observable<any> {
    return this.http.get(`v1/orderitems?key=${orderkey}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getOrderItems(order_id: number, options ?: any): Observable<any> {
    const optionText = [];
    if(options) {
      const keys = Object.keys(options);
      keys.forEach(key => {
        if (options[key]) {
          optionText.push(`${key}=${options[key]}`);
        }
      });
    }
    return this.http.get(`v1/orderitems?limit=1000&orderId=${order_id}&addCategory=true&${optionText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getAllOrderItems(options ?: any): Observable<any> {
    const optionText = [];
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        optionText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/orderitems?limit=1000&addCategory=true&${optionText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }


  /**
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  addOrderItem(data: any): Observable<any> {
    return this.http.post(`v1/orderitems`, data
    ).map((res) => {
      return res.json();
    }).catch((err) => {
      return Observable.of(err);
    });
  }

  /**
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updateOrderItem(data: any): Observable<any> {
    return this.http.put(`v1/orderitems/${data.id}/assemble`, data
    ).map((res) => {
      return res.json();
    }).catch((err) => {
      return Observable.of(err);
    });
  }

  /**
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  replaceOrderItem(data: any): Observable<any> {
    return this.http.put(`v1/orderitems/${data.item.id}/replace`, data
    ).map((res) => {
      return res.json();
    }).catch((err) => {
      return Observable.of(err);
    });
  }

  /**
   *
   * @param {number} id
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  unreplaceOrderItem(id: number, data: any): Observable<any> {
    return this.http.put(`v1/orderitems/${id}/unreplace`, data
    ).map((res) => {
      return res.json();
    }).catch((err) => {
      return Observable.of(err);
    });
  }

  /**
   *
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  removeOrderItem(id: number): Observable<any> {
    return this.http.delete(`v1/orderitems/${id}`
    ).map((res) => {
      return res.json();
    }).catch((err) => {
      return Observable.of(err);
    });
  }

  /**
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updateOrder(data: any): Observable<any> {
    return this.http.put(`v1/order/${data.id}/seller`, data
    ).map((res) => {
      return res.json();
    }).catch(err => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<user[]>}
   *
   * @memberof AdminService
   */
  getPBUsers(options ?: any): Observable<any> {
    const optionText = [];
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        optionText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/partnerbuyerusers?${optionText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.of([]));
  }

  /**
   *
   *
   * @returns {Observable<orderpayments[]>}
   *
   * @memberof AdminService
   */
  getOrderPayments(options ?: any, filters?: any): Observable<any> {
    const filterText = [];
    let keys = Object.keys(filters);
    keys.forEach(key => {
      if (filters[key]) {
        filterText.push(`${key}=${filters[key]}`);
      }
    });
    keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        filterText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/orderpaymentdetails/?${filterText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @returns {Observable<orderpayments[]>}
   *
   * @memberof AdminService
   */
  getOrderPaymentsEOD(options ?: any, filters?: any): Observable<any> {
    const filterText = [];
    let keys = Object.keys(filters);
    keys.forEach(key => {
      if (filters[key]) {
        filterText.push(`${key}=${filters[key]}`);
      }
    });
    keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        filterText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/orderpaymentdetails/eodreport/?${filterText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.empty());
  }

  /**
   *
   * @param {string} email
   * @returns {Observable<user[]>}
   *
   * @memberof AdminService
   */
  resetPassword(email): Observable<any> {
    return this.http.post(`v1/admin/resetpassword/${email}`, {
      email: email
    }).map((res: Response) => {
      const data = res.json();
      if (data.message === 'Success') {
        this.http.loading.next({
          loading: false,
          isSuccess: true,
          hasMsg: 'Password reset email has been successfully sent.',
          reset: 4500,
        });
      } else {
        this.http.loading.next({
          loading: false,
          hasError: true,
          hasMsg: 'Error occurred. Please try again later.',
          reset: 4500,
        });
      }
      return data;
    });
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  changePassword(data): Observable<any> {
    return this.http.put(`v1/admin/${data.id}/changepassword`, data)
      .map((res: Response) => {
        const result = res.json();
        if (result.message.indexOf('Updated') >= 0) {
          this.http.loading.next({
            loading: false,
            isSuccess: true,
            hasMsg: `Password was successfully updated.`,
            reset: 4500,
          });
        } else {
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: 'Incorrect password.',
            reset: 4500,
          });
        }
        return result;
      });
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  checkToken(data): Observable<any> {
    return this.http.post(
      'v1/admin/token', data
    ).map((res: Response) => {
      return res.json();
    });
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  addCategories(data): Observable<any> {
    return this.http.post(
      `v1/category/multiple`, data)
    .map((res: Response) => {
      return res.json();
    })
    .catch(res => Observable.empty());
  }

   /**
    * @param {storeId} number
    * @returns {Observable<any>}
    *
    * @memberof AdminService
    */
  getCategories(storeId ?: number): Observable<any> {
    const path = storeId ? `store/${storeId}`: `list`;
    return this.http.get(`v1/category/${path}`)
      .map(res => {
        return res.json();
      })
      .catch((error) => Observable.of({
        categories: [],
        subCategories: [],
        error,
      }));
  }

  getItemCount(filters?: any): Observable<any> {
    let httpString = '';
    let filterText = [];
    let keys = Object.keys(filters);
      keys.forEach(key => {
        if (filters[key] != null) {
          filterText.push(`${key}=${filters[key]}`)

        }
      });
    if(filterText.length > 0){
      httpString = `v1/items/count/?${filterText.join('&')}`;
    } else {
      httpString = `v1/items/count/?status=none`;
    }
    return this.http.get(httpString)
    .map(res => res.json())
    .catch(err => Observable.empty());
  }


  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updateItem(data: any): Observable<any> {
    return this.http.put(`v1/items/admin/edit/${data.id}`, data)
    .map((res: Response) => {
      return res.json();
    })
    .catch((error) => Observable.of({ message: 'Failed', error }));
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  addItems(data): Observable<any> {
    return this.http.post(`v1/items/multiple`, data)
      .map((res: Response) => {
        return res.json();
      })
      .catch(res => Observable.of({}));
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  addItem(data): Observable<any> {
    return this.http.post(`v1/items/admin`, data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message === 'Saved') {
          this.http.loading.next({
            loading: false,
            isSuccess: true,
            hasMsg: response.message,
            reset: 4500
          });
        } else {
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: response.message,
            reset: 4500
          });
        }
        return response;
      })
      .catch(res => Observable.of({}));
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updateItems(data): Observable<any> {
    return this.http.put(`v1/items/multiple`, data)
      .map((res: Response) => {
        return res.json();
      })
      .catch(res => Observable.of({}));
  }

  /**
  *
  *
  * @param {any} data
  * @returns {Observable<any>}
  *
  * @memberof AdminService
  */
  createUsers(data): Observable<any> {
    this.hasError = false;
    return this.http.post(`v1/users/multiple`, data)
      .map((res: Response) => {
        return res.json();
      })
      .catch(res => Observable.empty());
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  createItems(data): Observable<any> {
    this.hasError = false;
    return this.http.put(`v1/items/multiple`, data)
      .map((res: Response) => res.json())
      .catch(res => Observable.of({}));
  }

  /**
   *
   *
   * @param {any} id
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getPartnerBuyerUser(id): Observable<any> {
    return this.http.get(`v1/partnerbuyerusers/user/${id}`)
    .map((res: Response) => {
      return res.json();
    })
    .catch(err => Observable.empty());
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updatePartnerBuyerUser(data): Observable<any> {
    return this.http.put(`v1/partnerbuyerusers/user/${data.useraccount_id}`, data)
    .map(res => {
      return res.json();
    })
    .catch(err => Observable.empty());
  }

  /**
   * @param {any} options {limit, skip, sort, sortBy, etc}
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getItems(options?: any, markup?: number): Observable<any> {
    if (options.keyword) {
      options.keyword = encodeURI(encodeURIComponent(options.keyword));
    }
    const optionsText = [];
    if (options) {
      const keys = Object.keys(options);
      keys.forEach(key => {
        if (options[key]) {
          optionsText.push(`${key}=${options[key]}`);
        }
      });
    }
    return this.http.get(`v1/storeitems?${optionsText.join('&')}`)
      .map((res: Response) => {
        const items = res.json();
        if (items.length) {
          return this.markUpPrice(items,markup);
        }
        return [];
      })
      .catch(res => Observable.of([]));
  }

  /**
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getItem(id: number): Observable<any> {
    return this.http.get(`v1/items/admin/edit/${id}`)
      .map((res: Response) =>  {
        const result = res.json();
        if (result.message === 'Found') {
          const [item] = this.markUpPrice([result],0);
          return item;
        }
        return result;
      })
      .catch(err => Observable.of({}));
  }

  /**
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getItemAdmin(id: number): Observable<any> {
    return this.http.get(`v1/items/admin/${id}/partners`)
      .map((res: Response) =>  {
        const result = res.json();
        return result;
      })
      .catch(err => Observable.of({}));
  }

  getItemsAdmin(options ?: any): Observable<any> {
    const optionText = [];
    if (options.keyword) {
      options.keyword = encodeURI(encodeURIComponent(options.keyword));
    }
    if (options.brand) {
      options.brand = encodeURI(encodeURIComponent(options.brand));
    }
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        optionText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/items/admin?${optionText.join('&')}`)
      .map((res: Response) => {
        const itemList = res.json();
        if (itemList.list) {
          itemList['list'] = this.markUpPrice(itemList['list'],0);
          return itemList;
        }
        return [];
      })
      .catch(res => Observable.of([]));
  }

  getStoreItems(options?:any): Observable<any> {
    if (options.keyword) {
      options.keyword = encodeURI(encodeURIComponent(options.keyword));
    }
    if (options.brand) {
      options.brand = encodeURI(encodeURIComponent(options.brand));
    }
    const optionText = [];
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key] !== null && options[key] !== '') {
        optionText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/storeitems?${optionText.join('&')}`)
      .map((res: Response) => {
        const itemList = res.json();
        return Array.isArray(itemList) ? itemList: [];
      })
      .catch(res => Observable.of([]));
  }

  getStoreItem(itemId: number): Observable<any> {
    return this.http.get(`v1/storeitems/${itemId}/detailed`)
      .map((res: Response) => {
        return res.json();
      })
      .catch(res => Observable.of([]));
  }

  createStoreItem(data): Observable<any> {
    return this.http.post('v1/storeitems', data)
    .map((res: Response) => {
      return res.json();
    })
    .catch((error) => Observable.of({ message: 'Failed', error }));
  }

  updateStoreItem(data): Observable<any> {
    return this.http.put(`v1/storeitems/${data.id}`, data)
    .map((res: Response) => {
      return res.json();
    })
    .catch((error) => Observable.of({ message: 'Failed', error }));
  }

  getItemsAdminSortDesc(options ?: any): Observable<any> {
    const optionText = [];
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        optionText.push(`${key}=${options[key]}`);
      }
    });
    return this.http.get(`v1/items/admin?${optionText.join('&')}`)
      .map((res: Response) => {
        const itemList = res.json();
        itemList['list'] = this.markUpPrice(itemList['list'],0);
        return itemList;
      })
      .catch(res => Observable.of([]));
  }

  getItemBrands(): Observable<any> {
    return this.http.get(`v1/items/admin/brands`)
      .map((res: Response) => {
        const brandList = res.json();
        return brandList;
      })
      .catch(res => Observable.of([]));
  }

  getItemUseBarcode(barcode: string): Observable<any> {
    return this.http.get(`v1/items/admin/${barcode}`)
      .map((res: Response) =>  {
        const itemList = res.json();
        return this.markUpPrice(itemList,0)[0];
      })
      .catch(err => Observable.of({}));
  }

  /**
   * @param {number} order_id
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getPaymentDetailsPerOrder(orderId: number): Observable<any> {
    return this.http.get(`v1/orderpaymentdetails/order/${orderId}`)
      .map(res => {
        return res.json();
      })
      .catch(err => Observable.empty());
  }

  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updateOrderPaymentDetail(data: any): Observable<any> {
    return this.http.put(`v1/orderpaymentdetails/${data.id}`, data)
      .map(res => {
        return res.json();
      })
      .catch(err => Observable.empty());
  }

  /**
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getGiftCertificatesByOrder(orderId: number): Observable<any> {
    return this.http.get(`v1/gc/order/${orderId}`)
      .map((res: Response) => res.json())
      .catch(err => Observable.of([]));
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  getSalesReport(options ?: any, filters?: any): Observable<any> {
    const filterText = [];
    let keys = filters ? Object.keys(filters) : null;
    if (keys) {
      keys.forEach(key => {
        if (filters[key]) {
          filterText.push(`${key}=${filters[key]}`);
        }
      });
    }
    keys = options ? Object.keys(options) : null;
    if (keys) {
      keys.forEach(key => {
        if (options[key]) {
          filterText.push(`${key}=${options[key]}`);
        }
      });
    }
    return this.http.get(`v1/reportsales?${filterText.join('&')}`)
    .map(res => {
      return res.json();
    })
    .catch(err => Observable.empty());

  }

  /**
   * @param {number} partnerId
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  getTimeSlotsByPartnerId(partnerId: number): Observable<object> {
    return this.http.get(`v1/timeslotorder/partner/${partnerId}`)
      .map((res: Response) => res.json());
  }

  /**
   * @param {number} partnerId
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  getTimeSlotsByPartnerStoreId(partnerId: number): Observable<object> {
    return this.http.get(`v1/timeslots/partner/${partnerId}`)
      .map((res: Response) => res.json());
  }

  /**
   * @param {number} partnerId
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  createTimeSlotsByPartnerId(partnerId: number): Observable<object> {
    return this.http.post(`v1/timeslots/partner/${partnerId}`, {})
      .map((res: Response) => {
        const response = res.json();
        if (response.message === 'Saved') {
          this.http.loading.next({
            loading: false,
            isSuccess: true,
            hasMsg: response.message,
            reset: 4500
          });
        } else {
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: response.message,
            reset: 4500
          });
        }
        return response;
      });
  }

  /**
   * @param {number} partnerId
   * @param {Array<any>} data
   * @returns {Observable<any>}
   *
   * @memberof AdminService
   */
  updateTimeSlotsByPartnerId(partnerId: number, data: Array<any>): Observable<any> {
    return this.http.put(`v1/timeslots/partner/${partnerId}`, data)
      .map((res: Response) => {
        const response = res.json();
        if (response.message.indexOf('Updated') >= 0) {
          this.http.loading.next({
            loading: false,
            isSuccess: true,
            hasMsg: response.message,
            reset: 4500
          });
        } else {
          this.http.loading.next({
            loading: false,
            hasError: true,
            hasMsg: response.message,
            reset: 4500
          });
        }
        return response;
      });
  }

  /**
   *
   *
   * @returns {Observable<user[]>}
   *
   * @memberof AdminService
   */
  getPartners(options?: any): Observable<any> {
    const optionText = [];
    if (options) {
      const keys = Object.keys(options);
      keys.forEach(key => {
        if (options[key]) {
          optionText.push(`${key}=${options[key]}`);
        }
      });
    }
    return this.http.get(`v1/partners?${optionText.join('&')}`)
      .map((res: Response) => {
        return res.json();
      });
  }

  getPartner(id: number): Observable<any> {
    return this.http.get(`v1/partners/${id}`)
      .map((res: Response) => {
        return res.json();
      });
  }

  addPartner(data: any): Observable<any> {
    return this.http.post(`v1/partners`, data)
      .map((res: Response) => {
        const response = res.json();
        const msgObj = {
          loading: false,
          hasMsg: response.message,
          reset: 4500,
        };
        if (response.message === 'Saved') {
          this.http.loading.next(Object.assign(msgObj, { isSuccess: true }));
        } else {
          this.http.loading.next(Object.assign(msgObj, { hasError: true }));
        }
        return response;
      });
  }

  updatePartner(data: any): Observable<any> {
    return this.http.put(`v1/partners/${data.id}`, data)
      .map((res: Response) => {
        const response = res.json();
        const msgObj = {
          loading: false,
          hasMsg: response.message,
          reset: 4500,
        };
        if (response.message.indexOf('Updated') >= 0) {
          this.http.loading.next(Object.assign(msgObj, { isSuccess : true }));
        } else {
          this.http.loading.next(Object.assign(msgObj, { hasError: true }));
        }
        return response;
      });
  }

  getCustomers(options?: any): Observable<any> {
    const optionText = [];
    if (options) {
      const keys = Object.keys(options);
      keys.forEach(key => {
        if (options[key]) {
          optionText.push(`${key}=${options[key]}`);
        }
      });
    }
    return this.http.get(`v1/users?${optionText.join('&')}`)
      .map((res: Response) => {
        return res.json();
      });
  }

  getCustomer(id: number): Observable<any> {
    return this.http.get(`v1/users/${id}`)
      .map((res: Response) => {
        return res.json();
      });
  }

  resetPasswordCustomer(email: string): Observable<any> {
    return this.http.post(`v1/users/${email}/forgotpassword`, {
      email: email
    }).map((res: Response) => {
      const response = res.json();
      const msgObj = {
        loading: false,
        hasMsg: response.message,
        reset: 4500,
      };
      if (response.message === 'Success') {
        msgObj.hasMsg = 'Password reset email sent';
        this.http.loading.next(Object.assign(msgObj, { isSuccess : true }));
      } else {
        this.http.loading.next(Object.assign(msgObj, { hasError: true }));
      }
    });
  }

  /**
   *
   * @param {string} message
   * @returns {void}
   *
   * @memberof AdminService
   */
  showErrorMsg(message: string): void {
    this.http.loading.next({
      loading: false,
      hasError: true,
      hasMsg: message,
      reset: 4500
    });
  }

  /**
   *
   * @param {string} message
   * @returns {void}
   *
   * @memberof AdminService
   */
  showSuccessMsg(message: string): void {
    this.http.loading.next({
      loading: false,
      isSuccess: true,
      hasMsg: message,
      reset: 4500
    });
  }
  /**
   *
   *
   * @private
   * @param {any} user_data
   *
   * @memberof AdminService
   */
  private setTokenInLocalStorage(user_data): void {
    const jsonData = JSON.stringify(user_data);
    localStorage.setItem('user', jsonData);
  }

  /**
   *
   *
   * @returns {Observable<history[]>}
   *
   * @memberof AdminService
   */
  getItemHistory(options ?: any): Observable<any[]> {
    const optionText = [];
    if (options) {
      const keys = Object.keys(options);
      keys.forEach(key => {
        if (options[key]) {
          optionText.push(`${key}=${options[key]}`);
        }
      });
    }
    return this.http.get(`v1/pricehistory?${optionText.join('&')}`)
      .map((res: Response) => res.json())
      .catch(res => Observable.of([]));
  }

  markUpPrice(items: any, markUp: number): any {
    return items.map((item) => {
      const price = Number(item.price);
      let increase = Number(price * markUp);
      increase = Number(Math.round(Number(increase + 'e2')) + 'e-2');
      item.price = price + increase;
      let strPrice = item.price.toString();
      let newPrice = '';
      if (!Number.isInteger(item.price)) {
        if (strPrice.length > 7) {
          item.price = Number(Math.round(Number(item.price + 'e2')) + 'e-2');
          strPrice = item.price.toString();
        }
        const lastDec = strPrice.charAt(strPrice.length - 1);
        const firstDec = strPrice.charAt(strPrice.length - 2);
        let noDecimal = strPrice.substring(0, strPrice.indexOf('.'));
        noDecimal = noDecimal + '.';
        const decimal = firstDec + lastDec;
        let numDecimal = Number(decimal);
        if (Number(numDecimal) > 0.99 ) {
          numDecimal = Math.ceil(numDecimal / 5) * 5;
        } else {
          numDecimal = lastDec;
        }
        if (numDecimal < 100) {
          newPrice = noDecimal + numDecimal.toString();
        } else {
          numDecimal = numDecimal / 100;
          const addNums = Number(noDecimal) + numDecimal;
          newPrice = addNums.toString();
        }
      } else {
        newPrice = item.price.toString();
      }
      item.price = Number(newPrice);
      item.displayPrice = item.price;
      return item;
    });
  }

  /**
   * @param {string} filename
   * @param {string} cont
   * @returns {Observable<object>}
   *
   * @memberof CheckoutService
   */
  uploadFileToS3(file: File, rename: string): Observable<any> {
    return this.http.get(`v1/upload?filename=${rename}&content_type=${file.type}`)
      .map((res: Response) => res.json())
      .mergeMap((response) => {
        const fd = new FormData();
        fd.append('key', rename);
        fd.append('acl', response.params.acl);
        fd.append('Content-Type', file.type);
        fd.append('policy', response.params.policy);
        fd.append('x-amz-algorithm', response.params['x-amz-algorithm']);
        fd.append('x-amz-credential', response.params['x-amz-credential']);
        fd.append('x-amz-date', response.params['x-amz-date']);
        fd.append('x-amz-signature', response.params['x-amz-signature']);
        fd.append('success_action_status', response.params['success_action_status'])
        fd.append('file', file);
        return this.http.post3rdParty('s3', response.endpoint_url, fd);
      })
      .map((res: Response) => res.json())
      .catch(() => Observable.of({}));
  }

  /**
   *
   *
   * @returns {Observable<storetypes>}
   *
   * @memberof AdminService
   */
  getStoreTypes(): Observable<any[]> {
    return this.http.get(`v1/store/types`)
      .map((res: Response) => res.json())
      .catch(res => Observable.of([]));
  }

}
