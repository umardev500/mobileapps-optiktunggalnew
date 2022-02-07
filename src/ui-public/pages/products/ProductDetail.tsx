import numeral from 'numeral';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, ListRenderItemInfo, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { colors, ColorVariant, shadows, wrapper } from '../../../lib/styles';
import { CartItemType, Modelable, ProductModel, ProductPhoto, ProductRetail, ProductType, ReviewModel } from '../../../types/model';
import { BadgeDiscount, BottomDrawer, Button, ButtonCart, ImageAuto, PressableBox, ProgressBar, RenderHtml, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import ReviewItem from '../../components/ReviewItem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImageView from "react-native-image-viewing";
import { ImageSource } from 'react-native-vector-icons/Icon';
import { useAppNavigation } from '../../../router/RootNavigation';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppSelector } from '../../../redux/hooks';
import { httpService } from '../../../lib/utilities';
import { useDispatch } from 'react-redux';
import { pushCartItem } from '../../../redux/actions/shopActions';
import { default as _omit } from 'lodash/omit';
import { getConfig } from '../../../lib/config';
import { toggleFavorite } from '../../../redux/actions';
import { useTranslation } from 'react-i18next';
<<<<<<< HEAD
=======
import Products from '../../components/Products';
import ProductsLoading from '../../loadings/ProductsLoading';

type Fields = {
  sort?: string;
  prdcat?: string;
  brand?: string;
};
>>>>>>> origin/Develop

