import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { CartModel, CategoryModel } from '../../types/model';
import { ShopRootState } from '../../types/redux/ShopReducer';
import { fetchCategories, pushCartItem, setCartItems } from '../actions/shopActions';

export const shopSlice = createSlice<ShopRootState, SliceCaseReducers<ShopRootState>, 'shop'>({
  name: 'shop',
  initialState: {
    cart_items: [],
    categories: [],
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        return {
          ...state,
          categories: action.payload,
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
} = shopSlice.actions;

export default shopSlice.reducer;
