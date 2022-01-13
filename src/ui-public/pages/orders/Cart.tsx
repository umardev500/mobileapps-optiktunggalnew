import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { CartModel, Modelable } from '../../../types/model';
import { Button, PressableBox, TextField, TextFieldNumber, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import Ionicons from 'react-native-vector-icons/Ionicons';
import numeral from 'numeral';
import { useAppSelector } from '../../../redux/hooks';
import { useDispatch } from 'react-redux';
import { setCartItems } from '../../../redux/actions/shopActions';
import { httpService } from '../../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { default as startCase } from 'lodash/startCase';

type OptionsState = {
  cartSelected?: number[];
  notes?: number[];
};

function Cart() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { user: { user }, shop: { cart_items } } = useAppSelector((state) => state);
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [options, setOptions] = useState<OptionsState>({
    cartSelected: [],
    notes: [],
  });
  const [price, setPrice] = useState({
    original: 0,
    total: 0,
    totalReseller: 0,
    orderfirst: 0,
    ordernext: 0,
    isLoaded: false,
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    setCart(state => ({
      ...state,
      models: (cart_items || []).filter((item) => !!item.prd_id),
      modelsLoaded: true,
    }));
  }, [cart_items]);

  useEffect(() => {
    calculatePrice();
  }, [options.cartSelected, cart.models]);

  useEffect(() => {
    if (cart.modelsLoaded) {
      handleSelectAll();
    }
  }, [cart.modelsLoaded]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveConfig();

    setIsLoading(false);
  };

  const retrieveConfig = async () => {
    return httpService('/order/list', {
      data: {
        act: 'ConfigInfo',
        dt: JSON.stringify({ comp: '001' }),
      },
    }).then(({ status, data }) => {
      if (200 === status) {
        setPrice(state => ({
          ...state,
          orderfirst: parseFloat(data.orderfirst || '0'),
          ordernext: parseFloat(data.ordernext || '0'),
          isLoaded: true
        }));
      }
    }).catch((err) => {
      setPrice(state => ({
        ...state,
        isLoaded: true
      }));
    });
  }

  const handleSelectAll = () => {
    const { cartSelected = [] } = options;
    const newSelected = cartSelected.length !== cart.models?.length ? (
      cart.models?.map((item, index) => index)
    ) : [];

    setOptions(state => ({
      ...state,
      cartSelected: newSelected,
    }));
  };

  const handleSelect = (cartItem: CartModel, index?: number) => {
    const { cartSelected = [] } = options;
    const findIndex = index === undefined ? -1 : index;
    const isSelected = cartSelected.indexOf(findIndex) >= 0;

    setOptions(state => ({
      ...state,
      cartSelected: isSelected ? cartSelected.filter((item) => findIndex !== item) : [
        ...cartSelected,
        findIndex
      ],
    }));
  };

  const handleNoteShow = (cartItem: CartModel, index?: number) => {
    const { notes = [] } = options;
    const findIndex = index === undefined ? -1 : index;
    const isSelected = notes.indexOf(findIndex) >= 0;

    setOptions(state => ({
      ...state,
      notes: isSelected ? notes.filter((item) => {
        return cartItem.note ? true : (findIndex !== item);
      }) : [
        ...notes,
        findIndex
      ],
    }));
  };

  const handleQtyChange = (
    change: '+' | '-' | 'remove' | number,
    cartItem: CartModel,
    index?: number,
    alert = true
  ) => {
    const { cartSelected = [] } = options;
    const amount = '+' === change ? 1 : -1;
    const newQty = 'number' === typeof change ? change : (
      'remove' === change ? 0 : (
        (cartItem.qty || 0) + amount
      )
    );
    const findIndex = index === undefined ? -1 : index;
    const isSelected = cartSelected.indexOf(findIndex) >= 0;

    if (newQty <= 0 && alert) {
      return handleCartRemove(cartItem, index);
    }

    const newCartItems = (cart.models || []).map((item, i) => {
      if (i === index) {
        const newItem = { ...item };

        newItem.qty = newQty;

        return newItem;
      }

      return item;
    }).filter(({ qty = 0 }) => 'number' === typeof change ? true : qty > 0);

    dispatch(setCartItems(newCartItems));

    // Select item if amount +
    if (newQty <= 0 && isSelected) {
      setOptions(state => ({
        ...state,
        cartSelected: cartSelected.filter((item) => item !== index),
      }));
    } else if (!isSelected) {
      setOptions(state => ({
        ...state,
        cartSelected: [...cartSelected, findIndex],
      }));
    }
  };

  const handleCartRemove = (cartItem: CartModel, index?: number) => {
    Alert.alert(
      `${t('Keranjang')}`,
      `${t('Apakah Anda ingin menghapus produk ini dari keranjang?')}`,
      [
        {
          text: `${t('Batal')}`,
        },
        {
          text: `${t('Hapus')}`,
          onPress: () => handleQtyChange('remove', cartItem, index, false),
        }
      ]
    );
  };

  const handleCheckout = () => {
    const { models = [] } = cart;
    const { cartSelected = [] } = options;

    if (!cartSelected.length) {
      return Alert.alert(
        `${t('Produk belum dipilih')}`,
        `${t('Pilih dengan cara mencentang produk yang ingin Anda beli.')}`,
      );
    }

    if (!user) {
      return navigation.navigatePath('Public', {
        screen: 'BottomTabs.AccountStack.Account',
        params: [null, null, { action: 'cart' }]
      });
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Checkout',
      params: [null, null, {
        cart_items: models.filter((item, index) => {
          return cartSelected.indexOf(index) >= 0;
        }),
      }],
    });
  };

  const calculatePrice = () => {
    const { cartSelected = [] } = options;

    let original = 0;
    let total = 0;
    let totalReseller = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      if (cartSelected.indexOf(index) >= 0) {
        const { product: itemProduct } = item;
        const discount = user?.reseller === '1' ? itemProduct?.disc_reseller : itemProduct?.disc_retail;
        const subtotalOriginal = ((item.harga || 0) * 100 / (100 - parseFloat(discount || '0'))) * qty;
        const subtotal = (item.harga || 0) * qty;

        original += subtotalOriginal;
        total += subtotal;

        if ('reseller' === item.type) {
          totalReseller += subtotal;
        }
      }
    });

    setPrice(state => ({
      ...state,
      original,
      total,
      totalReseller,
    }));
  };

  const isCartSelected = (cartItem: CartModel, index?: number): boolean => {
    const { cartSelected = [] } = options;

    return cartSelected.indexOf(undefined === index ? -1 : index) >= 0;
  };

  const isCartNoted = (cartItem: CartModel, index?: number): boolean => {
    const { notes = [] } = options;

    return notes.indexOf(undefined === index ? -1 : index) >= 0;
  };

  const { cartSelected = [], notes = [] } = options;
  const cartSelectedAll = cartSelected.length === cart.models?.length;

  let canCheckout = true;
  const minimumTotal = !user?.orderfirst ? price.orderfirst : price.ordernext;
  const hasResellerSelected = cart.models?.find((item, index) => {
    if (!isCartSelected(item, index)) {
      return false;
    }

    return item.type === 'reseller';
  });

  if (price.total < minimumTotal && hasResellerSelected) {
    canCheckout = false;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
      >
        {!cart.modelsLoaded ? (
          <View style={{ paddingTop: 12 }}>
            {[1, 2].map((item) => (
              <View key={item} style={[wrapper.row, { alignItems: 'center', marginTop: 24 }]}>
                <BoxLoading width={20} height={20} style={{ marginRight: 24 }} />

                <BoxLoading width={56} height={56} />

                <View style={{ flex: 1, paddingLeft: 15 }}>
                  <BoxLoading width={180} height={16} />
                  <BoxLoading width={[100, 120]} height={16} style={{ marginTop: 4 }} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ flex: 1, paddingTop: 12 }}>
            {!cart.models?.length ? (
              <Typography textAlign="center" style={{ marginVertical: 12 }}>
                {`${t('Belum ada produk dalam keranjang')}`}
              </Typography>
            ) : (
              <View>
                <View style={[styles.cartContent, { paddingTop: 4 }]}>
                  <View style={{ width: 30, marginRight: 10 }}>
                    <Button
                      containerStyle={{ alignSelf: 'center' }}
                      border={'700'}
                      rounded={4}
                      size={20}
                      onPress={() => handleSelectAll()}
                    >
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={cartSelectedAll ? colors.gray[700] : 'transparent'}
                      />
                    </Button>
                  </View>

                  <Typography style={{ flex: 1 }}>
                    {`${t('Pilih Semua')}`}
                  </Typography>
                </View>

                {cart.models.map((item, index) => (
                  <View key={index} style={[styles.cartRow, { borderTopWidth: index === 0 ? 1 : 0 }]}>
                    <View style={styles.cartContent}>
                      <View style={{ width: 30, marginRight: 10 }}>
                        <Button
                          containerStyle={{ alignSelf: 'center' }}
                          border={'700'}
                          rounded={4}
                          size={20}
                          onPress={() => handleSelect(item, index)}
                        >
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={isCartSelected(item, index) ? colors.gray[700] : 'transparent'}
                          />
                        </Button>
                      </View>

                      {!item.product?.prd_foto ? null : (
                        <Image source={{ uri: item.product.prd_foto }} style={styles.cartImage} />
                      )}

                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <Typography size="xs" color={500}>
                          {startCase(item.type)}
                        </Typography>

                        <Typography size="sm" style={{ marginTop: 2 }}>
                          {item.product?.prd_ds}
                        </Typography>
                      </View>

                      <Typography textAlign="right">
                        {!item.price_original ? null : (
                          <Typography color="secondary" style={{
                            fontStyle: 'italic',
                            textDecorationLine: 'line-through',
                            textDecorationStyle: 'solid',
                            lineHeight: 24
                          }}>
                            {numeral(item.price_original).format()}

                            {'\n'}
                          </Typography>
                        )}

                        <Typography heading>
                          {numeral(item.harga).format()}
                        </Typography>
                      </Typography>
                    </View>

                    <View style={styles.cartAction}>
                      <View style={{ width: 30, marginRight: 10 }} />

                      <View style={{ flex: 1 }}>
                        <PressableBox
                          containerStyle={{ alignSelf: 'flex-start' }}
                          onPress={() => handleNoteShow(item, index)}
                        >
                          <Typography color="primary" size="sm">
                            {`${t('Tulis Catatan')}`}
                          </Typography>
                        </PressableBox>

                        {notes.indexOf(index) < 0 ? null : (
                          <TextField
                            containerStyle={{ marginTop: 4 }}
                            style={{ fontSize: 12 }}
                            placeholder={`${t('Tulis Catatan')}`}
                            size="sm"
                            border
                            multiline
                            value={item.note}
                            onChangeText={(value) => setCart(state => ({
                              ...state,
                              models: cart.models?.map((cartModel, i) => {
                                if (i === index) {
                                  const newCart = { ...cartModel };

                                  newCart.note = value;

                                  return newCart;
                                }

                                return cartModel;
                              }) || [],
                            }))}
                          />
                        )}
                      </View>

                      <View style={[wrapper.row, {
                        alignSelf: 'flex-end',
                        alignItems: 'center'
                      }]}>
                        <Button
                          containerStyle={{ marginHorizontal: 10 }}
                          size={24}
                          rounded={4}
                          onPress={() => handleQtyChange(0, item, index)}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.gray[700]} />
                        </Button>

                        <TextFieldNumber
                          containerStyle={{ width: 86, paddingHorizontal: 4 }}
                          placeholder="0"
                          value={item.qty?.toString()}
                          border
                          size="sm"
                          buttonProps={{ size: 24 }}
                          editable
                          onChangeText={(value) => !value ? void(0) : handleQtyChange(parseInt(value), item, index, false)}
                          onIncrease={() => handleQtyChange('+', item, index)}
                          onDecrease={() => handleQtyChange('-', item, index)}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {!cart.modelsLoaded || !price.isLoaded ? null : (
        <View style={styles.action}>
          <View style={[wrapper.row, { alignItems: 'center' }]}>
            <Typography type="h4" color="primary" style={{ flex: 1, paddingVertical: 4 }}>
              {`${t('Total Harga')}`}
            </Typography>

            <Typography textAlign="right">
              {!price.original ? null : (
                <Typography size="lg" color="secondary" style={{
                  fontStyle: 'italic',
                  textDecorationLine: 'line-through',
                  textDecorationStyle: 'solid',
                  lineHeight: 24
                }}>
                  {numeral(price.original).format()}

                  {'\n'}
                </Typography>
              )}

              <Typography type="h4">
                {numeral(price.total).format()}
              </Typography>
            </Typography>
          </View>

          {canCheckout || !cartSelected.length ? null : (
            <Typography size="sm" color="red" textAlign="center" style={{ marginTop: 12 }}>
              {`${t('Minimal total pembelian Reseller adalah')} ${numeral(!user?.orderfirst ? price.orderfirst : price.ordernext).format()
                }`}
            </Typography>
          )}

          <Button
            containerStyle={{ marginTop: 16, alignSelf: 'center' }}
            style={{ width: 150 }}
            label={`${t('Beli')}`.toUpperCase()}
            color="yellow"
            shadow={3}
            onPress={handleCheckout}
            disabled={!canCheckout}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },

  cartRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.palettes.primary,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  cartContent: {
    ...wrapper.row,
    alignItems: 'center',
  },
  cartImage: {
    width: 56,
    height: 56,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  cartAction: {
    ...wrapper.row,
    alignItems: 'center',
    marginTop: 12,
  },

  action: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: colors.gray[400],
    backgroundColor: colors.white
  }
});

export default Cart;
