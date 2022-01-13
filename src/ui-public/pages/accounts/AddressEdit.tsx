import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { httpService, showPhone } from '../../../lib/utilities';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { CityModel, DistrictModel, Modelable, ProvinceModel, RegionModel, VillageModel } from '../../../types/model';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { BottomDrawer, Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import MapsLocationSelect from '../../components/MapsLocationSelect';
import { default as _startCase } from 'lodash/startCase';
import { BoxLoading } from '../../../ui-shared/loadings';
import { useTranslation } from 'react-i18next';
import { RegisterFields } from '..';
import { useAppSelector } from '../../../redux/hooks';

type Fields = {
  // Register Fields
  prop?: string;
  kab?: string;
  kec?: string;
  kel?: string;
  rt?: string;
  rw?: string;
  jl?: string;
  lat?: string;
  lng?: string;
  location?: string;
  response?: string;
  email?: string;
  id?: string;
  nama?: string;
  title?: string;
  hp?: string;
};

type OptionsState = {
  provinces?: ProvinceModel[];
  provincesLoaded?: boolean;
  provinceModalOpen?: boolean;
  regencies?: CityModel[];
  regenciesLoaded?: boolean;
  regencyModalOpen?: boolean;
  districts?: DistrictModel[];
  districtsLoaded?: boolean;
  districtModalOpen?: boolean;
  villages?: VillageModel[];
  villagesLoaded?: boolean;
  villageModalOpen?: boolean;
};

function AddressEdit() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'AddressEdit'>>();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('account');
  const { user, location } = useAppSelector(({ user }) => user);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [fields, setFields] = useState<Fields>({
    prop: '',
    kab: '',
    kec: '',
    kel: '',
    rt: '',
    rw: '',
    jl: '',
    lat: '',
    lng: '',
    location: '',
    response: '',
    id: '',
    title: '',
    nama: '',
    hp: '',
    email: '',
  });
  const [profile, setProfile] = useState<RegisterFields | null>(null);
  const [action, setAction] = useState('');
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  const [options, setOptions] = useState<OptionsState>({
    provinces: [],
    provincesLoaded: false,
    provinceModalOpen: false,
    regencies: [],
    regenciesLoaded: false,
    regencyModalOpen: false,
    districts: [],
    districtsLoaded: false,
    districtModalOpen: false,
    villages: [],
    villagesLoaded: false,
    villageModalOpen: false,
  });

  // Effects
  useEffect(() => {
    const { profile, address, action } = route.params;

    action && setAction(action);

    if (profile) {
      setProfile(profile);
    } else {
      navigation.setOptions({
        title: !address ? `${''}Tambah Alamat` : `${''}Edit Alamat`
      });
    }

    if (address) {
      setFields(state => ({
        ...state,
        id: address.id,
        jl: address.alamat,
        lat: address.lat,
        lng: address.lng,
        nama: address.nama || address.vch_nama,
        hp: showPhone(address.hp, '') // Remove leading 62
      }));
      setIsEdit(true);
    }
  }, [route.params]);

  useEffect(() => {
    retrieveProvinces();
    // getdataExist();
  }, []);

  // Vars
  const retrieveProvinces = async () => {
    setOptions(state => ({
      ...state,
      regencies: [],
      regenciesLoaded: false,
      districts: [],
      districtsLoaded: false,
      villages: [],
      villagesLoaded: false,
    }));

    return await httpService('http://ws.stmorita.net/zonasi/list', {
      data: {
        act: 'PropList',
        dt: JSON.stringify({ comp: '001' })
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setOptions(state => ({
          ...state,
          provinces: data,
          provincesLoaded: true,
        }));
      }
    });
  };

  const retrieveRegencies = async (id: string) => {
    setOptions(state => ({
      ...state,
      districts: [],
      districtsLoaded: false,
      villages: [],
      villagesLoaded: false,
    }));

    return await httpService('http://ws.stmorita.net/zonasi/list', {
      data: {
        act: 'KabList',
        dt: JSON.stringify({ comp: '001', prop: id })
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setOptions(state => ({
          ...state,
          regencies: data,
          regenciesLoaded: true,
        }));
      }
    })
  };

  const retrieveDistricts = async (id: string) => {
    setOptions(state => ({
      ...state,
      villages: [],
      villagesLoaded: false,
    }));

    return await httpService('http://ws.stmorita.net/zonasi/list', {
      data: {
        act: 'KecList',
        dt: JSON.stringify({ comp: '001', kab: id })
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setOptions(state => ({
          ...state,
          districts: data,
          districtsLoaded: true,
        }));
      }
    });
  };

  const retrieveVillages = async (id: string) => {
    return await httpService('http://ws.stmorita.net/zonasi/list', {
      data: {
        act: 'KelList',
        dt: JSON.stringify({ comp: '001', kec: id })
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setOptions(state => ({
          ...state,
          villages: data,
          villagesLoaded: true,
        }));
      }
    });
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;
    const newState: Partial<Fields> = {
      [field]: value,
    };

    if (field === 'prop') {
      newState.kab = '';
      newState.kec = '';
      retrieveRegencies(value as string);
    } else if (field === 'kab') {
      newState.kec = '';
      newState.kel = '';
      retrieveDistricts(value as string);
    } else if (field === 'kec') {
      newState.kel = '';
      retrieveVillages(value as string);
    }

    setFields(state => ({
      ...state,
      ...newState,
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });

    handleModalToggle(field);
  };

  const handleLatLngChange = (lat: number, lng: number) => {
    setFields(state => ({
      ...state,
      lat: lat.toString(),
      lng: lng.toString(),
    }));
  };

  const handleErrorShow = (fields: keyof Fields | Array<keyof Fields>, message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);

    setError({
      fields: 'string' === typeof fields ? [fields] : fields as Array<keyof Fields>,
      message
    });
  };

  const getFieldError = (field: keyof Fields) => {
    const { fields = [] } = error;

    return fields.indexOf(field) < 0 ? null : error.message;
  };

  // const getdataExist = async () => {
  //   return httpService('/api/login/login', {
  //     data: {
  //       act: 'CekEmailExist',
  //       dt: JSON.stringify({
  //         email: 'nrntwhd@gmail.com',
  //         hp: '0812563400463',
  //       }),
  //     }
  //   }).then(({ status, data }) => {
  //     setIsSaving(false);
  //     if (status === 200) {
  //       Alert.alert( "Pemberitahuan", "Email atau No. Handphone sudah terdaftar."+data.kd_customer,
  //         [
  //           {text: "Cancel",onPress: () => console.log("Cancel Pressed"),style: "cancel"},
  //           { text: "OK", onPress: () => console.log("OK Pressed") }
  //         ]
  //       );
  //     }
  //   }).catch((err) => {
  //     setIsSaving(false);
  //   });
    
  // };

  const sendRegister = async () => {
    const { ktp, foto, ...restProfile } = profile || {};    
    return httpService('/api/login/login', {
      data: {
        act: 'Register',
        dt: JSON.stringify({
          ...restProfile,
          ...fields,
          email: fields.email || restProfile.email,
          hp: showPhone(fields.hp || profile?.hp, '62')
        }),
      }
    }).then(async ({ status, msg, id = 1 }) => {
      // console.log('STATUS_ '+status);
      if (status === 200) {
        await httpService.setUser({
          ...(!id ? null : { id }),
          ...restProfile,
          foto,
          ...fields,
          hp: showPhone(fields.hp || profile?.hp, '62'),
        });

        return id;
      } else if (status === 201) {
        Alert.alert( "Pemberitahuan", "Email atau No. Handphone sudah terdaftar. silahkan ke menu login dan klik tombol lupa password untuk mendapatkan password anda. Terima Kasih.",
                [
                  { text: "GANTI DATA", onPress: () => navigation.navigatePath('Public', { screen: 'BottomTabs.AccountStack.Register'}) }
                ]
        );
      }

      return 0;
    }).catch((err) => {

    });
  };

  const handleSubmit = async () => {
    if (!profile) {
      if (!fields.nama) {
        return handleErrorShow('nama', `${''}Mohon masukkan nama penerima.`);
      } else if (!fields.hp) {
        return handleErrorShow('hp', `${''}Mohon masukkan nomor telepon penerima.`);
      }
    }

    if (!isEdit) {
      if (!fields.prop || !fields.kab || !fields.kec || !fields.kel) {
        return handleErrorShow(['prop', 'kab', 'kec', 'kel'], `${''}Mohon pilih daerah Anda secara lengkap.`);
      } else if (!fields.rt || !fields.rw) {
        return handleErrorShow(['rt', 'rw'], `${''}Mohon masukkan RT dan RW.`);
      }
    }

    if (!fields.jl) {
      return handleErrorShow('jl', `${''}Mohon masukkan alamat lengkap tujuan pengiriman.`);
    } /*else if (!fields.lat || !fields.lng) {
      return handleErrorShow(['lat', 'lng'], `${''}Mohon pilih posisi Anda pada peta.`);
    }*/

    setIsSaving(true);

    const userId = !profile ? user?.id : await sendRegister();
    
    if (!userId) {
      handleErrorShow('response', t(`Registrasi akun bermasalah`));

      return setIsSaving(false);
    }

    let name = fields.nama;
    let phone = fields.hp;
    let email = fields.email;

    if (profile) {
      name = fields.nama || `${profile.namadepan} ${profile.namabelakang}`;
      phone = fields.hp || profile.hp;
      email = fields.email || profile.email;
    }

    const addressField = {
      penerima: fields.nama,
      email: email,
      shipto: isEdit ? fields.jl : `${fields.jl}. Kel. ${options.villages?.find(item => item.id === fields.kel)?.nama || '-'
        }, Kec. ${options.districts?.find(item => item.id === fields.kec)?.nama || '-'
        }, ${options.regencies?.find(item => item.id === fields.kab)?.nama || '-'
        }, ${options.provinces?.find(item => item.id === fields.prop)?.nama || '-'
        }`,
      provinsi: `${options.provinces?.find(item => item.id === fields.prop)?.id || '-'}`,
      kota_kab: `${options.regencies?.find(item => item.id === fields.kab)?.id || '-'}`,
      kecamatan: `${options.districts?.find(item => item.id === fields.kec)?.id || '-'}`,
      kelurahan: `${options.villages?.find(item => item.id === fields.kel)?.id || '-'}`,
      handphone: showPhone(phone, '62'),
      latitude: fields.lat,
      longitude: fields.lng,
      label: 'Rumah',
    };
    
    return httpService('/api/login/login', {
      data: {
        act: 'ShipAddress',
        dt: JSON.stringify(addressField),
      }
    }).then(async ({ status, id = 1 }) => {
      setIsSaving(false);

      if (status === 200) {
        if (!profile) {
          return action === 'checkout' ? (
            navigation.navigatePath('Public', {
              screen: 'BottomTabs.HomeStack.Checkout',
              params: [null, null, {
                address: { ...addressField, id },
              }],
            })
          ) : navigation.navigatePath('Public', {
            screen: 'BottomTabs.AccountStack.AddressList',
            params: [null, null, {
              refresh: true,
            }],
          });
        }

        navigation.navigatePath('Public', {
          screen: 'BottomTabs.AccountStack.Verification',
          params: [null, null, {
            email,
          }],
        });
      }
    }).catch(err => {
      setIsSaving(false);
    });
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    let newState: Partial<OptionsState> = {};

    switch (type) {
      case 'prop':
        newState.provinceModalOpen = 'boolean' === typeof open ? open : !options.provinceModalOpen;
        break;
      case 'prop':
        newState.provinceModalOpen = 'boolean' === typeof open ? open : !options.provinceModalOpen;
        break;
      case 'kab':
        newState.regencyModalOpen = 'boolean' === typeof open ? open : !options.regencyModalOpen;
        break;
      case 'kec':
        newState.districtModalOpen = 'boolean' === typeof open ? open : !options.districtModalOpen;
        break;
      case 'kel':
        newState.villageModalOpen = 'boolean' === typeof open ? open : !options.villageModalOpen;
        break;
      case 'location':
        newState.provinceModalOpen = open || false;
        newState.regencyModalOpen = open || false;
        newState.districtModalOpen = open || false;
        newState.villageModalOpen = open || false;
        break;
    }

    setOptions(state => ({
      ...state,
      ...newState,
    }));
  };

  let locationField: keyof Fields = 'kel';
  let locationStepRequired = '';
  let locationModalTitle = '';
  let locationModalList: RegionModel[] = [];
  let locationModalListLoaded: boolean = false;
  let locationModalOpen = options.provinceModalOpen || options.regencyModalOpen || options.districtModalOpen || options.villageModalOpen;

  if (options.provinceModalOpen) {
    locationField = 'prop';
    locationModalTitle = t(`${''}Pilih Provinsi`);
    locationModalList = options.provinces || [];
    locationModalListLoaded = !!options.provincesLoaded;
  } else if (options.regencyModalOpen) {
    locationField = 'kab';
    locationModalTitle = t(`${''}Pilih Kota/Kabupaten`);
    locationModalList = options.regencies || [];
    locationModalListLoaded = !!options.regenciesLoaded;

    if (!fields.prop) {
      locationStepRequired = t(`${''}Mohon pilih Provinsi.`);
    }
  } else if (options.districtModalOpen) {
    locationField = 'kec';
    locationModalTitle = t(`${''}Pilih Kecamatan`);
    locationModalList = options.districts || [];
    locationModalListLoaded = !!options.districtsLoaded;

    if (!fields.kab) {
      locationStepRequired = t(`${''}Mohon pilih Kota/Kabupaten.`);
    }
  } else if (options.villageModalOpen) {
    locationField = 'kel';
    locationModalTitle = t(`${''}Pilih Kelurahan`);
    locationModalList = options.villages || [];
    locationModalListLoaded = !!options.villagesLoaded;

    if (!fields.kec) {
      locationStepRequired = t(`${''}Mohon pilih Kecamatan.`);
    }
  }

  const textPilih = t(`${''}Pilih`);
  const { address: addressRoute } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {profile ? null : (
        <View style={{ marginTop: 24 }}>
          <Typography type="h4" style={{ marginBottom: 8 }}>
            {`${''}Informasi Alamat pengiriman`}
          </Typography>

          <TextField
            placeholder={`${''}Nama Penerima`}
            value={fields.nama}
            onChangeText={(value) => handleFieldChange('nama', value)}
            error={!!getFieldError('nama')}
            message={error.message}
          />

          <TextField
            containerStyle={{ marginTop: 12 }}
            placeholder={t('Nomor Telepon')}
            value={fields.hp}
            onChangeText={(value) => handleFieldChange('hp', value)}
            keyboardType="phone-pad"
            left={(
              <View style={{ ...wrapper.row, alignItems: 'center' }}>
                <Typography color={950} style={{ marginLeft: 6 }}>+62</Typography>
              </View>
            )}
            error={!!getFieldError('hp')}
            message={error.message}
          />
        </View>
      )}

      {profile ? null : (
        <Typography type="h4" style={{ marginTop: 24 }}>
          {`${''}Detail Alamat`}
        </Typography>
      )}

      {isEdit ? null : (
        <>
          <PressableBox
            containerStyle={{ overflow: 'visible', marginTop: 12 }}
            opacity={1}
            onPress={() => handleModalToggle('prop', true)}
          >
            <TextField
              placeholder={`${''}Pilih Provinsi`}
              value={options.provinces?.find(({ id }) => id === fields.prop)?.nama}
              editable={false}
              pointerEvents="none"
            />
          </PressableBox>

          <PressableBox
            containerStyle={{ overflow: 'visible', marginTop: 12 }}
            opacity={1}
            onPress={() => handleModalToggle('kab', true)}
          >
            <TextField
              placeholder={`${''}Pilih Kota/Kabupaten`}
              value={options.regencies?.find(({ id }) => id === fields.kab)?.nama}
              editable={false}
              pointerEvents="none"
            />
          </PressableBox>

          <PressableBox
            containerStyle={{ overflow: 'visible', marginTop: 12 }}
            opacity={1}
            onPress={() => handleModalToggle('kec', true)}
          >
            <TextField
              placeholder={`${''}Pilih Kecamatan`}
              value={options.districts?.find(({ id }) => id === fields.kec)?.nama}
              editable={false}
              pointerEvents="none"
            />
          </PressableBox>

          <PressableBox
            containerStyle={{ overflow: 'visible', marginTop: 12 }}
            opacity={1}
            onPress={() => handleModalToggle('kel', true)}
          >
            <TextField
              placeholder={`${''}Pilih Kelurahan`}
              value={options.villages?.find(({ id }) => id === fields.kel)?.nama}
              editable={false}
              pointerEvents="none"
            />
          </PressableBox>

          {!getFieldError('prop') ? null : (
            <Typography size="sm" color="red" style={{ marginTop: 6 }}>
              {error.message}
            </Typography>
          )}

          <View style={[wrapper.row, { marginTop: 24 }]}>
            <TextField
              containerStyle={{
                flex: 1,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }}
              placeholder={`${''}RT`}
              value={fields.rt}
              onChangeText={(value) => handleFieldChange('rt', value)}
            />

            <TextField
              containerStyle={{
                flex: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }}
              placeholder={`${''}RW`}
              value={fields.rw}
              onChangeText={(value) => handleFieldChange('rw', value)}
            />
          </View>

          {!getFieldError('rt') && !getFieldError('rw') ? null : (
            <Typography size="sm" color="red" style={{ marginTop: 8 }}>
              {error.message}
            </Typography>
          )}
        </>
      )}

      <TextField
        containerStyle={{ marginTop: 12 }}
        style={{ height: 120, paddingTop: 8 }}
        placeholder={`${''}Alamat Lengkap (Beserta patokan alamat)`}
        value={fields.jl}
        onChangeText={(value) => handleFieldChange('jl', value)}
        multiline
        textAlignVertical="top"
        error={!!getFieldError('jl')}
        message={error.message}
      />

      {/* The Map */}
      {/*<Typography color={getFieldError('lat') ? 'red' : 600} size="sm" textAlign="center" style={{ marginTop: 8 }}>
        {`${''}Mohon letakan pin dengan akurat\nagar kami bisa mengantar ke alamat yg tepat`}
      </Typography>
      <MapsLocationSelect
        style={{
          width: width - 30,
          height: (width - 30) * 10/16,
          marginTop: 12,
          ...shadows[3]
        }}
        onUpdate={handleLatLngChange}
        latitude={!addressRoute ? undefined : parseFloat(addressRoute?.lat || '')}
        longitude={!addressRoute ? undefined : parseFloat(addressRoute?.lng || '')}
      />*/}

      {!getFieldError('response') ? null : (
        <Typography color="red" size="sm" textAlign="center" style={{ marginTop: 16 }}>
          {error.message}
        </Typography>
      )}

      <View style={{ marginTop: 'auto', paddingTop: 24 }}>
        {!profile ? (
          <Button
            containerStyle={{ alignSelf: 'center' }}
            style={{ width: 360 }}
            label={`${''}Simpan`.toUpperCase()}
            color="primary"
            shadow={3}
            onPress={handleSubmit}
            loading={isSaving}
          />
        ) : (
          <Button
            containerStyle={{ alignSelf: 'center' }}
            style={{ width: 360 }}
            label={`${''}Lanjut`.toUpperCase()}
            color="primary"
            onPress={handleSubmit}
            loading={isSaving}
          />
        )}
      </View>

      {/* Popup Provinces */}
      <BottomDrawer
        isVisible={locationModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('location', false)}
        onBackdropPress={() => handleModalToggle('location', false)}
        title={locationModalTitle}
        style={{ maxHeight: height * 0.75 }}
      >
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
                style={{ maxHeight: height * 0.66 }}
                contentContainerStyle={styles.modalContainer}
                renderItem={({ item, index }) => (
                  <Button
                    key={index}
                    label={item.nama}
                    labelProps={{ type: 'p' }}
                    labelStyle={{ flex: 1, textAlign: 'left' }}
                    containerStyle={{
                      backgroundColor: fields[locationField] === item.id ? colors.gray[300] : undefined,
                    }}
                    style={{ paddingVertical: 15 }}
                    onPress={() => handleFieldChange(locationField, item.id)}
                    right={(
                      <Typography color="primary">
                        {textPilih}
                      </Typography>
                    )}
                  />
                )}
              />
            )
          )
        )}
      </BottomDrawer>
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
});

export type { Fields as AddressEditFields };

export default AddressEdit;
