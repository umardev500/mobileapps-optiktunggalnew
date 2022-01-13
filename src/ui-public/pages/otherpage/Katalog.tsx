import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { KatalogModel } from '../../../types/model/Others';
import { RenderHtml, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import CardCollapse from '../../components/CardCollapse';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { httpService } from '../../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { BannerModel, CategoryModel, Modelable, ModelablePaginate, ProductModel, BrandModel } from '../../../types/model';
import Products from '../../components/Products';
import ProductsLoading from '../../loadings/ProductsLoading';

function Katalog() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('katalog');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [Katalog, setKatalog] = useState<Modelable<KatalogModel>>({
    models: [],
    modelsLoaded: false,
  });

  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveProducts();

    setIsLoading(false);
  };

  const retrieveProducts = async (page: number = 1) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);

    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdList',
        dt: JSON.stringify({
          comp: '001',
          reccnt,
          pg: page,
          param: "list",
          limit: product.perPage
        }),
      },
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

  return (
    <>
      <Products
        contentContainerStyle={styles.container}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
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
          <Typography textAlign="center" style={{ marginVertical: 12 }}>
            {t(`Tidak ada produk`)}
          </Typography>
        )}
        ListFooterComponent={!product.isPageEnd ? null : (
          <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
            {t(`Sudah menampilkan semua produk`)}
          </Typography>
        )} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export default Katalog;
