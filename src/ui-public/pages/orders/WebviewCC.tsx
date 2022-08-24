import { useRoute, RouteProp } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image, ImageBackground, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, PressableBox, Button } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../redux/hooks';
import { WebView } from 'react-native-webview';
import { httpService } from '../../../lib/utilities';
import { AddressModel, CartModel, MidtransModelVA, Modelable, PaymentMethodType } from '../../../types/model';
import { useDispatch } from 'react-redux';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { setCartItems } from '../../../redux/actions';

type Fields = {
  bank_number?: string;
  bank_account_name?: string;
  price_total?: number;
};

function WebviewCC() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'PaymentMerchant'>>();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('payment');
  const dispatch = useDispatch();
  const [transactionId, setTransactionId] = useState('');
  const { user: { user } } = useAppSelector((state) => state);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    model: null,
    modelLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    bank_number: '',
    bank_account_name: '',
    price_total: 0,
  });
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const paymentMethodType = paymentMethod?.payment_type || '';

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
    setIsLoading(true);
    paymentMethod && handleSubmit();
  }, [paymentMethod]);

  const calculatePrice = () => {
    let total = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      const subtotal = (item.harga || 0) * qty;

      total += subtotal;
    });

    handleFieldChange('price_total', total);
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

  const handleSubmit = async () => {
    const { model: addressModel } = address;
    let today = new Date();
    let date = today.getDate()+''+Number(today.getMonth()+1)+''+today.getFullYear();
    let randomNumber = Math.floor(Math.random() * 100000) + 1;

    setIsSaving(true);
    return httpService('/api/transaction/transaction', {
      data: {
        act: 'OrderNew',
        header: JSON.stringify({
          regid: user?.id,
          invnumber: 'OT-'+date+'-'+randomNumber,
          paymethod: paymentMethod?.payment_name,
          paytype: paymentMethodType,
          type: paymentMethod?.type,
          paytoken: 'tokenpayfrom_midtrans',
          accountnumber: 'Nomor pembayaran dari midtrans',
          paystatus: 'pending',
          shipto: addressModel?.id || '',
          shiptotal: Number(route.params?.price_total),
          lat: addressModel?.lat || '',
          lng: addressModel?.lng || '',
          ip: location.ip,
        }),
        item_midtrans: JSON.stringify((cart.models || []).map((item) => ({
          id: item.prd_id,
          name: item.atributBcurve == undefined ? item.product?.prd_ds : item.product?.prd_ds +' - '+ item.atributBcurve +' - '+ item.atributSpheries +' - '+ item.atributColor,
          quantity: item.qty,
          price: item.product?.harga,
        }))),
        item: JSON.stringify((cart.models || []).map((item) => ({
          id: item.prd_id,
          basecurve: item.atributBcurve == '' ? '0' : item.atributBcurve,
          spheries: item.atributSpheries == '' ? null : item.atributSpheries,
          color: item.atributColor == '' ? null : item.atributColor,
          qty: item.qty,
          harga: item.product?.harga,
          remark: item.note,
        })))
      }
    }).then(({ data }) => {
      setMidtrans(data);
      setVa(data.va_numbers[0].va_number);
    }).catch(() => {
      setIsSaving(false);

      ToastAndroid.show(`${t('Tidak dapat menyimpan order.')} ${t('Coba beberapa saat lagi.')}`, ToastAndroid.SHORT);
    }).finally(() => setIsLoading(false));
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView 
            style={{flex: 1}}
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            startInLoadingState={true}
            allowUniversalAccessFromFileURLs={true}
            source={{ uri: 'https://0rdg6.zappar.io/0rdg6/4869346714061923988/1.0/' }} 
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export default WebviewCC;
