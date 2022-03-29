import numeral from 'numeral';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, ListRenderItemInfo, RefreshControl, ScrollView, 
         StyleSheet, Text, useWindowDimensions, View, FlatList } from 'react-native';
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
import Products from '../../components/Products';
import ProductsLoading from '../../loadings/ProductsLoading';
import { WebView } from 'react-native-webview';

type Fields = {
  sort?: string;
  prdcat?: string;
  brand?: string;
};

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

  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    brand: '',
  });

  // Effects
  useEffect(() => {
    
  }, []);

  useEffect(() => {
    const { product_id, product } = route.params;
    product && setProduct(state => ({
      ...state,
      model: product,
      modelLoaded: false,
    }));

    undefined !== product_id && retrieveProduct(product_id);
    // retrieveReviews(product_id);
  }, [route.params]);

  useEffect(() => {
    if (product.modelLoaded && !review.modelsLoaded) {
      // retrieveReviews();
    }
  }, [product.modelLoaded]);

  useEffect(() => {
    // 
  }, [favorites]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    route.params?.product_id && await retrieveProduct(route.params.product_id);

    setIsLoading(false);
  };

  const renderPrdSerupa = ({ item, index }: ListRenderItemInfo<ProductModel>) => {
    return (
      <PressableBox
        key={index}
        opacity
        containerStyle={{
          marginHorizontal: 5,
          maxWidth: 190,
          backgroundColor: '#FEFEFE',
          ...shadows[3]
        }}
        style={{ alignItems: 'center', backgroundColor: '#FEFEFE' }}
        // onPress={() => navigation.navigatePath('Public', {
        //   screen: 'BottomTabs.HomeStack.Search',
        //   params: [null, null, {
        //     brand: item,
        //   }],
        // })}
      >
        <Image source={{ uri: item.prd_foto }} style={styles.brandImage} />
      </PressableBox>
    );
  };

  const retrieveProduct = async (product_id: string) => {
    return httpService('/api/product/product/', {
      data: {
        dt: JSON.stringify({ prd_id: product_id }),
        act: 'PrdInfo'
      },
    }).then(({ status, data: [data], foto }) => {
      if (status === 200) {
        setProduct(state => ({
          ...state,
          model: {
            ...data,
            // harga: parseFloat(data.harga || 0),
            // harga_promo: parseFloat(data.harga_promo || 0),
            // diskon: parseFloat(data.diskon || 0),
            images: foto
          },
          modelLoaded: true
        }));
        retrieveReviews(product_id);
      }
    });
  };

  const retrieveReviews = async (product_id: string) => {
    return httpService('/api/review/review/', {
      data: {
        act: 'UlasanList',
        dt: JSON.stringify({ comp: '001', idprd: product_id, limit: 2 })
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
  const productImages: ImageSource[] = [productModel.prd_foto, ...(productModel.images || [])]
    .filter((item) => ('string' === typeof item) || item?.prd_foto)
    .map((item) => ({
      uri: 'string' === typeof item ? item : item?.prd_foto,
    }));
   
  // let canAddToCart = false;

  const favorite = favorites.find((item) => item.prd_id === product.model?.prd_id);
  // let retails: ProductRetail[] = [];

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

              <Button
                containerStyle={{
                  position: 'absolute',
                  marginHorizontal: 10,
                  marginVertical: 10,
                  backgroundColor: colors.white,
                }}
                size={40}
                rounded={40}
                onPress={() => navigation.navigatePath('Public', {
                  // screen: 'BottomTabs.OtherStack.Katalog'
                  screen: 'BottomTabs.HomeStack.Search'
                })}
              >
                <Ionicons
                  name="arrow-back"
                  size={28}
                  style={{ marginTop: 2 }}
                />
              </Button>

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

              <Typography
                style={styles.totalImages}>{productModel.images.length} Images</Typography>
              
            </View>
          )}
          <View style={{ paddingTop: -20, paddingHorizontal: 5 }}>
            <Typography type="h3" style={{color: '#333333'}}>
              {productModel.prd_ds}
            </Typography>
            
            {productModel.harga_promo == 0 ? 
              (<>
                <Typography type="h4" color="primary">
                  Rp {productModel.harga}
                </Typography>
               </>) : (
                <>
                  <Typography type="h4" color="red" style={{ textDecorationLine: 'line-through' }}>
                    Rp {productModel.harga}
                  </Typography>
                  <Typography type="h4" color="primary">
                    Rp {productModel.harga_promo}
                  </Typography>
                </>
            )}
            
            <Typography style={{color: '#333333', fontSize: 12}}>
              Brand : {productModel.merk}
            </Typography>
            <Typography style={{color: '#333333', fontSize: 12}}>
              SKU : {route.params.product_id}
            </Typography>
            {/* <WebView
              originWhitelist={['*']}
              source={{ html: productModel.product_info.replace('\r\n', '') }}
            /> */}
            {/*{route.params.product.harga_promo == 0 ? (
              <View></View>
             ) : (
               <View style={{ marginTop: 10 }}>
                 <Typography type="h6" style={{ color: '#333333' }}>
                    {t('Ketentuan')}
                  </Typography>
                  <View style={[styles.borderTop, {
                    borderColor: colors.gray[400],
                  }]} />
               </View>
             )}*/}

            {/*<Typography type="h5" style={{color: '#333333'}}>
              {t('Details')}
            </Typography>

            <View style={styles.borderTop} />

            <View>
              <RenderHtml
                source={{ html: route.params.product.product_info }}
                tagsStyles={{
                  p: { marginVertical: 0, height: 'auto', fontSize: 12, paddingHorizontal: 5, textAlign: 'justify' }
                }}
              />
            </View>*/}
            
            {/* {!review.modelsLoaded ? null : (
              <>
                <Typography type="h5" style={{ marginTop: 10, color: '#333333' }}>
                  {t('Reviews')}
                </Typography>

                <View style={[styles.borderTop, {
                  borderColor: colors.gray[400],
                  marginVertical: 12,
                }]} />

                {!review.models?.length ? (
                  <Typography style={{ textAlign: 'center' }}>
                    {t('Ulasan masih kosong')}
                  </Typography>
                ) : (
                  <View>
                    {review.models.map((item, index) => (
                      <ReviewItem
                        key={index}
                        review={item}
                        style={{
                          paddingHorizontal: 24,
                          marginHorizontal: -24,
                        }}
                      />
                    ))}
                    <PressableBox
                      containerStyle={{ marginTop: 10, marginBottom: 30, backgroundColor: '#f9f9f9' }}
                      onPress={() => navigation.navigatePath('Public', {
                        screen: 'ReviewAll',
                        params: [{ 
                          product_id: route.params.product_id || 0,
                          product,
                        }]
                      })}
                      >
                      <Typography
                        textAlign="center"
                        style={{ marginHorizontal: 15, paddingVertical: 10, fontSize: 12 }}
                        color="primary">
                        {t(`${''}Lihat Review lainnya...`)}
                      </Typography>
                    </PressableBox>
                  </View>
                )}
              </>
            )} */}
          </View> 
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
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },
  borderTop: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderColor: '#c1c1c1',
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
  },
  brandImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  totalImages: {
    position: 'absolute',
    top: 295,
    right: 15,
    fontSize: 11,
    backgroundColor: '#ededed',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10
  }
});

export default ProductDetail;
