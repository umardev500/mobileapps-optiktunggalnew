import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, ToastAndroid, View, Text, Alert } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import LOGO from '../../../assets/app-logo.png';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import validator from 'validator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';

type Fields = {
  email?: string,
  password?: string,
};

function Login() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'Login'>>();
  const { user: { location }, shop: { cart_items } } = useAppSelector((state) => state);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<Fields>({
    email: '',
    password: '',
  });
  const [options, setOptions] = useState({
    passwordShow: false,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  // Effects
  useEffect(() => {
    // 
  }, []);

  // Vars
  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    setFields(state => ({
      ...state,
      [field]: value
    }));

    setError({
      fields: [],
      message: undefined,
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

  const handleSubmit = async () => {
    if (!fields.email) {
      return handleErrorShow('email', `${''}Mohon masukkan alamat email Anda.`);
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', `${''}Mohon masukkan alamat email yang valid.`);
    } else if (!fields.password) {
      return handleErrorShow('password', `${''}Mohon masukkan PIN Anda.`);
    }

    setIsSaving(true);
<<<<<<< HEAD

    return httpService('/api/login/login', {
      data: {
        act: 'Login',
        dt: JSON.stringify({
=======
    return httpService('/api/login/login', {
    // return httpService('https://ws.stmorita.net/register/list', {
      data: {
        act: 'Login',
        dt: JSON.stringify({
          comp: '001',
>>>>>>> origin/Develop
          LoginID: fields.email,
          LoginPwd: fields.password,
        }),
      }
    }).then(({ status, data, token }) => {
      console.log("LOGIN", data);

      setIsSaving(false);

<<<<<<< HEAD
      if (status) {
        httpService.setUser({
          ...data,
          ...(!token ? null : { token }),
          reseller: '1',
=======
      if (status == 200) {
        httpService.setUser({
          ...data,
          ...(!token ? null : { token }),
          status: '1',
>>>>>>> origin/Develop
        }).then(() => {
          navigation.navigatePath('Public', {
            screen: 'BottomTabs.AccountStack.Account',
            params: [null, null, {
              profile: fields,
<<<<<<< HEAD
=======
              data: data
>>>>>>> origin/Develop
            }],
          });

          setTimeout(() => {
            if (cart_items?.length) {
              return navigation.navigatePath('Public', {
                screen: 'BottomTabs.HomeStack.Cart',
              });
            }
          }, 250);
        });
<<<<<<< HEAD
      }
    }).catch((err) => {
      console.log("LOGIN ERROR", err);

=======
      }else{
        handleErrorShow('password', `${''}Email atau password salah.`);
      }
    }).catch((err) => {
>>>>>>> origin/Develop
      setIsSaving(false);

      handleErrorShow('password', `${''}Email atau password salah.`);
    });
  };

  const handleFieldShow = (field: keyof Fields, toggle: null | boolean = null) => {
    let optionName: keyof typeof options;

    switch (field) {
      case 'password':
        optionName = 'passwordShow';
        break;
    }

    setOptions(state => ({
      ...state,
      [optionName]: 'boolean' === typeof toggle ? toggle : !options[optionName],
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginTop: -350 }}>
        <Image source={LOGO} style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}/>
        <TextField
          placeholder={`${''}Email address`}
          value={fields.email}
          onChangeText={(value) => handleFieldChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!getFieldError('email')}
          message={error.message}
        />

        <TextField
          containerStyle={{ marginTop: 12 }}
          placeholder={`${''}Password`}
          value={fields.password}
          onChangeText={(value) => handleFieldChange('password', value)}
          autoCompleteType="password"
          secureTextEntry={!options.passwordShow}
          autoCapitalize="none"
          error={!!getFieldError('password')}
          message={error.message}
          right={(
            <Button
              size={24}
              onPress={() => handleFieldShow('password')}
            >
              <Ionicons
                name={!options.passwordShow ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.gray[700]}
              />
            </Button>
          )}
        />

        <Button
          containerStyle={{ alignSelf: 'center', borderRadius: 5, backgroundColor: '#CCC',  marginTop: 30}}
          style={{ width: 340, height: 40,  }}
          label={`${''}Login`.toUpperCase()}
          shadow={3}
          onPress={handleSubmit}
          loading={isSaving}
        />

        <View style={[wrapper.row, { alignItems: 'center', marginHorizontal: 10 }]}>
          <PressableBox
            containerStyle={{ marginTop: 40, alignSelf: 'center', padding: 10 }}
            opacity
            onPress={() => {
              navigation.navigatePath('Public', {
                screen: 'BottomTabs.AccountStack.ForgotPassword',
              });
            }}
          >
            <Typography heading size="sm" color="primary" style={{}}>
              Lupa Password?
            </Typography>
          </PressableBox>
          <Typography style={{ paddingHorizontal: 10, marginTop: 40}}>
            |
          </Typography>
          <PressableBox
            containerStyle={{ marginTop: 40, alignSelf: 'center', padding: 10 }}
            opacity
            onPress={() => navigation.navigatePath('Public', {
              screen: 'BottomTabs.AccountStack.Register'
            })}
          >
            <Typography heading size="sm" color="primary" style={{}}>
              Belum punya akun?
            </Typography>
          </PressableBox>
        </View>
        {/*
        <Typography style={{ textAlign: 'center', marginTop: 15 }}>
          - OR -
        </Typography>
        <View style={[wrapper.row, { alignItems: 'center', marginTop: 15, }]}>
          <PressableBox
            containerStyle={{ alignSelf: 'center',
                              backgroundColor: '#df5449', borderColor: '#ccc', 
                              borderWidth: 1, borderRadius: 5, overflow: 'visible' }}
            style={{ width: 160, height: 40, }}
            opacity={1}
            onPress={() => Alert.alert( "Halo", "Fitur Login Google ini sedang dikembangkan!",
                                        [{text: "Cancel",onPress: () => console.log("Cancel Pressed"),style: "cancel"},
                                          { text: "OK", onPress: () => console.log("OK Pressed") }
                                        ]
                          )}>
            <Typography style={{ textAlign: 'center', marginTop: 10, color: 'white' }}>
              <Ionicons name="logo-google" size={15} />
              oogle
            </Typography>
          </PressableBox>
          <View style={{ marginHorizontal: 25 }}></View>
          <PressableBox
            containerStyle={{ alignSelf: 'center', 
                              backgroundColor: '#4867aa', borderColor: '#ccc', 
                              borderWidth: 1, borderRadius: 5, overflow: 'visible' }}
            style={{ width: 160, height: 40, }}
            opacity={1}
            onPress={() => Alert.alert( "Halo", "Fitur Login Facebook ini sedang dikembangkan!",
                                        [{text: "Cancel",onPress: () => console.log("Cancel Pressed"),style: "cancel"},
                                          { text: "OK", onPress: () => console.log("OK Pressed") }
                                        ]
                          )}>
            <Typography style={{ textAlign: 'center', marginTop: 10, color: 'white' }}>
              <Ionicons name="logo-facebook" size={15} style={{color: 'white'}} />          
              acebook
            </Typography>
          </PressableBox>
        </View>*/}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 12,
    paddingHorizontal: 30,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -150
  },
});

export type { Fields as LoginFields };

export default Login;
