import { RouteProp, useRoute } from '@react-navigation/core';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, ToastAndroid, useWindowDimensions, View, Alert } from 'react-native';
import { RegisterFields } from '.';
import { colors, typography, wrapper } from '../../../lib/styles';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import validator from 'validator';

type Fields = {
  otp_code?: string;
  email?: string;
};

function Verification() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'Verification'>>();
  const { user, location } = useAppSelector(({ user }) => user);
  const { t } = useTranslation('account');

  const inputRef = useRef<TextInput>();
  const timerTO = useRef<any>();

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<Fields>({
    otp_code: '',
    email: ''
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [inputLength, setInputLength] = useState(6);
  const [profile, setProfile] = useState<RegisterFields | null>(null);
  const [timer, setTimer] = useState(60);

  // Effects
  useEffect(() => {
    if (route.params?.profile) {
      setProfile(route.params.profile);
    }

    route.params.email && handleFieldChange('email', route.params.email);
  }, [route.params]);

  useEffect(() => {
    clearTimeout(timerTO.current);
    beginTimer();
  }, []);

  // Vars
  const beginTimer = () => {
    timer > 0 && setTimer(state => state - 1);

    clearTimeout(timerTO.current);

    timerTO.current = setTimeout(() => {
      beginTimer();
    }, 1000);
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    setFields(state => ({
      ...state,
      [field]: value
    }));

    fields.indexOf(field) >= 0 && setError({
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
    if (!fields.otp_code) {
      return handleErrorShow('otp_code', t(`OTP code is not complete.`));
    }

    setIsSaving(true);

    return httpService('/api/login/login', {
      data: {
        act: 'CekVerifikasi',
        dt: JSON.stringify({
          email: route.params.email,
          otp: fields.otp_code,
          hp: route.params.hp
        }),
      },
    }).then(({ status, data, msg }) => {
      setIsSaving(false);

      if (status === 200) {
        httpService.setUser({
          ...user,
          ...data,
          verified: 1,
        }).then(() => {
          navigation.navigatePath('Public', {
            screen: 'PinEdit',
            params: [{
              action: 'register',
              email: user?.email || fields.email,
            }],
          });
        });
      }else{
        Alert.alert( "Notification", "The OTP code you entered is wrong.",[{ text: "Oke", onPress: () => console.log("OK Pressed") }]);
      }
    }).catch(({ msg }) => {
      setIsSaving(false);

      if ('string' === typeof msg) {
        switch (msg.toLowerCase()) {
          case 'kode verifikasi tidak valid':
            handleErrorShow('otp_code', t(`Invalid verification code`));
            break;
        }
      }
    });
  };

  const handleVerificationResend = () => {
    setIsSaving(true);

    return httpService('/api/login/login', {
      data: {
        act: 'KirimUlangOTP',
        dt: JSON.stringify({
          comp: '001',
          email: fields.email || route.params.hp,
          type: fields.email === '' ? 'wa' : 'mail', 
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        })
      }
    }).then(({ status }) => {
      setIsSaving(false);

      if (200 === status) {
        setTimer(120);

        ToastAndroid.show(t(`Verification code sent to your email.`), ToastAndroid.SHORT);
      }
    }).catch((err) => {
      setIsSaving(false);

      return handleErrorShow('email', t(`Email address not registered.`));
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ paddingTop: 24, alignSelf: 'center' }}>
        <Typography heading style={{ marginTop: 2, color: '#333', textAlign: 'center' }}>
          {t(`${''}Masukan Kode Verifikasi`)}
        </Typography>
        {route.params?.flaq === "mail" ? (
          <Typography style={{ marginTop: 2, color: '#333', textAlign: 'center' }}>
            {t(`${''}Kode verifikasi sudah kami kirimkan ke email anda. Silahkan cek inbox atau spam di email anda.`)}
          </Typography>
        )
        :
        (
          <Typography style={{ marginTop: 2, color: '#333', textAlign: 'center' }}>
            {t(`${''}Kode verifikasi kami kirimkan melalui whatsapp dengan nomor +`+route.params.hp+`.`)}
          </Typography>
        )}
      </View>
      {/* <Typography textAlign="center" style={{ paddingTop: 24 }}>
        {moment().startOf('day').set('second', timer).format('mm:ss')}
      </Typography> */}

      <View style={styles.inputsWrap}>
        <TextInput
          ref={inputRef as any}
          style={styles.input}
          value={fields.otp_code}
          maxLength={inputLength}
          onChangeText={(value) => handleFieldChange('otp_code', value)}
          keyboardType="number-pad"
        />

        <View style={styles.inputs}>
          {Array.from(Array(inputLength)).map((item, index) => (
            <PressableBox
              key={index}
              opacity={1}
              containerStyle={{ marginHorizontal: 6, overflow: 'visible' }}
              style={styles.inputWrap}
              onPress={() => inputRef.current?.focus()}
            >
              <TextField
                value={!fields.otp_code ? '' : fields.otp_code[index]}
                maxLength={1}
                containerStyle={styles.inputField}
                style={styles.inputItem}
                editable={false}
                pointerEvents="none"
                showSoftInputOnFocus={false}
              />
            </PressableBox>
          ))}
        </View>

        {!getFieldError('otp_code') ? null : (
          <Typography size="sm" color="red" textAlign="center" style={{ marginTop: 12 }}>
            {error.message}
          </Typography>
        )}

        <View style={{ marginTop: 50, paddingTop: 24 }}>
          <Button
            containerStyle={{ alignSelf: 'center', backgroundColor: '#0d674e' }}
            style={{ width: 320, height: 40 }}
            shadow={3}
            onPress={handleSubmit}
            loading={isSaving}
          >
            <Typography style={{color: '#FFFFFF'}}>SUBMIT</Typography>
          </Button>

          <PressableBox
            containerStyle={{ marginTop: 30, alignSelf: 'center' }}
            opacity
            onPress={handleVerificationResend}
          >
            <Typography heading size="sm" color={!profile ? '#0d674e' : 900} style={{
              textDecorationLine: 'underline',
            }}>
              {`${''}Kirim Ulang Kode OTP`.toUpperCase()}
            </Typography>
          </PressableBox>
        </View>
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

  inputsWrap: {
    maxWidth: 260,
    alignSelf: 'center',
    alignItems: 'center',
  },
  inputs: {
    ...wrapper.row,
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 32,
    marginHorizontal: -6,
  },
  input: {
    position: 'absolute',
    opacity: 0,
  },
  inputWrap: {
    ...wrapper.row,
    paddingHorizontal: 0,
    width: 40,
    zIndex: 10,
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 0,
    borderColor: colors.gray[500]
  },
  inputItem: {
    ...typography.h3,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 0,
    textAlign: 'center',
  },
});

export type { Fields as VerificationFields };

export default Verification;