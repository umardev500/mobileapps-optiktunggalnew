import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { AddressModel, CartModel, Modelable } from '../../../types/model';
import { Button, Header, PressableBox, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import numeral from 'numeral';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppSelector } from '../../../redux/hooks';
import { useDispatch } from 'react-redux';
import { fetchAddresses } from '../../../redux/actions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { showPhone } from '../../../lib/utilities';
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";

function Checkout() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'Checkout'>>();
  const { width } = useWindowDimensions();
  const { user: { user, location, address: addressState } } = useAppSelector((state) => state);
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    model: null,
    modelLoaded: false,
  });
  const [price, setPrice] = useState({
    harga: 0,
    total: 0,
    itemqty: 0
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    if (route.params?.cart_items) {
      setCart(state => ({
        ...state,
        models: route.params?.cart_items,
        modelsLoaded: true,
      }));
    }

    if (route.params?.address) {
      setAddress(state => ({
        ...state,
        model: route.params.address,
        modelLoaded: true,
      }));
    }
  }, [route.params]);

  useEffect(() => {
    calculatePrice();
  }, [cart.models]);

  useEffect(() => {
    if (addressState.modelsLoaded) {
      setAddress(state => ({
        ...state,
        model: (addressState.models || [])[0],
        modelLoaded: true
      }));
    }
  }, [addressState.modelsLoaded]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveAddress();

    setIsLoading(false);
  };

  const retrieveAddress = async () => {
    dispatch(fetchAddresses());
  };

  const handlePay = async () => {
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.PaymentMethod',
      params: [null, null, {
        cart_items: cart.models,
        address: address.model,
        price_total: price.total
      }],
    });
  };

  const calculatePrice = () => {
    let harga = 0;
    let total = 0;
    let itemqty = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      const { product: itemProduct } = item;
      const discount = itemProduct?.diskon;
      const subtotalOriginal = ((itemProduct?.harga || 0) * 100 / (100 - parseFloat(discount || '0'))) * qty;
      const subtotal = (itemProduct?.harga || 0) * qty;

      harga += subtotalOriginal;
      total += subtotal;
      itemqty += qty;
    });

    setPrice(state => ({
      ...state,
      harga,
      total,
      itemqty
    }));
  };

  const { model: addressModel } = address;
  let canSubmit = true;

  if (!address.model) {
    canSubmit = false;
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        left
        title={[
          `${t('Proses Checkout')}`,
        ]}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {!address.modelLoaded ? (
          <View style={{ paddingVertical: 12 }}>
            <BoxLoading width={[90, 120]} height={18} />
            <BoxLoading width={[200, 240]} height={18} style={{ marginTop: 4 }} />
            <BoxLoading width={[160, 200]} height={18} style={{ marginTop: 4 }} />
          </View>
        ) : (
          !address.model ? (
            <View style={[wrapper.row, { paddingVertical: 12 }]}>
              <Typography size="sm" style={{paddingVertical: 3, paddingHorizontal: 5}}>
                {t('Belum ada alamat')}
              </Typography>

              <PressableBox
                containerStyle={{ alignSelf: 'flex-end', flex: 1 }}
                onPress={() => navigation.navigatePath('Public', {
                  screen: 'BottomTabs.AccountStack.AddressEdit',
                  params: [null, null, {
                    action_screen: ['Public', 'BottomTabs.HomeStack.Checkout'],
                  }]
                })}
              >
                <View style={[wrapper.row, { alignSelf: 'flex-end' }]}>
                  <Typography color="#0d674e" style={{
                    borderWidth: 1,
                    borderColor: "#0d674e",
                    paddingVertical: 3,
                    paddingHorizontal: 5,
                    borderRadius: 5,
                    fontSize: 12
                  }}>
                    <Ionicons name="location" size={12} color="#0d674e" />
                    {`${t('Tambah')}`}
                  </Typography>
                </View>
              </PressableBox>
            </View>
          ) : (
            <View style={{ paddingVertical: 12 }}>
              {!addressModel?.title ? null : (
                <Typography heading>
                  {addressModel.title}
                </Typography>
              )}
              <View style={[wrapper.row]}>
                <Typography size="sm" style={{ marginTop: 4, fontSize: 12 }}>
                  Dikirim ke :
                </Typography>
              </View>
              <View style={[wrapper.row, {flex: 1}]}>
                <View style={{flex: 1}}>
                  <Typography size="md" style={{ marginTop: 4, fontSize: 12, fontWeight: 'bold' }}>
                    {addressModel?.nama || addressModel?.vch_nama}
                  </Typography>
                  <Typography size="sm" style={{ marginTop: 0, fontSize: 12 }}>
                    {showPhone(addressModel?.hp, '0')+'\n'}
                    {addressModel?.alamat}
                  </Typography>
                </View>
                <View style={{marginRight: 10}}>
                  <PressableBox
                    containerStyle={{alignSelf: 'center', borderWidth: 1, borderColor: '#0d674e',}}
                    style={{alignItems: 'center'}}
                    onPress={() => navigation.navigatePath('Public', {
                      screen: 'BottomTabs.AccountStack.AddressList',
                      params: [null, null, {
                        action_screen: ['Public', 'BottomTabs.HomeStack.Checkout'],
                      }]
                    })}
                  >
                    <Typography style={{
                      textDecorationStyle: 'solid',
                      fontSize: 12,
                      paddingHorizontal: 5,
                      paddingVertical: 5,
                      color: '#0d674e'
                    }}>
                      <Ionicons name="location" size={12} color="#0d674e" />
                      {`${t('Ganti')}`}
                    </Typography>
                  </PressableBox>
                </View>
              </View>
            </View>
          )
        )}

        {!cart.modelsLoaded ? (
          <View style={{
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.gray[400]
          }}>
            {[1, 2].map((item, index) => (
              <View key={item} style={[wrapper.row, { alignItems: 'center', marginTop: index === 0 ? 0 : 12 }]}>
                <BoxLoading width={56} height={56} />

                <View style={{ flex: 1, paddingLeft: 15 }}>
                  <BoxLoading width={180} height={16} />
                  <BoxLoading width={[100, 120]} height={16} style={{ marginTop: 4 }} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{
            flex: 1,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.gray[400]
          }}>
            {!cart.models?.length ? (
              <Typography textAlign="center">
                {`${t('Belum ada produk dalam keranjang')}`}
              </Typography>
            ) : (
              cart.models.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.cartRow,
                    { marginTop: index === 0 ? 0 : 12 }
                  ]}
                >
                  <View style={styles.cartContent}>
                    {!item.product?.prd_foto ? null : (
                      <Image source={{ uri: item.product.prd_foto }} style={styles.cartImage} />
                    )}

                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <Typography size='sm'>
                          {item.product?.prd_ds}
                        </Typography>
                        <View style={{ alignItems: 'flex-start' }}>
                        {!item.qty ? null : (
                          <Typography size="xs" color={700} style={{ marginBottom: 2 }}>
                            {`${t('Qty')}: ${item.qty}`}
                          </Typography>
                        )}

                        <Typography size='sm' style={{fontWeight: '700'}}>
                          {/* Rp{item.product?.harga || 0 (item.qty || 1)} */}
                          {formatCurrency({ amount: Number(item.product?.harga)*(item.qty || 1), code: 'IDR' })}
                        </Typography>
                      </View>
                      {!item.note ? null : (
                        <Typography size="sm" color={700} style={{ marginTop: 2 }}>
                          {`${t('Catatan')}: ${item.note}`}
                        </Typography>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {!cart.modelsLoaded ? null : (
        <View style={styles.action}>
          <View style={[wrapper.row, { alignItems: 'center' }]}>
            <Typography size='sm' color="black" style={{ flex: 1, paddingVertical: 4 }}>
              {`${t('Jumlah '+'('+price.itemqty+' item)')}`}
            </Typography>

            <Typography textAlign="right">
              <Typography size='sm'>
                {formatCurrency({ amount: Number(price.total), code: 'IDR' })}
              </Typography>
            </Typography>
          </View>
          <View style={[wrapper.row, { alignItems: 'center' }]}>
            <Typography size='sm' color="black" style={{ flex: 1, paddingVertical: 4 }}>
              {`${t('Ongkos Kirim')}`}              
            </Typography>
            <View style={styles.column}>
              <Typography style={{textAlign: 'center', color: '#fff', fontSize: 12}}>
                Free
              </Typography>
            </View>
            <Typography textAlign="right">
              <Typography size='sm'>
                {formatCurrency({ amount: Number(0), code: 'IDR' })}
              </Typography>
            </Typography>
          </View>
          <View style={{borderBottomColor: '#333', borderWidth: 1, marginVertical: 5, borderRadius: 1}}></View>
          <View style={[wrapper.row, { alignItems: 'center' }]}>
            <Typography size='sm' color="black" style={{ flex: 1, paddingVertical: 4, fontWeight: '700' }}>
              {`${t('Total Harga')}`}
            </Typography>

            <Typography textAlign="right">
              <Typography size='sm' style={{fontWeight: '700'}}>
                {formatCurrency({ amount: Number(price.total), code: 'IDR' })}
              </Typography>
            </Typography>
          </View>

          <Button
              containerStyle={{ marginTop: 16, alignSelf: 'center', marginVertical: 10, backgroundColor: '#0d674e', borderRadius: 5 }}
              style={{ width: 300 }}
              onPress={handlePay}
              disabled={!canSubmit}
              loading={isSaving}
            >
            <Typography size='sm' style={{textAlign: 'center', paddingVertical: 3, color: '#FEFEFE'}}>
              {`${t('Pilih Metode Pembayaran')}`.toUpperCase()}
            </Typography>
          </Button>
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

  cartRow: {},
  cartContent: {
    ...wrapper.row,
    alignItems: 'center',
  },
  cartImage: {
    width: 45,
    height: 30,
    resizeMode: 'stretch',
    borderRadius: 8,
  },
  cartAction: {
    ...wrapper.row,
    alignItems: 'center',
    marginTop: 12,
  },
  column:{
    width: '15%', 
    height: 20, 
    backgroundColor: 'red',
    justifyContent:"center",
    marginHorizontal: 10,
    borderRadius: 3
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

export default Checkout;
