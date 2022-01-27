import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { Favorite } from '../../ui-public/pages';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';

export type PublicFavoriteStackParamList = {
  Favorite: {};
  Login: {};
  Register: {};
  Verification: {};
  Profile: {};
  Address: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicFavoriteStackParamList>();

function PublicFavoriteStack() {
  return (
    <Stack.Navigator
      initialRouteName="Favorite"
      screenOptions={{
        header: ({ navigation, route, options, back }) => {
          const title = getHeaderTitle(options, route.name);

          return (
            <Header
              title={title}
              left={!!back}
              {...(!options.headerRight ? null : {
                right: options.headerRight(navigation as any)
              })}
            />
          );
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Favorite" component={Favorite} options={routeOptions('Favorite')} />

      {/* Favorite */}
      {(Object.keys(Favorite) as Array<keyof typeof Favorite>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Favorite[name]} options={routeOptions(name)} />
        ))}
    </Stack.Navigator>
  );
}

export default PublicFavoriteStack;
