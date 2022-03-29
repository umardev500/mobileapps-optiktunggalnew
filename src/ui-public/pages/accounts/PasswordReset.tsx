import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, ToastAndroid, View } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../redux/hooks';
import { httpService } from '../../../lib/utilities';

function PasswordReset() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'PasswordReset'>>();
  const { t } = useTranslation('account');
  const { user, location } = useAppSelector(({ user }) => user);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  // Vars
  const handleSubmit = async () => {
    setIsLoading(true);

    return httpService('/api/login/login', {
      data: {
        act: 'GantiPwdByEmail',
        dt: JSON.stringify({
          email: user?.email,
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        })
      }
    }).then(({ status }) => {
      setIsLoading(false);

      setIsSuccess(true);
    }).catch((err) => {
      setIsLoading(false);
    });
  };

  const [mailName, mailDomain] = (user?.email || '@').split('@');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Typography heading>
        {t(`Ubah password`)}
      </Typography>

      <Typography style={{ marginTop: 4 }}>
        {t(`Jangan beritahukan password anda kepada orang lain.`)}
      </Typography>

      <View style={{ marginTop: 24 }}>
        {/*<Button
          containerStyle={[styles.resetBtnContainer, { marginBottom: 12 }]}
          rounded={15}
          left={(
            <View style={{ marginRight: 15 }}>
              <Ionicons name="mail" size={28} color={colors.gray[900]} />
            </View>
          )}
          onPress={() => Alert.alert(
            t(`Reset Sandi`),
            t(`Anda yakin mengatur ulang sandi?\nSandi baru akan dikirim ke alamat email Anda`),
            [
              { text: t(`Batal`) },
              {
                text: t(`Ya`),
                onPress: handleSubmit
              },
            ]
          )}
          loading={isLoading}
        >
          <View style={{ flex: 1 }}>
            <Typography>Email ke</Typography>

            <Typography numberOfLines={1} style={{ marginTop: 4 }}>
              {`${mailName.substr(0, mailName.length - 3).replace(/./g, '*')}${mailName.substr(-3)}@${mailDomain}`}
            </Typography>
          </View>
        </Button>*/}

        <Button
          containerStyle={styles.resetBtnContainer}
          style={{ justifyContent: 'flex-start' }}
          label={t(`Ubah Password`)}
          labelProps={{ textAlign: 'left', type: 'p' }}
          rounded={15}
          left={(
            <View style={{ marginRight: 15 }}>
              <Ionicons name="key" size={28} color={colors.gray[900]} />
            </View>
          )}
          onPress={() => navigation.navigatePath('Public', {
            screen: 'BottomTabs.AccountStack.PinEdit'
          })}
          loading={isLoading}
        />

        {!isSuccess ? null : (
          <Typography color="green" style={{ marginTop: 6 }}>
            {t(`Password baru telah dikirim ke email Anda.`)}
          </Typography>
        )}
      </View>
    </ScrollView>
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

  resetBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
  }
});

export default PasswordReset;
