import { List } from 'immutable';
import { SearchActions } from './search.actions';
import { ActionReducer, Action } from '@ngrx/store';
import { SearchState, SearchStateRecord } from './search.state';

export const initialState: SearchState = new SearchStateRecord() as SearchState;

export const searchReducer: ActionReducer<SearchState> =
  (state: SearchState = initialState, {type, payload}: Action): SearchState => {
    let _selectedFilters, _selectedTaxonIds;

    switch (type) {
      case SearchActions.ADD_FILTER:
        let filterAlreadyPresent = false;
        state.selectedFilters.forEach(filter => {
          const filterId = filter['id'];
          if (filterId === payload.id) {
            filterAlreadyPresent = true;
          }
        });

        if (filterAlreadyPresent) {
          return state;
        } else {
          _selectedFilters = state.selectedFilters.concat([payload]);
          _selectedTaxonIds = state.selectedTaxonIds.concat(payload.id);
          return state.merge({
            selectedFilters: _selectedFilters,
            selectedTaxonIds: _selectedTaxonIds
          }) as SearchState;
        }

      case SearchActions.REMOVE_FILTER:
        let removeIndex = -1;
        state.selectedFilters.forEach((filter, index) => {
          const filterId = filter['id'];
          if (filterId === payload.id) {
            removeIndex = index;
          }
        });
        _selectedFilters = state.selectedFilters.remove(removeIndex);
        const taxonRemoveIndex = state.selectedTaxonIds.findIndex(filterId => payload.id === filterId);
        _selectedTaxonIds = state.selectedTaxonIds.remove(taxonRemoveIndex);
        return state.merge({
            selectedFilters: _selectedFilters,
            selectedTaxonIds: _selectedTaxonIds
        }) as SearchState;

      case SearchActions.SET_FILTER:
        return state.merge({
          filters: payload,
        }) as SearchState;

      case SearchActions.SET_SORTING:
        return state.merge({
          sorting: payload
        }) as SearchState;

      default:
        return state;
    }
  };
