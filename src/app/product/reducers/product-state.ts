import { Taxonomy } from './../../core/models/taxonomy';
import { Taxon } from './../../core/models/taxon';
/**
 * Read more about Immutable Records here
 * 1. https://coderwall.com/p/vxk_tg/using-immutable-js-in-typescript
 * 2. http://untangled.io/immutable-js-the-foolproof-guide-to-creating-lists/
 * 3. https://blog.jscrambler.com/immutable-data-immutable-js/
 * 4. https://medium.com/azendoo-team/immutable-record-react-redux-99f389ed676#.91s1g124s
 */

import { Product } from './../../core/models/product';
import { Item } from './../../core/models/item';
import { Category } from './../../core/models/category';
import { Map, Record, List, fromJS } from 'immutable';

export interface ProductState extends Map<string, any> {
  productIds: List<number>;
  productEntities: Map<number, Item>;
  selectedProductId: number;
  selectedProduct: any;
  categories: List<Category>;
  partnerStore: any;
}

export const ProductStateRecord = Record({
  productIds: List([]),
  productEntities: Map({}),
  selectedProductId: Map({}),
  selectedProduct: fromJS({}),
  categories: List([]),
  partnerStore: fromJS({}),
});
