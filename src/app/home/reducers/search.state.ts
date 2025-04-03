/** Search state
 * [{
 *   name: 'Bag',
 *   taxonId: 1
 * }, {
 *   name: 'T-shirts',
 *   taxonId: 9
 * }]
 *
*/

import { List, Record, Map, fromJS } from 'immutable';

export interface SearchState extends Map<string, any> {
  selectedFilters: List<Map<string, any>>;
  selectedTaxonIds: List<number>;
  sorting: any;
  filters: any;
}

export const SearchStateRecord = Record({
  selectedFilters: List([]),
  selectedTaxonIds: List([]),
  sorting: fromJS({}),
  filters: fromJS({}),
});
