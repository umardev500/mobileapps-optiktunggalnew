import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ImageAuto, Typography } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, ProductModel, PromotionModel, ModelablePaginate } from '../../../types/model';
import { PublicNotificationStackParamList } from '../../../router/publicBottomTabs';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';

function PromotionDetail() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicNotificationStackParamList, 'PromotionDetail'>>();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [promotion, setPromotion] = useState<Modelable<PromotionModel>>({
    model: null,
    modelLoaded: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });

  // Effects
  useEffect(() => {
    if (route.params?.promotion) {
      setPromotion(state => ({
        ...state,
        model: route.params.promotion,
        modelLoaded: true
      }));
    }
  }, [route.params]);

  useEffect(() => {
    if (!product.isPageEnd) {
      retrieveProducts(product.page);
    }
  }, [product.page]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrievePromotion();

    setIsLoading(false);
  };

  const retrieveProducts = async (page: number = 1) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);

    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product/', {
      data: {},
      method: 'POST'
    }).then(({ status, data }) => {
      if (200 === status) {
        setProduct(state => ({
          ...state,
          models: [...(state.models || []), ...data],
          modelsLoaded: true,
          isPageEnd: !data?.length,
        }));
      }
    }).catch(err => {
      setProduct(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const retrievePromotion = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        setPromotion(state => ({
          ...state,
          modelLoaded: true,
        }));

        resolve(null);
      }, 250);
    });
  };

  const { model: promotionModel } = promotion;

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
      {!promotion.modelLoaded ? (
        <View>
          <BoxLoading width={width} height={width * 10/16} style={styles.image} />

          <BoxLoading width={[160, 200]} height={22} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 12 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={[240, width - 30]} height={18} style={{ marginTop: 2 }} />
        </View>
      ) : (
        !promotionModel? (
          <Typography textAlign="center" style={{ marginVertical: 12 }}>
            {t(`${''}Promotion not found.`)}
          </Typography>
        ) : (
          <View>
            {!promotionModel.PromoImage ? null : (
              <View style={[styles.image, { maxHeight: width }]}>
                <ImageAuto
                  source={{ uri: promotionModel.PromoImage }}
                  width={width - 30}
                  style={{
                    marginHorizontal: 15,
                    marginTop: 16,
                    resizeMode: 'stretch'
                  }}
                />
              </View>
            )}

            {!promotionModel.PromoImage ? null : (
              <>
                <Typography style={{ marginTop: 5, textAlign: 'justify' }}>
                  {promotionModel?.description || promotionModel?.PromoDescription}.
                </Typography>
                <View style={{
                  marginTop: 8,
                  borderTopWidth: 1,
                  borderColor: '#ccc'
                }} />
                <Typography type="h4" style={{ marginTop: 15}}>
                  Products
                </Typography>
              </>
            )}
          </View>
        )
      )}
      <Products
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        style={{ marginTop: 15, marginHorizontal: -5 }}
        loading={!product.modelsLoaded && !product.isPageEnd}
        onEndReached={() => {
          if (product.modelsLoaded) {
            setProduct(state => ({
              ...state,
              page: state.page + 1,
              modelsLoaded: false,
            }));
          }
        }}
        data={product.models}
        LoadingView={(
          <ProductsLoading />
        )}
        ListEmptyComponent={!product.modelsLoaded ? (
          <ProductsLoading />
        ) : product.models?.length ? null : (
        <View style={{ height: '100%', marginTop: 120 }}>
          <Image source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaEnPtfvMIzIukll6g4M2s_9U8z99x0ber1Q&usqp=CAU' }} 
                style={{ width: 100, height: 100, alignSelf: 'center' }} />
        </View>
        )}
        // ListFooterComponent={!product.isPageEnd ? null : (
        //   <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
        //     {t(`Already showing all products`)}
        //   </Typography>
        // )}
      />
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

export default PromotionDetail;
