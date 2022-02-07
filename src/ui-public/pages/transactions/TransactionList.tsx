import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, TransactionModel } from '../../../types/model';
=======
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image, ImageBackground } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, PressableBox, Button } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, TransactionModel, UserModel } from '../../../types/model';
>>>>>>> origin/Develop
import TransactionItem from '../../components/TransactionItem';
import TransactionStatusModal from '../../components/TransactionStatusModal';
import TransactionPayModal from '../../components/TransactionPayModal';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
<<<<<<< HEAD
=======
import ViewCollapse from '../../components/ViewCollapse';
import Ionicons from 'react-native-vector-icons/Ionicons';
>>>>>>> origin/Develop

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
<<<<<<< HEAD
  const { height } = useWindowDimensions();
=======
  const { width, height } = useWindowDimensions();
>>>>>>> origin/Develop
  const { t } = useTranslation('notification');
  const { user: { user } } = useAppSelector((state) => state);

  // States
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
=======
  const [users, setUsers] = useState<Modelable<UserModel>>({
    model: null,
    modelLoaded: false,
  });
>>>>>>> origin/Develop
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

<<<<<<< HEAD
=======
  const [isRefreshing, setIsRefreshing] = useState(false);

>>>>>>> origin/Develop
  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

<<<<<<< HEAD
=======
  useEffect(() => {
    if (route.params?.users) {
      setUsers(state => ({
        ...state,
        model: route.params.users,
        modelLoaded: true
      }));
    }
  }, [route.params]);

>>>>>>> origin/Develop
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

<<<<<<< HEAD
    return httpService('/order/list', {
      data: {
        act: 'MPList',
        dt: JSON.stringify({ comp: '001', regid: user?.id })
=======
    return httpService('/api/transaction/transaction', {
      data: {
        act: 'TrxList',
>>>>>>> origin/Develop
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

<<<<<<< HEAD
=======
  const { model: usersModel } = users;

>>>>>>> origin/Develop
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
<<<<<<< HEAD
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
=======
        {!usersModel? ( 
            <Typography textAlign="center" style={{ marginVertical: 12 }}>
              {t(`${''}Tidak ada transaksi.`)}
            </Typography>
          ) : ( 
            <>
              {usersModel.no_card == null ? (
                <View>
                  <Typography style={{ textAlign: 'center', fontSize: 12, paddingHorizontal: 3, color: '#ec3a3b' }}>
                    Anda Belum Menjadi Member
                  </Typography>
                  <Typography style={{ textAlign: 'center', fontSize: 12, paddingHorizontal: 3 }}>
                    Pengguna member akan mendapatkan penawaran terbaik setiap melakukan transaksi.
                  </Typography>
                </View>
              ) : (
                <View>
                  <ImageBackground source={require('../../../assets/icons/figma/membercard.png')} resizeMode= 'stretch' style={{width: '100%', height: 220 }}>
                     <View style={{position: 'absolute', top: 145, left: 0, right: 0, bottom: 0}}>
                       <Typography style={{ color: 'white', marginHorizontal: 20, fontSize: 16 }}>
                         {usersModel.nm_lengkap}
                        </Typography>
                        <View style={[wrapper.row, { width: '100%', marginTop: 5 }]}>
                           <Typography style={{ color: 'white', marginHorizontal: 20, fontSize: 16}}>
                             {usersModel.no_card}
                            </Typography>
                            <Typography style={{ color: 'white', textAlign: 'center', fontSize: 10, flex: 1, marginLeft: 30 }}>
                             Valid thru 12/31/2021
                            </Typography>
                        </View>
                     </View>
                  </ImageBackground>
                </View>
              )}
              
              <Typography style={{ paddingVertical: 12, marginVertical: 10, borderBottomWidth: 1, }}>
                {t(`List Transaksi`)}
              </Typography>
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
            </>
          ) }
>>>>>>> origin/Develop
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
<<<<<<< HEAD

  actionBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
  },

=======
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
>>>>>>> origin/Develop
  header: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
<<<<<<< HEAD
=======
  menuChildBtn: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 6,
  },
  menuChildIcon: {
    width: 24,
    alignItems: 'center',
  },
>>>>>>> origin/Develop
});

export default TransactionList;
