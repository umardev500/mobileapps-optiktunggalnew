import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import validator from 'validator';
import DocumentPicker from 'react-native-document-picker';
import { useTranslation } from 'react-i18next';
import { httpService, showPhone } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker';
import imageManager, { ImageManagerParams } from '../../../lib/utilities/imageManager';

type Fields = {
  namadepan?: string;
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
};

function ProfileEdit() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { user: { user, location } } = useAppSelector(state => state);
  const { width } = useWindowDimensions();
  const { t } = useTranslation('account');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<Fields>({
    namadepan: '',
    namabelakang: '',
    hp: '',
    email: '',
    ktp: '',
    namaktp: '',
    foto: '',
    namafoto: '',
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  // Effects
  useEffect(() => {
    if (user) {
      const [namadepan, namabelakang] = user.nama?.split(' ') || '';

      setFields(state => ({
        ...state,
        namadepan: user.namadepan || namadepan,
        namabelakang: user.namabelakang || namabelakang,
        hp: showPhone(String(user.hp), ''), // Remove leading 62
        email: user.email,
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
    if (!fields.namadepan || !fields.namabelakang) {
      return handleErrorShow('namadepan', t('Mohon masukkan nama Anda secara lengkap.'));
    } else if (!fields.hp) {
      return handleErrorShow('hp', t('Mohon masukkan nomor telepon Anda.'));
    } else if (!fields.email) {
      return handleErrorShow('email', t('Mohon masukkan alamat email Anda.'));
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', t('Mohon masukkan alamat email yang valid.'));
    } else if (!fields.foto) {
      // return handleErrorShow('namafoto', t('Mohon pilih file untuk foto profil Anda.'));
    } else if (!fields.ktp) {
      // return handleErrorShow('namaktp', t('Mohon pilih file foto KTP/NPWP Anda.'));
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

        Alert.alert( "Berhasil", "Profil berhasil diubah",
          [
            { text: "OKE", onPress: () => navigation.navigatePath('Public', { screen: 'BottomTabs.AccountStack.Account'}) }
          ]
        );
      } else if ('string' === typeof msg) {
        switch (msg.toLowerCase()) {
          case 'hp sudah terdaftar':
            handleErrorShow('response', t(`Nomor HP sudah terdaftar.`));
            break;
          case 'email sudah terdaftar':
            handleErrorShow('response', t(`Email sudah terdaftar.`));
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={t('Nama Depan')}
        value={fields.namadepan}
        onChangeText={(value) => handleFieldChange('namadepan', value)}
        error={!!getFieldError('namadepan')}
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

      <View style={[wrapper.row, { marginTop: 12, alignItems: 'center' }]}>
        {!fields.foto ? (
          !user?.foto ? (
            <View style={[styles.image, { backgroundColor: colors.gray[200] }]} />
          ) : (
            <Image source={{ uri: user.foto }} style={styles.image} />
          )
        ) : (
          <Image source={{ uri: fields.foto }} style={styles.image} />
        )}

        <PressableBox
          containerStyle={{ overflow: 'visible', flex: 1 }}
          opacity={1}
          onPress={() => handleFileOpen('namafoto')}
        >
          <TextField
            placeholder={t('Upload Foto')}
            value={fields.fotoLocalName}
            editable={false}
            pointerEvents="none"
            error={!!getFieldError('namafoto')}
            message={error.message}
            right={(
              <Button
                size={32}
                onPress={() => handleCameraOpen('namafoto')}
              >
                <Ionicons name="camera-outline" size={24} color={colors.gray[700]} />
              </Button>
            )}
          />

          <Typography size="sm" color={600} style={{ marginTop: 2 }}>
            {t(`Biarkan kosong jika tidak merubah foto.`)}
          </Typography>
        </PressableBox>
      </View>

      <View style={{ marginTop: 20, paddingTop: 24 }}>
        <Button
          containerStyle={{
            alignSelf: 'center',
            ...shadows[3]
          }}
          style={{ width: 300 }}
          label={t(`Simpan`).toUpperCase()}
          color="primary"
          shadow={3}
          onPress={handleSubmit}
          loading={isSaving}
        />
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

  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  }
});

export type { Fields as ProfileEditFields };

export default ProfileEdit;
