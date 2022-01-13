import { CartModel, CategoryModel, BrandModel } from "../model";

export type ShopRootState = {
  cart_items?: CartModel[];
  categories?: CategoryModel[];
  brands?: BrandModel[];
};
