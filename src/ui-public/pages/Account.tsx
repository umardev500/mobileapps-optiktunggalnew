import React, { useCallback, useEffect, useState } from 'react';
import { Image, Linking, Platform, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { colors, shadows, wrapper } from '../../lib/styles';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useAppNavigation } from '../../router/RootNavigation';
import { BottomDrawer, Button, Header, PressableBox, Typography } from '../../ui-shared/components';
import AccountBanner from '../components/AccountBanner';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { httpService, Storage, showPhone } from '../../lib/utilities';
import LanguageModal from '../components/LanguageModal';
import { useTranslation } from 'react-i18next';
import ViewCollapse from '../components/ViewCollapse';
import { FigmaIcon } from '../../assets/icons';
import { useRoute } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setCartItems, setFavorites } from '../../redux/actions';
import moment from 'moment';

function Account() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { user: { user }, ui: { lang } } = useAppSelector((state) => state);
  const { t } = useTranslation('account');
  const { height } = useWindowDimensions();
  const dispatch = useAppDispatch();

  // States
  const [options, setOptions] = useState({
    authModalOpen: false,
    langModalOpen: false,
    termsUrl: '',
    privacyUrl: '',
    versionUrl: '',
    faqUrl: '',
  });

  // Effects
  useEffect(() => {
    handleVersionCheck();
  }, []);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus' as any, () => {
      handleModalToggle('auth', !user);
    });

    const unsubscribeBlur = navigation.addListener('blur' as any, () => {
      handleModalToggle('auth', false);
    });

    if (user) {
      unsubscribeFocus();
      unsubscribeBlur();
    }

    handleModalToggle('auth', !user);

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [user]);

  // Vars
  const handleVersionCheck = async () => {
    let isValid = true;

    await httpService(`/version.json`, {
      method: 'get'
    }).then(({
      terms_ios, privacy_ios, link_ios,
      terms_android, privacy_android, link_android, faq_ios, faq_android,
    }) => {
      let termsUrl = '';
      let privacyUrl = '';
      let versionUrl = '';
      let faqUrl= '';

      switch (Platform.OS) {
        case 'ios':
          termsUrl = terms_ios;
          privacyUrl = privacy_ios;
          versionUrl = link_ios;
          faqUrl  = faq_ios;
          break;
        case 'android':
          termsUrl = terms_android;
          privacyUrl = privacy_android;
          versionUrl = link_android;
          faqUrl  = faq_android;
          break;
      }

      setOptions(state => ({
        ...state,
        termsUrl,
        privacyUrl,
        versionUrl,
        faqUrl
      }));
    }).catch(() => void (0));

    return isValid;
  };

  const handleLogout = async () => {
    // await dispatch(setCartItems([]));
    // await dispatch(setFavorites([]));

    await httpService.logout();

    navigation.reset({
      index: 0,
      routes: [{
        name: 'Public',
        params: { screen: 'BottomTabs' }
      }],
    });
  };

  const handleModalToggle = (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'lang':
        setOptions(state => ({
          ...state,
          langModalOpen: 'boolean' === typeof open ? open : !options.langModalOpen,
        }))
        break;
      case 'auth':
        setOptions(state => ({
          ...state,
          authModalOpen: 'boolean' === typeof open ? open : !options.authModalOpen,
        }))
        break;
    }
  };

  const renderLangBtn = () => {
    return (
      <Button
        containerStyle={{ marginLeft: 12 }}
        size={42}
        label={lang.toUpperCase()}
        labelProps={{ color: 900, size: 'lg' }}
        onPress={() => setOptions(state => ({ ...state, langModalOpen: true }))}
      />
    );
  };

  const renderUnauthenticated = () => {
    return (
      <View style={{ flex: 1, position: 'relative' }}>

        <SafeAreaView style={{ flex: 1 }}>
          <Header hideSearch hideBg />

          <View style={styles.wrapper}>
            <AccountBanner />
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <>
      {!user ? renderUnauthenticated() : (
        <View style={{ flex: 1 }}>
          <Header
            title={t(`${''}Pengaturan`)}
            left
            // right={renderLangBtn()}
          />

          <ScrollView
            contentContainerStyle={[styles.wrapper, styles.container]}
          >
            <View style={styles.accountCard}>
              <View style={[wrapper.row, { alignItems: 'center', marginTop: 5, }]}>
                {!user.foto ? <Image source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTdmrjoiXGVFEcd1cX9Arb1itXTr2u8EKNpw&usqp=CAU' }} style={styles.avatar} /> : (
                  <Image source={{ uri: user.foto }} style={styles.avatar} />
                )}
                <View style={{ flexGrow: 1 }}>
                  <Typography style={{ color: '#333333', fontSize: 14, fontWeight: 'bold',  marginHorizontal: 15}} >
                    {user.name || `${user.namadepan} ${user.namabelakang}`}
                  </Typography>
                  {!user.foto ? 
                    <Typography style={{ marginHorizontal: 15,}}>
                      <Image source={require('../../assets/icons/figma/vip.png')} style={styles.avatarVIP} />
                      Member
                    </Typography>
                  : (
                    <Typography style={{ marginHorizontal: 15,}}>
                      <Image source={require('../../assets/icons/figma/vip.png')} style={styles.avatarVIP} />
                      Member
                    </Typography>
                  )}
                  {user.verified || 1 ?
                      <PressableBox
                        containerStyle={{ marginTop: 1 }}
                        onPress={() => navigation.navigatePath('Public', {
                          screen: 'BottomTabs.AccountStack.ProfileEdit',
                        })}
                      >
                        <Typography
                          textAlign="left"
                          style={{ marginHorizontal: 15, marginTop: 3}}
                          color="primary">
                          {t(`${''}Lihat Profil`)}
                        </Typography>
                      </PressableBox>: (
                    <PressableBox
                      containerStyle={{ marginTop: 8 }}
                      onPress={() => navigation.navigatePath('Public', {
                        screen: 'BottomTabs.AccountStack.Verification',
                        params: [null, null, {
                          profile: user,
                        }]
                      })}
                    >
                      <Typography
                        textAlign="center"
                        color="primary"
                        style={{
                          borderBottomWidth: 1,
                          borderColor: colors.palettes.primary
                        }}
                      >
                        {t(`${''}Akun Belum terverifikasi`)}
                      </Typography>
                    </PressableBox>
                  )}
                </View>
              </View>

              <View style={{ marginTop: 5 }}>
                <ViewCollapse
                  style={styles.menuContainer}
                  pressableProps={{
                    containerStyle: styles.menuBtnContainer,
                  }}
                  header={t(`${''}Transaksi`)}
                  headerProps={{
                    type: 'h',
                    style: { paddingLeft: 24 + 15 }
                  }}
                  collapse
                >
                  {[
                    {
                      title: t(`${''}Daftar Transaksi`),
                      subtitle: t(`${''}Transaksi yang pernah anda lakukan.`),
                      Icon: FigmaIcon.FigmaDownload,
                      navigatePath: () => {
                        navigation.navigatePath('Public', {
                          screen: 'BottomTabs.NotificationStack.TransactionList',
                          params: [null, {
                            initial: false,
                          }]
                        });
                      },
                    },
                    {
                      title: t(`${''}Favorit Kamu`),
                      subtitle: t(`${''}Produk yang kamu sukai`),
                      Icon: FigmaIcon.Figmawishlist,
                      navigatePath: () => {
                        navigation.navigatePath('Public', {
                          screen: 'BottomTabs.',
                        });
                      },
                    },
                  ].map((item, index) => (
                    <PressableBox
                      key={index}
                      containerStyle={{
                        marginTop: index === 0 ? 8 : 4,
                        borderRadius: 15,
                        marginHorizontal: 0,
                      }}
                      style={styles.menuChildBtn}
                      onPress={!item.navigatePath ? undefined : (
                        () => {
                          if ('function' === typeof item.navigatePath) {
                            return item.navigatePath();
                          }
                          
                          navigation.navigatePath('Public', {
                            screen: item.navigatePath
                          });
                      })}
                    >
                      <View style={styles.menuChildIcon}>
                        {!item.Icon ? null : (
                          <item.Icon width={24} height={24} color={colors.gray[900]} />
                        )}
                      </View>

                      <View style={{ flex: 1, paddingLeft: 15 }}>
                        <Typography heading>
                          {item.title}
                        </Typography>

                        <Typography size="sm" color={800} style={{ marginTop: 4 }}>
                          {item.subtitle}
                        </Typography>
                      </View>
                    </PressableBox>
                  ))}
                </ViewCollapse>
              </View>

              <View style={{ marginTop: 5 }}>
                <ViewCollapse
                  style={styles.menuContainer}
                  pressableProps={{
                    containerStyle: styles.menuBtnContainer,
                  }}
                  header={t(`${''}Pengaturan Akun`)}
                  headerProps={{
                    type: 'h',
                    style: { paddingLeft: 24 + 15 }
                  }}
                  collapse
                >
                  {[
                    // {
                    //   title: t(`${''}Daftar Transaksi`),
                    //   subtitle: t(`${''}Transaksi yang pernah anda lakukan.`),
                    //   Icon: FigmaIcon.FigmaDownload,
                    //   navigatePath: () => {
                    //     navigation.navigatePath('Public', {
                    //       screen: 'BottomTabs.NotificationStack.TransactionList',
                    //       params: [null, {
                    //         initial: false,
                    //       }]
                    //     });
                    //   },
                    // },
                    // {
                    //   title: t(`${''}Keranjang`),
                    //   subtitle: t(`${''}Daftar produk yg ditambahkan ke keranjang belanja`),
                    //   Icon: FigmaIcon.FigmaCartIn,
                    //   navigatePath: () => {
                    //     navigation.navigatePath('Public', {
                    //       screen: 'BottomTabs.HomeStack.Cart',
                    //       params: [null, {
                    //         initial: false,
                    //       }]
                    //     });
                    //   },
                    // },
                    // {
                    //   title: t(`${''}Ulasan`),
                    //   subtitle: t(`${''}Daftar ulasan produk yg sudah dibeli`),
                    //   Icon: FigmaIcon.FigmaDocument,
                    //   navigatePath: 'BottomTabs.AccountStack.ReviewList',
                    // },
                    {
                      title: t(`${''}Keamanan Akun`),
                      subtitle: t(`${''}PIN & verifikasi data diri`),
                      Icon: FigmaIcon.FigmaLock,
                      navigatePath: 'BottomTabs.AccountStack.PasswordReset',
                    },
                    // {
                    //   title: t(`${''}Alamat Pengiriman`),
                    //   subtitle: t(`${''}Atur alamat pengiriman belanjaan`),
                    //   Icon: FigmaIcon.FigmaHomeFilled,
                    //   navigatePath: 'BottomTabs.AccountStack.AddressList',
                    // },
                    {
                      title: t(`${''}Hubungi Kami`),
                      Icon: FigmaIcon.FigmaContact,
                      subtitle: t(`${''}Kami senang melayani anda, silahkan ajukan pertanyaan.`),
                      navigatePath: 'BottomTabs.ContactStack.Contact',
                    },
                  ].map((item, index) => (
                    <PressableBox
                      key={index}
                      containerStyle={{
                        marginTop: index === 0 ? 8 : 4,
                        borderRadius: 15,
                        marginHorizontal: 0,
                      }}
                      style={styles.menuChildBtn}
                      onPress={!item.navigatePath ? undefined : (
                        () => {
                          if ('function' === typeof item.navigatePath) {
                            return item.navigatePath();
                          }
                          
                          navigation.navigatePath('Public', {
                            screen: item.navigatePath
                          });
                      })}
                    >
                      <View style={styles.menuChildIcon}>
                        {!item.Icon ? null : (
                          <item.Icon width={24} height={24} color={colors.gray[900]} />
                        )}
                      </View>

                      <View style={{ flex: 1, paddingLeft: 15 }}>
                        <Typography heading>
                          {item.title}
                        </Typography>

                        <Typography size="sm" color={800} style={{ marginTop: 4 }}>
                          {item.subtitle}
                        </Typography>
                      </View>
                    </PressableBox>
                  ))}
                </ViewCollapse>
              </View>

              <View style={{ marginTop: 0 }}>
                <ViewCollapse
                  style={styles.menuContainer}
                  pressableProps={{
                    containerStyle: styles.menuBtnContainer,
                  }}
                  header={t(`${''}Informasi lain`)}
                  headerProps={{
                    type: 'h',
                    style: { paddingLeft: 24 + 15 }
                  }}
                  collapse
                >
                  {[
                    {
                      title: t(`${''}Syarat & Ketentuan`),
                      navigatePath: 'Terms',
                      url: options.termsUrl,
                      Icon: FigmaIcon.FigmaHomeFilled,
                    },
                    {
                      title: t(`${''}FAQ`),
                      navigatePath: 'FAQ',
                      url: options.faqUrl,                    
                    },
                    {
                      title: t(`${''}Kebijakan Privasi`),
                      navigatePath: 'PrivacyPolicy',
                      url: options.privacyUrl,
                    },
                    {
                      title: t(`${''}Ulas Aplikasi ini`),
                      navigatePath: 'BottomTabs.AccountStack.Account',
                      url: options.versionUrl,
                    },
                  ].map((item, index) => (
                    <PressableBox
                      key={index}
                      containerStyle={{
                        marginTop: index === 0 ? 8 : 4,
                        borderRadius: 15,
                        marginHorizontal: 0,
                      }}
                      style={[styles.menuChildBtn, { paddingVertical: 8 }]}
                      onPress={!item.url ? undefined : () => Linking.openURL(item.url)}
                    >
                      <View style={styles.menuChildIcon} />

                      <View style={{ flex: 1, paddingLeft: 15 }}>
                        <Typography heading>
                          {item.title}
                        </Typography>
                      </View>
                    </PressableBox>
                  ))}
                </ViewCollapse>
              </View>

              <View style={{ marginTop: 0, paddingBottom: 15 }}>
                <Button
                  containerStyle={[styles.menuBtnContainer, {
                    alignSelf: 'flex-start',
                    borderBottomWidth: 0
                  }]}
                  style={{ paddingHorizontal: 15, paddingVertical: 12 }}
                  label={`${''}Keluar Akun`}
                  labelStyle={{
                    paddingLeft: 15,
                    minWidth: 128,
                    textAlign: 'left',
                    color: 'red'
                  }}
                  rounded={4}
                  left={(
                    <View style={{ width: 24, alignItems: 'center' }}>
                      <Ionicons name="arrow-up" size={18} color='red' />
                    </View>
                  )}
                  onPress={handleLogout}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Lang Modal */}
      <LanguageModal
        isVisible={options.langModalOpen}
        onSwipeComplete={() => handleModalToggle('lang', false)}
        onBackButtonPress={() => handleModalToggle('lang', false)}
        onBackdropPress={() => handleModalToggle('lang', false)}
        onSelected={() => handleModalToggle('lang', false)}
      />

      {/* Register Modal */}
      <BottomDrawer
        isVisible={options.authModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Home',
        })}
        style={{
          paddingTop: 0,
          paddingBottom: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height
        }}
      >
        {renderUnauthenticated()}
      </BottomDrawer>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
  },
  container: {
    backgroundColor: colors.palettes.primary
  },

  accountCard: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 15,
    marginTop: -20,
  },
  avatarVIP: {
    width: 30,
    height: 30,
    marginHorizontal: 15,
  },
  avatar: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 128,
    resizeMode: 'cover',
  },
  cardMember: {
    marginTop: 20, 
    borderColor: '#333', 
    backgroundColor:'#D0A92C',
    borderWidth:0,
    borderRadius:20, height: 200, width: '100%',
    ...shadows[5]
  },
  menuContainer: {
    margin: -15,
    padding: 15,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
  menuChildBtn: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  menuChildIcon: {
    width: 24,
    alignItems: 'center',
  }
});

export default Account;
