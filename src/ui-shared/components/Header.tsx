import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View, ViewProps } from 'react-native';
import Typography, { TypographyProps } from './Typography';
import TextField from './TextField';
import Button, { ButtonProps } from './Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IconProps } from 'react-native-vector-icons/Icon';
import { colors, wrapper } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { TextFieldProps } from '.';

type Props = ViewProps & {
  title?: string | string[] | React.ReactNode[];
  titleProps?: TypographyProps;
  hideLogo?: boolean;
  hideBg?: boolean;

  search?: string;
  searchProps?: TextFieldProps;
  hideSearch?: boolean;

  left?: boolean | React.ReactNode; // If true show Back button
  leftProps?: ButtonProps;
  leftIconProps?: Partial<IconProps>;

  right?: boolean | React.ReactNode; // If true show Back button
  rightProps?: ButtonProps;
  rightIconProps?: Partial<IconProps>;
};

function Header({
  style,
  title: titles = [],
  titleProps = {},
  hideLogo = false,
  hideBg = false,
  search: searchValue = '',
  searchProps,
  hideSearch = false,
  left = true,
  leftProps = {},
  leftIconProps = {},
  right = false,
  rightProps = {},
  rightIconProps = {},
  children,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();

  // State
  const [search, setSearch] = useState(searchValue);

  // Effects
  useEffect(() => {
    setSearch(searchValue);
  }, [searchValue]);

  // Vars
  const renderTitle = () => {
    return 'string' === typeof title ? (
      <View style={{ flex: 1, alignSelf: 'center', alignItems: 'center' }}>
        <Typography
<<<<<<< HEAD
          type="h4"
          color={900}
=======
          style={{marginTop: -20, color: '#FFFFFF'}}
>>>>>>> origin/Develop
          textAlign="center"
          {...titleProps}
        >{title}</Typography>

        {!subtitle ? null : (
<<<<<<< HEAD
          <Typography size="sm" textAlign="center" style={{ marginTop: 4 }}>
=======
          <Typography size="sm" textAlign="center" style={{ marginTop: 4, color: '#FFFFFF' }}>
>>>>>>> origin/Develop
            {subtitle}
          </Typography>
        )}
      </View>
    ) : title;
  };

  const handleSearch = () => {
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Search',
      params: [null, null, {
        search,
      }]
    });
  };

  const [title, subtitle] = 'string' === typeof titles ? [titles] : [...titles];

  return (
    <View style={[styles.headercolor, {position: 'relative'}]}>
      {/* {hideBg ? null : (
        <Image source={require('../../assets/images/header-bg.png')} style={styles.headerBg} />
      )} */}
      

      {/* <View style={styles.headercolor}></View> */}
      
      <View style={[styles.container, style]} {...props}>
<<<<<<< HEAD

=======
>>>>>>> origin/Develop
        <View style={[wrapper.row, {
          marginTop: !title && !children && !hideSearch ? 8 : 0,
          minHeight: !hideSearch ? 42 : 0,
        }]}>
          {/* Left Column */}
          {'boolean' !== typeof left ? (
            'function' === typeof left ? left() : left
          ) : (
            (!left || !navigation.canGoBack()) ? null : (
              <Button
<<<<<<< HEAD
                containerStyle={{ marginRight: 12, alignSelf: 'flex-start' }}
=======
                containerStyle={{ marginRight: 12, alignSelf: 'flex-start', marginTop: -10 }}
>>>>>>> origin/Develop
                size={42}
                color="transparent"
                onPress={() => navigation.goBack()}
                {...leftProps}
              >
<<<<<<< HEAD
                <Ionicons name="arrow-back" size={24} color={colors.gray[900]} {...leftIconProps} />
              </Button>
            )
          )}

=======
                <Ionicons name="arrow-back" size={24} color={colors.white} {...leftIconProps} />
              </Button>
            )
          )}
          
>>>>>>> origin/Develop
          {/* Middle Column */}
          {title ? renderTitle() : (
            // Render $children
            children || (
              // Spaces between left & right
              !hideSearch ? (
                <TextField
                  border
<<<<<<< HEAD
                  containerStyle={{ flex: 1, backgroundColor: colors.gray[100], alignSelf: 'center', }}
                  style={{
                    paddingTop: Platform.OS === 'ios' ? 4 : 2,
                    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
                    height: 40,
                  }}
                  placeholder="Search Product.."
=======
                  containerStyle={{ flex: 1, backgroundColor: colors.gray[100], alignSelf: 'center', marginTop: -40 }}
                  style={{
                    paddingTop: Platform.OS === 'ios' ? 4 : 2,
                    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
                    height: 35,
                    fontSize: 11
                  }}
                  placeholder="Cari Produk.."
>>>>>>> origin/Develop
                  value={search}
                  onChangeText={(value) => setSearch(value)}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
<<<<<<< HEAD
                  left={(
                    <Ionicons
                      name="search"
                      size={25}
=======
                  right={(
                    <Ionicons
                      name="search"
                      size={20}
>>>>>>> origin/Develop
                      color={colors.gray[500]}
                      style={{ paddingHorizontal: 3, }}
                    />
                  )}
                  {...searchProps}
                />
              ) : (
                !right ? null : (
                  <View style={{ flex: 1 }} />
                )
              )
            )
          )}

          {/* Right Column */}
          {'boolean' !== typeof right ? (
            'function' === typeof right ? right() : right
          ) : (
            !right ? (
              title && left ? (
                <View style={{ width: 42, marginLeft: 12 }} />
              ) : null
            ) : (
              <Button
                border
                containerStyle={{ marginRight: 12, alignSelf: 'flex-start' }}
                size={40}
                color="transparent"
                onPress={() => navigation.goBack()}
                {...rightProps}
              >
                <Ionicons name="cart-outline" size={18} color={colors.gray[900]} {...rightIconProps} />
              </Button>
            )
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    paddingVertical: 5,
    paddingHorizontal: 5,
=======
    paddingVertical: 15,
    paddingHorizontal: 15,
>>>>>>> origin/Develop
    position: 'relative',
  },

  headercolor: {
    width: '100%',
<<<<<<< HEAD
    height: 65,
    backgroundColor: "#FEFEFE",
=======
    height: 50,
    backgroundColor: "#204c29",
>>>>>>> origin/Develop
    position: 'absolute',
    resizeMode: 'cover',
  },

  logo: {
    width: 100,
    height: 30,
<<<<<<< HEAD
    alignSelf: 'center',
=======
>>>>>>> origin/Develop
  }
});

export type { Props as HeaderProps };

export default Header;
