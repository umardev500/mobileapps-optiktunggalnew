import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { Modelable, ArticleModel } from '../../../types/model';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import moment from 'moment';

function ContactLens() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<Modelable<ArticleModel>>({
    models: [],
    modelsLoaded: false,
  });

  const [tabActive, setTabActive] = useState<number>(0);
  const handleTabToggle = (tab: number) => {
    setTabActive(tab === tabActive ? 1 : tab);
  };
  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    await retrieveArticle();
    setIsLoading(false);
  };

  const retrieveArticle = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleList',
      },
    }).then(({ status, data }) => {
      setArticle(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setArticle(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const handleGoToArticleDetail = (article: ArticleModel) => {
    if (!article.ArticleID) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.ArticleStack.ArticleDetail',
      params: [null, null, {
        article_id: article.ArticleID || 0,
        article,
      }]
    });
  };

  const renderarticles = ({ item, index }: ListRenderItemInfo<ArticleModel>) => {
  const content = item.html;

    return (
      <PressableBox
        key={index}
        style={styles.articleCard}
        onPress={() => handleGoToArticleDetail(item)}>

        {!item.ArticleID ? null : (
          <Image source={{ uri: 'https://optiktunggal.com/img/article/'+item.ArticleImage }} style={styles.articleCardImage} />
        )}
        <View style={{
            marginTop: 8,
            borderTopWidth: 1,
            borderColor: '#ccc'
          }} />
        <View style={{ flex: 1, marginTop: 10
         }}>
          <Typography heading>
            {item.ArticleName}
          </Typography>
          <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}></View>
          <View style={[wrapper.row, { alignItems: 'center', paddingHorizontal: 5}]}>
            <Typography color="black" style={{ flex: 1, fontSize: 13 }}>
              {item.ArticlePublishDate}    <Ionicons name="eye-outline" size={16} color={'black'} /> {item.ArticleView}
            </Typography>
            <Button
              containerStyle={[styles.btnShare]}
              label={t('Bagikan', { count: 1 })}
              labelProps={{ type: 'p', size: 'sm' }}
              labelStyle={{ textAlign: 'center' }}
              size="lg"
              right={(
                <Ionicons name="share-social-outline" size={18} color={'black'} />
              )}
              // onPress={() => navigation.navigatePath('Public', {
              //   screen: 'BottomTabs.NotificationStack.PromotionList'
              // })}
              onPress={() => Alert.alert( "Pemberitahuan", "Fitur ini sedang dikembangkan!",
                            [{text: "Cancel",onPress: () => console.log("Cancel Pressed"),style: "cancel"},
                              { text: "OK", onPress: () => console.log("OK Pressed") }
                            ]
              )}
            />
          </View>
          {/*!content ? null : (
            <View style={{ marginTop: 4, maxHeight: 50 }}>
              <RenderHtml
                contentWidth={width - 30 - (!item.html ? 0 : 76)}
                source={{ html: content }}
              />
            </View>
          )*/}
        </View>
      </PressableBox>
    )
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE' }}>
      <View style={styles.Tabbed}>
        {[
          { label: 'Schon', tab: 1 },
          { label: 'Edgy', tab: 2 },
          { label: 'Acuvue', tab: 3 },
        ].map((item, index) => (
          <Button
            key={index}
            containerStyle={{
              flex: 1,
              marginHorizontal: 4,
              backgroundColor: colors.white,
              ...shadows[3],
            }}
            label={item.label}
            color={tabActive !== item.tab ? 'transparent' : 'primary'}
            rounded={10}
            onPress={() => handleTabToggle(item.tab)}
          />
        ))}
      </View>

      {tabActive !== 1 ? null : (
        <FlatList
          contentContainerStyle={styles.container}
          refreshControl={(
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.palettes.primary]}
            />
          )}
          data={article.models}
          renderItem={renderarticles}
          ListEmptyComponent={!article.modelsLoaded ? (
            <View style={[styles.promoCardContainer, { marginTop: 8 }]}>
              <View style={styles.articleCard}>
                <BoxLoading width={64} height={64} rounded={8} />

                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <BoxLoading width={[100, 150]} height={20} />

                  <BoxLoading width={[140, 200]} height={18} style={{ marginTop: 6 }} />
                  <BoxLoading width={[100, 130]} height={18} style={{ marginTop: 2 }} />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 15 }}>
              <Typography textAlign="center">
                {t(`${''}Semua Kabar sudah ditampilkan.`)}
              </Typography>
            </View>
          )}
        />
      )}

      {tabActive !== 2 ? null : (
        <View style={{ marginTop: 15 }}>
          <Typography textAlign="center">
            {t(`${''}List Edgy.`)}
          </Typography>
        </View>
      )}

      {tabActive !== 3 ? null : (
        <View style={{ marginTop: 15 }}>
          <Typography textAlign="center">
            {t(`${''}List Acuvue.`)}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderColor: '#F3F3F3',
  },
  Tabbed: {
    ...wrapper.row,
    marginVertical: 12,
    marginHorizontal: -4,
    paddingHorizontal: 12,
    backgroundColor: '#FEFEFE',
  },
  actionBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
  },

  btnShare: {
    backgroundColor: colors.white,
  },

  header: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },

  promoCardContainer: {
    marginHorizontal: 0,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  articleCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#FEFEFE',
    borderWidth: 2,
    borderColor: '#F3F3F3',
    borderRadius: 5,
  },
  articleCardImage: {
    width: '100%',
    height: 130,
    borderRadius: 5,
    resizeMode: 'stretch',
    backgroundColor: '#F3F3F3',
    borderColor: '#F3F3F3',
  }
});

export default ContactLens;
