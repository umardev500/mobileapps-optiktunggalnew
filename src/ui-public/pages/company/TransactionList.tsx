import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image, ImageBackground, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, PressableBox, Button } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, TransactionModel, UserModel } from '../../../types/model';
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
  const [users, setUsers] = useState<Modelable<UserModel>>({
    model: null,
    modelLoaded: false,
  });
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

  useEffect(() => {
    if (route.params?.users) {
      setUsers(state => ({
        ...state,
        model: route.params.users,
        modelLoaded: true
      }));
    }
  }, [route.params]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await retrieveTransactions();
    setIsLoading(false);
  };

  const retrieveTransactions = async () => {
    // setIsLoading(true);
    // setTransaction(state => ({
    //   ...state,
    //   models: [],
    //   modelsLoaded: false,
    // }));

    return httpService('/api/transaction/transaction', {
      data: {
        act: 'TrxList',
        dt: JSON.stringify({ kdcust : user?.id }),
      }
    }).then(({ status, data }) => {
      setTransaction(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));

      // if (!user?.orderfirst && data?.length) {
      //   const orderfirst = data.find((item: TransactionModel) => (
      //     item.orderstatus?.toLowerCase() === 'diterima'
      //   ))?.ordertgl || '';

      //   orderfirst && httpService.setUser({
      //     ...user,
      //     orderfirst
      //   });
      // }
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

  const { model: usersModel } = users;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[colors.palettes.black]}
          />
        )}
      >
        <View>              
          {!transaction.modelLoaded == null ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <ActivityIndicator size={32} animating color={colors.palettes.primary} />
            </View>
          ) : (
            !transaction.models?.length ? (
              <View style={[styles.container, styles.wrapper]}>
                <Image source={{ uri: 'https://www.callkirana.in/bootstrp/images/no-product.png' }} style={styles.sorry} />
                {/* {!transaction.models?.length ? (
                  <PressableBox
                    containerStyle={{ alignSelf: 'center' }}
                    onPress={() => handleRefresh()}>
                    <Typography size="sm" style={{ borderBottomWidth: 1, borderColor: colors.gray[700] }}>
                      {t(`Click to view transaction`)}
                    </Typography>
                  </PressableBox>
                ) : (
                  null
                )} */}
                <Typography textAlign="center" style={{ marginVertical: 12 }}>
                  {t(`${t('Tidak ada transaksi.')}`)}
                </Typography>
              </View>
            ) : transaction.models.map((item, index) => (
              <TransactionItem
                key={index}
                transaction={item}
                onDetailPress={(model) => handleModalToggle('detail', true, {
                  detailModel: model
                })}
                // onPayPress={(model) => handleModalToggle('pay', true, {
                //   payModel: model
                // })}
                style={{ marginTop: index === 0 ? 0 : 12 }}
              />
            ))
          )}
        </View>
      </ScrollView>
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
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 100
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
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
});

export default TransactionList;
