import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../../core/services/http';

@Injectable()
export class ToolsService {

  constructor(
    private http: HttpService,
  ) { }

  /**
   * @param {object} options
   * @returns {Observable<any>}
   *
   * @memberof ToolsService
   */
  getPageSettingList(options?: any): Observable<any> {
    const optionText = [];
    const keys = Object.keys(options);
    keys.forEach(key => {
      if (options[key]) {
        optionText.push(`${key}=${options[key]}`)
      }
    });    
    return this.http.get(`v1/pagesettings?${optionText.join('&')}`)
      .map((res: Response) => res.json())
      .catch((err: any) => Observable.of([]));
  }

  /**
   * @param {object} options
   * @returns {Observable<any>}
   *
   * @memberof ToolsService
   */
  getPageSetting(id: number): Observable<any> { 
    return this.http.get(`v1/pagesettings/${id}`)
      .map((res: Response) => res.json())
      .catch((err: any) => Observable.of({}));
  }

  /**
   * @param {object} data
   * @returns {Observable<any>}
   *
   * @memberof ToolsService
   */
  addPageSetting(data: any): Observable<any> { 
    return this.http.post(`v1/pagesettings`, data)
      .map((res: Response) => {
        const response = res.json() as any;
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
      })
      .catch((err: any) => Observable.of({}));
  }

  /**
   * @param {object} data
   * @returns {Observable<any>}
   *
   * @memberof ToolsService
   */
  updatePageSetting(data: any): Observable<any> { 
    return this.http.put(`v1/pagesettings/${data.id}`, data)
      .map((res: Response) => {
        const response = res.json() as any;
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
      })
      .catch((err: any) => Observable.of({}));
  }

  /**
   *
   * @param {string} message
   * @returns {void}
   *
   * @memberof ToolsService
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
   * @memberof ToolsService
   */
  showSuccessMsg(message: string): void {
    this.http.loading.next({
      loading: false,
      isSuccess: true,
      hasMsg: message,
      reset: 4500
    });
  }
}