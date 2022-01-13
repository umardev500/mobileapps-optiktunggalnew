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
    original: 0,
    total: 0,
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
      }],
    });
  };

  const calculatePrice = () => {
    let original = 0;
    let total = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      const { product: itemProduct } = item;
      const discount = user?.reseller === '1' ? itemProduct?.disc_reseller : itemProduct?.disc_retail;
      const subtotalOriginal = ((item.harga || 0) * 100 / (100 - parseFloat(discount || '0'))) * qty;
      const subtotal = (item.harga || 0) * qty;

      original += subtotalOriginal;
      total += subtotal;
    });

    setPrice(state => ({
      ...state,
      original,
      total,
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
          `${t('Alamat Pengiriman')}`,
          <PressableBox
            onPress={() => navigation.navigatePath('Public', {
              screen: 'BottomTabs.AccountStack.AddressList',
              params: [null, null, {
                action_screen: ['Public', 'BottomTabs.HomeStack.Checkout'],
              }]
            })}
          >
            <Typography style={{
              textDecorationLine: 'underline',
              textDecorationStyle: 'solid'
            }}>
              {`${t('Pilih Alamat Lain')}`}
            </Typography>
          </PressableBox>
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
            <View style={{ paddingVertical: 12 }}>
              <Typography type="h4">
                {t('Belum ada alamat')}
              </Typography>

              <Typography style={{ marginVertical: 4 }}>
                {`${t('Masukkan alamat rumah Anda untuk melanjutkan')}`}
              </Typography>

              <PressableBox
                containerStyle={{ alignSelf: 'flex-start' }}
                onPress={() => navigation.navigatePath('Public', {
                  screen: 'BottomTabs.AccountStack.AddressEdit',
                  params: [null, null, {
                    action_screen: ['Public', 'BottomTabs.HomeStack.Checkout'],
                  }]
                })}
              >
                <View style={[wrapper.row, { alignItems: 'center' }]}>
                  <Typography color="primary" style={{
                    borderBottomWidth: 1,
                    borderColor: colors.palettes.primary,
                    paddingRight: 4
                  }}>
                    {`${t('Tambahkan Alamat Baru')}`}
                  </Typography>

                  <Ionicons name="arrow-forward" size={16} color={colors.palettes.primary} />
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

              <Typography heading style={{ marginTop: 4 }}>
                {addressModel?.nama || addressModel?.vch_nama}
              </Typography>

              <Typography style={{ marginTop: 4 }}>
                {showPhone(addressModel?.hp, '+62')}
              </Typography>

              <Typography style={{ marginTop: 4 }}>
                {addressModel?.alamat}
              </Typography>
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
                      <Typography>
                        {item.product?.prd_ds}
                      </Typography>

                      {!item.note ? null : (
                        <Typography size="sm" color={700} style={{ marginTop: 2 }}>
                          {`${t('Catatan')}: ${item.note}`}
                        </Typography>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      {!item.qty ? null : (
                        <Typography size="sm" color={700} style={{ marginBottom: 2 }}>
                          {`${t('Qty')}: ${item.qty}`}
                        </Typography>
                      )}

                      <Typography heading>
                        {numeral((item.harga || 0) * (item.qty || 1)).format()}
                      </Typography>
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
            <Typography type="h4" color="primary" style={{ flex: 1, paddingVertical: 4 }}>
              {`${t('Total Harga')}`}
            </Typography>

            <Typography textAlign="right">
              <Typography type="h4">
                {numeral(price.total).format()}
              </Typography>
            </Typography>
          </View>

          <Button
            containerStyle={{ marginTop: 16, alignSelf: 'center' }}
            label={`${t('Pilih Pembayaran')}`.toUpperCase()}
            color="yellow"
            shadow={3}
            onPress={handlePay}
            disabled={!canSubmit}
            loading={isSaving}
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

  cartRow: {},
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

export default Checkout;
