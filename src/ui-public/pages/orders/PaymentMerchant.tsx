import { CommonActions, RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { BottomDrawer, Button, ImageAuto, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { AddressModel, CartModel, Modelable, PaymentMethodType } from '../../../types/model';
import numeral from 'numeral';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { BannerWelcome } from '../../../assets/images/banners';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useDispatch } from 'react-redux';
import { setCartItems } from '../../../redux/actions';
import { PAYMENT_IMAGES } from './PaymentMethod';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';

export const PAYMENT_METHODS = [
  {
    method: 'transfer',
    bankName: 'Mandiri',
    bankNo: '166-000-3456-803',
    bankAccount: 'PT MORITA MITRA BERSAMA',
  }
];

type Fields = {
  bank_number?: string;
  bank_account_name?: string;
  price_total?: number;
};

function PaymentMerchant() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'PaymentMerchant'>>();
  const { width, height } = useWindowDimensions();
  const { user, location } = useAppSelector(({ user }) => user);
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    model: null,
    modelLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    bank_number: '',
    bank_account_name: '',
    price_total: 0,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [options, setOptions] = useState({
    infoModalOpen: false,
  });

  // Effects
  useEffect(() => {
    const { cart_items, address, payment_method } = route.params;

    address && setAddress(state => ({
      ...state,
      model: address,
      modelLoaded: true
    }));
    cart_items && setCart(state => ({
      ...state,
      models: cart_items,
      modelsLoaded: true,
    }));
    payment_method && setPaymentMethod(payment_method);
  }, [route.params]);

  useEffect(() => {
    calculatePrice();
  }, [cart.models]);

  useEffect(() => {
    if (paymentMethod?.method === 'cod') {
      handleSubmit();
    }
  }, [paymentMethod]);

  // Vars
  const handleModalToggle = async (type: string, open: boolean | null = null, redirect: boolean = false) => {
    switch (type) {
      case 'info':
        const toggle = 'boolean' === typeof open ? open : !options.infoModalOpen;

        setOptions(state => ({
          ...state,
          infoModalOpen: toggle
        }));

        (!toggle && redirect) && handleFinish();
        break;
    }
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    setFields(state => ({
      ...state,
      [field]: value
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });
  };

  const handleErrorShow = (fields: keyof Fields | Array<keyof Fields>, message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);

    setError({
      fields: 'string' === typeof fields ? [fields] : fields as Array<keyof Fields>,
      message
    });
  };

  const getFieldError = (field: keyof Fields) => {
    const { fields = [] } = error;

    return fields.indexOf(field) < 0 ? null : error.message;
  };

  const handleSubmit = async () => {
    switch (paymentMethod?.method) {
      case 'transfer':
        if (!fields.price_total) {
          return handleErrorShow('price_total', `${t('Terjadi kesalahan')}: ${t('Total harga belum terhitung.')}`);
        } else if (!fields.bank_number) {
          // return handleErrorShow('bank_number', `${t('Mohon masukkan nomor rekening.')}`);
        } else if (!fields.bank_account_name) {
          // return handleErrorShow('bank_account_name', `${t('Mohon masukkan nama pemilik rekening.')}`);
        }
        break;
      case 'cod':
        // COD Validations
        break;
    }

    const { model: addressModel } = address;

    setIsSaving(true);

    return httpService('/order/save', {
      data: {
        act: 'MPNew',
        comp: '001',
        dt: JSON.stringify({
          regid: user?.id,
          payterm: 'cod' === paymentMethodType ? '2' : '1',
          shipto: addressModel?.id || '',
          lat: addressModel?.lat || '',
          lng: addressModel?.lng || '',
          ip: location.ip,
        }),
        item: JSON.stringify((cart.models || []).map((item) => ({
          id: item.prd_id,
          qty: item.qty,
          harga: item.harga,
          refill: item.refill || '0',
          remark: item.note,
        })))
      }
    }).then(({ status, id, nomor }) => {
      setIsSaving(false);

      console.log("SAVE ORDER", status, id, nomor);

      if (id) {
        setTransactionId(id);

        handleModalToggle('info', true);
      }
    }).catch(() => {
      setIsSaving(false);

      ToastAndroid.show(`${t('Tidak dapat menyimpan order.')} ${t('Coba beberapa saat lagi.')}`, ToastAndroid.SHORT);
    });
  };

  const handleFinish = () => {
    dispatch(setCartItems([]));

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Home',
      params: [],
    });

    setTimeout(() => {
      navigation.navigatePath('Public', {
        screen: 'BottomTabs.NotificationStack.Notification',
      });
    }, 165);

    setTimeout(() => {
      navigation.navigatePath('Public', {
        screen: 'BottomTabs.NotificationStack.TransactionDetail',
        params: [null, null, {
          transaction_id: transactionId,
        }],
      });
    }, 500);
  };

  const calculatePrice = () => {
    let total = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      const subtotal = (item.harga || 0) * qty;

      total += subtotal;
    });

    handleFieldChange('price_total', total);
  };

  let title = `${t('Pembayaran')}`;
  let titleImage = null;
  const paymentMethodType = paymentMethod?.method || '';

  switch (paymentMethodType) {
    case 'transfer':
      title = `${t('Transfer Manual')}`;
      titleImage = paymentMethod?.image || PAYMENT_IMAGES[paymentMethod?.nama || ''];
      break;
    case 'cod':
      title = `${t('QRIS')}`;
      titleImage = paymentMethod?.image || PAYMENT_IMAGES[paymentMethod?.nama || ''];
      break;
  }

  const transferInfo = PAYMENT_METHODS.find(item => item.method === paymentMethodType);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          <Typography type="h5" style={{ flex: 1, paddingHorizontal: 8 }}>
            {title}
          </Typography>

          {!titleImage ? null : (
            <ImageAuto source={titleImage} height={24} />
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {['transfer'].indexOf(paymentMethodType || '') < 0 ? null : (
          <View>
            <View style={styles.card}>
              <Typography size="sm">
                {`${t('Total Tagihan')}`}
              </Typography>

              <Typography type="h5" style={{ marginTop: 4 }}>
                {numeral(fields.price_total).format()}
              </Typography>

              {!getFieldError('price_total') ? null : (
                <Typography size="sm" color="red" style={{ marginTop: 4 }}>
                  {error.message}
                </Typography>
              )}
            </View>

            <View style={[styles.card, { marginTop: 16, display: 'none' }]}>
              <Typography size="sm">
                {`${t('No. Rekening')}`}
              </Typography>

              <TextField
                containerStyle={{ marginTop: 4, paddingHorizontal: 0 }}
                placeholder={`${t('Contoh')}: 1234567`}
                value={fields.bank_number}
                keyboardType="number-pad"
                onChangeText={(value) => handleFieldChange('bank_number', value)}
                border="bottom"
                size="sm"
                error={!!getFieldError('bank_number')}
                message={error.message}
              />

              <Typography size="sm" style={{ marginTop: 16 }}>
                {`${t('Nama Pemilik Rekening')}`}
              </Typography>

              <TextField
                containerStyle={{ marginTop: 4, paddingHorizontal: 0 }}
                placeholder={`${t('Contoh: John Doe')}`}
                value={fields.bank_account_name}
                onChangeText={(value) => handleFieldChange('bank_account_name', value)}
                border="bottom"
                size="sm"
                error={!!getFieldError('bank_account_name')}
                message={error.message}
              />

              <View style={styles.cardInfo}>
                {[
                  `${t('Masukan info terkait diatas sesuai pada buku tabungan.')}`,
                  `${t('Untuk pembayaran lewat teller isi “No Rekening”. Lalu isi “Nama Pemilik Rekening” dengan nama Anda.')}`,
                ].map((item, index) => (
                  <View key={index} style={[wrapper.row]}>
                    <Ionicons
                      name="ellipse"
                      size={6}
                      color={colors.palettes.primary}
                      style={{ marginTop: 4 }}
                    />

                    <Typography
                      style={{
                        flex: 1,
                        color: colors.palettes.primary,
                        paddingLeft: 6,
                      }}
                      size="sm"
                    >
                      {item}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.card, { marginTop: 16 }]}>
              <Typography type="h5">
                {`${t('Langkah Pembayaran')}`}
              </Typography>

              <View style={[wrapper.row, { marginTop: 12 }]}>
                <Typography textAlign="right" style={{ minWidth: 12 }}>
                  1.
                </Typography>

                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Typography>
                    {`${t('Silahkan transfer menuju rekening resmi Morita yang tertera di bawah ini.')}`}
                  </Typography>

                  <Typography heading style={{ marginTop: 8 }}>
                    {`${t('Tujuan Transfer')}`} :
                  </Typography>

                  <View style={[wrapper.row, { alignItems: 'center', marginTop: 4 }]}>
                    {!titleImage ? null : (
                      <ImageAuto source={titleImage} width={80} />
                    )}

                    <View style={{ flex: 1, paddingLeft: 15 }}>
                      <Typography heading>
                        <Typography size="xs">
                          {`${t('Nama Bank')}`}
                        </Typography>
                        {`\nBank ${paymentMethod?.nama}`}
                      </Typography>

                      <View style={{ marginTop: 4 }}>
                        <Typography size="xs">
                          {`${t('Nomor Rekening')}`}
                        </Typography>

                        <View style={[wrapper.row, { justifyContent: 'flex-start' }]}>
                          <Typography heading>
                            {`${transferInfo?.bankNo}`}
                          </Typography>

                          {!transferInfo ? null : (
                            <Button
                              containerStyle={{ marginLeft: 2 }}
                              size={18}
                              onPress={() => {
                                const bankNo = transferInfo.bankNo;

                                Clipboard.setString(bankNo.replace(/-/g, ''));

                                ToastAndroid.show(`${''}Copied!`, ToastAndroid.SHORT);
                              }}
                            >
                              <Ionicons name="copy" size={14} color={colors.gray[800]} />
                            </Button>
                          )}
                        </View>
                      </View>

                      <Typography heading style={{ marginTop: 4 }}>
                        <Typography size="xs">
                          {`${t('Atas Nama')}`}
                        </Typography>
                        {`\n${transferInfo?.bankName}`}
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[wrapper.row, { marginTop: 12 }]}>
                <Typography textAlign="right" style={{ minWidth: 12 }}>
                  2.
                </Typography>

                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Typography>
                    {`${t('Nominal transfer adalah')} `}

                    <Typography heading>
                      {numeral(fields.price_total).format()}
                    </Typography>

                    {`.`}
                  </Typography>
                </View>
              </View>

              <View style={[wrapper.row, { marginTop: 4 }]}>
                <Typography textAlign="right" style={{ minWidth: 12 }}>
                  3.
                </Typography>

                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Typography>
                    {`${t('Simpan bukti transfer untuk dikirim melalui aplikasi.')}`}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        )}

        {['cod'].indexOf(paymentMethodType || '') < 0 ? null : (
          <View>
            <View style={styles.card}>
              <Typography>
                {`${t('Silahkan scan Barcode pada Driver yg mengantar pesanan Anda')} `}
              </Typography>
            </View>

            <View style={[styles.header, { marginHorizontal: -15, marginTop: 24 }]}>
              <View style={styles.headerRow}>
                <Typography type="h5" style={{ flex: 1 }}>
                  {`${t('COD')}`}
                </Typography>

                <ImageAuto source={require('../../../assets/images/payments/cart-green.png')} height={24} />
              </View>
            </View>

            <View style={[styles.card, { marginTop: 12 }]}>
              <Typography>
                {`${t('Silahkan scan Barcode pada Driver yg mengantar pesanan Anda')} `}
              </Typography>
            </View>
          </View>
        )}
      </ScrollView>

      {!cart.modelsLoaded ? null : (
        <View style={styles.action}>
          <Button
            containerStyle={{ alignSelf: 'center' }}
            style={{ width: 150 }}
            label={`${t('Bayar')}`.toUpperCase()}
            color="yellow"
            shadow={3}
            onPress={handleSubmit}
            loading={isSaving}
          />
        </View>
      )}

      {/* Popup Finish */}
      <BottomDrawer
        isVisible={options.infoModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('info', false, true)}
        onBackdropPress={() => handleModalToggle('info', false, true)}
        containerStyle={{
          borderTopLeftRadius: 0,
          height: height,
        }}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height: height,
          paddingTop: 0,
        }}
      >
        <PressableBox
          containerStyle={{
            marginHorizontal: 0,
            flex: 1,
          }}
          style={{
            paddingHorizontal: 15,
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          opacity={1}
          onPress={() => handleModalToggle('info', false, true)}
        >
          <BannerWelcome width={width * 0.7} height={width * 0.7} />

          <Typography type="h4" color="primary" textAlign="center" style={{ marginTop: 12 }}>
            {'transfer' === paymentMethodType ? (
              `${t('Transaksi Berhasil')}`.toUpperCase()
            ) : (
              `${t('Pesanan COD Berhasil')}`
            )}
          </Typography>

          <Typography type="h6" color="primary" textAlign="center" style={{ marginTop: 4 }}>
            {'transfer' === paymentMethodType ? (
              `${t('Terimakasih! Upload bukti pembayaranmu agar barang segera dikirim.')}`
            ) : (
              `${t('Terimakasih! Barang akan segera dikirim ke rumahmu!')}`
            )}
          </Typography>
        </PressableBox>
      </BottomDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  header: {
    paddingTop: 4,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },
  headerRow: {
    ...wrapper.row,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderColor: colors.transparent('palettes.primary', 1),
    paddingVertical: 4,
  },

  card: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.white
  },
  cardInfo: {
    marginTop: 12,
    backgroundColor: colors.transparent('palettes.primary', 0),
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8
  },

  action: {
    paddingTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: colors.white
  },
});

export default PaymentMerchant;
