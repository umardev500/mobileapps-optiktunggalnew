import React, { useState } from 'react';
import { BottomDrawer, BottomDrawerProps, Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../ui-shared/components';
import { default as POPUPS } from '../../assets/popup';
import { Image, Linking, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PopupModel } from '../../types/model';

type Props = BottomDrawerProps & {
  promotions: PopupModel[];
  onComplete?: () => void;
};

function PopupPromoModal({
  promotions,
  onComplete,
  style,
  ...props
}: Props) {
  // Hooks
  const { width, height } = useWindowDimensions();

  // States
  const [step, setStep] = useState<number>(0);

  // Vars
  // promotions = POPUPS;

  const handlePromoNext = () => {
    const nextStep = step + 1;

    if (nextStep >= promotions.length) {
      setTimeout(() => {
        setStep(0);
      }, 1000);

      'function' === typeof onComplete && onComplete();

      return void(0);
    }

    setStep(nextStep);
  };

  const promoBgHeight = height * 0.7;

  return (
    <BottomDrawer
      style={[{
        height,
        backgroundColor: '#ffffff00',
      }, style]}
      {...props}
    >
      {promotions.map((item, index) => {
        return (
          <PressableBox
            containerStyle={styles.promoContainer}
            style={styles.promo}
            opacity={1}
          >
            

            <View style={[styles.promoContent, { minHeight: promoBgHeight - 30 }]}>
              {!item.image ? null : (
                <View style={styles.promoImageContainer}>
                  <ImageAuto
                    source={'string' === typeof item.image ?  { uri: item.image } : item.image}
                    width={width - 60}
                    height={height/2}
                    style={styles.promoImage}
                  />
                  <Button
                    containerStyle={styles.promoClose}
                    size={22}
                    onPress={handlePromoNext}
                  >
                    <Ionicons name="close" size={15} color={'#5e5c5c'} />
                  </Button>
                </View>
              )}

              <View style={{ marginTop: 'auto' }}>
                {!item.title ? null : (
                  <Typography type="h5" color="primary" textAlign="center">
                    {item.title}
                  </Typography>
                )}

                {!item.subtitle ? null : (
                  <Typography heading textAlign="center" style={{ marginTop: 4 }}>
                    {item.subtitle}
                  </Typography>
                )}

                {!item.caption ? null : (
                  <Typography textAlign="center" style={{ marginTop: 4 }}>
                    {item.caption}
                  </Typography>
                )}

                {/*!item.html ? null : (
                  <View style={{ marginTop: 4 }}>
                    <RenderHtml contentWidth={width - 60} source={{ html: item.html }} />
                  </View>
                )*/}
              </View>
            </View>
          </PressableBox>
        );
      })}
    </BottomDrawer>
  );
};

const styles = StyleSheet.create({
  promoClose: {
    position: 'absolute',
    right: -13,
    flex: 1,
    top: Platform.OS === 'ios' ? 40 : 70,
    backgroundColor: '#FEFEFE',
    borderRadius: 20,
    borderColor: '#5e5c5c',
    borderWidth: 1,
    ...shadows[3]
  },

  promoMaster: {
    marginTop: -24,
    flexGrow: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoContainer: {
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 100,
    overflow: 'visible',
    justifyContent: 'center',
    position: 'relative',
  },
  promoBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promo: {
    position: 'relative',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  promoCard: {
    ...shadows[3],
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    backgroundColor: '#ffffff00',
    borderRadius: 15,
  },

  promoContent: {
    elevation: 4,
    position: 'relative',
  },
  promoImageContainer: {
    
  },
  promoImage: {
    resizeMode: 'contain',
    marginLeft: -5,
    marginTop: 50,
  }
});

export default PopupPromoModal;
