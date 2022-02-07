import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
<<<<<<< HEAD
import { CartModel, CategoryModel } from '../../types/model';
import { ShopRootState } from '../../types/redux/ShopReducer';
import { fetchCategories, pushCartItem, setCartItems } from '../actions/shopActions';
=======
import { CartModel, CategoryModel, BrandModel } from '../../types/model';
import { ShopRootState } from '../../types/redux/ShopReducer';
import { fetchCategories, fetchBrand, pushCartItem, setCartItems } from '../actions/shopActions';
>>>>>>> origin/Develop

export const shopSlice = createSlice<ShopRootState, SliceCaseReducers<ShopRootState>, 'shop'>({
  name: 'shop',
  initialState: {
    cart_items: [],
    categories: [],
<<<<<<< HEAD
=======
    brands: [],
>>>>>>> origin/Develop
  },
  reducers: {
    setCartItems: (state, action: PayloadAction<CartModel[]>) => {
      return {
        ...state,
        cart_items: action.payload,
      };
    },
    setCategories: (state, action: PayloadAction<CategoryModel[]>) => {
      return {
        ...state,
        categories: action.payload,
      };
    },
<<<<<<< HEAD
=======
    setBrand: (state, action: PayloadAction<BrandModel[]>) => {
      return {
        ...state,
        brands: action.payload,
      };
    },
>>>>>>> origin/Develop
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        return {
          ...state,
          categories: action.payload,
        };
      })
<<<<<<< HEAD
=======
      .addCase(fetchBrand.fulfilled, (state, action) => {
        return {
          ...state,
          brands: action.payload,
        };
      })
>>>>>>> origin/Develop
      .addCase(setCartItems.fulfilled, (state, action) => {
        return {
          ...state,
          cart_items: action.payload,
        };
      })
      .addCase(pushCartItem.fulfilled, (state, action) => {
        return {
          ...state,
          cart_items: action.payload,
        };
      });
  }
})

// Action creators are generated for each case reducer function
export const {
  setCartItems: setShopCartItems,
  setCategories: setShopCategories,
<<<<<<< HEAD
=======
  setBrand: setShopBrand,
>>>>>>> origin/Develop
} = shopSlice.actions;

export default shopSlice.reducer;
