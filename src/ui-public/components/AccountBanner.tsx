import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View, StyleSheet } from 'react-native';
import { wrapper } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { Button, PressableBox, Typography } from '../../ui-shared/components';

function AccountBanner() {
  // Hooks
  const navigation = useAppNavigation();
  const { t } = useTranslation('account');

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE' }}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20
      }}>
        <Image
          source={require('../../assets/images/banners/logowhite.png')}
          style={{
            width: 215,
            height: 215,
            resizeMode: 'contain'
          }}
        />
      </View>

      <View style={[wrapper.row,{
        paddingBottom: 84,
        justifyContent: 'center',
        alignItems: 'center',
      }]}>

        <Button
          style={{ width: 160, backgroundColor: '#cccccc' }}
          label={t('LOGIN').toUpperCase()}
          shadow={1}
          rounded
          onPress={() => {
            navigation.navigatePath('Public', {
              screen: 'BottomTabs.AccountStack.Login',
            });
          }}
        />
        <View style={{ width: 20}}></View>
        <Button
          style={{ width: 160, backgroundColor: '#FEFEFE', borderRadius: 5 }}
          label={t('REGISTER').toUpperCase()}
          rounded
          color="yellow"
          shadow={1}
          onPress={() => navigation.navigatePath('Public', {
            screen: 'BottomTabs.AccountStack.Register'
          })}
        />
      </View>
    </View>
  );
};

export default AccountBanner;
