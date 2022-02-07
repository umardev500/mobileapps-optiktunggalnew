import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { getHeaderTitle } from '@react-navigation/elements';
import { Article } from '../../ui-public/pages';
import Header from '../../ui-shared/components/Header';

import * as ArticleDetailPage from '../../ui-public/pages/article';
<<<<<<< HEAD
import * as ContactLensDetailPage from '../../ui-public/pages/article';
import { routeOptions } from '../routerConfig';
import { ArticleModel, ContactLensModel } from '../../types/model';
=======
import * as BannerDetailPage from '../../ui-public/pages/article/banner';
import { routeOptions } from '../routerConfig';
import { ArticleModel, ContactLensModel, BannerModel } from '../../types/model';
>>>>>>> origin/Develop

export type PublicArticleStackParamList = {
  Article: {};
  // ArticleDetail: {
  //   article_id: string;
  //   article_name?: Partial<ArticleModel>;
  // },
  // ContactLensDetail: {
  //   contactlens?: ContactLensModel;
  // };
  ArticleDetail: {
    article?: ArticleModel;
  };
<<<<<<< HEAD
=======
  BannerDetail: {
    banner?: BannerModel;
  };
>>>>>>> origin/Develop
  [key: string]: {};
};

const Stack = createStackNavigator<PublicArticleStackParamList>();

function PublicArticleStack() {
  return (
    <Stack.Navigator
      initialRouteName="Article"
      screenOptions={{
        header: ({ navigation, route, options, back }) => {
          const title = getHeaderTitle(options, route.name);

          return (
            <Header
<<<<<<< HEAD
              style={{ marginTop: 5 }}
              title={title}
              left={!!back}
              {...(!options.headerRight ? null : {
                right: options.headerRight(navigation as any) 
=======
              title={title}
              left={!!back}
              {...(!options.headerRight ? null : {
                right: options.headerRight(navigation as any)
>>>>>>> origin/Develop
              })}
            />
          );
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Article" component={Article} options={routeOptions('Article')} />

      {/* Article */}
      {(Object.keys(Article) as Array<keyof typeof Article>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Article[name]} options={routeOptions(name)} />
        ))}

      {/* Article Detail */}
      {(Object.keys(ArticleDetailPage) as Array<keyof typeof ArticleDetailPage>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={ArticleDetailPage[name]} options={routeOptions(name)} />
        ))}

<<<<<<< HEAD
=======
      {/* Banner Detail */}
      {(Object.keys(BannerDetailPage) as Array<keyof typeof BannerDetailPage>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={BannerDetailPage[name]} options={routeOptions(name)} />
        ))}       

>>>>>>> origin/Develop

    </Stack.Navigator>
  );
}

export default PublicArticleStack;
