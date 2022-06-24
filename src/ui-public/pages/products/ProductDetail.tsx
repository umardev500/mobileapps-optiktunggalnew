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
import ProductsSerupa from '../../components/ProductsSerupa';
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
    handleRefresh();
  }, []);

  useEffect(() => {
    const { product_id, product } = route.params;
    // Alert.alert( "Pemberitahuan", "Brand : "+route.params.product?.merk);
    product && setProduct(state => ({
      ...state,
      model: product,
      modelLoaded: false,
    }));

    undefined !== product_id && retrieveProduct(product_id) && retrieveProductsList();
  }, [route.params]);

  useEffect(() => {
    if (product.modelLoaded && !review.modelsLoaded) {
      // retrieveProductsList();
    }
  }, [product.modelLoaded]);

  useEffect(() => {
    // 
  }, [favorites]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    route.params?.product_id; 
    retrieveProduct(route.params?.product_id);
    retrieveProductsList();

    setIsLoading(false);
  };

  const retrieveProductsList = async (page: number = 1) => {
    const reccnt = 4 * (page <= 1 ? 0 : page);

    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdSerupa',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          param: "serupa",
          limit: 4,
          brand: route.params.product?.merk || productModel.merk,
          prdid: route.params.product?.prd_id || route.params.product_id,
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
                  screen: 'BottomTabs.OtherStack.Katalog'
                  // screen: 'BottomTabs.HomeStack.Search'
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
            <Typography type="h5" style={{color: '#333333'}}>
              {productModel.prd_ds}
            </Typography>
            <Typography style={{color: '#333333', fontSize: 14}}>
              {productModel.merk}
            </Typography>
            <Typography style={{color: '#333333', fontSize: 14}}>
              {route.params.product_id}
            </Typography>

            {productModel.harga_promo == 0 ? 
              (<>
                <Typography type="h4" color="#0d674e">
                  Rp. {productModel.harga}
                </Typography>
               </>) : (
                <>
                  <Typography type="h4" color="red" style={{ textDecorationLine: 'line-through' }}>
                    Rp. {productModel.harga}
                  </Typography>
                  <Typography type="h4" color="#0d674e">
                    Rp {productModel.harga_promo}
                  </Typography>
                </>
            )}            
          </View> 
          <Typography 
            type="h5" 
            style={{ marginTop: 20, marginBottom: 10, color: '#333333', 
                     textAlign: 'center', }}>
            {t('You might like these too')}
          </Typography>
          <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginBottom: 10 }}></View>
          {!product.models ? (
            <View style={[styles.container, styles.wrapper]}>
              <Image source={{ uri: 'https://www.callkirana.in/bootstrp/images/no-product.png' }} style={styles.sorry} />
              <Typography textAlign="center" style={{ marginVertical: 12 }}>
              {t(`${t('Product Not Found')}`)}
              </Typography>
            </View>
          ) : 
          (
            <ProductsSerupa
              contentContainerStyle={[styles.container, styles.wrapper]}
              refreshing={isLoading}
              data={product.models}
              LoadingView={(
              <ProductsLoading />
              )}
            />
          )}
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
  sorry: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 80
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
