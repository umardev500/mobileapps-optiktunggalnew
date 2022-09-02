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
      return { title: tHome('Keranjang') };
    case 'Search':
      return { headerShown: false };
    case 'SearchNew':
      return { headerShown: false };
    case 'Checkout':
      return { headerShown: false };
    case 'PaymentMethod':
      return { title: [tHome('Pembayaran'), tHome('Metode Pembayaran')] as any };
    case 'PaymentMerchant':
      return { headerShown: false };

    // Notifications | Transaction
    case 'Notification':
      return { title: tNotif('Notifikasi') };
    case 'TransactionUsers':
      return { headerShown: false };
    case 'TransactionList':
      return { title: tNotif('Transaksi') };
    case 'Vto':
        return { title: tNotif('Virtual Try On') };
    case 'TransactionDetail':
      return { title: tNotif('Detail Transaksi') };
    case 'PromotionList':
      return { title: tNotif('Promosi') };
    case 'PromotionDetail':
      return { title: tNotif(`${''}Detail Promosi`) };

    // Contact | About
    case 'Contact':
      return { headerShown: false };
    case 'OurStore':
      return { headerShown: false };
    case 'StoreDetail':
      return { headerShown: false };
    case 'OurContact':
      return { title: `${''}Hubungi Kami` };
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
      return { title: `${''}Detail Artikel` };
      
    // case 'ContactLens':
    //   return { title: `${''}Contact Lens` };

    // case 'WebView':
    //   return { title: `${''}Web View` };      

    // Account | Auth
    case 'WebviewCC':
      return { title: tPay('Authentikasi Pembayaran') };
    case 'Account':
      return { headerShown: false };
    case 'Login':
      return { headerShown: false };
    case 'ForgotPassword':
      return { title: tAcc('Lupa Password') };
    case 'Register':
      return { title: tAcc('Buat Akun') };
    case 'SelectUsers':
        return { title: tAcc('Buat Akun') };  
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
        title: [tAcc('Masukan Password')] as any
      };
    case 'PasswordReset':
      return { title: tAcc(`${''}Keamanan akun`) };
    case 'ReviewList':
      return { title: tAcc(`${''}Nilai kami`) };
    case 'ProfileEdit':
      return { title: tAcc(`${'Profile'}`) };
    case 'Members':
      return { title: tAcc(`${'Members'}`) };
    case 'Stores':
      return { title: tAcc(`${'Stores'}`) };
    // Company
    case 'Terms':
      return { title: `${''}Syarat & Ketentuan` };
    case 'PrivacyPolicy':
      return { title: `${''}Kebijakan Privasi` };
  }

  return { title: '' };
}
