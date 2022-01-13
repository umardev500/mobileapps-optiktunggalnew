import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { colors, wrapper } from '../../lib/styles';
import { Modelable, TransactionLog, TransactionModel } from '../../types/model';
import { BottomDrawer, BottomDrawerProps, Typography } from '../../ui-shared/components';
import { BoxLoading } from '../../ui-shared/loadings';

const LOGS: TransactionLog[] = [
  {
    date: '2021-10-01 15:00:00',
    description: 'Pembayaran sudah diverifikasi\nPembayaran telah diterima'
  },
  {
    date: '2021-10-02 08:00:00',
    description: 'Pemesanan sedang diproses'
  },
  {
    date: '2021-10-02 09:00:00',
    description: 'Barang sedang dikirim'
  },
];

type Props = BottomDrawerProps & {
  transaction?: TransactionModel
};

function TransactionStatusModal({
  isVisible,
  transaction,
  ...props
}: Props) {
  // Hooks
  const { t } = useTranslation('notification');

  // States
  const [log, setLog] = useState<Modelable<TransactionLog>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    if (isVisible && !transaction?.logs?.length) {
      retrieveTransactionStatus();
    } else if (transaction?.logs?.length) {
      setLog(state => ({
        ...state,
        models: transaction?.logs,
        modelsLoaded: true,
      }));
    } else if (!isVisible) {
      setLog(state => ({
        ...state,
        models: [],
        modelsLoaded: false,
      }));
    }
  }, [isVisible]);

  // Vars
  const retrieveTransactionStatus = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        setLog(state => ({
          ...state,
          models: LOGS,
          modelsLoaded: true,
        }));
      }, 1000);

      resolve(null);
    });
  };

  const renderLogs = ({ item, index }: ListRenderItemInfo<TransactionLog>) => {
    const date = moment(item.date);
    const isCurrent = index + 1 === log.models?.length;

    return (
      <View key={index} style={styles.logRow}>
        <View style={styles.logCircleLine}>
          <View style={[styles.logCircle, !isCurrent ? null : styles.logCircleCurrent]} />

          {index === 0 ? null : (
            <View style={styles.logLine} />
          )}
        </View>

        <View style={{ flex: 1, marginHorizontal: 15, paddingBottom: 16 }}>
          <Typography color={800}>
            {date.format('D MMM YYYY')}
          </Typography>

          <Typography style={{ marginTop: 4 }}>
            {item.description}
          </Typography>
        </View>

        <Typography size="sm" textAlign="right" style={{ paddingVertical: 4 }}>
          {date.format('HH:mm')}
        </Typography>
      </View>
    );
  };

  return (
    <BottomDrawer
      isVisible={isVisible}
      title={t(`${''}Detail Status Pemesanan`)}
      titleProps={{ textAlign: 'center', color: 'primary' }}
      {...props}
    >
      <FlatList
        contentContainerStyle={styles.container}
        style={{ flexDirection: 'column-reverse' }}
        data={log.models}
        renderItem={renderLogs}
        ListEmptyComponent={!log.modelsLoaded ? (
          <View style={styles.logRow}>
            <View style={styles.logCircleLine}>
              <View style={[styles.logCircle, { backgroundColor: colors.gray[400]}]} />
            </View>

            <View style={{ flex: 1, marginHorizontal: 15, paddingBottom: 16 }}>
              <BoxLoading width={[70, 90]} height={18} />

              <BoxLoading width={[180, 220]} height={18} style={{ marginTop: 4 }} />
            </View>
          </View>
        ) : (
          <Typography textAlign="center" style={{ paddingVertical: 12 }}>
            {t(`${''}Belum ada riwayat status pemesanan.`)}
          </Typography>
        )}
      />
    </BottomDrawer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 15,
    flexDirection: 'column-reverse'
  },

  logRow: {
    ...wrapper.row,
    alignItems: 'flex-start',
  },
  logCircleLine: {
    width: 40,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  logCircle: {
    marginTop: 2,
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: colors.gray[600]
  },
  logCircleCurrent: {
    backgroundColor: colors.palettes.green,
  },
  logLine: {
    width: 1,
    marginBottom: -2,
    flex: 1,
    backgroundColor: colors.gray[600],
  },
  logLineCurrent: {
    backgroundColor: colors.palettes.green,
  },
});

export default TransactionStatusModal;
