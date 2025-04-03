import { Observable } from 'rxjs/Observable';
import { HttpService } from './http';
import { Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';

@Injectable()
export class ProductService {

  /**
   * Creates an instance of ProductService.
   * @param {HttpService} http
   *
   * @memberof ProductService
   */
  constructor(private http: HttpService) {

   }

  /**
   *
   *
   * @param {number} id
   * @returns {Observable<any>}
   *
   * @memberof ProductService
   */
  getProduct(id: number): Observable<any> {
    return this.http.get(`v1/storeitems/${id}/detailed`)
      .map(res => {
        const result = res.json();
        if (result.message === 'Found') {
          const [item] = this.markUpPrice([result]);
          return item;
        }
        return result;
      })
      .catch(err => Observable.of({}));
  }

  /**
   *
   * @param {any} options
   * @returns {Observable<Array<any>>}
   *
   * @memberof ProductService
   */
  getProducts(options: any): Observable<any> {
    const _options = Object.assign({}, options);
    if (_options.keyword) {
      if (!Number.isNaN(Number(_options.keyword))) {
        _options['code'] = _options.keyword;
        delete options.keyword;
      } else {
        _options.keyword = encodeURI(encodeURIComponent(_options.keyword));
      }
    }
    const optionsText = [];
    const keys = Object.keys(_options);
    keys.forEach(key => {
      if (_options[key]) {
        optionsText.push(`${key}=${_options[key]}`);
      }
    });
    return this.http.get(`v1/storeitems?${optionsText.join('&')}`)
      .map(res => {
        const items = res.json();
        if (!items.length) {
          return [];
        }
        return this.markUpPrice(items);
      })
      .catch(err => Observable.of([]));
  }

  /**
   *
   *
   * @returns {Observable<Array<any>>}
   *
   * @memberof ProductService
   */
  getCategories(): Observable<any> {
    return this.http.get(`v1/category/list`)
    .map(res => res.json())
    .catch(err => Observable.of([]));
  }

  /**
   *
   *
   * @returns {Observable<Array<any>>}
   *
   * @memberof ProductService
   */
  getStoreCategories(id: any): Observable<any> {
    return this.http.get(`v1/category/store/${id}`)
    .map(res => res.json())
    .catch(err => Observable.of([]));
  }
  /**
   *
   *
   * @param {string} keyword
   * @param {number} partnerId
   * @param {number} limit optional, default = 5
   * @returns {Observable<any>}
   *
   * @memberof ProductService
   */
  getSearchItems(keyword: string, partnerId: number, limit = 5): Observable<any> {
    const word = encodeURI(encodeURIComponent(keyword));
    return this.http.get(`v1/storeitems/search?limit=${limit}&keyword=${word}&partnerId=${partnerId}`)
      .map(res => {
        const results = res.json();
        results.items = this.markUpPrice(results.items);
        return results;
      })
      .catch(() => Observable.of({ items: [], categories: [] }));
  }

  /**
   * @returns {<Observable<Array<Items>>}
   *
   * @memberof ProductService
   */
  getSuggestedItems(id: number, partnerId: number): any {
    return this.http.get(`v1/storeitems/${id}/related?partnerId=${partnerId}&limit=16&suggestions=1`)
    .map(res => {
      return this.markUpPrice(res.json());
    })
    .catch(err => Observable.of([]));
  }

  /**
   *
   *
   * @param {number} id
   * @param {number} partnerId
   * @param {number} keyword
   * @returns {<Observable<Array<Items>>}
   *
   * @memberof ProductService
   */
  getSubstituteItems(id: number, keyword: string, partnerId: number): any {
    const params = `partnerId=${partnerId}&limit=12&substitutes=1&keyword=${keyword}`;
    return this.http.get(`v1/storeitems/${id}/related?${params}`)
    .map(res => {
      const itemList = res.json();
      return this.markUpPrice(itemList);
    })
    .catch(err => Observable.of([]));
  }

  /**
   *
   *
   * @param {number} partnerId
   * @returns {<Observable<Array<object>>}
   *
   * @memberof ProductService
   */
  getStoreCatalog(partnerId: number, sortBy = 'rank'): Observable<Array<object>> {
    return this.http.get(`v1/storecatalogs?partnerId=${partnerId}&sortBy=${sortBy}`)
      .map(res => res.json())
      .catch(err => Observable.of([]));
  }

  /**
   *
   *
   * @param {Array<Items>} items
   * @returns {Item}
   *
   * @memberof ProductService
   */
  markUpPrice(items: Array<any>, _markup ?: number): Array<any> {
    let markup;
    if (_markup === undefined || _markup === null) {
      const partnerStore = JSON.parse(localStorage.getItem('partnerStore')) ? JSON.parse(localStorage.getItem('partnerStore')) : [];
      markup = partnerStore.markup ? Number(partnerStore.markup) : 0;
    } else {
      markup = _markup;
    }
    return items.map((item) => {
      const price = Number(item.price);
      let increase = Number(price * markup);
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
      return item;
    });
  }

}
