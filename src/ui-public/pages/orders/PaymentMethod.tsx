import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { PressableBox, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Modelable, PaymentMethodType } from '../../../types/model';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { httpService } from '../../../lib/utilities';
import { BoxLoading } from '../../../ui-shared/loadings';
import { useTranslation } from 'react-i18next';

export const PAYMENT_IMAGES: {
  [key: string]: any;
} = {
  'Mandiri': require('../../../assets/images/payments/bank-mandiri.png'),
  'COD': require('../../../assets/images/payments/qris.png'),
};

function PaymentMethod() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'PaymentMethod'>>();
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<Modelable<PaymentMethodType>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    // 
  }, [route.params]);

  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveMethods();

    setIsLoading(false);
  };

  const retrieveMethods = async () => {
    return httpService('/product/list', {
      data: {
        act: 'PaymentList',
        dt: JSON.stringify({ comp: '001' }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setMethod(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    });
  };

  const handleMethodSelect = (payment_method: PaymentMethodType) => {
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.PaymentMerchant',
      params: [null, null, {
        address: route.params?.address,
        cart_items: route.params?.cart_items,
        payment_method,
      }],
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {true ? null : (
        <View style={[styles.header, { paddingTop: 8 }]}>
          <Typography
            type="h5"
            style={{
              borderBottomWidth: 1,
              borderColor: colors.gray[700],
              paddingVertical: 4,
            }}
          >
            {`${t('Metode Pembayaran')}`}
          </Typography>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        {!method.modelsLoaded ? (
          <BoxLoading width={[140, 200]} height={20} style={{ marginVertical: 12 }} />
        ) : (
          !method.models?.length ? (
            <Typography style={{ marginVertical: 12 }}>
              {`${t('Tidak ada metode pembayaran')}`}
            </Typography>
          ) : (
            [
              ...(method.models || []),
              { nama: `${t('COD')}` }
            ].map((item, index) => {
              let label = item.nama;

              switch (item.nama) {
                case 'COD':
                  label = `${t('COD (Bayar di Tempat)')}`;
                  item.method = 'cod';
                break;
                default:
                  label = `Transfer Bank ${item.nama}`;
                  item.method = 'transfer';
              }

              return (
                <PressableBox
                  key={index}
                  containerStyle={{
                    ...styles.methodRow,
                    marginTop: index === 0 ? 0 : 0
                  }}
                  style={styles.method}
                  onPress={() => handleMethodSelect(item)}
                >
                  {!item.foto1 ? (
                    <Image source={PAYMENT_IMAGES[item.nama || '']} style={styles.methodImage} />
                  ) : (
                    <Image source={{ uri: item.foto1 }} style={styles.methodImage} />
                  )}
    
                  <View style={{ flex: 1, paddingHorizontal: 15 }}>
                    <Typography>{label}</Typography>
                  </View>
    
                  <Ionicons name="chevron-forward" size={20} color={colors.palettes.primary} />
                </PressableBox>
              );
            })
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  header: {
    paddingTop: 4,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },

  methodRow: {
    marginHorizontal: 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.transparent('palettes.primary', 1),
  },
  method: {
    ...wrapper.row,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center'
  },
  methodImage: {
    width: 80,
    height: 24,
    resizeMode: 'contain',
  },
});

export default PaymentMethod;
