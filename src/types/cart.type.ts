import { ProductType } from './product.type';

export type CartItemType = {
  product: ProductType;
  quantity: number;
};

export type CartType = {
  items: CartItemType[];
};

export type CartCountType = {
  count: number;
};
