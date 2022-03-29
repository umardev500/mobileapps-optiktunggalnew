import { useRoute } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, 
         View, ListRenderItemInfo, Image, FlatList, ToastAndroid, Alert } from 'react-native';
import { FigmaIcon } from '../../../assets/icons';
import { getConfig } from '../../../lib/config';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, Header, ImageAuto, Typography, PressableBox, TextField, BottomDrawer } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ContactUsModel, Modelable } from '../../../types/model';
import Carousel from 'react-native-snap-carousel';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import { ErrorState, ValueOf } from '../../../types/utilities';
// import { WebView } from 'react-native-webview';
import MapboxGL from "@react-native-mapbox-gl/maps";

type Fields = {
  search?: string;
};

function OurStore() {
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('ourstore');
  const carouselRef = useRef<any>();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [fields, setFields] = useState({
    search: '',
  });
  const [contactUs, setContactUs] = useState<Modelable<ContactUsModel>>({
    models: [],
    modelsLoaded: false,
  });

  const [coordinates, setCoordinates] = useState([106.82150309838204, -6.19540649567783]);
  const [selected, setSelected] = useState<ContactUsModel>({});

  MapboxGL.setAccessToken(
    "pk.eyJ1Ijoib3B0aWt0dW5nZ2FsIiwiYSI6ImNreWptY2N6ODF1NHkyd3FoZG1taXN5cWgifQ.G06xjHOeLJrk9JiKUQDYCg"
  );

  const [action, setAction] = useState('');

  useEffect(() => {
    retrieveContactUs();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    setContactUs(state => ({ ...state, modelsLoaded: false }));
    await retrieveContactUs();

    setIsLoading(false);
  };

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
        onPress={() => {
          setSelected(item);

          (lat && long) && setCoordinates([lat, long]);

          console.log("LAT LN SLEECT", lat, long);
        }}
      >
        <Image source={{ uri: 'https://optiktunggal.com/img/store_location/'+item.StoreImage }} 
              style={{ width: '20%', height: 70 }} />
        <View style={{ marginLeft: 10, width: '65%' }}>
          <Typography type="h4" style={{ fontSize: 11, }} numberOfLines={2}>
            {item.StoreName} | {item.StoreLocationUnit}
          </Typography>
          <Typography style={{ fontSize: 12, textAlign: 'justify'}} numberOfLines={2}>
            {item.StoreAddress}
          </Typography>
          <Typography style={{ fontSize: 12, textAlign: 'justify'}}>
            Phone : { item.StorePhone }, {item.StoreNotes}
          </Typography>
        </View>
      </PressableBox>
      <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 6, marginHorizontal: 10 }}></View>
      </>
    )
  };

  const renderStoreMap = ({ item, index }: ListRenderItemInfo<ContactUsModel>) => {
    const lat = item.StoreLatitude;
    const long = item.StoreLongitude;
    return (
      <>
        <MapboxGL.MarkerView id={"marker"} coordinate={coordinates}>
          <View>
            <View style={styles.markerContainer}>
              <View style={styles.TypographyContainer}>
                <Typography style={styles.Typography}>
                  {item.StoreName} | {item.StoreLocationUnit}
                </Typography>
              </View>
              <Image
                source={{ uri: 'https://api.surewin.co.id/data/client/logo/20190514142545uljsqb.png' }}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "transparent",
                  resizeMode: "cover",
                }}
              />
            </View>
          </View>
        </MapboxGL.MarkerView>
      </>
    )
  };

  // const renderAnnotations = () => {
  //   return (
  //     <MapboxGL.PointAnnotation
  //       key="pointAnnotation"
  //       id="pointAnnotation"
  //       coordinate={[3.3362400, 6.5790100]}>
  //       <View style={{
  //                 height: 30, 
  //                 width: 30, 
  //                 backgroundColor: '#00cccc', 
  //                 borderRadius: 50, 
  //                 borderColor: '#fff', 
  //                 borderWidth: 3
  //               }} />
  //     </MapboxGL.PointAnnotation>
  //   );
  // }

  return (
    <>
      <View style={[wrapper.row]}>
        <PressableBox
            opacity
            onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.HomeStack'
            })}>
            <Typography color="black" style={{ marginVertical: 15, marginHorizontal: 15 }}>
              <Ionicons name="arrow-back" size={18} /> {`${''}Kembali`}
            </Typography>
        </PressableBox>
      </View>

      <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView style={styles.container}>
            <MapboxGL.UserLocation/>
            <MapboxGL.Light />
            <MapboxGL.Images />
            <MapboxGL.Camera 
              zoomLevel={7} 
              centerCoordinate={coordinates}/>
            {/*{renderAnnotations()}*/}

            {!selected.StoreID ? null : (
              <MapboxGL.MarkerView id={"marker"} coordinate={coordinates}>
                <View>
                  <View style={styles.markerContainer}>
                    <View style={styles.TypographyContainer}>
                      <Typography style={styles.Typography}>
                        {selected.StoreName} | {selected.StoreLocationUnit}

                        {!selected.StoreAddress ? null : (
                          <Typography style={[styles.Typography, { fontWeight: 'normal' }]} numberOfLines={2}>
                            {`\n${selected.StoreAddress}`}
                          </Typography>
                        )}
                      </Typography>
                    </View>
                    <Image
                      source={{ uri: 'https://optiktunggal.com/img/store_location/' + selected.StoreImage }}
                      style={{
                        marginTop: 4,
                        width: 40,
                        height: 40,
                        borderRadius: 40,
                        backgroundColor: "transparent",
                        resizeMode: "cover",
                      }}
                    />
                  </View>
                </View>
              </MapboxGL.MarkerView>
            )}
            <View style={{ marginBottom: 50 }}>
              <FlatList data={contactUs.models} renderItem={renderStore} style={styles.flatList} />
            </View>
          </MapboxGL.MapView>
        </View>
      </View>
      <View>
        <Typography style={{ marginVertical: 16, fontWeight: 'bold', textAlign: 'center' }}>
          {`${''}OUTLET KAMI`}
        </Typography>
      </View>
      <View style={{ marginHorizontal: 8 }}>
        <TextField
          containerStyle={{ ...shadows[3], marginTop: 10 }}
          border={false}
          placeholder={t(`Cari outlet`)}
          onChangeText={(value) => setFields(state => ({ ...state, search: value }))}
          returnKeyType="search"
          onSubmitEditing={handleRefresh}
          right={(
            <Button
              size={24}
              onPress={handleRefresh}
            >
              <Ionicons name="search" size={16} color={colors.gray[900]} />
            </Button>
          )}
        />
      </View>
      <ScrollView style={{ flexBasis: '10%', backgroundColor: '#FEFEFE'}} 
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}>
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
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  promoCard: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FEFEFE',
  },
  flatList: {
      top: 20,
      flex: 1,
  },
  cardLocation: {
    backgroundColor: '#FEFEFE',
    marginHorizontal: 20,
  },
  container: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    width: '50%',
    backgroundColor: "transparent",
    height: 'auto',
  },
  map: {
    flex: 1,
  },
  TypographyContainer: {
    backgroundColor: "white",
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    minHeight: 50
  },
  Typography: {
    paddingHorizontal: 5,
    flexGrow: 1,
    fontSize: 10,
    fontWeight: 'bold'
  },
  icon: {
    paddingTop: 10,
  },
});

export default OurStore;