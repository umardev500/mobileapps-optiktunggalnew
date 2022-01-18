import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ImageAuto, Typography, RenderHtml } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, BannerModel, ModelablePaginate } from '../../../types/model';
import { PublicArticleStackParamList } from '../../../router/publicBottomTabs';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';

function BannerDetail() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicArticleStackParamList, 'BannerDetail'>>();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Modelable<BannerModel>>({
    model: null,
    modelLoaded: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);


  // Effects
  useEffect(() => {
    if (route.params?.banner) {
      setBanner(state => ({
        ...state,
        model: route.params.banner,
        modelLoaded: true
      }));
    }
  }, [route.params]);

  useEffect(() => {});

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveBannerDetail();

    setIsLoading(false);
  };

  const retrieveBannerDetail = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        setBanner  (state => ({
          ...state,
          modelLoaded: true,
        }));

        resolve(null);
      }, 250);
    });
  };

  const { model: bannerModel } = banner;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={(
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.palettes.primary]}
        />
      )}
    >
      <Typography style={{ textAlign: 'center', marginTop: 250, }}>
        Mohon maaf sedang dalam pengembangan
      </Typography>
      <ImageAuto
        source={{ uri: 'https://img.freepik.com/free-vector/flat-engineering-construction-illustrated_23-2148892788.jpg?size=626&ext=jpg' }}
        width={width - 300}
        style={{
          marginHorizontal: 15,
          marginTop: 16,
          alignSelf: 'center',
          resizeMode: 'stretch'
        }}
      />
      {/*!banner.modelLoaded ? (
        <View>
          <BoxLoading width={width} height={width * 10/16} style={styles.image} />

          <BoxLoading width={[160, 200]} height={22} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 12 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={[240, width - 30]} height={18} style={{ marginTop: 2 }} />
        </View>
      ) : (
        !bannerModel? (
          <Typography textAlign="center" style={{ marginVertical: 12 }}>
            {t(`${''}Promotion not found.`)}
          </Typography>
        ) : (
          <View>
            {!bannerModel.banner_foto ? null : (
              <View style={[styles.image, { maxHeight: width }]}>
                <ImageAuto
                  source={{ uri: 'https://optiktunggal.com/img/article/'+bannerModel.banner_foto }}
                  width={width - 30}
                  style={{
                    marginHorizontal: 15,
                    marginTop: 16,
                    resizeMode: 'stretch'
                  }}
                />
              </View>
            )}

            <Typography>{bannerModel.banner_desc}</Typography>
          </View>
        )
      )*/}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  image: {
    marginHorizontal: -15,
    marginBottom: 16,
  }
});

export default BannerDetail;
