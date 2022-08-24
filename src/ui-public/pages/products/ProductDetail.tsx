import numeral from 'numeral';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, ListRenderItemInfo, RefreshControl, ScrollView, 
         StyleSheet, Text, useWindowDimensions, View, FlatList, ToastAndroid } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { colors, ColorVariant, shadows, wrapper } from '../../../lib/styles';
import { CartItemType, Modelable, ProductModel, ProductPhoto, 
         ProductRetail, ColorModel, SpheriesModel, BaseCurveModel, ReviewModel, CartAtribut } from '../../../types/model';
import { BadgeDiscount, BottomDrawer, Button, ButtonCart, TextField,
         ImageAuto, PressableBox, ProgressBar, RenderHtml, Typography } from '../../../ui-shared/components';
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
import { ErrorState, ValueOf } from '../../../types/utilities';
import SelectDropdown from 'react-native-select-dropdown';
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";
import { StringMap } from 'i18next';
import { indexOf } from 'lodash';

const QTY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const QTY2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Fields = {
  sort?: string;
  prdcat?: string;
  brand?: string;
  color?: any;
  color2?: any;
  spheries?: any;
  spheries2?: any;
  basecurve?: any;
  basecurve2?: any;
  jumlah?: number;
  jumlah2?: number;
};

type OptionsState = {
  colors?: ColorModel[];
  colorsLoaded?: boolean;
  colorsModalOpen?: boolean;
};

type OptionsState2 = {
  colors2?: ColorModel[];
  colors2Loaded?: boolean;
  colors2ModalOpen?: boolean;
};

type OptionsStateSpheries = {
  sph?: SpheriesModel[];
  sphLoaded?: boolean;
  sphModalOpen?: boolean;
};

type OptionsStateSpheries2 = {
  sph2?: SpheriesModel[];
  sph2Loaded?: boolean;
  sph2ModalOpen?: boolean;
};

type OptionsStateBaseCurve = {
  basecrv?: BaseCurveModel[];
  basecrvLoaded?: boolean;
  basecrvModalOpen?: boolean;
};

type OptionsStateBaseCurve2 = {
  basecrv2?: BaseCurveModel[];
  basecrv2Loaded?: boolean;
  basecrv2ModalOpen?: boolean;
};


