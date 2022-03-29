import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { CartModel, CategoryModel, BrandModel, GenderModel, ModelKacamata } from '../../types/model';
import { ShopRootState } from '../../types/redux/ShopReducer';
import { fetchCategories, fetchBrand, pushCartItem, setCartItems, fetchGender, fetchModelKacamata } from '../actions/shopActions';

export const shopSlice = createSlice<ShopRootState, SliceCaseReducers<ShopRootState>, 'shop'>({
  name: 'shop',
  initialState: {
    cart_items: [],
    categories: [],
    brands: [],
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
    setBrand: (state, action: PayloadAction<BrandModel[]>) => {
      return {
        ...state,
        brands: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        return {
          ...state,
          categories: action.payload,
        };
      })
      .addCase(fetchGender.fulfilled, (state, action) => {
        return {
          ...state,
          genders: action.payload,
        };
      })
      .addCase(fetchModelKacamata.fulfilled, (state, action) => {
        return {
          ...state,
          modelkacamata: action.payload,
        };
      })
      .addCase(fetchBrand.fulfilled, (state, action) => {
        return {
          ...state,
          brands: action.payload,
        };
      })
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
  setBrand: setShopBrand,
} = shopSlice.actions;

export default shopSlice.reducer;
