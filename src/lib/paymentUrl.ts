import { parseBank, type Bank } from '../data/banks';

export type PaymentInfo = {
  bank?: Bank;
  account: string;
  holder: string;
  amount: string;
  memo: string;
  nickname: string;
};

type ShareUrlOptions = {
  cleanUrlAfterRead?: boolean;
};

export function readPaymentInfo(search: string): PaymentInfo {
  const params = new URLSearchParams(search);
  const bankValue = params.get('bank') ?? params.get('bankCode') ?? params.get('b');

  return {
    bank: parseBank(bankValue),
    account: params.get('account') ?? params.get('acct') ?? params.get('a') ?? '',
    holder: params.get('holder') ?? params.get('name') ?? params.get('h') ?? '',
    amount: params.get('amount') ?? params.get('amt') ?? '',
    memo: params.get('memo') ?? params.get('m') ?? '',
    nickname: params.get('nickname') ?? params.get('nick') ?? params.get('n') ?? '',
  };
}

export function isPaymentInfoComplete(info: PaymentInfo) {
  return getBankName(info.bank) !== '' && info.account.trim() !== '' && info.holder.trim() !== '';
}

export function normalizeAccountForCopy(account: string) {
  const digitsOnly = account.replace(/[^\d]/g, '');
  return digitsOnly === '' ? account.trim() : digitsOnly;
}

export function normalizeAmount(amount: string) {
  return amount.replace(/[^\d]/g, '');
}

export function formatAmount(amount: string) {
  const normalized = normalizeAmount(amount);
  return normalized === '' ? '' : `${Number(normalized).toLocaleString('ko-KR')}원`;
}

export function shouldCleanUrlAfterRead(search: string) {
  const params = new URLSearchParams(search);
  const value = params.get('clean') ?? params.get('cleanUrl') ?? params.get('hideUrl');

  return value === '1' || value === 'true';
}

export function shouldAllowPaymentEdit(search: string) {
  const params = new URLSearchParams(search);
  const value = params.get('edit');

  return value === '1' || value === 'true';
}

export function createCleanPageUrl(currentHref: string) {
  const url = new URL(currentHref);
  url.search = '';
  url.hash = '';

  return url.toString();
}

export function createShareUrl(info: PaymentInfo, currentHref: string, options: ShareUrlOptions = {}) {
  const url = new URL(currentHref);
  url.search = '';
  url.hash = '';

  if (info.bank?.officialCode != null) {
    url.searchParams.set('bank', info.bank.officialCode);
  } else if (getBankName(info.bank) !== '') {
    url.searchParams.set('bank', getBankName(info.bank));
  }

  if (info.account.trim() !== '') {
    url.searchParams.set('account', info.account.trim());
  }

  if (info.holder.trim() !== '') {
    url.searchParams.set('holder', info.holder.trim());
  }

  const amount = normalizeAmount(info.amount);

  if (amount !== '') {
    url.searchParams.set('amount', amount);
  }

  if (info.memo.trim() !== '') {
    url.searchParams.set('memo', info.memo.trim());
  }

  if (info.nickname.trim() !== '') {
    url.searchParams.set('nickname', info.nickname.trim());
  }

  if (options.cleanUrlAfterRead === true) {
    url.searchParams.set('clean', '1');
  }

  return url.toString();
}

export function createTossTransferUrl(info: PaymentInfo) {
  const params = new URLSearchParams();
  const amount = normalizeAmount(info.amount);

  if (amount !== '') {
    params.set('amount', amount);
  }

  const bankName = getBankName(info.bank);

  if (bankName !== '') {
    params.set('bank', bankName);
  }

  params.set('accountNo', normalizeAccountForCopy(info.account));
  params.set('origin', 'qr');

  return `supertoss://send?${params.toString()}`;
}

export function getDefaultPaymentInfo(): PaymentInfo {
  return {
    bank: undefined,
    account: '',
    holder: '',
    amount: '',
    memo: '',
    nickname: '',
  };
}

export function getBankName(bank?: Bank) {
  return bank?.name.trim() ?? '';
}
