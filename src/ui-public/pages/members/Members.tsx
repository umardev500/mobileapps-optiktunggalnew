import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Image,FlatList, ScrollView, Linking, StyleSheet, useWindowDimensions, ListRenderItemInfo, ImageBackground, ActivityIndicator } from 'react-native';
import { View } from 'react-native-animatable';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, ModelablePaginate, ProductModel, BrandModel, CategoryModel, UserModel, TransactionModel } from '../../../types/model';
import { Typography, Button, PressableBox, BottomDrawer } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import { BoxLoading } from '../../../ui-shared/loadings';
import ViewCollapse from '../../components/ViewCollapse';
import { wrap } from 'lodash';
import { PublicMemberStackParamList } from '../../../router/publicBottomTabs/PublicMemberStack';
import TransactionItem from '../../components/TransactionItem';

type OptionsState = {
  detailModalOpen?: boolean;
  detailModel?: null | TransactionModel;
  payModalOpen?: boolean;
  payModel?: null | TransactionModel;
  filterModalOpen?: boolean;
  benefitModalOpen?: boolean;
};

function Members() {
  // Hooks
  const navigation = useAppNavigation();
  const { user: { user }, ui: { lang } } = useAppSelector((state) => state);
  // const { user, favorites } = useAppSelector(({ user }) => user);
  const route = useRoute<RouteProp<PublicMemberStackParamList, 'Members'>>();
  const { width, height } = useWindowDimensions();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);
  const { t } = useTranslation('home');
  const [users, setUsers] = useState<Modelable<UserModel>>({
    model: null,
    modelLoaded: false,
  });
  const [transaction, setTransaction] = useState<Modelable<TransactionModel>>({
    models: [],
    modelsLoaded: false,
  });  
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });
  const [brand, setBrand] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [options, setOptions] = useState<OptionsState>({
    detailModalOpen: false,
    detailModel: null,
    payModalOpen: false,
    payModel: null,
  });

  const [category, setCategory] = useState<Modelable<CategoryModel>>({
    models: [],
    modelsLoaded: false,
  });

  useEffect(() => {
  }, [route.params]);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await retrieveTransactions();
    retrieveMembersBenefits();
    setIsLoading(false);
  };

  const handleCloseModal = async () => {
    handleModalToggle('popup', false);
  };

  const handleModalCloseBenefit = async () => {
    handleModalToggle('benefitnotyet', false);
  }

  const retrieveMembersBenefits = async () => {
    return httpService(`/members.json`, {
      method: 'post'
    }).then((data) => {
      setOptions(state => ({
        ...state,
        popupModels: data,
        popupModalOpen: true
      }));
    }).catch((err) => void(0));
  };

  const retrieveTransactions = async () => {
    // setIsLoading(true);
    // setTransaction(state => ({
    //   ...state,
    //   models: [],
    //   modelsLoaded: false,
    // }));

    return httpService('/api/transaction/transaction', {
      data: {
        act: 'TrxList',
        dt: JSON.stringify({ kdcust : user?.id }),
      }
    }).then(({ status, data }) => {
      setTransaction(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setTransaction(state => ({
        ...state,
        modelsLoaded: true
      }));
    });
  };

  const handleModalToggle = (type: string, open: null | boolean = null, args: OptionsState = {}) => {
    let toggle: boolean;

    switch (type) {
      case 'detail':
        toggle = 'boolean' === typeof open ? open : !options.detailModalOpen;

        if (!toggle) {
          args.detailModel = null;
        }

        setOptions(state => ({
          ...state,
          detailModalOpen: toggle,
          ...args,
        }));
        break;
      case 'pay':
        toggle = 'boolean' === typeof open ? open : !options.payModalOpen;

        if (!toggle) {
          args.detailModel = null;
        }

        setOptions(state => ({
          ...state,
          payModalOpen: toggle,
          ...args,
        }));
        break;
      case 'popup':
        setOptions(state => ({
          ...state,
          filterModalOpen: 'boolean' === typeof open ? open : !options.filterModalOpen
        }));
        break;
      case 'benefitnotyet':
        setOptions(state => ({
          ...state,
          benefitModalOpen: 'boolean' === typeof open ? open : !options.benefitModalOpen
        }));
        break;
    }
  };

  const { model: usersModel } = users;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      
      <ScrollView>
      {!user? (
        <View style={{ marginBottom: 30, marginHorizontal: 15, marginTop: 10 }}>
          <Image source={require('../../../assets/icons/figma/membercard.png')} 
                 resizeMode= 'stretch' 
                 style={{width: '80%', height: 180, marginVertical: 20, alignSelf: 'center' }}/>
          {/* <Typography type='h4'>SYARAT DAN KETENTUAN</Typography>
          <Typography style={{textAlign: 'justify'}}>
            Melakukan 1 (satu) Transaksi Lunas dengan Value Minimal Rp. 4.000.000,-
            dalam satu Nota Pesan atau Nota Kontan.
          </Typography> */}
          <View style={{marginHorizontal: 5}}>
            <Typography type='h4'>BENEFIT</Typography>
            <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginTop: 5}}></View>
            <View style={[wrapper.row, { marginHorizontal: 15, marginTop: 10 }]}>
              <Typography style={{marginHorizontal: 5}}>1. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                Setiap transaksi pembelanjaan Frame, Sunglass dan Lensa, diseluruh cabang Optik TUnggal, Optik Tunggal Next Generation dan ZEISS Vision Center, Sebagai VIP Member Anda akan mendapatkan point reward sebanyak 5% dari nilai netto pembelanjaan.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginHorizontal: 15 }]}>
              <Typography style={{marginHorizontal: 5}}>2. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                Nilai 1 (satu) point reward = 1 (satu) Rupiah.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginHorizontal: 15 }]}>
              <Typography style={{marginHorizontal: 5}}>3. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                Masa berlaku point reward mengikuti masa berlaku VIP Member Optik Tunggal.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginHorizontal: 15 }]}>
              <Typography style={{marginHorizontal: 5}}>4. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                Point Reward yang terkumpul dapat digunakan untuk berbelanja Frame, Sunglass dan Lensa, di seluruh cabang Optik Tunggal, Optik Tunggal Next Generation dan ZEISS Vision Center.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginHorizontal: 15 }]}>
              <Typography style={{marginHorizontal: 5}}>5. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                Sebagai VIP Member Anda berpeluang menerima kejutan dari Optik Tunggal di hari Ulang Tahun Anda.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginHorizontal: 15}]}>
              <Typography style={{marginHorizontal: 5}}>6. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                VIP Member akan mendapatkan kode referral. kode referral tersebut dapat digunakan untuk mereferensikan
                orang lain yang belum pernah berbelanja di Optik Tunggal dan menjadi VIP Member. 
              </Typography>
            </View>
            <View style={[wrapper.row, { marginHorizontal: 15}]}>
              <Typography style={{marginHorizontal: 5}}>7. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                VIP Member akan mendapatkan tambahan saldo sebesar 5% atas transaksi frame, sunglass dan lensa dari netto pembelanjaan yang direferralkan.
              </Typography>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ marginBottom: 50, marginHorizontal: 15 }}>
          {user?.no_card == null ? (
            <View style={{marginTop: 20}}>
              <Typography style={{ textAlign: 'center', fontSize: 12, paddingHorizontal: 3, color: '#ec3a3b' }}>
                You are not a member yet
              </Typography>
              <Typography style={{ textAlign: 'center', fontSize: 12, paddingHorizontal: 3 }}>
                Member users will get the best offers every time they make a transaction.
              </Typography>
              <PressableBox 
                onPress={() => handleModalToggle('benefitnotyet', true)}
                style={{marginVertical: 10, marginRight: 15, alignSelf: 'center'}}>
                <Typography style={{fontSize: 12, fontStyle: 'italic', textDecorationLine: 'underline'}}>
                  {'Click & View Benefits'}
                </Typography>
              </PressableBox>
            </View>
          ) : (
            <View>
              <Typography style={{ flex: 1, textAlign: 'center', color: '#7e7e7e', marginTop: -13, fontSize: 10 }}>
                <Ionicons name="arrow-down" size={14} color={colors.gray[600]} />
                Pull down to refresh
              </Typography>
              {!user?.no_card? null : (
                <>
                <ImageBackground source={require('../../../assets/icons/figma/membercard.png')} resizeMode= 'stretch' style={{width: '100%', height: 220, marginTop: 10 }}>
                  <View style={{position: 'absolute', top: 145, left: 0, right: 0, bottom: 0}}>
                    <Typography style={{ color: 'white', marginHorizontal: 20, fontSize: 16 }}>
                      {user?.nama}
                      </Typography>
                      <View style={[wrapper.row, { width: '100%', marginTop: 5 }]}>
                        <Typography style={{ color: 'white', marginHorizontal: 20, fontSize: 16}}>
                          {user?.no_card}
                          </Typography>
                          <Typography style={{ color: 'white', textAlign: 'center', fontSize: 10, flex: 1, marginLeft: 30 }}>
                            Valid thru {user?.aktif}
                          </Typography>
                      </View>
                  </View>
                </ImageBackground>
                <View style={[wrapper.row, 
                              { borderRadius: 5, borderColor: '#ccc', 
                                borderWidth: 1, marginHorizontal: 5, marginTop: 10}]}>
                  <View style={{flex: 1}}>
                    <Typography type='h4' size='md' style={{ fontSize: 14, marginHorizontal: 10, marginVertical: 10 }}>
                        Referral Code : {user?.no_referral}
                    </Typography>
                  </View>
                  <View>
                    <PressableBox 
                      onPress={() => handleModalToggle('popup', true)}
                      style={{marginVertical: 10, marginRight: 15}}>
                      <Ionicons name="md-information-circle-outline" size={18} color={colors.gray[900]} />
                    </PressableBox>
                  </View>
                  {/* <PressableBox style={{marginVertical: 10, width: 130}}>
                    <Typography style={{color: '#0000FF', textAlign: 'right'}}>
                      Share Code
                    </Typography>
                  </PressableBox> */}
                </View>
                <View style={[wrapper.row]}>
                  <View style={{ borderRadius: 5, flex: 1, borderColor: '#ccc', borderWidth: 1, marginTop: 10, marginHorizontal: 5}}>
                    <Image
                      source={require('../../../assets/star.png')}
                      style={{
                        width: 30,
                        height: 30,
                        alignSelf: 'center',
                        marginTop: 5
                      }}
                    />
                    <Typography style={{ textAlign: 'center', fontSize: 10, paddingHorizontal: 10 }}>
                      Poin Redeem :
                    </Typography>
                    <Typography style={{ textAlign: 'center', fontSize: 16, paddingVertical: 5, fontWeight: 'bold' }}>
                      {user?.saldo}
                    </Typography>
                  </View>

                  <View style={{ borderRadius: 5, flex: 1, borderColor: '#ccc', borderWidth: 1, marginTop: 10, marginHorizontal: 5}}>
                    <Image
                      source={require('../../../assets/password.png')}
                      style={{
                        width: 30,
                        height: 30,
                        alignSelf: 'center',
                        marginTop: 5
                      }}
                    />
                    <Typography style={{ textAlign: 'center', fontSize: 10, paddingHorizontal: 10 }}>
                      Password to redeem :
                    </Typography>
                    <Typography style={{ textAlign: 'center', fontSize: 16, paddingVertical: 5, fontWeight: 'bold' }}>
                      {user?.password}
                    </Typography>
                  </View>
                </View>

                {user?.saldo == 0 ? (
                    <Typography style={{ color: 'red', fontSize: 11, textAlign: 'center', marginTop: 15 }}>
                      <Ionicons name="warning" size={15} color={'red'} style={{paddingHorizontal: 5}}/> 
                      Upgrade transactions to get points and lots of benefits.
                    </Typography>
                  ) : null }
                </>
              )}
            </View>
          )}
          
          <Typography style={{ paddingVertical: 12, marginVertical: 10, borderBottomWidth: 1, }}>
            {t(`Transaction List`)}
          </Typography>
          {!transaction.modelLoaded == null ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <ActivityIndicator size={32} animating color={colors.palettes.primary} />
            </View>
          ) : (
            !transaction.models?.length ? (
              <View style={[styles.container, styles.wrapper]}>
                <Image source={{ uri: 'https://www.callkirana.in/bootstrp/images/no-product.png' }} style={styles.sorry} />
                {!transaction.models?.length ? (
                  <PressableBox
                    containerStyle={{ alignSelf: 'center' }}
                    onPress={() => handleRefresh()}>
                    <Typography size="sm" style={{ borderBottomWidth: 1, borderColor: colors.gray[700] }}>
                      {t(`Click to view transaction`)}
                    </Typography>
                  </PressableBox>
                ) : (
                  null
                )}
                <Typography textAlign="center" style={{ marginVertical: 12 }}>
                  {t(`${t('Empty Transaction List.')}`)}
                </Typography>
              </View>
            ) : transaction.models.map((item, index) => (
              <TransactionItem
                key={index}
                transaction={item}
                onDetailPress={(model) => handleModalToggle('detail', true, {
                  detailModel: model
                })}
                // onPayPress={(model) => handleModalToggle('pay', true, {
                //   payModel: model
                // })}
                style={{ marginTop: index === 0 ? 0 : 12 }}
              />
            ))
          )}
        </View>
      )}
      </ScrollView>
      {!user? ( 
          <View style={{backgroundColor: 'transparent'}}>
            <Button
              containerStyle={{ alignSelf: 'center', marginBottom: 10, backgroundColor: '#0d674e', width: 320 }}
              onPress={() => Linking.openURL('https://wa.me/6281113203000?text=Halo%20Saya%20mau%20menjadi%20VIP%20%20member.')}  
            >
              <Typography style={{ color: '#fff' }}>I want to be a VIP member</Typography>
              <Ionicons name="chevron-forward" size={19} color={'#fff'} />
            </Button>
          </View>
        ) : (null)
      }
      <BottomDrawer
        isVisible={options.filterModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('filter', false)}
        onBackdropPress={() => handleModalToggle('filter', false)}
        style={{ maxHeight: height * 0.75 }}
      >
        <Button
          containerStyle={{ alignItems: 'flex-end', marginBottom: 5, marginTop: -15 }}
          onPress={handleCloseModal}
        >
          <Ionicons name="ios-close" size={24} color={'#333'} />
          <Typography style={{ color: '#333' }}>Close</Typography>
        </Button>
        {/* <Typography type='h4' style={{ paddingVertical: 10, paddingHorizontal: 15, color: '#0d674e' }}>
          {`Referral terms & conditions`}
        </Typography>
        <View style={{borderColor: '#0d674e', borderWidth: 1, marginHorizontal: 15}}></View> */}
        <ScrollView style={{ paddingVertical: 10, paddingHorizontal: 15}}>
          <Typography style={{marginBottom: 10, textAlign: 'center', lineHeight: 25}}>
            {`Referensikan kode referral kepada keluarga, sahabat dan orang terdekat anda.`}
          </Typography>
        </ScrollView>
        {/* <Button
          containerStyle={{ alignSelf: 'center', marginBottom: 20, backgroundColor: '#0d674e' }}
          style={{ minWidth: 250 }}
          // onPress={() => }
        >
          <Ionicons name="share-social-outline" size={24} color={'#fff'} />
          <Typography style={{ color: '#fff', marginLeft: 10 }}>Share Referral</Typography>
        </Button> */}
        <View style={{ marginVertical: 20 }}></View>
      </BottomDrawer>

      {/*BENEFIT*/}
      <BottomDrawer
        isVisible={options.benefitModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('benefit', false)}
        onBackdropPress={() => handleModalToggle('benefit', false)}
        style={{ maxHeight: height * 0.75 }}
      >
        <Button
          containerStyle={{ alignItems: 'flex-end', marginBottom: 5, marginTop: -15 }}
          onPress={handleModalCloseBenefit}
        >
          <Ionicons name="ios-close" size={24} color={'#333'} />
          <Typography style={{ color: '#333' }}>Close</Typography>
        </Button>
        <Typography type='h4' style={{ paddingVertical: 10, paddingHorizontal: 15, color: '#0d674e' }}>
          {`BENEFIT`}
        </Typography>
        <View style={{borderColor: '#0d674e', borderWidth: 1, marginHorizontal: 15}}></View>
        <ScrollView style={{ paddingVertical: 10, paddingHorizontal: 15}}>
        <View style={{marginHorizontal: 5}}>
            <View style={[wrapper.row, { marginRight: 15, marginTop: 10 }]}>
              <Typography style={{marginHorizontal: 5}}>1. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                Setiap transaksi pembelanjaan Frame, Sunglass dan Lensa, diseluruh cabang Optik TUnggal, Optik Tunggal Next Generation dan ZEISS Vision Center, Sebagai VIP Member Anda akan mendapatkan point reward sebanyak 5% dari nilai netto pembelanjaan.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginRight: 5 }]}>
              <Typography style={{marginHorizontal: 5}}>2. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23}}>
                Nilai 1 (satu) point reward = 1 (satu) Rupiah.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginRight: 5 }]}>
              <Typography style={{marginHorizontal: 5}}>3. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23, marginRight: 20}}>
                Masa berlaku point reward mengikuti masa berlaku VIP Member Optik Tunggal.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginRight: 5 }]}>
              <Typography style={{marginHorizontal: 5}}>4. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23, marginRight: 20}}>
                Point Reward yang terkumpul dapat digunakan untuk berbelanja Frame, Sunglass dan Lensa, di seluruh cabang Optik Tunggal, Optik Tunggal Next Generation dan ZEISS Vision Center.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginRight: 5}]}>
              <Typography style={{marginHorizontal: 5}}>5. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23, marginRight: 20}}>
                Sebagai VIP Member Anda berpeluang menerima kejutan dari Optik Tunggal di hari Ulang Tahun Anda.
              </Typography>
            </View>
            <View style={[wrapper.row, { marginRight: 5}]}>
              <Typography style={{marginHorizontal: 5}}>6. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23, marginRight: 20}}>
                VIP Member akan mendapatkan kode referral. kode referral tersebut dapat digunakan untuk mereferensikan
                orang lain yang belum pernah berbelanja di Optik Tunggal dan menjadi VIP Member. 
              </Typography>
            </View>
            <View style={[wrapper.row, { marginRight: 5}]}>
              <Typography style={{marginHorizontal: 5}}>7. </Typography>
              <Typography style={{textAlign: 'justify', lineHeight: 23, marginRight: 20}}>
                VIP Member akan mendapatkan tambahan saldo sebesar 5% atas transaksi frame, sunglass dan lensa dari netto pembelanjaan yang direferralkan.
              </Typography>
            </View>
          </View>
        </ScrollView>
        {/* <Button
          containerStyle={{ alignSelf: 'center', marginBottom: 20, backgroundColor: '#0d674e' }}
          style={{ minWidth: 250 }}
          // onPress={() => }
        >
          <Ionicons name="share-social-outline" size={24} color={'#fff'} />
          <Typography style={{ color: '#fff', marginLeft: 10 }}>Share Referral</Typography>
        </Button> */}
        <View style={{ marginVertical: 20 }}></View>
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
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    marginBottom: 10,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
  menuContainer: {
    margin: -10,
    padding: 15,
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
    paddingHorizontal: 20,
  },
  filterIconBrand: {
    width: 30,
    height: 15,
    resizeMode: 'contain',
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
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120
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

export default Members;
