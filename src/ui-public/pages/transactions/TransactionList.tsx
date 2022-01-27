import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, PressableBox, Button } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, TransactionModel } from '../../../types/model';
import TransactionItem from '../../components/TransactionItem';
import TransactionStatusModal from '../../components/TransactionStatusModal';
import TransactionPayModal from '../../components/TransactionPayModal';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import ViewCollapse from '../../components/ViewCollapse';
import Ionicons from 'react-native-vector-icons/Ionicons';

type OptionsState = {
  detailModalOpen?: boolean;
  detailModel?: null | TransactionModel;
  payModalOpen?: boolean;
  payModel?: null | TransactionModel;
};

function TransactionList() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('notification');
  const { user: { user } } = useAppSelector((state) => state);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState<Modelable<TransactionModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [options, setOptions] = useState<OptionsState>({
    detailModalOpen: false,
    detailModel: null,
    payModalOpen: false,
    payModel: null,
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveTransactions();

    setIsLoading(false);
  };

  const retrieveTransactions = async () => {
    setTransaction(state => ({
      ...state,
      models: [],
      modelsLoaded: false,
    }));

    return httpService('/api/transaction/transaction', {
      data: {
        act: 'TrxList',
        // dt: JSON.stringify({ comp: '001', regid: user?.id })
      }
    }).then(({ status, data }) => {
      setTransaction(state => ({
        ...state,
        models: 200 === status ? data : [],
        modelsLoaded: true
      }));

      if (!user?.orderfirst && data?.length) {
        const orderfirst = data.find((item: TransactionModel) => (
          item.orderstatus?.toLowerCase() === 'diterima'
        ))?.ordertgl || '';

        orderfirst && httpService.setUser({
          ...user,
          orderfirst
        });
      }
    }).catch(() => {
      setTransaction(state => ({
        ...state,
        modelsLoaded: true
      }));
    });
  };

  const handleModalToggle = (type: string, open: null | boolean = null, args: OptionsState = {}) => {
    let toggle: boolean;

    switch (type) {
      case 'detail':
        toggle = 'boolean' === typeof open ? open : !options.detailModalOpen;

        if (!toggle) {
          args.detailModel = null;
        }

        setOptions(state => ({
          ...state,
          detailModalOpen: toggle,
          ...args,
        }));
        break;
      case 'pay':
        toggle = 'boolean' === typeof open ? open : !options.payModalOpen;

        if (!toggle) {
          args.detailModel = null;
        }

        setOptions(state => ({
          ...state,
          payModalOpen: toggle,
          ...args,
        }));
        break;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
      >
        <Typography textAlign="center" style={{ paddingVertical: 12 }}>
          {t(`Klik nama dibawah untuk melihat \n detail transaksi.`)}
        </Typography>

        <View style={{ marginTop: 5, backgroundColor: '#FEFEFE', }}>
          {[
            {
              title: t(`${''}Nama Customer 1`),
              navigatePath: () => {
                navigation.navigatePath('Public', {
                  screen: 'BottomTabs.NotificationStack.TransactionDetail',
                  // params: [null, null, {
                  //   transaction_id: transactionId,
                  // }],
                });
              },
            },
            {
              title: t(`${''}Nama Customer 2`),
              navigatePath: () => {
                navigation.navigatePath('Public', {
                  screen: 'BottomTabs.NotificationStack.TransactionDetail',
                  // params: [null, null, {
                  //   transaction_id: transactionId,
                  // }],
                });
              },
            },
          ].map((item, index) => (
            <PressableBox
              key={index}
              containerStyle={{
                marginHorizontal: 0,
                marginVertical: 5,
                borderWidth: 1, 
                borderRadius: 5, 
                borderColor: '#ccc'
              }}
              style={styles.menuChildBtn}
              onPress={!item.navigatePath ? undefined : (
                () => {
                  if ('function' === typeof item.navigatePath) {
                    return item.navigatePath();
                  }
                  
                  navigation.navigatePath('Public', {
                    screen: 'BottomTabs.NotificationStack.TransactionDetail',
                    // params: [null, null, {
                    //   transaction_id: transactionId,
                    // }],
                  });
              })}
            >

              <View style={{ flex: 1,}}>
                <View style={[wrapper.row, { flex: 1, marginTop: 10, paddingHorizontal: 10, width: '100%', }]}>
                  <Typography style={{ fontSize: 12, fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                </View>

                <View style={[wrapper.row, { marginTop: 5, paddingHorizontal: 10, width: '100%' }]}>
                  <View style={{ flex: 2 }}>
                    <Image source={require('../../../assets/icons/figma/vip.png')} style={styles.avatarVIP} />
                    <Typography style={{ textAlign: 'center', fontSize: 10 }}>
                      VIP MEMBER
                    </Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                      <View style={{ width: 0.5, height: 50, alignSelf: 'center', marginVertical: 10, backgroundColor: '#333' }} />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Image source={require('../../../assets/icons/figma/coin.png')} style={styles.avatarVIP} />
                    <Typography style={{ textAlign: 'center', fontSize: 10 }}>
                      10.000.000
                    </Typography>
                  </View>
                </View>
              </View>
            </PressableBox>
          ))}
        </View>

        {!transaction.modelsLoaded ? (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <ActivityIndicator size={32} animating color={colors.palettes.primary} />
          </View>
        ) : (
          !transaction.models?.length ? (
            <Typography textAlign="center" style={{ paddingVertical: 12 }}>
              {t(`Belum ada transaksi.`)}
            </Typography>
          ) : transaction.models.map((item, index) => (
            <TransactionItem
              key={index}
              transaction={item}
              onDetailPress={(model) => handleModalToggle('detail', true, {
                detailModel: model
              })}
              onPayPress={(model) => handleModalToggle('pay', true, {
                payModel: model
              })}
              style={{ marginTop: index === 0 ? 0 : 12 }}
            />
          ))
        )}
      </ScrollView>

      {/* Transaction Status Detail */}
      <TransactionStatusModal
        isVisible={options.detailModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('detail', false)}
        onBackdropPress={() => handleModalToggle('detail', false)}
        transaction={options.detailModel || undefined}
        style={{ maxHeight: height * 0.75 }}
      />

      {/* Transaction Pay Modal */}
      <TransactionPayModal
        isVisible={options.payModalOpen}
        onSwipeComplete={() => handleModalToggle('pay', false)}
        onBackButtonPress={() => handleModalToggle('pay', false)}
        onBackdropPress={() => handleModalToggle('pay', false)}
        onSuccess={() => {
          handleModalToggle('pay', false);

          handleRefresh();
        }}
        transaction={options.payModel || undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
  },
  actionBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
    borderRadius: 5,
    marginVertical: 5,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  menuChildBtn: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 6,
  },
  menuChildIcon: {
    width: 24,
    alignItems: 'center',
  },
  avatarVIP: {
    width: 30,
    height: 30,
    marginTop: 10,
    alignSelf: 'center'
  },
});

export default TransactionList;
