export type ProductModel = {
  id?: number;

  image?: any;

  name?: string;
  sku?: string;
  merk?: string;

  longdesc?: string;
  description?: string;
  tested?: string;
  certificate?: string;

  discount?: number;
  types?: ProductType[];

  rating?: number;
  reviews?: ReviewModel[];
  sales_count?: number;

  categories?: CategoryModel[];
  brands?: BrandModel[];

  favorite?: boolean;

  // API Responses
  prd_id?: string;
  prd_ds?: string;
  prd_no?: string;
  product_info?: string;

  prd_foto?: string;
  images?: ProductPhoto[];

  prd_favorit?: '0' | '1';

  faktor_refill?: string;
  unit_refill?: string;

  harga?: number;
  harga_promo?: number;
  // harga_reseller?: number;
  // harga_refill?: number;

  diskon?: string;

  [key: string]: any;
};

export type ProductType = {
  name: string;
  price: number;
  contents?: string[];
  enabled?: boolean;
  type?: CartItemType;
};

export type ProductRetail = {
  name?: string;
  link?: string;
};

export type ProductPhoto = {
  id?: string;
  prd_foto?: string;
  tgl?: string;
};

export type CategoryModel = {
  id?: string;
  name?: string;
  ds?: string;
  image?: any;
  foto?: string;
};

export type BrandModel = {
  id?: string;
  name?: string;
  fotobrand?: string;
  codebrand?: string;
  imgbrand?: any;
  imgbrandbg?: any;
};

export type ReviewModel = {
  rating?: number;
  content?: string;
  name?: string;
  date?: string;
  product?: ProductModel;
  replies?: ReviewModel[];

  id?: string;
  nama?: string;
  tgl?: string;
  jam?: string;
  star?: number;
  stat?: number;
  remark?: string;
};

export type CartModel = {
  id?: number;
  product_id?: number;
  product?: ProductModel;
  price_original?: number;
  price?: number;
  qty?: number;
  note?: string;

  prd_id?: string;
  harga?: number;
  refill?: '1' | '0';
  type?: CartItemType;
};

export type CartItemType = 'reseller' | 'retail' | 'refill';
