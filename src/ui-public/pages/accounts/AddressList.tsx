import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { AddressModel, Modelable } from '../../../types/model';
import { Button, Header, PressableBox, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../../router/Router';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../redux/hooks';
import { fetchAddresses } from '../../../redux/actions';
import { useTranslation } from 'react-i18next';
import { httpService, showPhone } from '../../../lib/utilities';

type ActionScreenState = {
  rootScreen?: keyof RootStackParamList;
  screenPath?: string;
};

function AddressList() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'AddressList'>>();
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const { user: { user, location, address: addressState } } = useAppSelector((state) => state);
  const { t } = useTranslation('account');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    models: [],
    modelLoaded: false,
  });
  const [actionScreen, setActionScreen] = useState<ActionScreenState>({
    rootScreen: undefined,
    screenPath: undefined,
  });
  const [options, setOptions] = useState({
    selected: -1,
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const { action_screen, refresh } = route.params;

    if (action_screen) {
      const [rootScreen, screenPath] = action_screen;

      setActionScreen(state => ({
        ...state,
        rootScreen,
        screenPath,
      }));
    }

    refresh && handleRefresh();
  }, [route.params]);

  useEffect(() => {
    if (addressState.modelsLoaded) {
      setAddress(state => ({
        ...state,
        models: addressState.models,
        modelsLoaded: true
      }));
    }
  }, [addressState]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveAddresses();

    setIsLoading(false);
  };

  const retrieveAddresses = async () => {
    dispatch(fetchAddresses());
  };

  const handleAddressSelect = (item: AddressModel, index: number) => {
    setOptions(state => ({
      ...state,
      selected: index,
    }));
  };

  const handleEdit = (addressItem: AddressModel) => {
    const {
      rootScreen = 'Public',
      screenPath = 'BottomTabs.AccountStack.AddressEdit'
    } = actionScreen;
    const paths = (screenPath)?.split('.') || [];

    if (rootScreen) {
      navigation.navigatePath(rootScreen, {
        screen: screenPath,
        params: paths.map((item, index) => {
          return index + 1 !== paths?.length ? null : {
            address: addressItem,
          };
        }),
      });
    }
  };

  const handleSubmit = (addressItem: AddressModel) => {
    const { rootScreen, screenPath } = actionScreen;
    const paths = screenPath?.split('.') || [];

    if (rootScreen) {
      navigation.navigatePath(rootScreen, {
        screen: screenPath,
        params: paths.map((item, index) => {
          return index + 1 !== paths?.length ? null : {
            address: addressItem,
          };
        }),
      });
    }
  };

  const handleDelete = async (addressItem: AddressModel) => {
    return httpService('/register/save', {
      data: {
        act: 'ShipTo',
        comp: '001',
        dt: JSON.stringify({
          regid: user?.id,
          id: addressItem.id,
          cmd: '3',
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        }),
      }
    }).then(async ({ status, id = 1 }) => {
      console.log("ADDRESS REMOVED", status, id);

      if (status === 200) {
        handleRefresh();
      }
    }).catch(err => {
      console.error("Register FAILED", err);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        left
        title={[
          t(`Alamat Pengiriman`),
          <PressableBox
            onPress={() => navigation.navigatePath('Public', {
              screen: 'BottomTabs.AccountStack.AddressEdit',
            })}
          >
            <Typography style={{
              textDecorationLine: 'underline',
              textDecorationStyle: 'solid'
            }}>
              {t(`Tambah Alamat`)}
            </Typography>
          </PressableBox>
        ]}
      />

      {!actionScreen.rootScreen ? null : (
        <View style={[styles.wrapper, { paddingVertical: 12 }]}>
          <Typography type="h4" style={{ marginTop: 12 }}>
            {t(`Pilih salah satu alamat`)}
          </Typography>
        </View>
      )}

      <FlatList
        contentContainerStyle={[styles.container, styles.wrapper]}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
        data={[...(address.models || [])].reverse()}
        renderItem={({ item, index }) => (
          <View
            key={index}
            style={{
              position: 'relative',
              marginTop: index === 0 ? 0 : 32,
            }}
          >
            <PressableBox
              containerStyle={styles.cardContainer}
              style={styles.card}
              onPress={() => handleAddressSelect(item, index)}
            >
              {!item.title ? null : (
                <Typography heading>{item.title}</Typography>
              )}

              <Typography heading style={{ marginTop: 4 }}>
                {item.vch_nama || item.nama}
              </Typography>

              <Typography style={{ marginTop: 4 }}>
                {showPhone(item.hp, '+62')}
              </Typography>

              <Typography style={{ marginTop: 4 }}>
                {item.alamat}
              </Typography>

              {!item.lat || !item.lng ? null : (
                <View style={[wrapper.row, { marginTop: 8, alignItems: 'center' }]}>
                  <Ionicons name="location-outline" size={20} color={colors.gray[900]} />

                  <Typography heading style={{ paddingLeft: 4 }}>
                    {t(`Sudah Pinpoint`)}
                  </Typography>
                </View>
              )}

              {index !== options.selected || true ? null : (
                <View style={{ position: 'absolute', top: 15, right: 15 }}>
                  <Ionicons name="checkmark" size={24} color={colors.gray[900]} />
                </View>
              )}
            </PressableBox>

            {!!actionScreen.rootScreen ? null : (
              <Button
                containerStyle={{
                  position: 'absolute',
                  top: 12,
                  right: 20
                }}
                size={24}
                rounded
                onPress={() => Alert.alert(
                  `${t('Hapus Alamat')}`,
                  `${t('Apakah Anda ingin menghapus alamat ini?')}`,
                  [
                    {
                      text: `${t('Batal')}`,
                    },
                    {
                      text: `${t('Hapus')}`,
                      onPress: () => handleDelete(item),
                    }
                  ]
                )}
              >
                <Ionicons name="trash-outline" size={18} color={colors.palettes.red} />
              </Button>
            )}

            {!actionScreen.rootScreen ? (
              <Button
                containerStyle={styles.cardAction}
                style={{ width: 150 }}
                label={t(`Ubah Alamat`).toUpperCase()}
                color="yellow"
                rounded
                onPress={() => handleEdit(item)}
              />
            ) : (
              <Button
                containerStyle={styles.cardAction}
                style={{ width: 150 }}
                label={t(`Pilih Alamat`).toUpperCase()}
                color="yellow"
                rounded
                onPress={() => handleSubmit(item)}
              />
            )}
          </View>
        )}
        ListEmptyComponent={!address.modelsLoaded ? (
          <View style={styles.card}>
            <BoxLoading width={90} height={18} />

            <BoxLoading width={[120, 160]} height={18} style={{ marginTop: 8 }} />
            <BoxLoading width={[220, width-100]} height={18} style={{ marginTop: 4 }} />
            <BoxLoading width={[180, 240]} height={18} style={{ marginTop: 4 }} />
          </View>
        ) : (
          <View style={{ paddingVertical: 12 }}>
            <Typography textAlign="center">
              {t(`Belum ada alamat yang disimpan.`)}
            </Typography>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 24,
  },
  wrapper: {
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },

  cardContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: colors.palettes.primary
  },
  card: {
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  cardAction: {
    elevation: 3,
    position: 'absolute',
    alignSelf: 'center',
    top: '100%',
    marginTop: -16
  },

  action: {
    marginTop: 'auto',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.white
  },
});

export default AddressList;
