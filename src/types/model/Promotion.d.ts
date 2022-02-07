export type PromotionModel = {
  // id?: number;
  title?: string;
  image?: string;
  content?: string;

  // API
  PromoID?: string;
  PromoImage?: string;
  PromoName?: string;
  PromoDescription?: string;
  description?: string;
  remark?: string;
};

export type PopupModel = {
  image?: string;
  bg?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  html?: string;
  disclaimer?: string;
  actions?: PopupActionType[];
};

export type PopupActionType = {
  image?: string;
  url?: string;
};
<<<<<<< HEAD

export type BannerModel = {
  banner_id?: string;
  banner_ds?: string;
  banner_foto?: string;
  banner_ul?: string;
  banner_remark?: string;
};
=======
>>>>>>> origin/Develop
