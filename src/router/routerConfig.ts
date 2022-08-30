import { StackNavigationOptions } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { HeaderProps } from "../ui-shared/components/Header";

/**
 * Convert file name to Header Title text
 * 
 * @param {string} fileName File name
 * @returns {NavigationOptions}
 */
export function routeOptions(fileName: string): StackNavigationOptions {
  // Hooks
  const { t: tHome } = useTranslation('home');
  const { t: tNotif } = useTranslation('notification');
  const { t: tContact } = useTranslation('contact');
  const { t: tFav } = useTranslation('favorite');
  const { t: tAcc } = useTranslation('account');
  const { t: tKata } = useTranslation('katalog');
  const { t: tPay } = useTranslation('payment');

  switch (fileName) {
    // Home | Product | Order | Payment
    case 'Cart':
      return { title: tHome('Cart') };
    case 'Search':
      return { headerShown: false };
    case 'SearchNew':
      return { headerShown: false };
    case 'Checkout':
      return { headerShown: false };
    case 'PaymentMethod':
      return { title: [tHome('Payment'), tHome('Payment Method')] as any };
    case 'PaymentMerchant':
      return { headerShown: false };

    // Notifications | Transaction
    case 'Notification':
      return { title: tNotif('Notification') };
    case 'TransactionUsers':
      return { headerShown: false };
    case 'TransactionList':
      return { title: tNotif('Your Transaction') };
    case 'Vto':
        return { title: tNotif('Virtual Try On') };
    case 'TransactionDetail':
      return { title: tNotif('Transaction Details') };
    case 'PromotionList':
      return { title: tNotif('Promotion') };
    case 'PromotionDetail':
      return { title: tNotif(`${''}Promotion Details`) };

    // Contact | About
    case 'Contact':
      return { headerShown: false };
    case 'OurStore':
      return { headerShown: false };
    case 'StoreDetail':
      return { headerShown: false };
    case 'OurContact':
      return { title: `${''}Contact Us` };
    case 'FAQ':
      return { title: `${''}FAQ` };
    case 'Brand':
      return { title: `${''}Brands` };
    case 'ContactLens':
      return { title: `${''}Contact Lens` };
    case 'ContactLensSubCategory':
      return { title: `${''}Contact Lens Sub Category` };
    case 'Lens':
      return { title: `${''}Lens` };
    case 'BannerDetail':
      return { headerShown: false };
    case 'ProductDetail':
      return { headerShown: false };
    case 'ReviewAll':
      return { headerShown: false};
    // Favorites
    case 'Favorite':
      return { title: `${''}Wishlist` };

    case 'News':
      return { title: `${''}News` };

    case 'ArticleDetail':
      return { title: `${''}Article Details` };
      
    // case 'ContactLens':
    //   return { title: `${''}Contact Lens` };

    // case 'WebView':
    //   return { title: `${''}Web View` };      

    // Account | Auth
    case 'WebviewCC':
      return { title: tPay('Otentikasi Pembayaran') };
    case 'Account':
      return { headerShown: false };
    case 'Login':
      return { headerShown: false };
    case 'ForgotPassword':
      return { title: tAcc('Forgot Password') };
    case 'Register':
      return { title: tAcc('Create Akun') };
    case 'SelectUsers':
        return { title: tAcc('Create Akun') };  
    case 'Verification':
      return { headerShown: false };
    case 'PinEdit':
      return { headerShown: false };
    case 'AddressEdit':
      return { headerShown: false };
    case 'AddressList':
      return { headerShown: false };
    case 'PinEdit':
      return {
        title: [tAcc('Enter Password')] as any
      };
    case 'PasswordReset':
      return { title: tAcc(`${''}Account Security`) };
    case 'ReviewList':
      return { title: tAcc(`${''}Reviews`) };
    case 'ProfileEdit':
      return { title: tAcc(`${'Profile'}`) };
    case 'Members':
      return { title: tAcc(`${'Members'}`) };
    case 'Stores':
      return { title: tAcc(`${'Stores'}`) };
    // Company
    case 'Terms':
      return { title: `${''}Terms & Condition` };
    case 'PrivacyPolicy':
      return { title: `${''}Privacy Policy` };
  }

  return { title: '' };
}
