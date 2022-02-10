import { createAsyncThunk } from "@reduxjs/toolkit";
import { httpService, Storage } from "../../lib/utilities";
import { CartModel, CategoryModel, BrandModel } from "../../types/model";
import { RootStoreState } from "../store";

export const fetchCategories = createAsyncThunk('shop/fetchCategories', async () => {
  let categories: CategoryModel[] = [];

  await httpService('/api/category', {
    data: {
      act: 'PrdCatList',
      dt: JSON.stringify({ comp: '001' }),
    },
  }).then(({ status, data }) => {
    if (status === 200) {
      categories = data;
    }
  });

  return categories;
});

export const fetchBrand = createAsyncThunk('shop/fetchBrand', async () => {
  let brands: BrandModel[] = [];

  await httpService('/api/brand/brand', {
    data: {
      act: 'BrandList',
    },
  }).then(({ status, data }) => {
    if (status === 200) {
      brands = data;
    }
  });

  return brands;
});

export const setCartItems = createAsyncThunk('shop/setCartItems', async (items: CartModel[]) => {
  await Storage.storeData('cart_items', items);

  return items;
});

export const pushCartItem = createAsyncThunk('shop/pushCartItem', async (item: CartModel, { getState }) => {
  const { shop, user: { user } } = getState() as RootStoreState;
  const { cart_items = [] } = shop;
  const { product } = item;

  let shouldPush = true;
  item.harga = 0;

  // switch (item.type) {
  //   case 'reseller':
  //     item.harga = product?.harga_reseller;
  //     break;
  //   case 'retail':
  //     item.harga = product?.harga_retail;
  //     break;
  //   case 'refill':
  //     item.harga = product?.harga_refill;
  //     break;
  // }

  const newCartItems: CartModel[] = [...cart_items].map((cartItem) => {
    if (cartItem.prd_id === product?.prd_id && item.type === cartItem.type) {
      const newItem = { ...cartItem };

      newItem.qty = (newItem.qty || 0) + 1;
      shouldPush = false;

      return newItem;
    }

    return cartItem;
  });

  if (shouldPush) {
    newCartItems.push({
      ...item,
      ...(!product?.prd_id ? null : { prd_id: product?.prd_id }),
      qty: 1,
    });
  }

  await Storage.storeData('cart_items', newCartItems);

  return newCartItems;
});
