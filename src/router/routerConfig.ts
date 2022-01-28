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

  switch (fileName) {
    // Home | Product | Order | Payment
    case 'Cart':
      return { title: tHome('Cart') };
    case 'Search':
    case 'Checkout':
      return { headerShown: false };
    case 'PaymentMethod':
      return { title: [tHome('Payment'), tHome('Payment Method')] as any };
    case 'PaymentMerchant':
      return { title: tHome('Payment') };

    // Notifications | Transaction
    case 'Notification':
      return { title: tNotif('Notifikasi') };
    case 'TransactionUsers':
      return { title: tNotif('Transaksi Pelanggan') };
    case 'TransactionList':
      return { title: tNotif('Transaksi') };
    case 'TransactionDetail':
      return { title: tNotif('Detail Transaksi') };
    case 'PromotionList':
      return { title: tNotif('Promosi') };
    case 'PromotionDetail':
      return { title: tNotif(`${''}Detail Promosi`) };

    // Contact | About
    case 'Contact':
      return { headerShown: false };
    case 'OurContact':
      return { title: `${''}Kontak Kami` };
    case 'FAQ':
      return { title: `${''}FAQ` };
    case 'Brand':
      return { title: `${''}Brands` };
    case 'ContactLens':
      return { title: `${''}Contact Lens` };
    case 'BannerDetail':
      return { headerShown: false };
    case 'ProductDetail':
      return { headerShown: false };

    // Favorites
    case 'Favorite':
      return { title: `${''}Favorit` };

    case 'Article':
      return { title: `${''}News` };

    case 'ArticleDetail':
      return { title: `${''}Detail Artikel` };
      
    // case 'ContactLens':
    //   return { title: `${''}Contact Lens` };

    // case 'WebView':
    //   return { title: `${''}Web View` };      

    // Account | Auth
    case 'Account':
      return { headerShown: false };
    case 'Login':
      return { title: tAcc('Login') };
    case 'ForgotPassword':
      return { title: tAcc('Lupa Password') };
    case 'Register':
      return {
        title: [tAcc('Buat Akun'), tAcc('')] as any
      };
    case 'Verification':
      return {
        title: tAcc(`${''}Verifikasi Akun`)
      };
    case 'AddressEdit':
      return {
        title: [tAcc('Informasi Alamat'), tAcc('sebagai alamat penerima.')] as any
      };
    case 'AddressList':
      return { headerShown: false };
    case 'PinEdit':
      return {
        title: [tAcc('Masukan Password')] as any
      };
    case 'PasswordReset':
      return { title: tAcc(`${''}Keamanan Akun`) };
    case 'ReviewList':
      return { title: tAcc(`${''}Ulasan`) };
    case 'ProfileEdit':
      return { title: tAcc(`${''}Ubah Profile`) };

    // Company
    case 'Terms':
      return { title: `${''}Syarat & Ketentuan` };
    case 'PrivacyPolicy':
      return { title: `${''}Kebijakan Privasi` };
  }

  return { title: '' };
}
