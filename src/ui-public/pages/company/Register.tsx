import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState, useRef } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Alert, Image, useColorScheme } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import validator from 'validator';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import RNFS from 'react-native-fs';
import { launchCamera } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showPhone } from '../../../lib/utilities';
import PhoneInput from "react-native-phone-number-input";
import { Colors } from "react-native/Libraries/NewAppScreen";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SelectDropdown from 'react-native-select-dropdown';

type Fields = {
  namadepan?: string,
  namatengah?: string,
  namabelakang?: string,
  hp?: string,
  email?: string,
  ktpLocalName?: string,
  ktp?: string,
  namaktp?: string,
  fotoLocalName?: string,
  foto?: string,
  namafoto?: string,
  gender?: string,
  tgllahir?: string,
  // password?: string,
};

function Register() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('notification');
  const phoneInput = useRef<PhoneInput>(null);
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [gender, setGender] = useState("");
  // const [tabIndex, setTabIndex] = React.useState();
  // const handleTabsChange = index => {
  //   setTabIndex(index);
  //   console.log('Current state unit: ', setTabIndex(index));
  // };
  const genderData = ["-- Pilih Jenis Kelamin --", "Pria", "Wanita"];
  const [isSaving, setIsSaving] = useState(false);
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<Fields>({
    namadepan: '',
    namatengah: '',
    namabelakang: '',
    hp: '',
    email: '',
    namaktp: '',
    namafoto: '',
    gender: '',
    tgllahir: '',
  });
  const [options, setOptions] = useState({
    ktpFileUploading: false,
    pictureFileUploading: false,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

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

  const getGender = (gender) => {
    setGender(gender);
  }

  const jk = () => {
    return gender;
  }

  // Effects
  useEffect(() => {
    // 
  }, []);
  
  // Vars
  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    if (field === 'hp' && value?.indexOf('0') === 0) {
      value = value.slice(1);
    }

    setFields(state => ({
      ...state,
      [field]: value,
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });
  };

  const kirimPassword = async () => {
    setIsSaving(true);
    return httpService('/api/login/login', {
      data: {
        act: 'KirimPasswordUserTerdaftar',
        dt: JSON.stringify({
          email: fields.email,
          nama: fields.namadepan+' '+fields.namabelakang,
          hp: phone.replace('+', ''), //+fields.hp
        }),
      }
    }).then(({ status, data }) => {
      setIsSaving(false);
      if (status === 200) {
        Alert.alert( "Alert", "We have sent the password to your email.",
          [
            { text: "OK", onPress: () => { navigation.navigatePath('Public', { screen: 'BottomTabs.AccountStack.Login',}); }}
          ]
        );
      }
    }).catch((err) => {
      setIsSaving(false);
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
    // console.log('GENDER__'+tabIndex);
    if (!fields.namadepan || !fields.namabelakang) {
      return handleErrorShow('namadepan', t('Please fill first and last name.'));
    } else if (!fields.hp) {
      return handleErrorShow('hp', t('Please fill phone number.'));
    } else if (!fields.email) {
      return handleErrorShow('email', t('Please fill email address.'));
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', t('Please fill email address.'));
    } else if(!date){
      return handleErrorShow('tgllahir', t('Please fill date of birth'));
    }else if(!SelectDropdown){
      return handleErrorShow('gender', t('Please select gender'));
    }/*else if (!fields.foto) {
      return handleErrorShow('namafoto', t('Please select the file for your profile photo.'));
    } else if (!fields.ktp) {
      return handleErrorShow('namaktp', t('Please select your KTP/NPWP photo file.'));
    }*/
    setIsLoading(true);
    return httpService('/api/login/login', {
      data: {
        act: 'CekEmailExist',
        dt: JSON.stringify({
          email: fields.email,
          hp: phone.replace('+', ''),
        }),
      }
    }).then(({ status, data }) => {
      setIsLoading(false);
      setIsSaving(false);
      if (status === 200) {
        // Alert.alert( "Pemberitahuan", "Sepertinya anda sudah pernah melakukan transaksi di OPTIK TUNGGAL. Silahkan klik tombol minta password untuk mengakses apps ini dan anda tidak perlu daftar akun baru. Terima Kasih",
        //   [
        //     { text: "Minta Password", onPress: () => kirimPassword() }
        //   ]
        // );
        navigation.navigatePath('Public', {
          screen: 'SelectUsers',
          params: [{
            email : fields.email
          }],
        });
      }else if(status === 201){
        navigation.navigatePath('Public', {
          screen: 'AddressEdit',
          params: [{
            profile: {
              ...fields,
              tgllahir: getDate(),
              gender: jk(),
              // hp: `62${fields.hp}`,
              hp: phone.replace('+', ''), //showPhone(fields.hp, '62'),
            },
          }],
        });
      }else if(status === 202){
        Alert.alert( "Alert", "Sorry, the email has been registered.",
          [
            { text: "Oke", onPress: () => navigation.navigatePath('Public', {screen: 'BottomTabs.HomeStack.Home'}) }
          ]
        );
        
      }
    }).catch((err) => {
      setIsSaving(false);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: 'https://www.resindaparkmall.com/media/k2/items/cache/ba1b7eb9b8ad142948e3b9dce300b4c6_L.jpg'}} style={{ width: '60%', height: 75, alignSelf: 'center' }}/>
      {/*<Typography style={{ textAlign: 'center', marginTop: 10 }}>
        Please fill in your personal data.
      </Typography>*/}
      <TextField
        containerStyle={{ marginTop: 25 }}
        placeholder={t('Nama Depan')}
        value={fields.namadepan}
        onChangeText={(value) => handleFieldChange('namadepan', value)}
        error={!!getFieldError('namadepan')}
        message={error.message}
      />

      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={t('Nama Tengah (Jika ada)')}
        value={fields.namabelakang}
        onChangeText={(value) => handleFieldChange('namatengah', value)}
        error={!!getFieldError('namatengah')}
        message={error.message}
      />

      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={t('Nama Belakang')}
        value={fields.namabelakang}
        onChangeText={(value) => handleFieldChange('namabelakang', value)}
        error={!!getFieldError('namabelakang')}
        message={error.message}
      />
      
      <PressableBox onPress={showDatePicker}>
        <TextField
          containerStyle={{ marginTop: 12 }}
          placeholder={t('Tanggal lahir')}
          value={getDate()}
          onChangeText={(value) => handleFieldChange('tgllahir', value)}
          error={!!getFieldError('tgllahir')}
          message={error.message}
          onPressOut={showDatePicker}
          editable={false}
        />
      </PressableBox>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      {/* <Typography style={{ marginTop: 10, }}>Select Gender</Typography> */}
      <SelectDropdown
        defaultValue={0}
        buttonStyle={styles.dropdown1BtnStyle}
        buttonTextStyle={styles.dropdown1BtnTxtStyle}
        data={genderData}
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

      <PhoneInput
        containerStyle={{ marginTop: 20, width: 330 }}
        textContainerStyle={{ height: 50, borderColor: '#f1f1f1', borderWidth: 1, borderRadius: 5, backgroundColor: '#FEFEFE' }}
        textInputStyle={{ height: 50, fontSize: 15 }}
        codeTextStyle={{ fontSize: 16 }}
        ref={phoneInput}
        defaultValue={phone}
        defaultCode="ID"
        layout="first"
        value={fields.hp}
        placeholder="Nomor Handphone"
        onChangeText={(value) => handleFieldChange('hp', value)}
        onChangeFormattedText={text => {
          setPhone(text);
        }}
        autoFocus/>

      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={t('Email')}
        value={fields.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!getFieldError('email')}
        message={error.message}
      />

      <View style={{ marginTop: 60, paddingTop: 24 }}> 
        <Button 
          containerStyle={{ alignSelf: 'center', borderRadius: 5, backgroundColor: '#0d674e', }} 
          style={{ width: 350, height: 40,  }} 
          onPress={handleSubmit} >
            <Typography style={{ color: '#FEFEFE' }}>{t('Submit').toUpperCase()} </Typography>
        </Button>
      </View>

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
  dropdown1BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 15,
    borderColor: '#ccc',
  },
  dropdown1BtnTxtStyle: {color: '#444', fontSize: 16, textAlign: 'left'},
});

export type { Fields as RegisterFields };

export default Register;