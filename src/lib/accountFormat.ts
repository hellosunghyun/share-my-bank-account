import type { Bank } from '../data/banks';

type AccountFormatRule = {
  groups: number[];
  regex: RegExp;
};

const accountFormatRules: Record<string, AccountFormatRule[]> = {
  '002': createRules([[3, 4, 4, 3], [3, 8, 3], [3, 2, 6]]),
  '003': createRules([[3, 2, 7], [3, 6, 2, 3], [8, 2], [3, 8]]),
  '004': createRules([[6, 2, 6], [4, 2, 6], [4, 2, 8], [3, 2, 4, 3], [10], [11]]),
  '007': createRules([[4, 4, 4], [3, 2, 8, 1], [3, 2, 5, 1]]),
  '011': createRules([[3, 4, 4, 2], [3, 4, 4, 3], [3, 2, 6], [4, 2, 6], [6, 2, 6]]),
  '012': createRules([[3, 4, 4, 2], [3, 4, 4, 3], [3, 2, 6], [4, 2, 6], [6, 2, 6]]),
  '020': createRules([[4, 3, 6], [3, 6, 2, 3], [3, 2, 6], [3, 2, 7]]),
  '023': createRules([[3, 2, 6], [3, 2, 9]]),
  '027': createRules([[3, 5, 3, 2], [1, 6, 3, 2], [3, 5, 3], [2, 2, 6], [1, 6, 3]]),
  '030': createRules([[4, 4, 4], [3, 2, 8, 1], [3, 2, 5, 1]]),
  '031': createRules([[3, 2, 6, 1], [3, 2, 6, 2], [3, 2, 6], [3, 2, 6, 3], [7], [8], [9], [10], [11]]),
  '032': createRules([[3, 4, 4, 2], [3, 2, 7]]),
  '034': createRules([[4, 3, 6], [3, 3, 6]]),
  '035': createRules([[3, 3, 6], [2, 2, 6]]),
  '037': createRules([[3, 2, 7]]),
  '039': createRules([[3, 2, 7]]),
  '045': createRules([[3, 4, 4, 1], [4, 2, 6, 1], [4, 3, 6, 1]]),
  '048': createRules([[3, 3, 6], [5, 2, 5, 1]]),
  '050': createRules([[3, 2, 2, 7], [3, 2, 2, 4]]),
  '054': createRules([[3, 5, 1, 3]]),
  '060': createRules([[4, 5, 3], [14]]),
  '064': createRules([[5, 2, 6], [3, 2, 7], [3, 2, 6]]),
  '071': createRules([[6, 2, 6], [6, 7], [1, 12], [3, 9]]),
  '081': createRules([[3, 6, 5]]),
  '088': createRules([[3, 3, 6], [3, 3, 8], [3, 2, 6], [3, 2, 8], [3, 3, 8]]),
  '089': createRules([[3, 3, 6], [1, 9], [1, 3, 3, 4], [12, 2]]),
  '090': createRules([[4, 2, 7]]),
  '092': createRules([[4, 4, 4], [4, 4, 4, 2]]),
};

export function formatAccountForBank(account: string, bank?: Bank) {
  const digits = normalizeAccountDigits(account);
  const rules = getAccountFormatRules(bank);

  if (digits === '' || rules.length === 0) {
    return digits;
  }

  const matchingRule = rules.find(rule => rule.regex.test(digits));
  const formattingRule = matchingRule ?? rules[0];

  return applyGroups(digits, formattingRule.groups);
}

export function getAccountWarning(account: string, bank?: Bank) {
  const digits = normalizeAccountDigits(account);
  const rules = getAccountFormatRules(bank);

  if (digits === '' || rules.length === 0 || rules.some(rule => rule.regex.test(digits))) {
    return '';
  }

  const lengths = [...new Set(rules.map(rule => getGroupLength(rule.groups)))].sort((a, b) => a - b);
  const lengthLabel = formatLengthRanges(lengths);

  return `${bank?.name ?? '선택한 은행'} 계좌번호는 보통 ${lengthLabel} 형식입니다.\n그래도 계속 진행할 수 있어요.`;
}

export function normalizeAccountDigits(account: string) {
  return account.replace(/[^\d]/g, '');
}

function createRules(groupsList: number[][]) {
  return groupsList.map(groups => ({
    groups,
    regex: new RegExp(`^\\d{${getGroupLength(groups)}}$`),
  }));
}

function getAccountFormatRules(bank?: Bank) {
  if (bank?.officialCode == null) {
    return [];
  }

  return accountFormatRules[bank.officialCode] ?? [];
}

function getGroupLength(groups: number[]) {
  return groups.reduce((sum, group) => sum + group, 0);
}

function formatLengthRanges(lengths: number[]) {
  const ranges: string[] = [];
  let start = lengths[0];
  let end = lengths[0];

  for (const length of lengths.slice(1)) {
    if (length === end + 1) {
      end = length;
      continue;
    }

    ranges.push(formatLengthRange(start, end));
    start = length;
    end = length;
  }

  ranges.push(formatLengthRange(start, end));

  return ranges.join(', ');
}

function formatLengthRange(start: number, end: number) {
  return start === end ? `${start}자리` : `${start}~${end}자리`;
}

function applyGroups(digits: string, groups: number[]) {
  const parts: string[] = [];
  let offset = 0;

  for (const group of groups) {
    const part = digits.slice(offset, offset + group);

    if (part === '') {
      break;
    }

    parts.push(part);
    offset += group;
  }

  const remaining = digits.slice(offset);

  if (remaining !== '') {
    parts.push(remaining);
  }

  return parts.join('-');
}
