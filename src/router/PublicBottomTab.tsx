import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Platform } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../lib/styles';
import { FigmaIcon } from '../assets/icons';
import { useAppSelector } from '../redux/hooks';
import {
  PublicHomeStack,
  PublicAccountStack,
  PublicNotificationStack,
  PublicArticleStack,
  PublicContactStack,
  PublicFavoriteStack,
<<<<<<< HEAD
=======
  PublicOtherStack,
>>>>>>> origin/Develop
} from './publicBottomTabs';
import { useTranslation } from 'react-i18next';
import { FocusAwareStatusBar } from '../ui-shared/components';

export type PublicBottomTabParamList = {
  HomeStack: {};
  NotificationStack: {};
  ContactStack: {};
  FavoriteStack: {};
  AccountStack: {};
  ArticleStack: {};
<<<<<<< HEAD
=======
  OtherStack: {};
>>>>>>> origin/Develop
};

const Tab = createBottomTabNavigator<PublicBottomTabParamList>();

function PublicBottomTab() {
  // Hooks
  const { user } = useAppSelector(({ user }) => user);
  const { t } = useTranslation('general');

  // Vars
  const iconProps = ({ size, focused }: {
    focused: boolean;
    color: string;
    size: number;
  }) => ({
    width: 30, // size,
    height: 30, // size,
    color: colors.gray[500],
    ...(!focused ? null : { color: colors.palettes.primary }),
  });

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.palettes.white
    }}>
      <FocusAwareStatusBar
        backgroundColor={colors.palettes.skyblue}
        barStyle="dark-content"
      />

      <Tab.Navigator
        initialRouteName="HomeStack"
        screenOptions={{
          tabBarActiveTintColor: colors.palettes.primary,
          tabBarStyle: {
            height: 64,
            paddingTop: 8,
            paddingBottom: 8,
            ...(Platform.OS !== 'ios' ? null : { paddingBottom: 0 }),
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeStack"
          component={PublicHomeStack}
          options={{
            tabBarLabel: t('Home'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaHome {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
          name="NotificationStack"
          component={PublicNotificationStack}
          options={{
            tabBarLabel: t('Notifikasi'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaNotification {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
<<<<<<< HEAD
          name="ContactStack"
          component={PublicContactStack}
=======
          name="OtherStack"
          component={PublicOtherStack}
>>>>>>> origin/Develop
          options={{
            tabBarLabel: t('Katalog'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaCatalogue {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
<<<<<<< HEAD
=======
          name="FavoriteStack"
          component={PublicFavoriteStack}
          options={{
            tabBarLabel: t('Favorit'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaFavorite {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
>>>>>>> origin/Develop
          // name="FavoriteStack"
          name="ArticleStack"
          component={PublicArticleStack}
          options={{
            tabBarLabel: t('News'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaNews {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
          name="AccountStack"
          component={PublicAccountStack}
          options={{
<<<<<<< HEAD
            tabBarLabel: t('Akun'),
=======
            tabBarLabel: t('Pengaturan'),
>>>>>>> origin/Develop
            tabBarIcon: (iconParams) => (!user?.foto || true) ? (
              <FigmaIcon.FigmaAccount {...iconProps(iconParams)} />
            ) : (
              <Image
                source={{ uri: user?.foto }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 20,
                  resizeMode: 'cover',
                }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default PublicBottomTab;
