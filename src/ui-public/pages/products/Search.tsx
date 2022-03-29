import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, ToastAndroid } from 'react-native';
import { View } from 'react-native-animatable';
import { colors, wrapper } from '../../../lib/styles';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, ModelablePaginate, ProductModel, BrandModel, GenderModel } from '../../../types/model';
import { Badge, BottomDrawer, Button, Header, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';
import { ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import ViewCollapse from '../../components/ViewCollapse';

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
  // prdgender?: string;
  brand?: string;
};

type OptionsState = {
  filterModalOpen?: boolean;
  prdcat?: string;
  // prdgender?: string;
  brand?: string;
};

function Search() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'Search'>>();
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
  const [gender, setGender] = useState<Modelable<GenderModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    // prdgender: '',
    brand: '',
  });
  const [options, setOptions] = useState<OptionsState>({
    filterModalOpen: false,
    prdcat: '',
    // prdgender: '',
    brand: '',
  });

  // Effects
  useEffect(() => {
    setProduct(state => ({
      ...state,
      page: 1
    }));

    retrieveBrands();
    retrieveGenders();
  }, []);

  useEffect(() => {
    const { search: routeSearch, category: routeCategory, brand: routeBrand } = route.params;

    routeSearch && setSearch(routeSearch);

    if (routeCategory) {
      handleFieldChange('prdcat', routeCategory.id);

      setOptions(state => ({ ...state, prdcat: routeCategory.id }));
    }else if (routeBrand) {
      handleFieldChange('brand', routeBrand.id);

      setOptions(state => ({ ...state, brand: routeBrand.id }));
    }

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

  // Vars
  const retrieveProducts = async (page: number = 1) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);

    setIsLoading(true);
    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdList',
        dt: JSON.stringify({
          comp: '001',
          reccnt,
          pg: page,
          limit: reccnt,
          search: search,
          param: "cariprd",
          ...fields
        }),
      },
    }).then(({ status, data }) => {
      setIsLoading(false);

      if (200 === status) {
        setProduct(state => ({
          ...state,
          models: [...(state.models || []), ...data],
          modelsLoaded: true,
          isPageEnd: !data?.length,
        }));
      }
    }).catch(err => {
      setIsLoading(false);
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

  const retrieveGenders = async () => {
    return httpService('/api/category', {
      data: {
        act: 'PrdGenderList',
        dt: JSON.stringify({ comp: '001' }),
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        setGender(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    });
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'filter':
        setOptions(state => ({
          ...state,
          filterModalOpen: 'boolean' === typeof open ? open : !options.filterModalOpen
        }));
        break;
    }
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    setFields(state => ({
      ...state,
      [field]: value
    }));
  };

  const handleFilterApply = async () => {
    handleModalToggle('filter', false);

    handleFieldChange('prdcat', options.prdcat);
    // handleFieldChange('brand', options.brand);

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
  const brandActive = brands?.find(item => item.id === fields.brand);

  return (
    <View style={{ flex: 1 }}>
      <Header
        left
        search={search || undefined}
      />

      <View style={[styles.wrapper, { paddingTop: 8, paddingBottom: 12 }]}>
        {!search ? null : (
          <Typography type="h5" style={{ marginVertical: 10, marginLeft: -8 }}>
            {t(`${t('Pencarian Produk')} “${search}”`)}
          </Typography>
        )}

        {/* <View style={[wrapper.row, { alignItems: 'center' }]}>
          <Button
            containerStyle={{
              borderColor: colors.transparent(filterColor, 0.25),
            }}
            label={`${t('Filter')}`}
            labelProps={{ type: 'p', color: filterColor }}
            rounded={8}
            border
            left={(
              <View style={{ marginRight: 8 }}>
                <Ionicons name="filter" size={16} color={filterColor} />
              </View>
            )}
            onPress={() => handleModalToggle('filter', true)}
          />

          {!categoryActive ? null : (
            <Badge
              style={[styles.filterItem, { marginLeft: 12 }]}
              label={categoryActive.ds}
              labelProps={{ size: 'sm' }}
              left={!categoryActive.foto ? false : (
                <View style={{ marginRight: 4 }}>
                  <Image source={{ uri: categoryActive.foto }} style={styles.filterIcon} />
                </View>
              )}
            />
          )}

          {!brandActive ? null : (
            <Badge
              style={[styles.filterItem, { marginLeft: 12, paddingVertical: 7 }]}
              label={brandActive.name}
              labelProps={{ size: 'sm' }}
              left={!brandActive.fotobrand ? false : (
                <View>
                  <Image source={{ uri: brandActive.fotobrand }} style={styles.filterIconBrand} />
                </View>
              )}
            />
          )}
        </View> */}
      </View>

      <Products
        contentContainerStyle={[styles.container, styles.wrapper, {marginTop: -5}]}
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
        LoadingView={isLoading ? ( <ProductsLoading/> ) : null}
        ListEmptyComponent={isLoading ? ( <ProductsLoading/> ) : 
          <View style={[styles.container, styles.wrapper]}>
            <Image source={{ uri: 'https://www.callkirana.in/bootstrp/images/no-product.png' }} style={styles.sorry} />
            <Typography textAlign="center" style={{ marginVertical: 12 }}>
              {t(`${t('Produk tidak ditemukan')}`)}
            </Typography>
          </View>
        }
        ListFooterComponent={!product.isPageEnd ? null : (
          <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
            {t(`${t('Sudah menampilkan semua produk')}`)}
          </Typography>
        )}
      />

      {/* Popup Provinces */}
      <BottomDrawer
        isVisible={options.filterModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('filter', false)}
        onBackdropPress={() => handleModalToggle('filter', false)}
        title="Filter"
        style={{ maxHeight: height * 0.75 }}
      >
        <Button
            containerStyle={{ alignSelf: 'center', marginBottom: 20 }}
            style={{ minWidth: 350 }}
            label={`${t('Terapkan Filter')}`}
            color="primary"
            onPress={handleFilterApply}
          />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 24
          }}
        >
          {/* <Typography type="h5" style={{ paddingBottom: 8 }}>
            {`${t('Urutkan Berdasar')}`}
          </Typography>

          <View style={[wrapper.row, { flexWrap: 'wrap' }]}>
            {SORT.map((item, index) => (
              <Button
                key={index}
                containerStyle={{
                  marginBottom: 8,
                  marginRight: 8,
                  borderColor: fields.sort === item.value ? colors.transparent('palettes.primary', 0.5) : colors.gray[400]
                }}
                label={t(`${''}${item.label}`)}
                labelProps={{ color: fields.sort === item.value ? colors.palettes.primary : colors.gray[900] }}
                size="sm"
                border
                onPress={() => handleFieldChange('sort', item.value)}
              />
            ))}
          </View> */}

          {!brand.modelsLoaded ? null : (
            <View style={{ marginTop: -10 }}>
              <ViewCollapse
                  style={styles.menuContainer}
                  pressableProps={{
                    containerStyle: styles.menuBtnContainer,
                  }}
                  header={t(`${''}Brand`)}
                  headerProps={{
                    type: 'h',
                  }}
                  collapse
                >
                  {[
                    {
                      id: '',
                      name: t(`${t('Semua Brand')}`),
                    },
                    ...(brand.models || [])
                    ].map((item, index) => {
                      const selected = item?.id === fields.brand;
                      return (
                        <Button
                          key={index}
                          label={item.name}
                          labelProps={{ type: 'p' }}
                          containerStyle={{
                            marginTop: index > 0 ? 4 : 0,
                            backgroundColor: selected ? colors.transparent('palettes.primary', 0.1) : undefined,
                          }}
                          style={{ justifyContent: 'space-between' }}
                          onPress={() => handleFieldChange('brand', item.id)}
                          size="lg"
                          right={(
                            <Typography size="sm" color={selected ? 'blue' : 'primary'}>
                              {selected ? `${t('Dipilih')}` : `${t('Pilih')}`}
                            </Typography>
                          )}
                        />
                      );
                    })
                  }
                </ViewCollapse>
            </View>
          )}

          <ViewCollapse
            style={styles.menuContainer}
            pressableProps={{
              containerStyle: styles.menuBtnContainer,
            }}
            header={t(`${''}Model`)}
            headerProps={{
              type: 'h',
            }}
            collapse
          >
            {!categories?.length ? (
              <Typography>
                {t(`${t('Tidak ada model')}`)}
              </Typography>
            ) : (
              [
                {
                  id: '',
                  ds: t(`${t('Semua Kategori')}`),
                },
                ...categories
              ].map((item, index) => {
                const selected = item?.id === options.prdcat;

                return (
                  <Button
                    key={index}
                    label={item.ds}
                    labelProps={{ type: 'p' }}
                    containerStyle={{
                      marginTop: index > 0 ? 4 : 0,
                      backgroundColor: selected ? colors.transparent('palettes.primary', 0.1) : undefined,
                    }}
                    style={{ justifyContent: 'space-between' }}
                    onPress={() => setOptions(state => ({ ...state, prdcat: item.id }))}
                    size="lg"
                    right={(
                      <Typography size="sm" color={selected ? 'blue' : 'primary'}>
                        {selected ? `${t('Dipilih')}` : `${t('Pilih')}`}
                      </Typography>
                    )}
                  />
                );
              })
            )}
          </ViewCollapse>
          
          <ViewCollapse
            style={styles.menuContainer}
            pressableProps={{
              containerStyle: styles.menuBtnContainer,
            }}
            header={t(`${''}Kategori`)}
            headerProps={{
              type: 'h',
            }}
            collapse
          >
            {!categories?.length ? (
              <Typography>
                {t(`${t('Tidak ada kategori')}`)}
              </Typography>
            ) : (
              [
                {
                  id: '',
                  ds: t(`${t('Semua Kategori')}`),
                },
                ...categories
              ].map((item, index) => {
                const selected = item?.id === options.prdcat;

                return (
                  <Button
                    key={index}
                    label={item.ds}
                    labelProps={{ type: 'p' }}
                    containerStyle={{
                      marginTop: index > 0 ? 4 : 0,
                      backgroundColor: selected ? colors.transparent('palettes.primary', 0.1) : undefined,
                    }}
                    style={{ justifyContent: 'space-between' }}
                    onPress={() => setOptions(state => ({ ...state, prdcat: item.id }))}
                    size="lg"
                    right={(
                      <Typography size="sm" color={selected ? 'blue' : 'primary'}>
                        {selected ? `${t('Dipilih')}` : `${t('Pilih')}`}
                      </Typography>
                    )}
                  />
                );
              })
            )}
          </ViewCollapse>

          <ViewCollapse
            style={styles.menuContainer}
            pressableProps={{
              containerStyle: styles.menuBtnContainer,
            }}
            header={t(`${''}Gender`)}
            headerProps={{
              type: 'h',
            }}
            collapse
          >
            {!categories?.length ? (
              <Typography>
                {t(`${t('Tidak ada Gender')}`)}
              </Typography>
            ) : (
              [
                {
                  id: '',
                  ds: t(`${t('Semua Gender')}`),
                },
                ...categories
              ].map((item, index) => {
                const selected = item?.id === options.prdcat;

                return (
                  <Button
                    key={index}
                    label={item.ds}
                    labelProps={{ type: 'p' }}
                    containerStyle={{
                      marginTop: index > 0 ? 4 : 0,
                      backgroundColor: selected ? colors.transparent('palettes.primary', 0.1) : undefined,
                    }}
                    style={{ justifyContent: 'space-between' }}
                    onPress={() => setOptions(state => ({ ...state, prdcat: item.id }))}
                    size="lg"
                    right={(
                      <Typography size="sm" color={selected ? 'blue' : 'primary'}>
                        {selected ? `${t('Dipilih')}` : `${t('Pilih')}`}
                      </Typography>
                    )}
                  />
                );
              })
            )}
          </ViewCollapse>
        </ScrollView>
      </BottomDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },

  header: {
    marginHorizontal: -15,
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
    borderRadius: 10
  },
  filterIconBrand: {
    width: 30,
    height: 15,
    resizeMode: 'contain',
  },
  menuContainer: {
    margin: -15,
    padding: 15,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    marginBottom: 10,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
});

export default Search;