import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, ListRenderItemInfo, StyleSheet, useWindowDimensions, 
         View, Alert, ScrollView, RefreshControl, ImageBackground, Linking } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { CarouselDots, PressableBox, Typography, Button, ButtonCart, RenderHtml, BottomDrawer } from '../../ui-shared/components';
import Carousel from 'react-native-snap-carousel';
import { BoxLoading } from '../../ui-shared/loadings';
import { BannerModel, CategoryModel, Modelable, ModelablePaginate, BrandModel, ContactUsModel, ArticleModel, GenderModel } from '../../types/model';
import { useAppNavigation } from '../../router/RootNavigation';
import Products from '../components/Products';
import ProductsLoading from '../loadings/ProductsLoading';
import { httpService } from '../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchBrand, fetchGender, fetchModelKacamata } from '../../redux/actions/shopActions';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import PopupPromoModal from '../components/PopupPromoModal';
import moment from 'moment';
import { Text } from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';

type OptionsState = {
  filterContactLens?: boolean;
  // benefitModalOpen?: boolean;
};

const Home = () => {
  // Hooks
  const navigation = useAppNavigation();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('home');
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);
 
  // Refs
  const carouselRef = useRef<any>();
  const [isLoading, setIsLoading] = useState(false);
  // States
  type SliderState = Modelable<BannerModel> & { activeIndex: number; };
  const [slider, setSlider] = useState<SliderState>({
    models: [],
    modelsLoaded: false,
    activeIndex: 0,
  });
  const [category, setCategory] = useState<Modelable<CategoryModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [brand, setBrand] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [gender, setGender] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [modelkacamatas, setModelkacamatas] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [options, setOptions] = useState({
    popupModalOpen: false,
    popupModels: [],
    filterContactLens: false,
  });

  const [contactUs, setContactUs] = useState<Modelable<ContactUsModel>>({
    models: [],
    modelsLoaded: false,
  });

  const [article, setArticle] = useState<Modelable<ArticleModel>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // useEffect(() => {
  // });

  // Vars
  const handleRefresh = async () => {
    setIsRefreshing(true);

    retrieveHomepage();
    retrieveArticle();
    
    dispatch(fetchCategories()).unwrap().then((results) => {
      setCategory(state => ({
        ...state,
        models: results,
        modelsLoaded: true
      }));
    }).catch(() => {
      setCategory(state => ({ ...state, modelsLoaded: true }));
    });

    dispatch(fetchBrand()).unwrap().then((results) => {
      setBrand(state => ({
        ...state,
        models: results,
        modelsLoaded: true
      }));
    }).catch(() => {
      setBrand(state => ({ ...state, modelsLoaded: true }));
    });

    // dispatch(fetchGender()).unwrap().then((results) => {
    //   setBrand(state => ({
    //     ...state,
    //     models: results,
    //     modelsLoaded: true
    //   }));
    // }).catch(() => {
    //   setGender(state => ({ ...state, modelsLoaded: true }));
    // });

    // dispatch(fetchModelKacamata()).unwrap().then((results) => {
    //   setBrand(state => ({
    //     ...state,
    //     models: results,
    //     modelsLoaded: true
    //   }));
    // }).catch(() => {
    //   setModelkacamatas(state => ({ ...state, modelsLoaded: true }));
    // });

    //await retrieveContactUs();
    // retrievePopups();

    setIsRefreshing(false);
  };

  const retrieveHomepage = async () => {
    return httpService('/api/home', {
      data: {
        act: 'BannerList',
        dt: JSON.stringify({ param: 'listBanner' }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setSlider(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));

        retrieveContactUs();
      }
    });
  };

  const retrieveArticle = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleList'
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

  const retrievePopups = async () => {
    return httpService(`/promotion.json`, {
      method: 'post'
    }).then((data) => {
      setOptions(state => ({
        ...state,
        popupModels: data,
        popupModalOpen: true
      }));
    }).catch((err) => void(0));
  };


  const retrieveContactUs = async () => {
    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
        dt: JSON.stringify({ 
          pageCountLimit: 5, 
          param: "store",
          search: ""
        }),
      },
    }).then(({ status, data }) => {
      setContactUs(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setContactUs(state => ({ ...state, modelsLoaded: true }));
    });
  };

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
            keywords: 'searchbybrand',
            brand: item,
          }],
        })}
      >
        {!item.fotobrand ? (
          <View style={[styles.brandImage, {
            backgroundColor: '#FEFEFE',
          }]} />
        ) : (
          <Image source={{ uri: item.fotobrand }} style={styles.brandImage} />
        )}        
      </PressableBox>
    );
  };

  const handleGoToDetailBanner = (banner: BannerModel) => {
    if (!banner.banner_id) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.ArticleStack.BannerDetail',
      params: [null, null, {
        banner_id: banner.banner_id || 0,
        banner,
      }]
    });
  };

  const renderCarousel = ({ item, index }: ListRenderItemInfo<BannerModel>) => {
    const height = width * 150 / 205;

    return (
      // <PressableBox
      //   key={index}
      //   containerStyle={styles.carouselItem}
      //   opacity
      //   onPress={() => handleGoToDetailBanner(item)}
      // >
        <Image source={{ uri: item.banner_foto }} style={{ height }} />
      // </PressableBox>
    );
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

  const renderArticle = ({ item, index }: ListRenderItemInfo<ArticleModel>) => {
    const height = 130;
    return (
      <View style={{ width: '100%', }}>
        <PressableBox
          key={index}
          style={{ marginHorizontal: 10 }}
          opacity
          onPress={() => handleGoToArticleDetail(item)}>
          <View style={[wrapper.row, { height: 130, width: '100%', borderRadius: 10}]}>
            <Image source={{ uri: item.ArticleImage }} style={[styles.articleImage, { height }]} />
            <View style={{ borderColor: '#333', width: '55%' }}>
              <Typography type="h4" style={{ marginTop: 5, fontSize: 12, paddingHorizontal: 15 }} numberOfLines={2}>
                {item.ArticleName}
              </Typography>
              {!item.html ? null : (
                <RenderHtml
                  contentWidth={width}
                  source={{ html: item.html }}
                  tagsStyles={{
                    p: { marginVertical: 0, height: 'auto', fontSize: 10, paddingHorizontal: 15, textAlign: 'justify' }
                  }}
                />
              )}
            </View>
          </View>
        </PressableBox>
      </View>
    );
  };

  const renderStore = ({ item, index }: ListRenderItemInfo<ContactUsModel>) => {
    const lat = item.StoreLatitude;
    const long = item.StoreLongitude;
    return (
      <>
      <PressableBox
          containerStyle={{ paddingHorizontal: 10 }}
          onPress={() => navigation.navigatePath('Public', {
            // setSelected(item);
            // (lat && long) && setCoordinate([lat, long]);
            screen: 'StoreDetail',
            params: [{
              storename: item.StoreName+' '+item.StoreLocationUnit,
              address: item.StoreAddress,
              waphone: item.waphone,
              phone: item.StorePhone,
              note: item.StoreNotes,
              images: item.StoreImage,
              latitude: item.StoreLatitude,
              longitude: item.StoreLongitude
            }]
          })}
        >
          <View style={[wrapper.row, { alignItems: 'center', marginHorizontal: 10 }]}>
              <Image source={{ uri: 'https://optiktunggal.com/img/store_location/'+item.StoreImage }} 
                    style={{ width: '30%', height: 75, resizeMode: 'cover' }} />
              <View style={{ marginLeft: 10, width: '65%' }}>
                <Typography type="h4" style={{ marginTop: 10, fontSize: 12, }} numberOfLines={2}>
                  {item.StoreName} | {item.StoreLocationUnit}
                </Typography>
                <Typography style={{ marginTop: 5, fontSize: 10, textAlign: 'justify'}} numberOfLines={4}>
                  {item.StoreAddress}, Phone : { item.StorePhone }, {item.StoreNotes}
                </Typography>
              </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10, marginHorizontal: 10 }}></View>
        </PressableBox>
      </>
    )
  };

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
            backgroundColor: '#FEFEFE'
          }]} />
        ) : (
          <ImageBackground source={{ uri: item.foto }} style={styles.categoryImage}>
            <Typography textAlign="center" style={{ marginTop: 82, fontSize: 12, color: '#FEFEFE', backgroundColor: '#282c3433' }}>
              {t(`${item.ds}`)}
            </Typography>
          </ImageBackground>
        )}
      </PressableBox>
    );
  };

  const handleCloseModalContactLens = async () => {
    handleModalToggle('contactLensModal', false);
  };
  
  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'popup':
        setOptions(state => ({
          ...state,
          popupModalOpen: 'boolean' === typeof open ? open : !options.popupModalOpen
        }));
        break;
      case 'contactLensModal':
        setOptions(state => ({
          ...state,
          filterContactLens: 'boolean' === typeof open ? open : !options.filterContactLens,
        }));
        break;
    }
  };

  return (
    <>
      <ScrollView style={{ flexBasis: '50%', backgroundColor: '#FEFEFE'}} 
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}>
        <View style={{ position: 'relative' }}>
          {!slider.modelsLoaded ? (
            <View style={{ alignSelf: 'center' }}>
              <BoxLoading width={width} height={width * 150 / 225} />
            </View>
          ) : (
            <Carousel
              ref={carouselRef}
              data={slider.models as any[]}
              renderItem={renderCarousel}
              sliderWidth={width}
              itemWidth={width}
              apparitionDelay={5}
              autoplay={true}
              loop={true}
              contentContainerStyle={{
                marginHorizontal: 40,
              }}
              onSnapToItem={(activeIndex) => setSlider(state => ({
                ...state,
                activeIndex
              }))}
            />
          )}

          <CarouselDots
            containerStyle={styles.carouselDots}
            activeIndexes={[slider.activeIndex]}
            dotCount={slider.models?.length || 0}
          />
        </View>

        {/*brands*/}
        <View style={[wrapper.row, { alignItems: 'center', marginBottom: 10, paddingHorizontal: 10 }]}>
          <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 13 }}>
            BRANDS
          </Typography>
          <Button
            containerStyle={[styles.actionBtnContainer, { marginTop: 0 }]}
            label={t('View All', { count: 1 })}
            labelProps={{ type: 'p', size: 'sm' }}
            labelStyle={{ textAlign: 'right', color: '#0d674e', fontSize: 10 }}
            size="lg"
            right={(
              <Ionicons name="chevron-forward" size={12} color={'#0d674e'} />
            )}
            onPress={() => navigation.navigatePath('Public', {
              screen: 'Brand'
            })}
          />
        </View>

        <View 
          style={{marginTop: -20}}>
              {!brand.modelsLoaded ? (
                <View style={[wrapper.row, {
                  justifyContent: 'center',
                  paddingVertical: 8,
                }]}>
                  {Array.from(Array(5)).map((item, index) => (
                    <View key={index} style={{ marginHorizontal: 8, marginBottom: 10 }}>
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
                    height: 90,
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              )}
        </View>

        <View style={{marginTop: -5, backgroundColor: '#0d674e',}}>
          <Typography type="h4" color="white" style={{ flex: 1, textAlign: 'left', paddingHorizontal: 10, fontSize: 13, marginTop: 10, marginBottom: 10 }}>
            CATEGORIES
          </Typography>
          <View style={[wrapper.row, {
            justifyContent: 'center',
          }]}>
            <View style={[wrapper.row]}>
                <View style={{ marginHorizontal: 3, height: height * 100 / 780, borderRadius: 5 }}>
                  <PressableBox
                  onPress={() => navigation.navigatePath('Public', {
                    screen: 'BottomTabs.HomeStack.Search',
                    params: [null, null, {
                      keywords: 'frame',
                    }]
                  })}>
                    <ImageBackground 
                      resizeMode='cover'
                      borderRadius={5}
                      source={require('../../assets/icons/figma/frame.jpg')} 
                      style={{ width: width * 100 / 210, height: height * 100 / 790, marginBottom: 10 }}>
                        <Typography textAlign="center" 
                                    style={{ fontSize: 16, color: '#0d674ee0', height: height * 100 / 780,
                                             textAlignVertical: 'bottom', borderRadius: 5, fontWeight: 'bold', 
                                             borderColor: '#fff', borderWidth: 2 }}>
                          {`\n`}{t(`FRAME`)}
                        </Typography>
                    </ImageBackground>
                  </PressableBox>
                </View>
                <View style={{ marginHorizontal: 3, height: height * 100 / 780, borderRadius: 5 }}>
                  <PressableBox
                    onPress={() => navigation.navigatePath('Public', {
                      screen: 'BottomTabs.HomeStack.Search',
                      params: [null, null, {
                        keywords: 'sunglass',
                      }]
                    })}>
                    <ImageBackground 
                      resizeMode='cover'
                      borderRadius={5}
                      source={require('../../assets/icons/figma/sunglass.jpg')} 
                      style={{ width: width * 100 / 210, height: height * 100 / 780, marginBottom: 10 }}>
                        <Typography textAlign="center" 
                                    style={{ fontSize: 16, color: '#0d674ee0', height: height * 100 / 780,
                                            textAlignVertical: 'bottom', borderRadius: 5, fontWeight: 'bold',
                                            borderColor: '#fff', borderWidth: 2 }}>
                          {`\n`}{t(`SUNGLASS`)}
                        </Typography>
                    </ImageBackground>
                  </PressableBox>
                </View>
            </View>
          </View>
          <View style={[wrapper.row, {
            justifyContent: 'center',
            paddingVertical: 5,
          }]}>
            <View style={[wrapper.row]}>
            <View style={{ marginHorizontal: 3 }}>
                <PressableBox
                  onPress={() => navigation.navigatePath('Public', {
                    screen: 'BottomTabs.HomeStack.Search',
                    params: [null, null, {
                      keywords: 'contactlens',
                    }]
                  })}>
                  <ImageBackground 
                    resizeMode='stretch'
                    borderRadius= {10}
                    source={require('../../assets/icons/figma/contactlens.jpg')}
                    style={{ width: width * 100 / 320, height: 70 }}>
                      <Typography textAlign="center" 
                                  style={{ fontSize: 12, color: '#0d674ee0', fontWeight: 'bold',
                                           height: '100%', textAlignVertical: 'bottom', borderRadius: 5,
                                           borderColor: '#fff', borderWidth: 2 }}>
                        {t(`CONTACT LENS`)}
                      </Typography>
                  </ImageBackground>
                </PressableBox>
              </View>

              <View style={{ marginHorizontal: 3 }}>
                <PressableBox
                  onPress={() => navigation.navigatePath('Public', {
                    screen: 'BottomTabs.HomeStack.Search',
                    params: [null, null, {
                      keywords: 'solutions',
                    }]
                  })}>
                  <ImageBackground 
                    resizeMode='cover'
                    borderRadius={5}
                    source={require('../../assets/icons/figma/solutions.jpg')}
                    style={{ width: width * 100 / 320, height: 70 }}>
                      <Typography textAlign="center" 
                          style={{ fontSize: 12, color: '#0d674ee0', fontWeight: 'bold',
                                   height: '100%', textAlignVertical: 'bottom',
                                   borderRadius: 5, borderColor: '#fff', borderWidth: 2
                                }}>
                        {t(`SOLUTIONS`)}
                      </Typography>
                  </ImageBackground>
                </PressableBox>
              </View>
              
              <View style={{ marginHorizontal: 3 }}>
                <PressableBox
                  onPress={() => navigation.navigatePath('Public', {
                    screen: 'BottomTabs.HomeStack.Search',
                    params: [null, null, {
                      keywords: 'accessories',
                    }]
                  })}>
                  <ImageBackground 
                    resizeMode='stretch'
                    borderRadius={10}
                    source={require('../../assets/icons/figma/accessories.jpeg')}
                    style={{ width: width * 100 / 320, height: 70 }}>
                      <Typography textAlign="center" 
                                  style={{ fontSize: 12, color: '#0d674ee0', fontWeight: 'bold',
                                           height: '100%', textAlignVertical: 'bottom', borderRadius: 5,
                                           borderColor: '#fff', borderWidth: 2 }}>
                        {t(`ACCESSORIES`)}
                      </Typography>
                  </ImageBackground>
                </PressableBox>
              </View>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: '#0d674e', }}>
          <View style={{ alignItems: 'center', paddingHorizontal: 10, marginVertical: 5}}>
            <View style={[wrapper.row]}>
              <Typography type="h4" color="white" style={{ flex: 1, paddingVertical: 4, fontSize: 16 }}>
                FOLLOW US ON
              </Typography>
              <PressableBox
                onPress={() => Linking.openURL('https://www.youtube.com/OptikTunggalOfficial')}
              >
                <Image source={require('../../assets/icons/figma/youtube.png')} style={{width: 26, height: 26, marginHorizontal: 5, marginTop: 2}}/>
              </PressableBox>
              <PressableBox
                onPress={() => Linking.openURL('https://www.instagram.com/optiktunggal/')}
              >
                <Image source={require('../../assets/icons/figma/instagram.png')} style={{width: 24, height: 24, marginHorizontal: 5, marginTop: 2}}/>
              </PressableBox>
              <PressableBox
                onPress={() => Linking.openURL('http://www.facebook.com/optiktunggalofficial')}
              >
                <Image source={require('../../assets/icons/figma/facebook.png')} style={{width: 24, height: 24, marginHorizontal: 5, marginTop: 2}}/>
              </PressableBox>
              <PressableBox
                onPress={() => Linking.openURL('https://vt.tiktok.com/ZSduAfsBR/')}
              >
                <Image source={require('../../assets/icons/figma/tiktok.png')} style={{width: 24, height: 24, marginHorizontal: 5, marginTop: 2}}/>
              </PressableBox>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {!options.popupModels.length ? null : (
        <PopupPromoModal
          isVisible={options.popupModalOpen}
          swipeDirection={null}
          onBackButtonPress={() => handleModalToggle('popup', false)}
          onBackdropPress={() => handleModalToggle('popup', false)}
          onComplete={() => handleModalToggle('popup', false)}
          promotions={options.popupModels}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  flatList: {
      flex: 1,
  },
  promoCard: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FEFEFE',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
    backgroundColor: '#FEFEFE'
  },
  storeCardContainer: {
    marginHorizontal: 0,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  storeCard: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FEFEFE',
    borderWidth: 2,
    borderColor: '#F3F3F3',
  },
  kategori: {
    fontFamily: "roboto-regular",
    color: "#121212",
    marginTop: 15,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  seeall: {
    fontFamily: "roboto-regular",
    color: "#204c29",
  },
  carousel: {
    position: 'relative',
  },
  carouselDots: {
    position: 'absolute',
    left: 0,
    bottom: 25,
    zIndex: 10,
  },

  carouselItem: {
    // width: '100%',
  },
  carouselImage: {
    // width: '100%',
  },
  categoryImage: {
    width: 100,
    height: 100,
    resizeMode: 'stretch',
    marginHorizontal: 10,
  },
  articleImage: {
    width: 170,
    height: '100%',
    resizeMode: 'contain',
  },
  brandImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  imgLens: {
    width: 90,
    height: 90,
    borderRadius: 5
  },
  imgContLens: {
    width: 90,
    height: 90,
    borderRadius: 5
  },
  actionBtnContainer: {
    borderRadius: 0,
    marginRight: -20,
    color: 'blue'
  },
});

export default Home;
