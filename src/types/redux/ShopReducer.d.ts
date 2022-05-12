import { CartModel, CategoryModel, BrandModel, GenderModel } from "../model";

export type ShopRootState = {
  cart_items?: CartModel[];
  categories?: CategoryModel[];
  brands?: BrandModel[];
  // genders?: GenderModel[];
};
