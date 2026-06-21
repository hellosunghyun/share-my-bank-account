export type Bank = {
  name: string;
  officialCode?: string;
  code?: string;
  koreanCode?: string;
  englishCode?: string;
  logoFile?: string;
  custom?: boolean;
};

const bankSymbolBase = `${import.meta.env.BASE_URL}bank-symbols/`;

export const banks: Bank[] = [
  {
    name: '경남은행',
    officialCode: '039',
    code: '39',
    koreanCode: '경남',
    englishCode: 'KYONGNAMBANK',
    logoFile: 'gyeongnam.svg',
  },
  {
    name: '광주은행',
    officialCode: '034',
    code: '34',
    koreanCode: '광주',
    englishCode: 'GWANGJUBANK',
    logoFile: 'gwangju.svg',
  },
  {
    name: '단위농협(지역농축협)',
    officialCode: '012',
    code: '12',
    koreanCode: '단위농협',
    englishCode: 'LOCALNONGHYEOP',
  },
  {
    name: '부산은행',
    officialCode: '032',
    code: '32',
    koreanCode: '부산',
    englishCode: 'BUSANBANK',
    logoFile: 'busan.svg',
  },
  {
    name: '새마을금고',
    officialCode: '045',
    code: '45',
    koreanCode: '새마을',
    englishCode: 'SAEMAUL',
    logoFile: 'saemaul.svg',
  },
  {
    name: '산림조합',
    officialCode: '064',
    code: '64',
    koreanCode: '산림',
    englishCode: 'SANLIM',
    logoFile: 'sanlim.svg',
  },
  {
    name: '신한은행',
    officialCode: '088',
    code: '88',
    koreanCode: '신한',
    englishCode: 'SHINHAN',
    logoFile: 'shinhan.svg',
  },
  {
    name: '신협',
    officialCode: '048',
    code: '48',
    koreanCode: '신협',
    englishCode: 'SHINHYEOP',
    logoFile: 'shinhyeop.svg',
  },
  {
    name: '씨티은행',
    officialCode: '027',
    code: '27',
    koreanCode: '씨티',
    englishCode: 'CITI',
    logoFile: 'citi.svg',
  },
  {
    name: '우리은행',
    officialCode: '020',
    code: '20',
    koreanCode: '우리',
    englishCode: 'WOORI',
    logoFile: 'woori.svg',
  },
  {
    name: '우체국예금보험',
    officialCode: '071',
    code: '71',
    koreanCode: '우체국',
    englishCode: 'POST',
    logoFile: 'post.svg',
  },
  {
    name: '저축은행중앙회',
    officialCode: '050',
    code: '50',
    koreanCode: '저축',
    englishCode: 'SAVINGBANK',
    logoFile: 'saving.svg',
  },
  {
    name: '전북은행',
    officialCode: '037',
    code: '37',
    koreanCode: '전북',
    englishCode: 'JEONBUKBANK',
    logoFile: 'jeonbuk.svg',
  },
  {
    name: '제주은행',
    officialCode: '035',
    code: '35',
    koreanCode: '제주',
    englishCode: 'JEJUBANK',
    logoFile: 'jeju.svg',
  },
  {
    name: '카카오뱅크',
    officialCode: '090',
    code: '90',
    koreanCode: '카카오',
    englishCode: 'KAKAOBANK',
    logoFile: 'kakao.svg',
  },
  {
    name: '케이뱅크',
    officialCode: '089',
    code: '89',
    koreanCode: '케이',
    englishCode: 'KBANK',
    logoFile: 'kbank.svg',
  },
  {
    name: '토스뱅크',
    officialCode: '092',
    code: '92',
    koreanCode: '토스',
    englishCode: 'TOSSBANK',
    logoFile: 'toss.svg',
  },
  {
    name: '하나은행',
    officialCode: '081',
    code: '81',
    koreanCode: '하나',
    englishCode: 'HANA',
    logoFile: 'hana.svg',
  },
  {
    name: '홍콩상하이은행',
    officialCode: '054',
    code: '54',
    englishCode: 'HSBC',
  },
  {
    name: 'Bank of America',
    officialCode: '060',
    code: '60',
    englishCode: 'BOA',
  },
  {
    name: 'IBK기업은행',
    officialCode: '003',
    code: '03',
    koreanCode: '기업',
    englishCode: 'IBK',
    logoFile: 'ibk.svg',
  },
  {
    name: 'KB국민은행',
    officialCode: '004',
    code: '06',
    koreanCode: '국민',
    englishCode: 'KOOKMIN',
    logoFile: 'kb.svg',
  },
  {
    name: 'iM뱅크(대구)',
    officialCode: '031',
    code: '31',
    koreanCode: '대구',
    englishCode: 'DAEGUBANK',
    logoFile: 'daegu.svg',
  },
  {
    name: '한국산업은행',
    officialCode: '002',
    code: '02',
    koreanCode: '산업',
    englishCode: 'KDBBANK',
    logoFile: 'kdb.svg',
  },
  {
    name: 'NH농협은행',
    officialCode: '011',
    code: '11',
    koreanCode: '농협',
    englishCode: 'NONGHYEOP',
    logoFile: 'nh.svg',
  },
  {
    name: 'SC제일은행',
    officialCode: '023',
    code: '23',
    koreanCode: 'SC제일',
    englishCode: 'SC',
    logoFile: 'sc.svg',
  },
  {
    name: 'Sh수협은행',
    officialCode: '007',
    code: '07',
    koreanCode: '수협',
    englishCode: 'SUHYEOP',
    logoFile: 'suhyup.svg',
  },
  {
    name: '수협중앙회',
    officialCode: '030',
    code: '30',
    koreanCode: '수협중앙회',
    englishCode: 'SUHYEOPLOCALBANK',
  },
];

