import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, 
         ToastAndroid, useWindowDimensions, View, Alert, ListRenderItemInfo } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { httpService, showPhone } from '../../../lib/utilities';
import { PublicAccountStackParamList, PublicOurStoreStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { CityModel, DistrictModel, Modelable, ProvinceModel, RegionModel, VillageModel, ContactUsModel } from '../../../types/model';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { BottomDrawer, Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import MapsLocationSelect from '../../components/MapsLocationSelect';
import { default as _startCase } from 'lodash/startCase';
import { BoxLoading } from '../../../ui-shared/loadings';
import { useTranslation } from 'react-i18next';
import { RegisterFields } from '..';
import { useAppSelector } from '../../../redux/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';


type Fields = {
  search?: string;
  city?: string;
  id?: string;
  nama?: string;
  kel?: string;
};

type OptionsState = {
  cities?: CityModel[];
  citiesLoaded?: boolean;
  citiesModalOpen?: boolean;
};

function OurStore() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicOurStoreStackParamList, 'OurStore'>>();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('account');
  const { user, location } = useAppSelector(({ user }) => user);
  const [contactUs, setContactUs] = useState<Modelable<ContactUsModel>>({
    models: [],
    modelsLoaded: false,
  });

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [fields, setFields] = useState<Fields>({
    search: '',
    city: '',
    id: '',
    nama: '',
    kel: '',
  });
  const [profile, setProfile] = useState<RegisterFields | null>(null);
  const [action, setAction] = useState('');
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<ContactUsModel>({});
  const [coordinate, setCoordinate] = useState([106.82150309838204, -6.19540649567783]);
  const [options, setOptions] = useState<OptionsState>({
    cities: [],
    citiesLoaded: false,
    citiesModalOpen: false,
  });

  // Effects
  useEffect(() => {
    action && setAction(action);

    if (profile) {
      setProfile(profile);
    } 
    retrieveProvinces();

  }, [route.params]);

  useEffect(() => {
    retrieveProvinces();
    retrieveContactUs();
  }, []);

  // Vars
  const retrieveProvinces = async () => {
    setOptions(state => ({
      ...state,
      cities: [],
      citiesLoaded: false,
    }));

    return await httpService('/api/zonasi/zonasi', {
      data: {
        act: 'KotaStore',
        search: fields.search
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setOptions(state => ({
          ...state,
          cities: data,
          citiesLoaded: true,
        }));
      }
    });
  };

  const handleLatLngChange = (lat: number, lng: number) => {
    setFields(state => ({
      ...state,
      lat: lat.toString(),
      lng: lng.toString(),
    }));
  };

  const hitungJarak = (lat: any, long: any) => {
    let R = 6371;
    let dLati = (106.773025-lat) * Math.PI/180.0;
    let dlongi = (-6.2034954-long) * Math.PI/180.0;

    let lati1 = (lat)*Math.PI/180.0;
    let lati2 = (106.773025)*Math.PI/180.0;

    let a = Math.pow(Math.sin(dLati / 2), 2) +
            Math.pow(Math.sin(dlongi / 2), 2) *
            Math.cos(lati1) * Math.cos(lati2); 

    let c = 2 * Math.asin(Math.sqrt(a));
    let d = R * c;
    return d;
  }
  

  const retrieveContactUs = async () => {
    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
        dt: JSON.stringify({
          pageCountLimit: 0,
          param: "store",
          search: fields.search,
        })
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

  const renderStore = ({ item, index }: ListRenderItemInfo<ContactUsModel>) => {
    const lat = Number(item.StoreLatitude);
    const long = Number(item.StoreLongitude);
    return (
      <>
      <PressableBox
        containerStyle={{ paddingHorizontal: 10 }}
        style={[wrapper.row, { alignItems: 'center', paddingVertical: 6 }]}
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
        <Image source={{ uri: 'https://optiktunggal.com/img/store_location/'+item.StoreImage }} 
              style={{ width: '30%', height: 70, resizeMode: 'stretch' }} />
        <View style={{ marginLeft: 10, width: '65%' }}>
          <Typography type="h4" style={{ fontSize: 11, }} numberOfLines={3}>
            {item.StoreName} | {item.StoreLocationUnit}
          </Typography>
          <Typography style={{ fontSize: 12, textAlign: 'justify'}} numberOfLines={3}>
            {item.StoreAddress}
          </Typography>
          <Typography style={{ fontSize: 12, textAlign: 'justify'}}>
            Phone : { item.StorePhone }, {item.StoreNotes}
          </Typography>
          {/* <Typography style={{ fontSize: 12, textAlign: 'justify'}}>
            Jarak : + - {Number(hitungJarak(lat, long)).toFixed(2)} Km
          </Typography> */}
          <Typography style={{ fontSize: 12, color: '#0d674e', fontStyle: 'italic', textAlign: 'right'}}>
            {`Store Details >>`}
          </Typography>
        </View>
      </PressableBox>
      <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 6, marginHorizontal: 10 }}></View>
      </>
    )
  };

  const getFieldError = (field: keyof Fields) => {
    const { fields = [] } = error;

    return fields.indexOf(field) < 0 ? null : error.message;
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    let newState: Partial<OptionsState> = {};

    switch (type) {
      case 'city':
        newState.citiesModalOpen = 'boolean' === typeof open ? open : !options.citiesModalOpen;
        break;
      case 'city':
        newState.citiesModalOpen = 'boolean' === typeof open ? open : !options.citiesModalOpen;
        break;
    }

    setOptions(state => ({
      ...state,
      ...newState,
    }));
  };

  let locationField: keyof Fields = 'city';
  let locationStepRequired = '';
  let locationModalTitle = '';
  let locationModalList: RegionModel[] = [];
  let locationModalListLoaded: boolean = false;
  let locationModalOpen = options.citiesModalOpen;

  if (options.citiesModalOpen) {
    locationField = 'city';
    locationModalTitle = t(`${''}Select City`);
    locationModalList = options.cities || [];
    locationModalListLoaded = !!options.citiesModalOpen;
  } 

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    // Alert.alert(
    //   `${t('Logout')}`,
    //   value,
    //   [
    //     { text: `${t('Cancel')}`},
    //   ]
    // );
    
    setFields(state => ({
      ...state,
      [field]: value
    }));
    handleSelectByCity(value);
    handleCloseModal();
  };

  const handleSelectByCity = (kota: any) => {
    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
        dt: JSON.stringify({
          pageCountLimit: 0,
          param: "storeselectbycity",
          search: kota,
        })
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
    handleModalToggle('city', false);
  }

  const handleCloseModal = async () => {
    handleModalToggle('city', false);
  };

  const textPilih = '';

  return (
    <View style={{ backgroundColor: '#FEFEFE' }}>
      <View style={[wrapper.row]}>
        <Button
          size={50}
          color="transparent"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={'#0d674e'} />
        </Button>
        <Typography color="black" style={{ marginVertical: 17, textAlign: 'center', }}>
          {`${''}Our Store`}
        </Typography>
      </View>
      <View style={{backgroundColor: '#FEFEFE'}}>
        <PressableBox
          containerStyle={{ overflow: 'visible', marginTop: 12, marginHorizontal: 15, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' }}
          opacity={1}
          onPress={() => handleModalToggle('city', true)}
        >
          <TextField
            placeholder={`${''}Select City`}
            value={options.cities?.find(({ id }) => id === fields.city)?.nama}
            onChangeText={(value) => setFields(state => ({ ...state, search: value }))}
            returnKeyType="search"
            editable={false}
            pointerEvents="none"
          />
        </PressableBox>

        {!getFieldError('city') ? null : (
          <Typography size="sm" color="red" style={{ marginTop: 6 }}>
            {error.message}
          </Typography>
        )}
        
      </View>
      <ScrollView contentContainerStyle={styles.container} style={{ marginTop: 10, marginBottom: 70}}>
        <View style={{ marginBottom: 50 }}>
          <FlatList data={contactUs.models} renderItem={renderStore} style={styles.flatList} />
        </View>

        {/* Popup Provinces */}
        <BottomDrawer
          isVisible={locationModalOpen}
          swipeDirection={null}
          onBackButtonPress={() => handleModalToggle('location', false)}
          onBackdropPress={() => handleModalToggle('location', false)}
          style={{ maxHeight: height * 0.75 }}
        >
          <View style={[wrapper.row]}>
          <Typography style={{ flex: 1, fontWeight: 'bold', fontSize: 16, marginLeft: 30 }}>{locationModalTitle}</Typography>
            <Button
              containerStyle={{ alignItems: 'flex-end', marginBottom: 10, marginTop: -15 }}
              onPress={handleCloseModal}
            >
              <Ionicons name="ios-close" size={24} color={'#333'}/>
              <Typography style={{ color: '#333' }}>Close</Typography>
            </Button>
          </View>
          <View style={{ borderColor: '#ccc', borderWidth: 1, marginHorizontal: 30 }}></View>
          {!locationModalOpen ? null : (
            locationStepRequired ? (
              // Required to select parent location
              <View style={styles.modalContainer}>
                <Typography>{locationStepRequired}</Typography>
              </View>
            ) : (
              !locationModalListLoaded ? (
                // Show loading
                <View style={styles.modalContainer}>
                  {[1, 2, 3].map((item, index) => (
                    <BoxLoading
                      key={index}
                      width={[190, 240]}
                      height={20}
                      style={{ marginTop: index === 0 ? 0 : 12 }}
                    />
                  ))}
                </View>
              ) : (
                // Location List
                <FlatList
                  data={locationModalList}
                  style={{ maxHeight: height * 0.66, backgroundColor: '#FEFEFE' }}
                  contentContainerStyle={styles.modalContainer}
                  renderItem={({ item, index }) => (
                    <Button
                      key={index}
                      label={item.nama}
                      labelProps={{ type: 'p' }}
                      labelStyle={{ flex: 1, textAlign: 'left' }}
                      containerStyle={{
                        backgroundColor: fields[locationField] === item.id ? colors.transparent('#0d674e', 0.1) : undefined,
                      }}
                      style={{ paddingVertical: 15 }}
                      onPress={() => handleFieldChange(locationField, item.id)}
                    />
                  )}
                />
              )
            )
          )}
        </BottomDrawer>
      </ScrollView>
    </View>
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
  flatList: {
    flex: 1,
  },
});

export type { Fields as OurStoreFields };

export default OurStore;
