import { colors } from "../styles";
import { TransactionPaymentStatus, TransactionStatus } from '../../types/model';

export const getStatusText = (status?: TransactionStatus): string => {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'accept':
      return 'Diterima';
    case 'paid':
    case 'confirm':
    case 'bukti bayar':
      return 'Sudah Dibayar';
    case 'unpaid':
    case 'open':
      return 'Belum Dibayar';
    case 'progress':
      return 'Diproses';
    case 'finish':
    case 'diterima':
      return 'Selesai';
    case 'cancel':
    case 'batal':
      return 'Dibatalkan';
    case 'do':
      return 'Sedang Dikirim';
    case 'revisi':
      return 'Revisi';
    case 'invoice':
      return 'Invoice';
  }

  return '';
};

export const getStatusColor = (status?: TransactionStatus): string => {
  switch (status) {
    case 'pending':
      return colors.palettes.blue;
    case 'accept':
      return colors.palettes.primary;
    case 'paid':
    case 'confirm':
    case 'bukti bayar':
      return colors.palettes.green;
    case 'unpaid':
    case 'open':
      return colors.gray[900];
    case 'progress':
      return colors.palettes.orange;
    case 'finish':
    case 'diterima':
      return colors.palettes.green;
    case 'cancel':
    case 'batal':
      return colors.palettes.red;
    case 'do':
    case 'revisi':
    case 'invoice':
      return colors.palettes.blue;
  }

  return colors.gray[900];
};

export const getPaymentStatusText = (status?: TransactionPaymentStatus): string => {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'unpaid':
      return 'Belum Dibayar';
    case 'paid':
      return 'Sudah Dibayar';
    case 'reject':
      return 'Pembayaran Ditolak';
  }

  return '';
};

export const showPhone = (phone?: string, leading: string = '0') => {
  let result = phone;

  if (!phone) {
    return '';
  } else if (phone.substring(0, 1) === '0') {
    result = phone.substring(1);
  } else if (phone.substring(0, 2) === '62') {
    result = phone.substring(2);
  } else if (phone.substring(0, 3) === '+62') {
    result = phone.substring(3);
  }

  return leading + result;
};
