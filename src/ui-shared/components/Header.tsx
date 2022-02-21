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
          style={{marginTop: -20, color: '#FFFFFF'}}
          textAlign="center"
          {...titleProps}
        >{title}</Typography>

        {!subtitle ? null : (
          <Typography size="sm" textAlign="center" style={{ marginTop: 4, color: '#FFFFFF' }}>
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
                containerStyle={{ marginRight: 12, alignSelf: 'flex-start', marginTop: -20 }}
                size={42}
                color="transparent"
                onPress={() => navigation.goBack()}
                {...leftProps}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} {...leftIconProps} />
              </Button>
            )
          )}
          
          {/* Middle Column */}
          {title ? renderTitle() : (
            // Render $children
            children || (
              // Spaces between left & right
              !hideSearch ? (
                <TextField
                  border
                  containerStyle={{ flex: 1, backgroundColor: colors.gray[100], alignSelf: 'center', marginTop: -40 }}
                  style={{
                    paddingTop: Platform.OS === 'ios' ? 4 : 2,
                    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
                    height: 35,
                    fontSize: 11
                  }}
                  placeholder="Cari Produk.."
                  value={search}
                  onChangeText={(value) => setSearch(value)}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  right={(
                    <Ionicons
                      name="search"
                      size={20}
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
    paddingVertical: 15,
    paddingHorizontal: 15,
    position: 'relative',
  },

  headercolor: {
    width: '100%',
    height: 50,
    backgroundColor: "#204c29",
    position: 'absolute',
    resizeMode: 'cover',
  },

  logo: {
    width: 100,
    height: 30,
  }
});

export type { Props as HeaderProps };

export default Header;
