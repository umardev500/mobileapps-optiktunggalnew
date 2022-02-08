import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import PublicStack from './PublicStack';
import ClientStack from './ClientStack';
import { navigationRef } from './RootNavigation';
import { SplashScreen } from '../ui-shared/pages';
import { Walkthrough } from '../ui-public/pages';
import { Home } from '../ui-public/pages';

export type RootStackParamList = {
  SplashScreen: {};
  Walkthrough: {};
  Client: {};
  Public: {};
  Home: {};
};

const Stack = createStackNavigator<RootStackParamList>();

function NavigationProvider() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Walkthrough"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Walkthrough" component={Walkthrough} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Public" component={PublicStack} />
        <Stack.Screen name="Client" component={ClientStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default NavigationProvider;
