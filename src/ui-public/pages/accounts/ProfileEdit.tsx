import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Alert, RefreshControl } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { Button, PressableBox, TextField, Typography, BottomDrawer } from '../../../ui-shared/components';
import validator from 'validator';
import DocumentPicker from 'react-native-document-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { httpService, showPhone } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker';
import imageManager, { ImageManagerParams } from '../../../lib/utilities/imageManager';
import SelectDropdown from 'react-native-select-dropdown';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { CityModel, RegionModel } from '../../../types/model';
import { BoxLoading } from '../../../ui-shared/loadings';

type Fields = {
  kodecust?: string;
  namadepan?: string;
  namatengah?: string;
  namabelakang?: string;
  hp?: string;
  email?: string;
  ktpLocalName?: string;
  ktp?: string;
  namaktp?: string;
  fotoLocalName?: string;
  foto?: string;
  namafoto?: string;
  response?: string;
  tgllahir?: string;
  gender?: string;
  address?: string;
  city?: string;
};

type OptionsState = {
  cities?: CityModel[];
  citiesLoaded?: boolean;
  citiesModalOpen?: boolean;
};

function ProfileEdit() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { user: { user, location } } = useAppSelector(state => state);
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('account');
  const genderData = ["-- Pilih Jenis Kelamin --", "Pria", "Wanita"];
  const [date, setDate] = useState("");
  const [gender, setGender] = useState("");
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<Fields>({
    kodecust: '',
    namadepan: '',
    namatengah: '',
    namabelakang: '',
    hp: '',
    email: '',
    ktp: '',
    namaktp: '',
    foto: '',
    namafoto: '',
    gender: '',
    tgllahir: '',
    address: '',
    city: ''
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    retrieveProvinces();
    setIsLoading(false);
  };

  const [options, setOptions] = useState<OptionsState>({
    cities: [],
    citiesLoaded: false,
    citiesModalOpen: false,
  });

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

  // Effects
  useEffect(() => {
    if (user) {
      const [namadepan, namatengah, namabelakang] = user.nama?.split(' ') || '';
      setFields(state => ({
        ...state,
        kodecust: user.id,
        namadepan: user.namadepan || namadepan,
        namatengah: user.namatengah || namatengah,
        namabelakang: user.namabelakang || namabelakang,
        gender: user.gender,
        tgllahir: user.tgllahir,
        hp: showPhone(String(user.hp), ''), // Remove leading 62
        email: user?.email,
        city: user?.city,
        address: user?.address,
      }));
    }
  }, [user]);

  // Vars
  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    if (field === 'hp' && value?.indexOf('0') === 0) {
      value = value.slice(1);
    }

    setFields(state => ({
      ...state,
      [field]: value
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });
  };

  
  const handleLogout = async () => {
    await httpService.logout();

    navigation.reset({
      index: 0,
      routes: [{
        name: 'Public',
        params: { screen: 'BottomTabs.AccountStack.Login' }
      }],
    });
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

  const handleSubmit = () => {
    if (!fields.hp) {
      return handleErrorShow('hp', t('Please enter your phone number.'));
    } else if (!fields.email) {
      return handleErrorShow('email', t('Please enter your email address.'));
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', t('Please enter your email address.'));
    } else if (!fields.foto) {
      // return handleErrorShow('namafoto', t('Mohon pilih file untuk foto profil Anda.'));
    } else if (!fields.ktp) {
      // return handleErrorShow('namaktp', t('Mohon pilih file foto KTP/NPWP Anda.'));
    }else if (!fields.tgllahir) {
      return handleErrorShow('tgllahir', t('Please select your date of birth.'));
    }

    const { ktp, foto, ...restFields } = fields;

    setIsSaving(true);

    return httpService('/api/login/login', {
      data: {
        act: 'GantiProfile',
        dt: JSON.stringify({
          ...fields,
          hp: showPhone(String(fields.hp), '62'),
          regid: user?.id,
          ip: location.ip,
          gender: jk(),
          tgllahir: getDate(),
        }),
        // ktp,
        foto
      }
    }).then(async ({ status, msg, id = 1 }) => {
      setIsSaving(false);

      if (status === 200) {
        await httpService.setUser({
          ...user,
          ...restFields,
          hp: showPhone(String(fields.hp), '62'),
          foto: !foto ? user?.foto : foto,
        });

        Alert.alert( "Success", "Profile changed successfully. Please login again",
          [
            { text: "OKE", onPress: () => 
            handleLogout()
              // navigation.navigatePath('Public', { 
              //   screen: 'BottomTabs.AccountStack.Account'
              // }) 
            }
          ]
        );
      } else if ('string' === typeof msg) {
        switch (msg.toLowerCase()) {
          case 'hp sudah terdaftar':
            handleErrorShow('response', t(`Phone Number already registered.`));
            break;
          case 'email sudah terdaftar':
            handleErrorShow('response', t(`Email already registered.`));
            break;
        }
      }
    }).catch((err) => {
      setIsSaving(false);

      handleErrorShow('response', t(`Terjadi kesalahan saat menyimpan.`));
    });
  };

  const handleCameraOpen = async (field: keyof Fields) => {
    const { assets = [] } = await launchCamera({
      mediaType: 'photo',
      maxWidth: 1920,
      maxHeight: 1920,
    }).catch(() => ({ assets: [] }));

    const [file] = assets;

    if (file) {
      const image = await imageManager(file as ImageManagerParams);
      let attachmentKey = '';

      switch (field) {
        case 'namafoto':
          attachmentKey = 'foto';
          handleFieldChange('fotoLocalName', !image ? '' : `Camera_${image.value}`);
          break;
      }

      handleFieldChange(attachmentKey as keyof Fields, image?.base64 || '');
      handleFieldChange(field, image?.value || '');
    }
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    // const isDate = moment().format("DD/MM/YYYY");
    setDate(date);
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  const getDate = () => {
    if(date == ""){
      let tempDate = "";
      return tempDate;
    }else{
      let tempDate = moment(date).format("YYYY-MM-DD");
      return tempDate;
    }
  };

  const retrieveProvinces = async () => {
    setOptions(state => ({
      ...state,
      cities: [],
      citiesLoaded: false,
    }));

    return await httpService('/api/zonasi/zonasi', {
      data: {
        act: 'KotaStore',
        search: ''
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

  const getGender = (gender) => {
    setGender(gender);
  }

  const jk = () => {
    return gender;
  }

  const handleFileOpen = async (field: keyof Fields) => {
    const [file] = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    }).catch(() => []);

    if (file) {
      const image = await imageManager(file as ImageManagerParams);
      let attachmentKey = '';

      switch (field) {
        case 'namafoto':
          attachmentKey = 'foto';
          handleFieldChange('fotoLocalName', image?.name || '');
          break;
      }

      handleFieldChange(attachmentKey as keyof Fields, image?.base64 || '');
      handleFieldChange(field, image?.value || '');
    }
  };

  const handleCloseModal = async () => {
    handleModalToggle('city', false);
  };

  const textPilih = t(`${''}Click`);

  return (
    <View>
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
        <View style={[wrapper.row, {marginTop: 30, marginBottom: 12}]}>
          <Typography>Kode Pelanggan</Typography>
          <Typography style={{textAlign: 'right', flex: 1}}>{fields.kodecust}</Typography>
        </View>
        <View style={[wrapper.row]}>
          <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Nama Depan</Typography>
          <View style={{flex: 1, marginLeft: 25}}>
            <TextField
              style={{textAlign: 'right'}}
              placeholder={t('Nama Depan')}
              value={fields.namadepan}
              onChangeText={(value) => handleFieldChange('namadepan', value)}
              error={!!getFieldError('namadepan')}
              editable={true}
              message={error.message}
            />
          </View>
        </View>
        <View style={[wrapper.row, {marginTop: 10}]}>
          <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Nama Tengah</Typography>
          <View style={{flex: 1, marginLeft: 25}}>
            <TextField
              style={{textAlign: 'right'}}
              placeholder={t('Nama Tengah (Jika ada)')}
              value={fields.namatengah}
              onChangeText={(value) => handleFieldChange('namatengah', value)}
              editable={true}
              message={error.message}
            />
          </View>
        </View>
        <View style={[wrapper.row, {marginTop: 10}]}>
          <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Nama Belakang</Typography>
          <View style={{flex: 1, marginLeft: 25}}>
            <TextField
              style={{textAlign: 'right'}}
              placeholder={t('Nama Belakang')}
              value={fields.namabelakang}
              onChangeText={(value) => handleFieldChange('namabelakang', value)}
              error={!!getFieldError('namabelakang')}
              editable={true}
              message={error.message}
            />
          </View>
        </View>
        <View style={[wrapper.row, {marginTop: 10}]}>
          <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Tanggal Lahir</Typography>
          <View style={{flex: 1, marginLeft: 25}}>
            <PressableBox onPress={showDatePicker}>
              <TextField
                style={{textAlign: 'right'}}
                placeholder={t('Date of birth')}
                value={fields.tgllahir ? fields.tgllahir : getDate()}
                onChangeText={(value) => handleFieldChange('tgllahir', value)}
                error={!!getFieldError('tgllahir')}
                message={error.message}
                onPressOut={showDatePicker}
                editable={false}
              />
            </PressableBox>
          </View>
        </View>
          
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <View style={[wrapper.row, {marginTop: 5}]}>
          <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Jenis Kelamin</Typography>
          <View style={{flex: 1, marginLeft: 25}}>
            <SelectDropdown
              defaultValue={fields.gender}
              buttonStyle={styles.dropdown1BtnStyle}
              buttonTextStyle={styles.dropdown1BtnTxtStyle}
              data={genderData}
              rowTextStyle={{ textAlign: 'left' }}
              onSelect={(selectedItem, index) => {
                console.log('Select '+selectedItem)
                getGender(selectedItem);
              }}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem
              }}
              rowTextForSelection={(item, index) => {
                return item
              }}
            />
          </View>
        </View>
        
        <View style={[wrapper.row, {marginTop: 10}]}>
          <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Nomor Handphone</Typography>
          <View style={{flex: 1, marginLeft: 25}}>
            <TextField
              style={{textAlign: 'right'}}
              placeholder={t('Nomor Handphone')}
              value={fields.hp}
              onChangeText={(value) => handleFieldChange('hp', value)}
              editable={false}
              keyboardType="phone-pad"
              // left={(
              //   <View style={{ ...wrapper.row, alignItems: 'center' }}>
              //     <Typography color={950} style={{ marginLeft: 6 }}>+62</Typography>
              //   </View>
              // )}
              error={!!getFieldError('hp')}
              message={error.message}
            />
          </View>
        </View>

        {
          <View style={[wrapper.row, {marginTop: 10}]}>
            <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Email</Typography>
            <View style={{flex: 1, marginLeft: 10}}>
              <TextField
                style={{textAlign: 'right'}}
                placeholder={t('Email')}
                value={fields.email}
                onChangeText={(value) => handleFieldChange('email', value)}
                keyboardType="email-address"
                editable={false}
                autoCapitalize="none"
                error={!!getFieldError('email')}
                message={error.message}
              />
            </View>
          </View>
        }
        <View style={[wrapper.row, {marginTop: 5}]}>
          <Typography style={{textAlignVertical: 'center', paddingTop: 10}}>Kota</Typography>
          <PressableBox
            containerStyle={{ overflow: 'visible', marginTop: 12, borderRadius: 5, 
                              borderWidth: 1, borderColor: '#ccc', flex: 1, marginLeft: 50 }}
            opacity={1}
            onPress={() => handleModalToggle('city', true)}
          >
            <TextField
              style={{textAlign: 'right'}}
              placeholder={`${''}Pilih Kota`}
              value={options.cities?.find(({ id }) => id === fields.city)?.nama}
              onChangeText={(value) => setFields(state => ({ ...state, search: value }))}
              returnKeyType="search"
              editable={false}
              pointerEvents="none"
              right={<Ionicons name="chevron-down" size={20} color={'#ccc'} />}
            />
          </PressableBox>
        </View>

        <View style={[wrapper.row, {marginTop: 10}]}>
          <Typography style={{textAlignVertical: 'top', paddingTop: 10}}>Alamat</Typography>
          <View style={{flex: 1, marginLeft: 25}}>
            <TextField
              placeholder={t('Address')}
              value={fields.address}
              onChangeText={(value) => handleFieldChange('address', value)}
              error={!!getFieldError('address')}
              style={{ height: 120, paddingTop: 8 }}
              multiline
              textAlignVertical="top"
              editable={true}
              message={error.message}
            />
          </View>
        </View>

        <View style={{ marginTop: 20, paddingTop: 24 }}>
          <Button
            containerStyle={{
              alignSelf: 'center',
              ...shadows[3]
            }}
            style={{ width: 300, backgroundColor: '#0d674e' }}
            shadow={3}
            onPress={handleSubmit}
            loading={isSaving}
          >
          <Typography style={{ color: '#FEFEFE' }}>Update Profile</Typography> 
          </Button>
        </View>
      </ScrollView>
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
  dropdown1BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 15,
    borderColor: '#ccc',
  },
  dropdown1BtnTxtStyle: {color: '#444', fontSize: 16, textAlign: 'right'},
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  modalContainer: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 24
  },
});

export type { Fields as ProfileEditFields };

export default ProfileEdit;
