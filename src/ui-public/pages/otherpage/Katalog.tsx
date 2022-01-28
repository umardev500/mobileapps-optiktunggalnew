import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Image,FlatList, ScrollView, StyleSheet, useWindowDimensions, ListRenderItemInfo } from 'react-native';
import { View } from 'react-native-animatable';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, ModelablePaginate, ProductModel, BrandModel, CategoryModel } from '../../../types/model';
import { Badge, BottomDrawer, Button, Header, Typography, PressableBox } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';
import { ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import { BoxLoading } from '../../../ui-shared/loadings';

const SORT = [
  { label: `${''}Ulasan`, value: 'review-desc' },
  // { label: `${''}Harga Tertinggi`, value: 'price-desc' },
  // { label: `${''}Harga Terendah`, value: 'price-asc' },
  { label: `${''}Populer`, value: 'price-asc' },
  { label: `${''}Terbaru`, value: 'price-asc' },
];

type Fields = {
  sort?: string;
  prdcat?: string;
  brand?: string;
};

type OptionsState = {
  filterModalOpen?: boolean;
  prdcat?: string;
  brand?: string;
};

function Katalog() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'Katalog'>>();
  const { width, height } = useWindowDimensions();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 0,
    perPage: 12,
    isPageEnd: false,
  });
  const [brand, setBrand] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    brand: '',
  });
  const [options, setOptions] = useState<OptionsState>({
    filterModalOpen: false,
    prdcat: '',
    brand: '',
  });

  const [category, setCategory] = useState<Modelable<CategoryModel>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    setProduct(state => ({
      ...state,
      page: 1
    }));

    retrieveBrands();
  }, []);

  useEffect(() => {
    // const { search: routeSearch, category: routeCategory, brand: routeBrand } = route.params;

    // routeSearch && setSearch(routeSearch);

    // if (routeCategory) {
    //   handleFieldChange('prdcat', routeCategory.id);

    //   setOptions(state => ({ ...state, prdcat: routeCategory.id }));
    // }

    // if (routeBrand) {
    //   handleFieldChange('prdcat', routeBrand.id);

    //   setOptions(state => ({ ...state, prdcat: routeBrand.id }));
    // }
  }, [route.params]);

  useEffect(() => {
    if (!product.isPageEnd && product.page > 0) {
      retrieveProducts(product.page);
    }
  }, [product.page]);

  useEffect(() => {
    setProduct(state => ({
      ...state,
      models: [],
      modelsLoaded: false,
      page: 1,
      isPageEnd: false,
    }));

    product.page === 1 && retrieveProducts();
  }, [search]);

  //Brands
  const renderBrand = ({ item, index }: ListRenderItemInfo<BrandModel>) => {
    return (
      <PressableBox
        key={index}
        opacity
        containerStyle={{
          marginHorizontal: 5,
          maxWidth: 100,
          backgroundColor: '#FEFEFE',
          ...shadows[3]
        }}
        style={{ alignItems: 'center', backgroundColor: '#FEFEFE' }}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Search',
          params: [null, null, {
            brand: item,
          }],
        })}
      >
        {!item.fotobrand ? (
          <View style={{
            backgroundColor: '#FEFEFE',
          }} />
        ) : (
          <Image source={{ uri: item.fotobrand }} style={styles.brandImage} />
        )}

        
      </PressableBox>
    );
  };

  //Kategori
  const renderCategories = ({ item, index }: ListRenderItemInfo<CategoryModel>) => {
    return (
      <PressableBox
        key={index}
        opacity
        containerStyle={{
          flex: 1,
          marginHorizontal: 8,
          maxWidth: 100,
        }}
        style={{ alignItems: 'center', }}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Search',
          params: [null, null, {
            category: item,
          }],
        })}
      >
        {!item.foto ? (
          <View style={[styles.categoryImage, {
            backgroundColor: '#FEFEFE',
          }]} />
        ) : (
          <Image source={{ uri: item.foto }} style={styles.categoryImage} />
        )}

        <Typography size="xxs" textAlign="center" style={{ marginTop: 5, fontSize: 12 }}>
          {t(`${item.ds} \nCollection's`)}
        </Typography>
      </PressableBox>
    );
  };

  // Vars
  const retrieveProducts = async (page: number = 1) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);

    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdListKatalog',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          param: "katalog",
          limit: product.perPage,
          prdcat: "",
          search: null,
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


  const retrieveBrands = async () => {
    return httpService('/api/brand/brand', {
      data: {
        act: 'BrandList',
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setBrand(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    }).catch((err) => {
      // 
    });
  };

  // const handleModalToggle = async (type: string, open: boolean | null = null) => {
  //   switch (type) {
  //     case 'filter':
  //       setOptions(state => ({
  //         ...state,
  //         filterModalOpen: 'boolean' === typeof open ? open : !options.filterModalOpen
  //       }));
  //       break;
  //   }
  // };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    setFields(state => ({
      ...state,
      [field]: value
    }));
  };

  const handleFilterApply = async () => {
    // handleModalToggle('filter', false);

    handleFieldChange('prdcat', options.prdcat);

    setProduct(state => ({
      ...state,
      page: 1,
      models: [],
      modelsLoaded: false,
      isPageEnd: false,
    }));

    product.page === 1 && await retrieveProducts();
  };

  let filterCount = 0;

  fields.sort && filterCount++;
  fields.prdcat && filterCount++;
  fields.brand && filterCount++;

  const filterColor = filterCount ? colors.palettes.primary : colors.gray[700];
  const categoryActive = categories?.find(item => item.id === fields.prdcat);
  // const brandActive = brands?.find(item => item.id === fields.prdcat);

  return (
    <View style={{ flex: 1 }}>
      <View style={[wrapper.row, { alignItems: 'center', marginTop: 5, marginBottom: 5, paddingHorizontal: 10, backgroundColor: '#FEFEFE' }]}>
        <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
          Brands
        </Typography>
      </View>

      <View 
        style={{marginTop: -10, backgroundColor: '#FEFEFE'}}>
            {!brand.modelsLoaded ? (
              <View style={[wrapper.row, {
                justifyContent: 'center',
                paddingVertical: 8,
                backgroundColor: '#FEFEFE',
              }]}>
                {Array.from(Array(5)).map((item, index) => (
                  <View key={index} style={{ marginHorizontal: 8 }}>
                    <BoxLoading width={60} height={60} />
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                  data={brand.models || []}
                  renderItem={renderBrand}
                  contentContainerStyle={{
                    alignItems: 'center',
                    height: 100,
                    marginLeft: 10,
                    backgroundColor: '#FEFEFE',
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
            )}
      </View>
      <Products
        contentContainerStyle={[styles.container, styles.wrapper]}
        refreshing={isLoading}
        onRefresh={handleFilterApply}
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
            {t(`${t('Tidak ada produk')}`)}
          </Typography>
        )}
        ListFooterComponent={!product.isPageEnd ? null : (
          <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
            {t(`${t('Sudah menampilkan semua produk')}`)}
          </Typography>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  categoryImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  brandImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },

  header: {
    marginHorizontal: -15,
  },
  actionBtnContainer: {
    backgroundColor: colors.white,
    borderRadius: 0,
    marginRight: -20,
    color: 'blue'
  },
  filterItem: {
    backgroundColor: colors.transparent('palettes.primary', 0.1),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.transparent('palettes.primary', 0.25),
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  filterIcon: {
    width: 24,
    height: 24,
  }
});

export default Katalog;
