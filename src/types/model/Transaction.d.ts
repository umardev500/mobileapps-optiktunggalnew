import { AddressModel, CartModel } from ".";

export type TransactionModel = {
  id?: string;
  invoice?: string;
  invoice_url?: string;
  status?: TransactionStatus;
  payment_status?: TransactionPaymentStatus;
  order_at?: string;
  cart_items?: CartModel[];
  address?: AddressModel;
  payment_method?: PaymentMethodType;
  price_total?: number;
  price_courier?: number;
  grand_total?: number;
  payment_picture?: any;
  logs?: TransactionLog[];
  totalbelanja?: number;
  orderno?: string;
  orderstatus?: TransactionStatus;
  ordertgl?: string;
  methodid?: string;
  methodds?: string;
  currds?: string;
  password?: string;
};

type TransactionStatus = 'nklunas' | 'nplunas' | 'npfullpay' | 'npnotpay' | 'open' | 'confirm' | 'do';

type TransactionPaymentStatus = 'pending' | 'unpaid' | 'paid' | 'reject';

export type PaymentMethodType = {
  label?: string;
  method?: 'cod' | 'transfer';
  image?: any;
  nama?: string;
  remark?: string;
  foto1?: string;
};

export type TransactionLog = {
  date?: string;
  description?: string;
};

export type InvoiceType = {
  url: string;
};

export { TransactionStatus, TransactionPaymentStatus };