function ProductDetail() {
  // Hooks
  const navnav = useNavigation();
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'ProductDetail'>>();
  const { width } = useWindowDimensions();
  const { user: { user, favorites } } = useAppSelector((state) => state);
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

  const carouselRef = useRef<any>();

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<Modelable<ProductModel>>({
    model: null,
    modelsLoaded: false,
  });
  const [review, setReview] = useState<Modelable<ReviewModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [tabActive, setTabActive] = useState<number>(0);
  const [options, setOptions] = useState({
    imageModalOpen: false,
    imageIndex: 0,
  });

<<<<<<< HEAD
  // Effects
  useEffect(() => {
    navnav.setOptions({
      headerRight: () => (
        <ButtonCart />
      ),
    });
=======
  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    brand: '',
  });

  // Effects
  useEffect(() => {
    
>>>>>>> origin/Develop
  }, []);

  useEffect(() => {
    const { product_id, product } = route.params;
<<<<<<< HEAD

=======
>>>>>>> origin/Develop
    product && setProduct(state => ({
      ...state,
      model: product,
      modelLoaded: false,
    }));

    undefined !== product_id && retrieveProduct(product_id);
  }, [route.params]);

  useEffect(() => {
    if (product.modelLoaded && !review.modelsLoaded) {
      retrieveReviews();
    }
  }, [product.modelLoaded]);

  useEffect(() => {
    // 
  }, [favorites]);

<<<<<<< HEAD
=======

  const retrieveProductsList = async (page: number = 1) => {
  const reccnt = 4 * (page <= 1 ? 0 : page);

    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdSerupa',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          param: "katalog",
          limit: 4,
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

>>>>>>> origin/Develop
  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    route.params?.product_id && await retrieveProduct(route.params.product_id);

    setIsLoading(false);
  };

  const retrieveProduct = async (product_id: string) => {
    return httpService('/api/product/product/', {
      data: {
<<<<<<< HEAD
        dt: JSON.stringify({ comp: '001', prd_id: product_id }),
        act: 'PrdInfo'
      },
      method: 'POST'
=======
        dt: JSON.stringify({ prd_id: product_id }),
        act: 'PrdInfo'
      },
>>>>>>> origin/Develop
    }).then(({ status, data, foto }) => {
      if (status === 200) {
        setProduct(state => ({
          ...state,
          model: {
            ...data,
<<<<<<< HEAD
            harga_refill: parseFloat(data.harga_refill || 0),
            harga_retail: parseFloat(data.harga_retail || 0),
            harga_reseller: parseFloat(data.harga_reseller || 0),
            disc_retail: parseFloat(data.disc_retail || 0),
            disc_reseller: parseFloat(data.disc_reseller || 0),
=======
            harga_refill: data.harga_refill,
>>>>>>> origin/Develop
            images: foto
          },
          modelLoaded: true
        }));
<<<<<<< HEAD
=======
        retrieveProductsList();
>>>>>>> origin/Develop
      }
    });
  };

  const retrieveReviews = async () => {
<<<<<<< HEAD
    return httpService('/api/review/review/prd_id/AAGB1023HS3FMF', {
=======
    return httpService('/api/review/review/prd_id/'+product.model?.prd_id, {
>>>>>>> origin/Develop
      data: {
        act: 'UlasanList',
        dt: JSON.stringify({ comp: '001', id: product.model?.prd_id })
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setReview(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    }).catch(() => void(0));
  };

  const handleTabToggle = (tab: number) => {
    setTabActive(tab === tabActive ? 0 : tab);
  };

  const handleModalToggle = (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'image':
        setOptions(state => ({
          ...state,
          imageModalOpen: 'boolean' === typeof open ? open : !options.imageModalOpen
        }));
        break;
    }
  };

<<<<<<< HEAD
  const handleCartAdd = async () => {


    dispatch(pushCartItem({
      product: _omit(product.model || undefined, 'product_info'),
    }));

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Cart',
    });
  };

=======
>>>>>>> origin/Develop
  const handleFavoriteToggle = async () => {
    if (!user) {
      return navigation.navigatePath('Public', {
        screen: 'BottomTabs.AccountStack.Account',
      });
    }

    return !product.model ? void(0) : dispatch(toggleFavorite(product.model));
  };

  const renderCarousel = ({ item, index }: ListRenderItemInfo<ImageSource>) => {
    const height = width;
    
    return (
      <PressableBox
        key={index}
        containerStyle={styles.carouselItem}
        style={{ paddingHorizontal: 0 }}
        opacity={1}
        onPress={() => {
          setOptions(state => ({
            ...state,
            imageModalOpen: true,
            imageIndex: index,
          }));
        }}
      >
        <Image source={item} style={[styles.carouselImage, { height }]} />
      </PressableBox>
    );
  };

  const { ...productModel } = product.model || {};
<<<<<<< HEAD
  const discount = user?.reseller === '1' ? productModel.disc_reseller : productModel.disc_retail;
=======
>>>>>>> origin/Develop
  const productImages: ImageSource[] = [productModel.prd_foto, ...(productModel.images || [])]
    .filter((item) => ('string' === typeof item) || item?.prd_foto)
    .map((item) => ({
      uri: 'string' === typeof item ? item : item?.prd_foto,
    }));
   
<<<<<<< HEAD
  let canAddToCart = false;

  const favorite = favorites.find((item) => item.prd_id === product.model?.prd_id);
  let retails: ProductRetail[] = [];
=======
  // let canAddToCart = false;

  const favorite = favorites.find((item) => item.prd_id === product.model?.prd_id);
  // let retails: ProductRetail[] = [];
>>>>>>> origin/Develop

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
      {!product.modelLoaded ? (
        <View>
          <BoxLoading width={width} height={width} style={{ marginHorizontal: -15 }} />

          <BoxLoading width={[200, 240]} height={20} style={{ marginTop: 15 }} />

          <BoxLoading width={width - 30} height={16} style={{ marginTop: 15 }} />
          <BoxLoading width={width - 30} height={16} style={{ marginTop: 2 }} />
          <BoxLoading width={180} height={16} style={{ marginTop: 2 }} />
        </View>
      ) : (
        <View>
          {!productModel.images?.length ? null : (
            <View style={{ marginHorizontal: -15, position: 'relative' }}>
              <Carousel
                ref={carouselRef}
                data={productImages as any[]}
                renderItem={renderCarousel}
                sliderWidth={width}
                itemWidth={width}
                inactiveSlideScale={1}
              />

<<<<<<< HEAD
              {!discount ? undefined : (
                <BadgeDiscount
                  containerStyle={styles.badgeDiscount}
                  color="primary"
                  label={(`${t('Diskon')} ${discount}%`).toUpperCase()}
                />
              )}

=======
>>>>>>> origin/Develop
              <Button
                containerStyle={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  backgroundColor: colors.white,
                  elevation: 2,
                }}
                size={40}
                rounded={40}
                onPress={handleFavoriteToggle}
              >
                <Ionicons
                  name={!favorite ? 'heart-outline' : 'heart'}
                  size={28}
                  color={!favorite ? colors.gray[600] : colors.palettes.red}
                  style={{ marginTop: 2 }}
                />
              </Button>
              
            </View>
          )}
<<<<<<< HEAD
          <View style={{ paddingTop: 5, paddingHorizontal: 5 }}>
            <Typography type="h4" style={{color: '#204c29'}}>{productModel.prd_ds}</Typography>
            <Typography type="h3" style={{color: '#204c29', marginTop: 5}}>{productModel.harga_retail}</Typography>
          </View>
          <View style={styles.productTabs} >
              <Button
                containerStyle={{
                  flex: 1,
                  marginHorizontal: 0,
                  backgroundColor: colors.white,
                  ...shadows[3]
                }}
                style={{ width: '100%' }}
                label={t('Add to cart').toUpperCase()}
                color="yellow"
                left={(
                  <View style={{ marginRight: 4 }}>
                    <Ionicons name="add" size={18} color={colors.gray[900]} />
                  </View>
                )}
                shadow={3}
                onPress={handleCartAdd}
              />
          </View>
          <View style={{ paddingTop: 12, paddingHorizontal: 5 }}>
            <Typography type="h5" style={{color: '#333333'}}>
=======
          <View style={{ paddingTop: -20, paddingHorizontal: 5 }}>
          <Typography type="h3" style={{color: '#333333'}}>
              {route.params.product_ds}
            </Typography>
            <Typography type="h4" color="primary">
              Rp {route.params.product.harga_het}
            </Typography>
            <Typography style={{color: '#333333', fontSize: 12}}>
              Brand : {route.params.product.merk}
            </Typography>
            <Typography style={{color: '#333333', fontSize: 12}}>
              SKU : {route.params.product_id}
            </Typography>
            {/*<Typography type="h5" style={{color: '#333333'}}>
>>>>>>> origin/Develop
              {t('Details')}
            </Typography>

            <View style={styles.borderTop} />

<<<<<<< HEAD
            <Typography style={{textAlign: 'justify', color: '#333333'}}>{productModel.prd_ds}</Typography>

            <Typography>{productModel.prd_no}</Typography>

            
            <View style={{ marginTop: 1, backgroundColor: '#ccc' }}>
              <Typography style={{textAlign: 'justify', color: '#333333'}}>{productModel.product_info}</Typography>
            </View>

            {!productModel.tested ? null : (
              <Typography type="h6" style={{ marginTop: 16 }}>
                {productModel.tested}
              </Typography>
            )}

            {!productModel.certificate ? null : (
              <Typography type="h6" style={{ marginTop: 16 }}>
                {productModel.certificate}
              </Typography>
            )}
            
            {!review.modelsLoaded ? null : (
              <>
                <Typography type="h5" style={{ marginTop: 32, color: '#333333' }}>
=======
            <View style={{ backgroundColor: '#f1f1f1' }}>
              <RenderHtml
                source={{ html: route.params.product.product_info }}
                tagsStyles={{
                  p: { marginVertical: 0, height: 'auto', fontSize: 12, paddingHorizontal: 5, textAlign: 'justify' }
                }}
              />
            </View>*/}
            
            {!review.modelsLoaded ? null : (
              <>
                <Typography type="h5" style={{ marginTop: 20, color: '#333333' }}>
>>>>>>> origin/Develop
                  {t('Reviews')}
                </Typography>

                <View style={[styles.borderTop, {
                  borderColor: colors.gray[400],
                  marginVertical: 12,
                }]} />

                {!review.models?.length ? (
                  <Typography style={{ textAlign: 'center' }}>
                    {t('No ratings yet!')}
                  </Typography>
                ) : (
                  <View>
                    {review.models.map((item, index) => (
                      <ReviewItem
                        key={index}
                        review={item}
                        style={{
                          paddingHorizontal: 24,
<<<<<<< HEAD
                          marginHorizontal: -24
=======
                          marginHorizontal: -24,
>>>>>>> origin/Develop
                        }}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View> 

<<<<<<< HEAD
=======
          {/*<Typography type="h5" style={{ marginTop: 20, marginBottom: 20, color: '#333333' }}>
            {t('Produk Serupa')}
          </Typography>
          <Products
            contentContainerStyle={[styles.container, styles.wrapper]}
            refreshing={isLoading}
            data={product.models}
            LoadingView={(
              <ProductsLoading />
            )}
          />*/}
>>>>>>> origin/Develop
        </View>
      )}

      {/* Image Popup */}
      <ImageView
        visible={options.imageModalOpen}
        images={productImages}
        imageIndex={options.imageIndex}
        keyExtractor={(imageSrc: ImageSource, index: number) => `image_view_${index}`}
        onRequestClose={() => handleModalToggle('image', false)}
        swipeToCloseEnabled={false}
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
<<<<<<< HEAD

=======
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },
>>>>>>> origin/Develop
  borderTop: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderColor: '#333333',
  },

  carouselItem: {
    overflow: 'hidden',
    width: '100%',
    marginHorizontal: 0,
    borderRadius: 0,
  },
  carouselImage: {
    width: '100%',
    resizeMode: 'contain',
  },

  productTabs: {
    ...wrapper.row,
    marginVertical: 12,
    marginHorizontal: -4,
    paddingHorizontal: 5,
  },
  badgeDiscount: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#f44336'
  }
});

export default ProductDetail;
