import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { Katalog } from '../../ui-public/pages/otherpage';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';
// import * as Katalog from '../../ui-public/pages/otherpage';

export type PublicOtherStackParamList = {
 //Katalog: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicOtherStackParamList>();

function PublicOtherStack() {
  return (
    <Stack.Navigator
      initialRouteName="Katalog"
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
      <Stack.Screen name="Katalog" component={Katalog} options={routeOptions('Katalog')} />

      {/* Katalog */}
      {(Object.keys(Katalog) as Array<keyof typeof Katalog>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Katalog[name]} options={routeOptions(name)} />
        ))}

    </Stack.Navigator>
  );
}

export default PublicOtherStack;
