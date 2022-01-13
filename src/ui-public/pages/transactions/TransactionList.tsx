import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, TransactionModel } from '../../../types/model';
import TransactionItem from '../../components/TransactionItem';
import TransactionStatusModal from '../../components/TransactionStatusModal';
import TransactionPayModal from '../../components/TransactionPayModal';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';

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
  const { height } = useWindowDimensions();
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

    return httpService('/order/list', {
      data: {
        act: 'MPList',
        dt: JSON.stringify({ comp: '001', regid: user?.id })
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

  actionBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
  },

  header: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
});

export default TransactionList;
