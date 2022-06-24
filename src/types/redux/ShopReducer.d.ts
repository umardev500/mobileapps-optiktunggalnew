import { CartModel, CategoryModel, BrandModel, GenderModel, ColorModel } from "../model";

export type ShopRootState = {
  cart_items?: CartModel[];
  categories?: CategoryModel[];
  brands?: BrandModel[];
  warnas?: ColorModel[];
  // genders?: GenderModel[];
};
