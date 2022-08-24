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
  brandcl?: BrandCLModel[];
  warnas?: ColorModel[];
  spheries?: SpheriesModel[];
  genders?: GenderModel[];
  modelkacamatas?: ModelKacamata[];

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

// export type UserExistModel = {
//   id?: string;
//   nama_lengkap?: string;
//   namadepan?: string;
//   namabelakang?: string;
//   hp?: string;
//   jl?: string;
// };

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

  keywords?: string;
};

export type GenderModel = {
  id?: string;
  name?: string;
  ds?: string;
  image?: any;
  foto?: string;
};

export type ModelKacamata = {
  id?: string;
  name?: string;
  ds?: string;
};

export type BrandModel = {
  id?: any;
  name?: any;
  fotobrand?: string;
  codebrand?: any;
  imgbrand?: any;
  imgbrandbg?: any;
};

export type BrandCLModel = {
  id?: any;
  name?: any;
  fotobrand?: string;
  codebrand?: any;
  imgbrand?: any;
  imgbrandbg?: any;
};

export type ColorModel = {
  id?: any;
  kd_warna?: any;
  nm_warna?: string;
};

export type SpheriesModel = {
  id?: any;
  kd_sph?: any;
  ket?: any
};

export type BaseCurveModel = {
  id?: any;
  code?: any;
  name?: any;
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
  atributColor?: string;
  atributColor2?: string;
  atributSpheries?: string;
  atributSpheries2?: string;
  atributBcurve?: string;
  atributBcurve2?: string;
  jenisproduk?: string;
  matakiri?: any;
  matakanan?: any;
  price_original?: number;
  price?: number;
  qty?: number;
  qty2?: number;
  note?: string;
  prd_id?: string;
  harga?: number;
  buyer?: '1' | '0';
  type?: CartItemType;
};


export type CartItemType = 'buyer';