function ProductDetail() {
  // Hooks
  const navnav = useNavigation();
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'ProductDetail'>>();
  const { width, height } = useWindowDimensions();
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
  const [atributColor, setAtributColor] = useState<Modelable<CartAtribut>>({
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
  const [pilihan, setPilihan] = useState<OptionsState>({
    colors: [],
    colorsLoaded: false,
    colorsModalOpen: false,
  });
  const [pilihan2, setPilihan2] = useState<OptionsState2>({
    colors2: [],
    colors2Loaded: false,
    colors2ModalOpen: false,
  });
  const [pilihanSpheries, setPilihanSpheries] = useState<OptionsStateSpheries>({
    sph: [],
    sphLoaded: false,
    sphModalOpen: false,
  });
  const [pilihanSpheries2, setPilihanSpheries2] = useState<OptionsStateSpheries2>({
    sph2: [],
    sph2Loaded: false,
    sph2ModalOpen: false,
  });
  const [pilihanBaseCrv, setPilihanBaseCrv] = useState<OptionsStateBaseCurve>({
    basecrv: [],
    basecrvLoaded: false,
    basecrvModalOpen: false,
  });
  const [pilihanBaseCrv2, setPilihanBaseCrv2] = useState<OptionsStateBaseCurve2>({
    basecrv2: [],
    basecrv2Loaded: false,
    basecrv2ModalOpen: false,
  });

  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    brand: '',
    color: '',
    color2: '',
    spheries: '',
    spheries2: '',
    basecurve: '',
    basecurve2: '',
    jumlah: 0,
    jumlah2: 0,
  });

  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  const [getProduct, setGetProduct] = useState<Modelable<ProductModel>>({
    model: null,
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    retrieveProductsList();
  }, []);

  useEffect(() => {
    const { product_id, product } = route.params;
    // Alert.alert( "Pemberitahuan", "Brand : "+type);
    product && setProduct(state => ({
      ...state,
      model: product,
      modelLoaded: false,
    }));
    if(route.params.product?.description == 'CL' || route.params.product?.description == 'ACCS'){
      retrieveColor();
      retrieveSpheries();
      retrieveBaseCurve();
    }

    handleRefresh();
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
    const { product_id, product } = route.params;
    setIsLoading(true);

    if(route.params.product?.description == 'ACCS' || route.params.product?.description == 'CL' || route.params.product?.description == 'SL'){
      undefined !== product_id && retrieveProduct(product_id);
    }else{
      undefined !== product_id && retrieveProduct(product_id);
    }

    route.params?.product_id; 
    retrieveSpheries();
    retrieveColor();
    retrieveBaseCurve();
    setIsLoading(false);
  };

  // GET COLOR API
  const retrieveColor = async () => {
    setPilihan(state => ({
      ...state,
      colors: [],
      colorsLoaded: false,
    }));

    return await httpService('/api/product/product', {
      data: {
        act: 'Color',
        dt: JSON.stringify({ 
          jenis : route.params.product?.description == 'ACCS' ? 'ACCS' : 'CL',
          prdid: route.params.product?.prd_id || route.params.product_id
        })
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setPilihan(state => ({
          ...state,
          colors: data,
          colorsLoaded: true,
        }));

        setPilihan2(state => ({
          ...state,
          colors2: data,
          colors2Loaded: true,
        }));
      }
    });
  };

  // GET SPHERIES API
  const retrieveSpheries = async () => {
    setPilihanSpheries(state => ({
      ...state,
      sph: [],
      sphLoaded: false,
    }));

    return await httpService('/api/product/product', {
      data: {
        act: 'Spheries',
        dt: JSON.stringify({ 
          jenis : route.params.product?.description == 'ACCS' ? 'ACCS' : 'CL',
          prdid: route.params.product?.prd_id || route.params.product_id
        })
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setPilihanSpheries(state => ({
          ...state,
          sph: data,
          sphLoaded: true,
        }));

        setPilihanSpheries2(state => ({
          ...state,
          sph2: data,
          sph2Loaded: true,
        }));
      }
    });
  };

  // GET BASE CURVE API
  const retrieveBaseCurve = async () => {
    setPilihanBaseCrv(state => ({
      ...state,
      basecrv: [],
      basecrvLoaded: false,
    }));

    return await httpService('/api/product/product', {
      data: {
        act: 'BaseCurve',
        dt: JSON.stringify({ 
          jenis : route.params.product?.description == 'ACCS' ? 'ACCS' : 'CL',
          prdid: route.params.product?.prd_id || route.params.product_id,
        })
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setPilihanBaseCrv(state => ({
          ...state,
          basecrv: data,
          basecrvLoaded: true,
        }));

        setPilihanBaseCrv2(state => ({
          ...state,
          basecrv2: [],
          basecrv2Loaded: true,
        }));
      }
    });
  };

  const retrieveProductsList = async (page: number = 1) => {
    const reccnt = 10 * (page <= 1 ? 0 : page);

    setIsLoading(true);
    setProduct(state => ({ ...state, modelsLoaded: false }));
    
    return httpService('/api/product/product', {
      data: {
        act: 'PrdSerupa',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          param: "serupa",
          limit: 10,
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
        dt: JSON.stringify({ prd_id: product_id, flaq: route.params.product?.description == undefined ? route.params.deskripsi : route.params.product?.description }),
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
        if(route.params.product?.description == 'ACCS' || route.params.product?.description == 'CL' || route.params.product?.description == 'SL'){
          null
        }else{
          retrieveReviews(product_id);
        }
        
      }
    });
  };

  const retrieveProductCart = async () => {
    return httpService('/api/product/product/', {
      data: {
        dt: JSON.stringify({ 
          prd_id: product.model
        }),
        act: 'PrdInfoCart'
      },
    }).then(({ status, data: [data], foto }) => {
      if (status === 200) {
        setGetProduct(state => ({
          ...state,
          model: {
            ...data,
            images: foto
          },
          modelLoaded: true
        }));        
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

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;
    // Alert.alert( "Pemberitahuan", "Jumlah : "+value);
    setFields(state => ({
      ...state,
      [field]: value
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });

    // handleCloseModal(field, false);
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

  const handleCartAdd = async (tipe: string) => {
    let warna = fields.color === '- Pilih -' ? fields.color : 'warna';
    let warna2 = fields.color2 === '- Pilih -' ? fields.color2 : 'warna2';

    if(tipe == 'contactlens'){
      if(warna != '- Pilih -' || warna2 != '- Pilih -'){
        ToastAndroid.show(warna2, ToastAndroid.SHORT);
        toCartCL()
      }else if(warna != '- Pilih -' && warna2 != '- Pilih -'){
        // ToastAndroid.show(warna+' - '+warna2, ToastAndroid.SHORT);
        toCartCL()
      }
    }else if(tipe == 'solutions'){
      toCart();
    }else if(tipe == 'accessories'){
      if(warna == ''){
        ToastAndroid.show(`${''}Warna belum dipilih!`, ToastAndroid.SHORT);
      }else if(fields.spheries == ''){
        ToastAndroid.show(`${''}Addition belum dipilih!`, ToastAndroid.SHORT);
      }else{
        toCart();
      }
    }
  };

  const toCart = async() => {
    dispatch(pushCartItem({
      product: _omit(product.model || undefined, 'product_info'),
      atributColor: fields.color,
      atributSpheries: fields.spheries,
      atributBcurve: fields.basecurve,
      qty: 1
    }));

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Cart',
    });
  }

  const toCartCL = async() => {
    setIsLoading(true);
    dispatch(pushCartItem({
      product: _omit(product.model || undefined, 'product_info'),
      atributColor: fields.color,
      atributSpheries: fields.spheries,
      atributBcurve: fields.basecurve,
      atributColor2: fields.color2,
      atributSpheries2: fields.spheries2,
      atributBcurve2: fields.basecurve2,
      matakiri: fields.color == '' ? '' : 'matakiri',
      matakanan: fields.color2 == '' ? '' : 'matakanan',
      qty: Number(fields.jumlah)+Number(fields.jumlah2)
    }));
    setIsLoading(false);
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Cart',
    });
    // if(fields.color2 == '- Pilih -'){
    //   toCartCL2()
    // }else{
    //   navigation.navigatePath('Public', {
    //     screen: 'BottomTabs.HomeStack.Cart',
    //   });
    // }
  }

  const toCartCL2 = async() => {
    setIsLoading(true);
    dispatch(pushCartItem({
      product: _omit(product.model || undefined, 'product_info'),
      atributColor: '',
      atributSpheries: '',
      atributBcurve: '',
      atributColor2: fields.color2,
      atributSpheries2: fields.spheries2,
      atributBcurve2: fields.basecurve2,
      mata: 'matakanan',
      qty2: fields.jumlah2
    }));
    setIsLoading(false);
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Cart',
    });
  }
  

  const { ...productModel } = product.model || {};
  // const productImages: ImageSource[] = [productModel.prd_foto, ...(productModel.images || [])]
  const productImages: ImageSource[] = [...(productModel.images || [])]
    .filter((item) => ('string' === typeof item) || item?.prd_foto)
    .map((item) => ({
      uri: 'string' === typeof item ? item : item?.prd_foto,
    }));
   
  // let canAddToCart = false;

  const favorite = favorites.find((item) => item.prd_id === product.model?.prd_id);
  // let retails: ProductRetail[] = [];
  const textPilih = t(`${''}Select`);

  const renderElement = () => {
    if(route.params.product?.description == 'CL'){
      return <View style={[wrapper.row]}>
                <View style={{flex: 1}}>
                  <PressableBox
                    containerStyle={{ overflow: 'visible', borderRadius: 5, 
                                      borderWidth: 1, borderColor: '#0d674e', backgroundColor: '#0d674e', paddingVertical: 10, marginTop: 10, flex: 1}}
                    opacity={1}
                    onPress={() => 
                      handleCartAdd('contactlens')
                      // Alert.alert( "Pemberitahuan", "Mohon maaf, fitur ini sedang proses pengembangan.")
                    }
                  >
                    <Typography style={{fontWeight: '700', color: '#FEFEFE', textAlign: 'center', fontSize: 14}}>
                      Beli
                    </Typography>
                  </PressableBox>
                </View>
              </View>;
    }else if (route.params.product?.description == 'ACCS'){
      return <View style={[wrapper.row]}>
                <View style={{flex: 1}}>
                  <PressableBox
                    containerStyle={{ overflow: 'visible', borderRadius: 5, 
                                      borderWidth: 1, borderColor: '#0d674e', backgroundColor: '#0d674e', paddingVertical: 10, marginTop: 10, flex: 1}}
                    opacity={1}
                    onPress={() => 
                      handleCartAdd('accessories')
                      // Alert.alert( "Pemberitahuan", "Mohon maaf, fitur ini sedang proses pengembangan.")
                    }
                  >
                    <Typography style={{fontWeight: '700', color: '#FEFEFE', textAlign: 'center', fontSize: 14}}>
                      Beli
                    </Typography>
                  </PressableBox>
                </View>
              </View>;
    }else if (route.params.product?.description == 'SOL'){
      return <View style={[wrapper.row]}>
                <View style={{flex: 1}}>
                  <PressableBox
                    containerStyle={{ overflow: 'visible', borderRadius: 5, 
                                      borderWidth: 1, borderColor: '#0d674e', backgroundColor: '#0d674e', paddingVertical: 10, marginTop: 10, flex: 1}}
                    opacity={1}
                    onPress={() => 
                      handleCartAdd('solutions')
                      // Alert.alert( "Pemberitahuan", "Mohon maaf, fitur ini sedang proses pengembangan.")
                    }
                  >
                    <Typography style={{fontWeight: '700', color: '#FEFEFE', textAlign: 'center', fontSize: 14}}>
                      Beli
                    </Typography>
                  </PressableBox>
                </View>
              </View>;
    }else{
      return <View style={[wrapper.row]}>
                  <View style={{flex: 1}}>
                    <PressableBox
                      containerStyle={{ overflow: 'visible', borderRadius: 5, 
                                        borderWidth: 1, borderColor: '#0d674e', backgroundColor: '#0d674e', paddingVertical: 10, marginTop: 10, flex: 1}}
                      opacity={1}
                      onPress={() => 
                        handleCartAdd('solutions')
                        // Alert.alert( "Pemberitahuan", "Mohon maaf, fitur ini sedang proses pengembangan.")
                      }
                    >
                      <Typography style={{fontWeight: '700', color: '#FEFEFE', textAlign: 'center', fontSize: 14}}>
                        Beli
                      </Typography>
                    </PressableBox>
                  </View>
                  <View style={{marginHorizontal: 5}}></View>
                    <View style={{marginHorizontal: 5, flex: 1}}>
                      <PressableBox
                        containerStyle={{ overflow: 'visible', borderRadius: 5, 
                                          borderWidth: 1, borderColor: '#0d674e', backgroundColor: '#FEFEFE', paddingVertical: 10, marginTop: 10, flex: 1}}
                        opacity={1}
                        onPress={() => navigation.navigatePath('Public', {
                          screen: 'Vto',
                        })}
                      >
                        <Typography style={{fontWeight: '700', color: '#0d674e', textAlign: 'center', fontSize: 10}}>
                          Coba Virtual
                        </Typography>
                      </PressableBox>
                    </View>
                </View>;
    }
  }
  
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
              <ScrollView
                horizontal={true}
                style={{marginHorizontal: 15}}
              >
                {productImages.map((item, index) => (
                  <PressableBox
                    key={index}
                    containerStyle={{marginVertical: 10}}
                    style={{
                      marginHorizontal: 3
                    }}
                    opacity={1}
                    onPress={() => {
                      setOptions(state => ({
                        ...state,
                        imageModalOpen: true,
                        imageIndex: index,
                      }));
                    }}
                  >
                    <View style={{borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 3, paddingVertical: 3}}>
                      <Image 
                        source={item} 
                        style={{width: 60, height: 50, paddingVertical: 10, resizeMode: 'stretch'}} />
                    </View>
                  </PressableBox>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={{ paddingTop: -20, paddingHorizontal: 5 }}>
          {route.params.product?.description == 'CL' ? 
            (
              <>
                <Typography type="h5" style={{color: '#333333'}}>
                  {productModel.prd_ds}
                </Typography>
                {productModel.harga_promo == 0 ? 
                  (<>
                    <Typography color="#0d674e">
                      {formatCurrency({ amount: productModel.harga, code: 'IDR' })}
                    </Typography>
                  </>) : (
                    <>
                      <Typography type="h4" color="red" style={{ textDecorationLine: 'line-through' }}>
                      {formatCurrency({ amount: productModel.harga, code: 'IDR' })}
                      </Typography>
                      <Typography type="h4" color="#0d674e">
                        {formatCurrency({ amount: productModel.harga_promo, code: 'IDR' })}
                      </Typography>
                    </>
                )} 
                <View style={{height: 1, backgroundColor: "#ccc", marginVertical: 15}}></View>
                <View style={[wrapper.row]}>
                  <View style={{flex: 0.7}}></View>
                  <View style={{flex: 1}}>
                    <Typography style={[styles.fontnya, {fontWeight: 'bold'}]}>
                      Mata Kiri (OS)
                    </Typography>
                  </View>
                  <View style={{flex: 1}}>
                    <Typography style={[styles.fontnya, {marginLeft: 5, fontWeight: 'bold'}]}>
                      Mata Kanan (OD)
                    </Typography>
                  </View>
                </View>
                {/*COLOR*/}
                <View style={[wrapper.row, {marginTop: 5}]}>
                  <View style={{flex: 0.5}}>
                    <Typography style={styles.fontnya}>
                      Color
                    </Typography>
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <SelectDropdown
                      data={pilihan.colors?.map(item => {
                        return item.nm_warna
                      })}
                      onSelect={(colors, index) => {
                        handleFieldChange('color', colors)
                      }}
                      buttonTextAfterSelection={(colors, index) => {
                        return colors
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      defaultValue={'- Pilih -'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                  <SelectDropdown
                      data={pilihan2.colors2?.map(item => {
                        return item.nm_warna
                      })}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('color2', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      defaultValue={'- Pilih -'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                </View>
                {/*SPHERIES / POWER*/}
                <View style={[wrapper.row, {marginTop: 5}]}>
                  <View style={{flex: 0.5}}>
                    <Typography style={styles.fontnya}>
                      Spheries / Power
                    </Typography>
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <SelectDropdown
                      data={pilihanSpheries.sph?.map(item => {
                        return item.ket
                      })}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('spheries', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      // defaultValue={'- Pilih -'}
                      defaultButtonText={'Pilih Spheries'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <SelectDropdown
                      data={pilihanSpheries2.sph2?.map(item => {
                        return item.ket
                      })}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('spheries2', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      // defaultValue={'- Pilih -'}
                      defaultButtonText={'Pilih Spheries'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                </View>
                {/*BASE CURVE*/}
                <View style={[wrapper.row, {marginTop: 5}]}>
                  <View style={{flex: 0.5}}>
                    <Typography style={styles.fontnya}>
                      Base Curve
                    </Typography>
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <SelectDropdown
                      data={pilihanBaseCrv.basecrv?.map(item => {
                        return item.id
                      })}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('basecurve', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      // defaultValue={'- Pilih -'}
                      defaultButtonText={'Pilih Base Curve'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <SelectDropdown
                      data={pilihanBaseCrv.basecrv?.map(item => {
                        return item.id
                      })}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('basecurve2', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      // defaultValue={'- Pilih -'}
                      defaultButtonText={'Pilih Base Curve'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                </View>
                {/*QTY*/}
                <View style={[wrapper.row, {marginTop: 5}]}>
                  <View style={{flex: 0.5}}>
                    <Typography style={styles.fontnya}>
                      QTY
                    </Typography>
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <SelectDropdown
                      data={QTY}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('jumlah', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      // defaultValue={'- Pilih -'}
                      defaultButtonText={'Pilih Qty'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <SelectDropdown
                      data={QTY2}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('jumlah2', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      // defaultValue={'- Pilih -'}
                      defaultButtonText={'Pilih Qty'}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  </View>
                </View>
                {renderElement()}
              </>
            ) : (route.params.product?.description == 'ACCS' ? 
              (
                <>
                  <Typography type="h5" style={{color: '#333333'}}>
                    {productModel.prd_ds}
                  </Typography>
                  <Typography style={{color: '#333333', fontSize: 14}}>
                    Brand : {productModel.merk}
                  </Typography>

                  {productModel.harga_promo == 0 ? 
                    (<>
                      <Typography color="#0d674e">
                        {formatCurrency({ amount: productModel.harga, code: 'IDR' })}
                      </Typography>
                    </>) : (
                      <>
                        <Typography type="h4" color="red" style={{ textDecorationLine: 'line-through' }}>
                        {formatCurrency({ amount: productModel.harga, code: 'IDR' })}
                        </Typography>
                        <Typography type="h4" color="#0d674e">
                          {formatCurrency({ amount: productModel.harga_promo, code: 'IDR' })}
                        </Typography>
                      </>
                  )} 
                  <View style={{height: 1, backgroundColor: "#ccc", marginVertical: 10}}></View>
                  <View style={{flex: 1, marginTop: 10 }}>
                    <SelectDropdown
                      data={pilihan.colors?.map(item => {
                        return item.nm_warna
                      })}
                      onSelect={(colors, index) => {
                        handleFieldChange('color', colors)
                      }}
                      buttonTextAfterSelection={(colors, index) => {
                        return colors
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      defaultButtonText={'Pilih Warna'}
                      buttonStyle={styles.dropdown1BtnStyleNew}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1BtnStyleNew}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                    {/* {pilihan.colors?.map((item, index) => (
                      <Button
                        key={index}
                        containerStyle={{
                          marginBottom: 8,
                          marginRight: 10,
                          borderColor: fields.color === item.kd_warna ? colors.transparent('#0d674e', 1) : colors.gray[400],
                          backgroundColor: fields.color === item.kd_warna ? colors.transparent('#0d674e', 1) : 'white'
                        }}
                        labelProps={{ color: fields.color === item.kd_warna ? '#0d674e' : colors.gray[900] }}
                        size="sm"
                        border
                        onPress={() => handleFieldChange('color', item.kd_warna)}
                      >
                        <Typography 
                          size='xs'
                          style={{
                            color: fields.color === item.kd_warna ? 'white' : 'black'
                          }}>{t(`${''}${item.kd_warna}`)}</Typography>
                      </Button>
                    ))} */}
                  </View>
                  <View style={{ flex: 1, marginTop: 10 }}>
                    <SelectDropdown
                      data={pilihanSpheries.sph?.map(item => {
                        return item.ket
                      })}
                      onSelect={(spheries, index) => {
                        handleFieldChange('spheries', spheries)
                      }}
                      buttonTextAfterSelection={(spheries, index) => {
                        return spheries
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      defaultButtonText={'Pilih Addition'}
                      buttonStyle={styles.dropdown1BtnStyleNew}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={12} color={'#ccc'} />;
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1BtnStyleNew}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                    {/* <View style={[wrapper.row, { flexWrap: 'wrap', marginTop: 10 }]}>
                      {pilihanSpheries.sph?.map((item, index) => (
                        <Button
                          key={index}
                          containerStyle={{
                            marginBottom: 8,
                            marginRight: 10,
                            borderColor: fields.spheries === item.ket ? colors.transparent('#0d674e', 1) : colors.gray[400],
                            backgroundColor: fields.spheries === item.ket ? colors.transparent('#0d674e', 1) : 'white'
                          }}
                          labelProps={{ color: fields.spheries === item.ket ? '#0d674e' : colors.gray[900] }}
                          size="sm"
                          border
                          onPress={() => handleFieldChange('spheries', item.ket)}
                        >
                          <Typography 
                            size='xs'
                            style={{
                              color: fields.spheries === item.ket ? 'white' : 'black'
                            }}>{t(`${''}${item.ket}`)}</Typography>
                        </Button>
                      ))}
                    </View> */}
                  </View>
                  {renderElement()}
                </>
              )
              : 
              <>
                <Typography style={{color: '#333333', fontSize: 13, fontWeight: '700'}}>
                  {productModel.prd_ds}
                </Typography>
                <Typography style={{color: '#333333', fontSize: 13}}>
                  {productModel.merk}
                </Typography>
                <Typography style={{color: '#333333', fontSize: 13}}>
                  {route.params.product_id}
                </Typography>

                {productModel.harga_promo == 0 ? 
                  (<>
                    <Typography color="#0d674e">
                      {formatCurrency({ amount: productModel.harga, code: 'IDR' })}
                    </Typography>
                  </>) : (
                    <>
                      <Typography type="h4" color="red" style={{ textDecorationLine: 'line-through' }}>
                      {formatCurrency({ amount: productModel.harga, code: 'IDR' })}
                      </Typography>
                      <Typography type="h4" color="#0d674e">
                        {formatCurrency({ amount: productModel.harga_promo, code: 'IDR' })}
                      </Typography>
                    </>
                )} 
                {renderElement()}
              </>
            )
          }           
          </View>
          {route.params.product?.description == 'CL' || route.params.product?.description == 'ACCS' || route.params.product?.description == 'SL' ? 
            null :
            (
              !product.models ? null :
              (
                <>
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
                      loading={!product.modelsLoaded}
                      data={product.models}
                      LoadingView={(
                        <ProductsLoading />
                      )}
                    />
                  )}
                </>
              )
            )          
          }
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
  modalContainer: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 24
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
  },
  fontnya: {
    textAlignVertical: 'center', 
    paddingTop: 10, 
    color: '#686868', 
    fontSize: 10,
  },
  dropdown1BtnStyle: {
    width: '85%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdown1BtnStyleNew: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imageFlat: {
    width: 150,
    height: 150
  },
  dropdown2BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdown1BtnTxtStyle: {color: '#444', textAlign: 'left', fontSize: 11},
  dropdown1DropdownStyle: {backgroundColor: '#EFEFEF'},
  dropdown1RowStyle: {backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5'},
  dropdown1RowTxtStyle: {color: '#444', textAlign: 'left'},
});

export default ProductDetail;
