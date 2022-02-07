import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, ListRenderItemInfo, StyleSheet, useWindowDimensions, View, Alert, ScrollView, RefreshControl } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { CarouselDots, PressableBox, Typography, Button, ButtonCart, RenderHtml } from '../../ui-shared/components';
import Carousel from 'react-native-snap-carousel';
import { BoxLoading } from '../../ui-shared/loadings';
import { BannerModel, CategoryModel, Modelable, ModelablePaginate, BrandModel, ContactUsModel, ArticleModel } from '../../types/model';
import { useAppNavigation } from '../../router/RootNavigation';
import Products from '../components/Products';
import ProductsLoading from '../loadings/ProductsLoading';
import { httpService } from '../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchBrand } from '../../redux/actions/shopActions';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import PopupPromoModal from '../components/PopupPromoModal';
import moment from 'moment';
import { Text } from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Home = () => {
  // Hooks
  const navigation = useAppNavigation();
  const { width } = useWindowDimensions();
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [options, setOptions] = useState({
    popupModalOpen: false,
    popupModels: [],
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

    //await retrieveContactUs();
<<<<<<< HEAD
    await retrievePopups();
=======
    // await retrievePopups();
>>>>>>> origin/Develop

    setIsRefreshing(false);
  };

  const retrieveHomepage = async () => {
    return httpService('/api/home', {
      data: {
        act: 'BannerList',
<<<<<<< HEAD
        dt: JSON.stringify({ comp: '001' }),
=======
        dt: JSON.stringify({ param: 'listBanner' }),
>>>>>>> origin/Develop
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

<<<<<<< HEAD
  const renderCarousel = ({ item, index }: ListRenderItemInfo<BannerModel>) => {
    const height = 300;

    return (
      <PressableBox
        key={index}
        containerStyle={styles.carouselItem}
        opacity
        onPress={() => navigation.navigatePath('Public', {
          //screen: 'BottomTabs.WebViewStack',
          // params: [null, null, {
          //   category: item,
          // }],
        })}
      >
        <Image source={{ uri: item.banner_foto }} style={{ height, paddingHorizontal: 5 }} />
      </PressableBox>
    );
  };
=======
>>>>>>> origin/Develop

  const retrieveContactUs = async () => {
    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
<<<<<<< HEAD
        dt: JSON.stringify({ pageCountLimit: 5 })
=======
        dt: JSON.stringify({ pageCountLimit: 5, param: "store" })
>>>>>>> origin/Develop
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
<<<<<<< HEAD
          flex: 1,
          marginHorizontal: 5,
          maxWidth: 100,
=======
          marginHorizontal: 5,
          maxWidth: 100,
          backgroundColor: '#FEFEFE',
>>>>>>> origin/Develop
          ...shadows[3]
        }}
        style={{ alignItems: 'center', backgroundColor: '#FEFEFE' }}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Search',
          params: [null, null, {
<<<<<<< HEAD
            category: item,
=======
            brand: item,
>>>>>>> origin/Develop
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

<<<<<<< HEAD
=======
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
    const height = 300;

    return (
      <PressableBox
        key={index}
        containerStyle={styles.carouselItem}
        opacity
        onPress={() => handleGoToDetailBanner(item)}
      >
        <Image source={{ uri: item.banner_foto }} style={{ height, paddingHorizontal: 5 }} />
      </PressableBox>
    );
  };

>>>>>>> origin/Develop

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
<<<<<<< HEAD
      <View style={{ width: '100%' }}>
=======
      <View style={{ width: '100%', }}>
>>>>>>> origin/Develop
        <PressableBox
          key={index}
          style={{ marginHorizontal: 10 }}
          opacity
          onPress={() => handleGoToArticleDetail(item)}>
          <View style={[wrapper.row, { height: 130, width: '100%', borderRadius: 10}]}>
            <Image source={{ uri: 'https://optiktunggal.com/img/article/'+item.ArticleImage }} style={[styles.articleImage, { height }]} />
            <View style={{ borderColor: '#333', width: '55%' }}>
<<<<<<< HEAD
              <Typography type="h4" style={{ marginTop: 5, fontSize: 14, paddingHorizontal: 10 }} numberOfLines={2}>
=======
              <Typography type="h4" style={{ marginTop: 5, fontSize: 12, paddingHorizontal: 15 }} numberOfLines={2}>
>>>>>>> origin/Develop
                {item.ArticleName}
              </Typography>
              {!item.html ? null : (
                <RenderHtml
                  source={{ html: item.html }}
                  tagsStyles={{
<<<<<<< HEAD
                    p: { marginVertical: 0, height: 'auto', fontSize: 12, paddingHorizontal: 10, textAlign: 'justify' }
=======
                    p: { marginVertical: 0, height: 'auto', fontSize: 10, paddingHorizontal: 15, textAlign: 'justify' }
>>>>>>> origin/Develop
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
      <View style={[wrapper.row, { alignItems: 'center', marginHorizontal: 10 }]}>
        <Image source={{ uri: 'https://optiktunggal.com/img/store_location/'+item.StoreImage }} 
              style={{ width: '20%', height: 70 }} />
        <View style={{ marginLeft: 10, width: '65%' }}>
<<<<<<< HEAD
          <Typography type="h4" style={{ marginTop: 10, fontSize: 14, }} numberOfLines={2}>
            {item.StoreName} | {item.StoreLocationUnit}
          </Typography>
          <Typography style={{ marginTop: 5, fontSize: 12, textAlign: 'justify'}} numberOfLines={4}>
=======
          <Typography type="h4" style={{ marginTop: 10, fontSize: 12, }} numberOfLines={2}>
            {item.StoreName} | {item.StoreLocationUnit}
          </Typography>
          <Typography style={{ marginTop: 5, fontSize: 10, textAlign: 'justify'}} numberOfLines={4}>
>>>>>>> origin/Develop
            {item.StoreAddress}, Phone : { item.StorePhone }, {item.StoreNotes}
          </Typography>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10, marginHorizontal: 10 }}></View>
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
            backgroundColor: '#FEFEFE',
          }]} />
        ) : (
          <Image source={{ uri: item.foto }} style={styles.categoryImage} />
        )}

        <Typography size="xxs" textAlign="center" style={{ marginTop: 5, fontSize: 12 }}>
<<<<<<< HEAD
          {item.ds} Collection's
=======
          {t(`${item.ds} \nCollection's`)}
>>>>>>> origin/Develop
        </Typography>
      </PressableBox>
    );
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'popup':
        setOptions(state => ({
          ...state,
          popupModalOpen: 'boolean' === typeof open ? open : !options.popupModalOpen
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
        <View style={{ position: 'relative'}}>
          {!slider.modelsLoaded ? (
            <View style={{ alignSelf: 'center' }}>
              <BoxLoading width={width} height={width * 134 / 375} />
            </View>
          ) : (
            <Carousel
              ref={carouselRef}
              data={slider.models as any[]}
              renderItem={renderCarousel}
              sliderWidth={width}
              itemWidth={width}
<<<<<<< HEAD
=======
              autoplay={true}
              loop={true}
>>>>>>> origin/Develop
              contentContainerStyle={{
                marginHorizontal: 10,
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
        <View style={[wrapper.row, { alignItems: 'center', marginTop: 5, marginBottom: 10, paddingHorizontal: 10 }]}>
          <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
<<<<<<< HEAD
            Merk
=======
            Brands
>>>>>>> origin/Develop
          </Typography>
          <Button
            containerStyle={[styles.actionBtnContainer, { marginTop: 0 }]}
            label={t('Lihat Semua', { count: 1 })}
            labelProps={{ type: 'p', size: 'sm' }}
<<<<<<< HEAD
            labelStyle={{ textAlign: 'right', color: 'blue' }}
            size="lg"
            right={(
              <Ionicons name="chevron-forward" size={18} color={'blue'} />
            )}
            onPress={() => navigation.navigatePath('Public', {
              screen: 'BottomTabs.ArticleStack'
=======
            labelStyle={{ textAlign: 'right', color: 'blue', fontSize: 10 }}
            size="lg"
            right={(
              <Ionicons name="chevron-forward" size={12} color={'blue'} />
            )}
            onPress={() => navigation.navigatePath('Public', {
              screen: 'Brand'
>>>>>>> origin/Develop
            })}
          />
        </View>

<<<<<<< HEAD
        <View style={{marginTop: -10, marginLeft: 15}}>
          <FlatList
              data={brand.models || []}
              renderItem={renderBrand}
              contentContainerStyle={{
                alignItems: 'center',
                height: 100,
                backgroundColor: '#FEFEFE',
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
=======
        <View 
          style={{marginTop: -10, marginLeft: 15,
                  ...(!brand.modelsLoaded ? null : shadows[3])}}>
              {!brand.modelsLoaded ? (
                <View style={[wrapper.row, {
                  justifyContent: 'center',
                  paddingVertical: 8,
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
                      backgroundColor: '#FEFEFE',
                    }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
              )}
>>>>>>> origin/Develop
        </View>

        {/* Category Carousel */}
        <View>
          <View style={[wrapper.row, { alignItems: 'center', marginTop: -5, paddingHorizontal: 10}]}>
            <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
              Kategori
            </Typography>
          </View>
          <View style={{
            marginBottom: 15,
            backgroundColor: '#FEFEFE',
            // ...(!category.modelsLoaded ? null : shadows[3])
          }}>
            {!brand.modelsLoaded ? (
              <View style={[wrapper.row, {
                justifyContent: 'center',
                paddingVertical: 8,
              }]}>
                {Array.from(Array(5)).map((item, index) => (
                  <View key={index} style={{ marginHorizontal: 8 }}>
                    <BoxLoading width={48} height={48} />

                    <BoxLoading width={48} height={16} style={{ marginTop: 6 }} />
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                data={category.models || []}
                renderItem={renderCategories}
                contentContainerStyle={{
                  alignItems: 'center',
                  height: 150,
                  backgroundColor: '#FEFEFE',
                  paddingHorizontal: 20,
                  paddingVertical: 0,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>
          <View>
            <View style={[wrapper.row, { alignItems: 'center', paddingHorizontal: 10 }]}>
              <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
<<<<<<< HEAD
                Lensa & Contact Lense
=======
                Lens & Contact Lense
>>>>>>> origin/Develop
              </Typography>
            </View>
            <PressableBox
              opacity
              containerStyle={{
                flex: 1,
                marginHorizontal: 5,
                paddingHorizontal: 10,
                marginBottom: 10
              }}
              style={{ alignItems: 'center', }}
              onPress={() => navigation.navigatePath('Public', {
<<<<<<< HEAD
                screen: 'BottomTabs.ContactLensStack'
=======
                screen: 'Lens'
>>>>>>> origin/Develop
              })}>
              <View style={[wrapper.row, { marginTop: 10 }]}>
                <Image source={{ uri: 'https://www.optiktunggal.com/img/home_middle_table/HC170105032019-12-16_10_25_44.jpg' }} style={styles.imgLens} />
                <View style={{ width: '80%' }}>
<<<<<<< HEAD
                  <Typography type="h4" color="black" style={{ paddingHorizontal: 10, fontSize: 16, textAlign: 'justify' ,marginTop: -5 }}>
                    High Quality Optical Lenses
                  </Typography>
                  <Typography style={{ paddingHorizontal: 10, fontSize: 10, textAlign: 'justify' }}>
                    Penglihatan Anda ayak mendapatkan yang terbaik. Dengan pengalaman lebih dari 90 tahun, Optik Tunggal berkomitmen untuk memberikan Anda layanan dan produk lensa optik dengan kualitas yang terbaik.
=======
                  <Typography type="h4" color="black" style={{ paddingHorizontal: 10, fontSize: 12, textAlign: 'justify' ,marginTop: -5 }}>
                    High Quality Optical Lenses
                  </Typography>
                  <Typography style={{ paddingHorizontal: 10, fontSize: 10, textAlign: 'justify' }} numberOfLines={3}>
                    Penglihatan Anda layak mendapatkan yang terbaik. Dengan pengalaman lebih dari 90 tahun, Optik Tunggal berkomitmen untuk memberikan Anda layanan dan produk lensa optik dengan kualitas yang terbaik.
>>>>>>> origin/Develop
                  </Typography>
                </View>
              </View>
            </PressableBox>
            <PressableBox
              opacity
              containerStyle={{
                flex: 1,
                marginHorizontal: 5,
                paddingHorizontal: 10,
                marginBottom: 20
              }}
              style={{ alignItems: 'center', }}
              onPress={() => navigation.navigatePath('Public', {
<<<<<<< HEAD
                screen: 'BottomTabs.HomeStack.Search',
                // params: [null, null, {
                //   category: item,
                // }],
              })}>
              <View style={[wrapper.row, { marginTop: 10 }]}>
                <Image source={{ uri: 'https://www.optiktunggal.com/img/contact_lens/category/CLC191212012019-12-12_11_27_58.jpg' }} style={styles.imgLens} />
                <View style={{ width: '80%' }}>
                  <Typography type="h4" color="black" style={{ paddingHorizontal: 10, fontSize: 16, textAlign: 'justify' ,marginTop: -5 }}>
                    Contact Lense | Schon
                  </Typography>
                  <Typography style={{ paddingHorizontal: 10, fontSize: 10, textAlign: 'justify' }} numberOfLines={4}>
=======
                screen: 'ContactLens'
              })}>
              <View style={[wrapper.row, { marginTop: 10 }]}>
                <Image source={{ uri: 'https://www.optiktunggal.com/img/contact_lens/category/CLC191212012019-12-12_11_27_58.jpg' }} style={styles.imgContLens} />
                <View style={{ width: '80%' }}>
                  <Typography type="h4" color="black" style={{ paddingHorizontal: 10, fontSize: 12, textAlign: 'justify' ,marginTop: -5 }}>
                    Contact Lense
                  </Typography>
                  <Typography style={{ paddingHorizontal: 10, fontSize: 10, textAlign: 'justify' }} numberOfLines={3}>
>>>>>>> origin/Develop
                    Schon adalah merek softlens yang menyediakan softlens kosmetik dan juga softlens korektif.
                    Softlens Schon didesain khusus untuk mata orang Indonesia yang mempunyai beragam pilihan, baik itu softlens bening dan juga yang berwarna.
                    Untuk varian softlens bening tersedia pilihan masa pakai harian dan bulanan.
                    Untuk varian softlens berwarna tersedia warna-warna natural dan warna-warna menarik lainnya yang dapat membuat tampilan anda lebih memukau.
                    Dapatkan softlens Schon di semua cabang Optik Tunggal di seluruh Indonesia.
                  </Typography>
                </View>
              </View>
            </PressableBox>
          </View>
        </View>

        {/*Artikel*/}
        <View>
          <View style={[wrapper.row, { alignItems: 'center', marginTop: -5, paddingHorizontal: 10 }]}>
            <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
<<<<<<< HEAD
              Kabar Optik Tunggal
=======
              News
>>>>>>> origin/Develop
            </Typography>
            <Button
              containerStyle={[styles.actionBtnContainer, { marginTop: 0 }]}
              label={t('Lihat Selengkapnya', { count: 1 })}
              labelProps={{ type: 'p', size: 'sm' }}
<<<<<<< HEAD
              labelStyle={{ textAlign: 'right', color: 'blue' }}
              size="lg"
              right={(
                <Ionicons name="chevron-forward" size={18} color={'blue'} />
=======
              labelStyle={{ textAlign: 'right', color: 'blue', fontSize: 10 }}
              size="lg"
              right={(
                <Ionicons name="chevron-forward" size={12} color={'blue'} />
>>>>>>> origin/Develop
              )}
              onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.ArticleStack'
              })}
            />
          </View>
            {!slider.modelsLoaded ? (
              <View style={[wrapper.row, styles.promoCard, { alignItems: 'center' }]}>
                <BoxLoading width={74} height={74} rounded={8} />

                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <BoxLoading width={[250, 250]} height={20} />

                  <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 6 }} />
                  <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 2 }} />
                </View>
              </View>
            ) : (
              <View style={{ width: '100%'}}>
                <Carousel
                  ref={carouselRef}
                  data={article.models as any[]}
                  renderItem={renderArticle}
                  sliderWidth={width}
<<<<<<< HEAD
=======
                  autoplay={true}
                  loop={true}
>>>>>>> origin/Develop
                  itemWidth={width}
                  onSnapToItem={(activeIndex) => setSlider(state => ({
                    ...state,
                    activeIndex
                  }))}
                />
              </View>
            )}  
        </View>

        {/*Store*/}
        <View style={{ marginBottom: 50, marginTop: 20 }}>
<<<<<<< HEAD
          <View style={[wrapper.row, { alignItems: 'center', marginTop: 10, paddingHorizontal: 10 }]}>
=======
          <View style={[wrapper.row, { alignItems: 'center', marginTop: 10, paddingHorizontal: 10, }]}>
>>>>>>> origin/Develop
            <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
              Outlet Kami
            </Typography>
            <Button
<<<<<<< HEAD
              containerStyle={[styles.actionBtnContainer, { marginTop: -10, }]}
              label={t('Lihat Semua', { count: 1 })}
              labelProps={{ type: 'p', size: 'sm' }}
              labelStyle={{ textAlign: 'right', color: 'blue' }}
              size="lg"
              right={(
                <Ionicons name="chevron-forward" size={18} color={'blue'} />
              )}
              onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.ContactStack'
=======
              containerStyle={[styles.actionBtnContainer]}
              label={t('Lihat Semua', { count: 1 })}
              labelProps={{ type: 'p', size: 'sm' }}
              labelStyle={{ textAlign: 'right', color: 'blue', fontSize: 10 }}
              size="lg"
              right={(
                <Ionicons name="chevron-forward" size={12} color={'blue'} />
              )}
              onPress={() => navigation.navigatePath('Public', {
                screen: 'Contact'
>>>>>>> origin/Develop
              })}
            />
          </View>
          {!contactUs.modelsLoaded ? (
            <View style={[wrapper.row, styles.promoCard, { alignItems: 'center' }]}>
              <BoxLoading width={74} height={74} rounded={8} />

              <View style={{ flex: 1, paddingLeft: 12 }}>
                <BoxLoading width={[250, 250]} height={20} />

                <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 6 }} />
                <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 2 }} />
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 50 }}>
              <FlatList data={contactUs.models} renderItem={renderStore} style={styles.flatList} />
            </View>
          )}
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
      top: 20,
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
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  articleImage: {
    width: 170,
    height: '100%',
    resizeMode: 'contain',
  },
  brandImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  imgLens: {
    width: 90,
    height: 90,
<<<<<<< HEAD
    resizeMode: 'contain',
=======
    borderRadius: 5
  },
  imgContLens: {
    width: 90,
    height: 90,
    borderRadius: 5
>>>>>>> origin/Develop
  },
  actionBtnContainer: {
    backgroundColor: colors.white,
    borderRadius: 0,
    marginRight: -20,
    color: 'blue'
  },
});

export default Home;