const bankOptionOrder = [
  '011',
  '090',
  '004',
  '092',
  '088',
  '020',
  '003',
  '081',
  '045',
  '032',
  '031',
  '089',
  '048',
  '071',
  '023',
  '039',
  '034',
  '007',
  '037',
  '050',
  '035',
  '027',
  '002',
  '064',
  '060',
  '054',
];

const bankOptionRank = new Map(bankOptionOrder.map((officialCode, index) => [officialCode, index]));

export const bankOptions = banks.filter(bank => bank.logoFile != null).sort((a, b) => {
  const aRank = a.officialCode == null ? Number.MAX_SAFE_INTEGER : bankOptionRank.get(a.officialCode) ?? Number.MAX_SAFE_INTEGER;
  const bRank = b.officialCode == null ? Number.MAX_SAFE_INTEGER : bankOptionRank.get(b.officialCode) ?? Number.MAX_SAFE_INTEGER;

  return aRank - bRank || (a.officialCode ?? a.name).localeCompare(b.officialCode ?? b.name);
});

export function getBankLogoSrc(bank: Bank) {
  return bank.logoFile == null ? undefined : `${bankSymbolBase}${bank.logoFile}`;
}

export function createCustomBank(name: string): Bank {
  return {
    name,
    custom: true,
  };
}

export function isCustomBank(bank?: Bank): bank is Bank & { custom: true } {
  return bank?.custom === true;
}

export function parseBank(value: string | null) {
  const bank = findBank(value);
  const trimmed = value?.trim() ?? '';

  if (bank != null || trimmed === '') {
    return bank;
  }

  return createCustomBank(trimmed);
}

export function findBank(value: string | null) {
  if (value == null) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();

  return banks.find(bank => {
    const candidates = [
      bank.officialCode,
      bank.code,
      bank.name,
      bank.koreanCode,
      bank.englishCode,
    ].filter((candidate): candidate is string => candidate != null);

    return candidates.some(candidate => candidate.toUpperCase() === normalized);
  });
}
