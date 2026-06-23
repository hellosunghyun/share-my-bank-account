import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckIcon, ChevronRightIcon, CopyIcon, PencilIcon, PlusIcon, QrCodeIcon, SendIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { bankOptions, createCustomBank, getBankLogoSrc, isCustomBank, type Bank } from './data/banks';
import { formatAccountForBank, getAccountWarning } from './lib/accountFormat';
import {
  createCleanPageUrl,
  createShareUrl,
  createTossTransferUrl,
  formatAmount,
  getBankName,
  getDefaultPaymentInfo,
  isPaymentInfoComplete,
  normalizeAccountForCopy,
  normalizeAmount,
  readPaymentInfo,
  shouldAllowPaymentEdit,
  shouldCleanUrlAfterRead,
  type PaymentInfo,
} from './lib/paymentUrl';
import './styles.css';

type ToastState = {
  open: boolean;
  text: string;
};

type ScreenMode = 'pay' | 'builder';
type QrTarget = 'share' | 'toss';
type BuilderIntent = 'create' | 'edit';

const initialInfo = readPaymentInfo(window.location.search);
const initialComplete = isPaymentInfoComplete(initialInfo);
const defaultPaymentInfo = getDefaultPaymentInfo();
const shouldCleanInitialUrl = initialComplete && shouldCleanUrlAfterRead(window.location.search);
const initialCanEditPaymentInfo = !initialComplete || shouldAllowPaymentEdit(window.location.search);
const initialFormInfo = initialComplete
  ? {
      ...initialInfo,
      account: formatAccountForBank(initialInfo.account, initialInfo.bank),
    }
  : {
      ...defaultPaymentInfo,
      ...initialInfo,
      bank: initialInfo.bank ?? defaultPaymentInfo.bank,
      account: formatAccountForBank(initialInfo.account, initialInfo.bank ?? defaultPaymentInfo.bank),
    };

if (shouldCleanInitialUrl) {
  window.history.replaceState(null, '', createCleanPageUrl(window.location.href));
}

function App() {
  const [mode, setMode] = useState<ScreenMode>(initialComplete ? 'pay' : 'builder');
  const [form, setForm] = useState<PaymentInfo>(initialFormInfo);
  const [toast, setToast] = useState<ToastState>({ open: false, text: '' });
  const [qrOpen, setQrOpen] = useState(false);
  const [qrTarget, setQrTarget] = useState<QrTarget>('share');
  const [cleanQrUrlAfterRead, setCleanQrUrlAfterRead] = useState(false);
  const [bankSheetOpen, setBankSheetOpen] = useState(false);
  const [canEditPaymentInfo, setCanEditPaymentInfo] = useState(initialCanEditPaymentInfo);
  const [builderIntent, setBuilderIntent] = useState<BuilderIntent>('create');

  const shareUrl = useMemo(() => createShareUrl(form, window.location.href), [form]);
  const cleanShareUrl = useMemo(() => createShareUrl(form, window.location.href, { cleanUrlAfterRead: true }), [form]);
  const complete = isPaymentInfoComplete(form);
  const tossTransferUrl = useMemo(() => createTossTransferUrl(form), [form]);

  useEffect(() => {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = () => {
      document.documentElement.classList.toggle('light', !colorSchemeQuery.matches);
      document.documentElement.classList.toggle('dark', colorSchemeQuery.matches);
      document.documentElement.style.colorScheme = colorSchemeQuery.matches ? 'dark' : 'light';
    };

    applySystemTheme();
    colorSchemeQuery.addEventListener('change', applySystemTheme);

    return () => colorSchemeQuery.removeEventListener('change', applySystemTheme);
  }, []);

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      fallbackCopy(text);
      showToast(message);
    }
  }

  function showToast(text: string) {
    setToast({ open: true, text });
    window.setTimeout(() => setToast(current => ({ ...current, open: false })), 2200);
  }

  function updateForm(next: Partial<PaymentInfo>) {
    setForm(current => ({ ...current, ...next }));
  }

  function openPayScreen() {
    if (!complete) {
      showToast('은행, 계좌번호, 예금주를 입력해주세요');
      return;
    }

    window.history.replaceState(null, '', shareUrl);
    setCanEditPaymentInfo(true);
    setMode('pay');
  }

  function createOwnPaymentInfo() {
    setForm(getDefaultPaymentInfo());
    setCanEditPaymentInfo(true);
    setQrOpen(false);
    setBankSheetOpen(false);
    setBuilderIntent('create');
    window.history.replaceState(null, '', createCleanPageUrl(window.location.href));
    setMode('builder');
  }

  return (
    <main className="flex min-h-dvh justify-center bg-background text-foreground">
      <section
        className="app-safe-surface flex min-h-dvh w-full max-w-[440px] flex-col bg-card px-5 shadow-[0_18px_60px_rgb(15_23_42/0.12)] sm:ring-x sm:ring-border"
        aria-label="계좌번호 복사 도구"
      >
        {mode === 'pay' && complete ? (
          <PaymentCard
            info={form}
            canEdit={canEditPaymentInfo}
            tossTransferUrl={tossTransferUrl}
            onEdit={() => {
              setBuilderIntent('edit');
              setMode('builder');
            }}
            onCreateOwn={createOwnPaymentInfo}
            onCopySummary={() => copy(createTransferText(form), '송금 정보가 복사됐습니다')}
            onOpenQr={() => {
              setQrTarget('share');
              setQrOpen(true);
            }}
          />
        ) : (
          <>
            <BuilderCard
              info={form}
              title={builderIntent === 'edit' ? '계좌 정보 수정' : '내 송금정보 입력'}
              complete={complete}
              onChange={updateForm}
              onOpenBankSheet={() => setBankSheetOpen(true)}
              onOpenPay={openPayScreen}
            />
            <div className="builder-bottom-blur" aria-hidden="true" />
          </>
        )}
      </section>

      <BankSelectSheet
        open={bankSheetOpen}
        selectedBank={form.bank}
        onOpenChange={setBankSheetOpen}
        onSelect={bank => {
          updateForm({ bank, account: formatAccountForBank(form.account, bank) });
          setBankSheetOpen(false);
        }}
        onSelectCustom={() => {
          updateForm({
            bank: createCustomBank(isCustomBank(form.bank) ? form.bank.name : ''),
            account: formatAccountForBank(form.account),
          });
          setBankSheetOpen(false);
        }}
      />
      <QrBottomSheet
        open={qrOpen}
        info={form}
        shareUrl={shareUrl}
        cleanShareUrl={cleanShareUrl}
        tossTransferUrl={tossTransferUrl}
        qrTarget={qrTarget}
        onChangeQrTarget={setQrTarget}
        cleanQrUrlAfterRead={cleanQrUrlAfterRead}
        onChangeCleanQrUrlAfterRead={setCleanQrUrlAfterRead}
        onOpenChange={setQrOpen}
        onCopyUrl={(url, message) => copy(url, message)}
      />
      <ToastMessage open={toast.open} text={toast.text} />
    </main>
  );
}

function PaymentCard({
  info,
  canEdit,
  tossTransferUrl,
  onEdit,
  onCreateOwn,
  onCopySummary,
  onOpenQr,
}: {
  info: PaymentInfo;
  canEdit: boolean;
  tossTransferUrl: string;
  onEdit: () => void;
  onCreateOwn: () => void;
  onCopySummary: () => void;
  onOpenQr: () => void;
}) {
  const amountLabel = formatAmount(info.amount);
  const nickname = info.nickname.trim();
  const memo = info.memo.trim();
  const hasDetail = amountLabel !== '' || memo !== '' || nickname !== '';

  return (
    <Card className="mt-0 flex-1 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-start justify-between gap-3">
          <BankHeader bank={info.bank} />
          {canEdit ? (
            <Button className="shrink-0" variant="ghost" size="sm" type="button" onClick={onEdit}>
              <PencilIcon data-icon="inline-start" />
              수정
            </Button>
          ) : (
            <Button className="shrink-0" variant="ghost" size="sm" type="button" onClick={onCreateOwn}>
              <PlusIcon data-icon="inline-start" />
              내 송금정보
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6 px-0">
        <section className="flex min-h-44 flex-col justify-center gap-3">
          <p className="text-sm font-semibold text-muted-foreground">입금 계좌</p>
          <strong className="break-words text-3xl leading-tight font-extrabold tabular-nums text-foreground">
            {info.account}
          </strong>
          <span className="text-base font-semibold text-muted-foreground">예금주 {info.holder}</span>
        </section>

        {hasDetail ? (
          <dl className="flex flex-col gap-3">
            {amountLabel !== '' ? <SummaryRow label="금액" value={amountLabel} /> : null}
            {memo !== '' ? <SummaryRow label="메모" value={memo} /> : null}
            {nickname !== '' ? <SummaryRow label="닉네임" value={nickname} /> : null}
          </dl>
        ) : null}

        <div className="mt-auto flex flex-col gap-3">
          <Button className="h-14 w-full text-base font-bold" type="button" onClick={onCopySummary}>
            <CopyIcon data-icon="inline-start" />
            송금정보 복사
          </Button>
          <Button asChild className="h-14 w-full text-base font-bold">
            <a href={tossTransferUrl}>
              <SendIcon data-icon="inline-start" />
              토스로 송금하기
            </a>
          </Button>
          <Button className="h-13 w-full text-base font-bold" variant="secondary" type="button" onClick={onOpenQr}>
            <QrCodeIcon data-icon="inline-start" />
            QR로 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BuilderCard({
  info,
  title,
  complete,
  onChange,
  onOpenBankSheet,
  onOpenPay,
}: {
  info: PaymentInfo;
  title: string;
  complete: boolean;
  onChange: (next: Partial<PaymentInfo>) => void;
  onOpenBankSheet: () => void;
  onOpenPay: () => void;
}) {
  const accountWarning = getAccountWarning(info.account, info.bank);
  const bankName = getBankName(info.bank);

  return (
    <Card className="mt-0 flex-1 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-3xl font-extrabold tracking-normal">{title}</CardTitle>
        <CardDescription>입력한 정보는 저장하지 않고 URL 파라미터에만 담깁니다.</CardDescription>
      </CardHeader>

      <CardContent className="builder-card-content px-0">
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel>은행</FieldLabel>
            <Button
              className="h-14 w-full justify-start rounded-3xl bg-input/50 px-4 text-base font-semibold text-foreground hover:bg-input"
              variant="secondary"
              type="button"
              onClick={onOpenBankSheet}
            >
              {info.bank != null ? (
                <>
                  <BankTileLogo bank={info.bank} />
                  <span className="truncate">{bankName !== '' ? bankName : '직접입력'}</span>
                </>
              ) : (
                <span className="text-muted-foreground">은행 선택</span>
              )}
              <ChevronRightIcon data-icon="inline-end" className="ml-auto" />
            </Button>
          </Field>

          {isCustomBank(info.bank) ? (
            <PaymentInputField
              id="bank-name"
              label="은행명"
              placeholder="은행명 입력"
              value={info.bank.name}
              onChange={value => onChange({ bank: createCustomBank(value) })}
            />
          ) : null}

          <PaymentInputField
            id="account"
            label="계좌번호"
            placeholder="계좌번호 입력"
            value={info.account}
            warning={accountWarning}
            inputMode="numeric"
            onChange={value => onChange({ account: formatAccountForBank(value, info.bank) })}
          />

          <PaymentInputField
            id="holder"
            label="예금주"
            placeholder="예금주 입력"
            value={info.holder}
            onChange={value => onChange({ holder: value })}
          />

          <PaymentInputField
            id="amount"
            label="금액 (선택)"
            placeholder="금액 입력"
            value={info.amount}
            inputMode="numeric"
            suffix="원"
            formatDisplayValue={formatAmountInputValue}
            onChange={value => onChange({ amount: normalizeAmount(value) })}
          />

          <PaymentInputField
            id="memo"
            label="메모 (선택)"
            placeholder="메모 입력"
            value={info.memo}
            onChange={value => onChange({ memo: value })}
          />

          <PaymentInputField
            id="nickname"
            label="닉네임 (선택)"
            placeholder="닉네임 입력"
            value={info.nickname}
            onChange={value => onChange({ nickname: value })}
          />
        </FieldGroup>

      </CardContent>

      <div className="builder-submit-rail">
        <Button className="h-14 w-full text-base font-bold" disabled={!complete} type="button" onClick={onOpenPay}>
          완료
        </Button>
      </div>
    </Card>
  );
}

function PaymentInputField({
  id,
  label,
  placeholder,
  value,
  warning = '',
  suffix,
  inputMode,
  formatDisplayValue,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  warning?: string;
  suffix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  formatDisplayValue?: (value: string) => string;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const inputValue = !focused && formatDisplayValue != null ? formatDisplayValue(value) : value;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          className={cn(
            'h-14 rounded-3xl px-4 text-base font-semibold',
            value !== '' && suffix == null ? 'pr-12' : undefined,
            value !== '' && suffix != null ? 'pr-20' : undefined,
            value === '' && suffix != null ? 'pr-11' : undefined,
          )}
          inputMode={inputMode}
          placeholder={placeholder}
          value={inputValue}
          onChange={event => onChange(event.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value !== '' ? (
          <button
            className={cn(
              'absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 focus-visible:outline-none',
              suffix != null ? 'right-9' : 'right-3',
            )}
            type="button"
            aria-label={`${label} 지우기`}
            onClick={() => onChange('')}
          >
            <XIcon />
          </button>
        ) : null}
        {suffix != null ? (
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {warning !== '' ? <FieldDescription className="whitespace-pre-line text-warning">{warning}</FieldDescription> : null}
    </Field>
  );
}

function BankSelectSheet({
  open,
  selectedBank,
  onOpenChange,
  onSelect,
  onSelectCustom,
}: {
  open: boolean;
  selectedBank?: Bank;
  onOpenChange: (open: boolean) => void;
  onSelect: (bank: Bank) => void;
  onSelectCustom: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88dvh] w-full max-w-[440px] gap-0 overflow-hidden rounded-t-4xl border-border p-0"
      >
        <SheetHeader className="gap-2 px-5 pt-5 pb-4 text-left">
          <div className="mx-auto mb-2 h-1 w-11 rounded-full bg-muted" />
          <SheetTitle className="text-2xl font-extrabold">은행을 선택해주세요</SheetTitle>
          <SheetDescription>심볼이 있는 은행만 표시합니다. 없으면 직접입력을 선택하세요.</SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-2 overflow-y-auto px-5 pb-5">
          {bankOptions.map(bank => {
            const selected = bank.officialCode != null && bank.officialCode === selectedBank?.officialCode;

            return (
              <Button
                className={cn(
                  'min-h-24 min-w-0 flex-col gap-2 rounded-2xl px-2 py-3 text-sm leading-tight font-bold',
                  selected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted/70 text-foreground hover:bg-muted',
                )}
                variant="secondary"
                type="button"
                key={bank.officialCode}
                aria-pressed={selected}
                onClick={() => onSelect(bank)}
              >
                <BankTileLogo bank={bank} selected={selected} />
                <span className="max-w-full break-keep text-center text-[13px] leading-tight">{getBankTileName(bank)}</span>
              </Button>
            );
          })}
          <Button
            className={cn(
              'min-h-24 min-w-0 flex-col gap-2 rounded-2xl px-2 py-3 text-sm leading-tight font-bold',
              isCustomBank(selectedBank) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted/70 text-foreground hover:bg-muted',
            )}
            variant="secondary"
            type="button"
            aria-pressed={isCustomBank(selectedBank)}
            onClick={onSelectCustom}
          >
            <span
              className={cn(
                'grid size-7 place-items-center rounded-lg',
                isCustomBank(selectedBank) ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-background text-primary',
              )}
            >
              <PencilIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="max-w-full break-keep text-center text-[13px] leading-tight">직접입력</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function QrBottomSheet({
  open,
  info,
  shareUrl,
  cleanShareUrl,
  tossTransferUrl,
  qrTarget,
  onChangeQrTarget,
  cleanQrUrlAfterRead,
  onChangeCleanQrUrlAfterRead,
  onOpenChange,
  onCopyUrl,
}: {
  open: boolean;
  info: PaymentInfo;
  shareUrl: string;
  cleanShareUrl: string;
  tossTransferUrl: string;
  qrTarget: QrTarget;
  onChangeQrTarget: (target: QrTarget) => void;
  cleanQrUrlAfterRead: boolean;
  onChangeCleanQrUrlAfterRead: (checked: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onCopyUrl: (url: string, message: string) => void;
}) {
  const amountLabel = formatAmount(info.amount);
  const selectedShareUrl = cleanQrUrlAfterRead ? cleanShareUrl : shareUrl;
  const qrValue = qrTarget === 'share' ? selectedShareUrl : tossTransferUrl;
  const qrTitle = qrTarget === 'share' ? '현재 링크 QR 코드' : '토스 송금 QR 코드';
  const copyMessage = qrTarget === 'share' ? '현재 링크가 복사됐습니다' : '토스 송금 링크가 복사됐습니다';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="qr-sheet-content mx-auto w-full max-w-[440px] rounded-t-4xl border-border p-0">
        <SheetHeader className="gap-2 px-5 pt-5 pb-4 text-left">
          <div className="mx-auto mb-2 h-1 w-11 rounded-full bg-muted" />
          <SheetTitle className="text-2xl font-extrabold">QR로 보기</SheetTitle>
          <SheetDescription>현재 링크 또는 토스 송금 링크를 QR로 공유합니다.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-5 pb-5">
          <QrTargetSegmentedControl value={qrTarget} onChange={onChangeQrTarget} />

          <div className="h-24 overflow-hidden">
            {qrTarget === 'share' ? (
              <button
                className="flex h-full w-full items-center justify-center gap-3 rounded-3xl bg-muted/60 p-4 text-center transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
                type="button"
                role="checkbox"
                aria-checked={cleanQrUrlAfterRead}
                onClick={() => onChangeCleanQrUrlAfterRead(!cleanQrUrlAfterRead)}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-lg transition-colors',
                    cleanQrUrlAfterRead ? 'bg-primary text-primary-foreground' : 'bg-input/90 text-transparent',
                  )}
                  aria-hidden="true"
                >
                  <CheckIcon className="size-4" />
                </span>
                <span className="text-base leading-snug font-bold text-foreground">QR코드 열고 나면 주소창에서 정보 숨기기</span>
              </button>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-muted/60 p-4 text-center">
                <p className="text-base font-extrabold text-foreground">토스 앱으로 바로 열리는 QR입니다.</p>
                <p className="mt-2 text-base leading-normal font-semibold text-muted-foreground">
                  QR을 스캔하면 토스 송금 화면으로 이동합니다.
                </p>
              </div>
            )}
          </div>

          <div className="grid min-h-60 place-items-center rounded-4xl bg-background p-5 ring-1 ring-border" data-qr-value={qrValue}>
            <QRCodeSVG value={qrValue} size={196} level="M" marginSize={2} title={qrTitle} />
          </div>

          <dl className="flex flex-col gap-3 rounded-3xl bg-muted/50 p-4">
            <SummaryRow label="은행" value={getBankName(info.bank)} compact />
            <SummaryRow label="계좌번호" value={info.account} compact />
            {amountLabel !== '' ? <SummaryRow label="금액" value={amountLabel} compact /> : null}
            {info.nickname.trim() !== '' ? <SummaryRow label="닉네임" value={info.nickname.trim()} compact /> : null}
          </dl>

          <Button className="h-12 w-full font-bold" type="button" onClick={() => onCopyUrl(qrValue, copyMessage)}>
            <CopyIcon data-icon="inline-start" />
            QR 링크 복사
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function QrTargetSegmentedControl({ value, onChange }: { value: QrTarget; onChange: (target: QrTarget) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-muted-foreground">공유 방식</span>
      <div className="grid grid-cols-2 rounded-3xl bg-muted/60 p-1" aria-label="QR 공유 방식">
        <button
          className={cn(
            'h-11 rounded-3xl text-sm font-extrabold transition-[background-color,box-shadow,color] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30',
            value === 'share' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
          type="button"
          aria-pressed={value === 'share'}
          onClick={() => onChange('share')}
        >
          현재 링크
        </button>
        <button
          className={cn(
            'h-11 rounded-3xl text-sm font-extrabold transition-[background-color,box-shadow,color] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30',
            value === 'toss' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
          type="button"
          aria-pressed={value === 'toss'}
          onClick={() => onChange('toss')}
        >
          토스로 송금하기
        </button>
      </div>
    </div>
  );
}

function BankHeader({ bank }: { bank?: Bank }) {
  const bankName = getBankName(bank);

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[76px_1fr] items-center gap-4">
      <BankLogo bank={bank} />
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">은행</span>
          {bank?.officialCode != null ? <Badge variant="secondary">코드 {bank.officialCode}</Badge> : null}
        </div>
        <CardTitle className="truncate text-2xl font-extrabold tracking-normal">{bankName !== '' ? bankName : '은행 선택 필요'}</CardTitle>
      </div>
    </div>
  );
}

function BankLogo({ bank }: { bank?: Bank }) {
  const [failed, setFailed] = useState(false);
  const src = bank == null || failed ? undefined : getBankLogoSrc(bank);
  const bankName = getBankName(bank);

  return (
    <div className="grid size-[76px] place-items-center overflow-hidden rounded-3xl bg-muted">
      {src != null ? (
        <img className="size-12 object-contain" src={src} alt={`${bankName} 로고`} onError={() => setFailed(true)} />
      ) : (
        <span className="text-base font-extrabold text-primary">{getBankInitialLabel(bankName)}</span>
      )}
    </div>
  );
}

function BankTileLogo({ bank, selected = false }: { bank: Bank; selected?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? undefined : getBankLogoSrc(bank);

  if (src == null) {
    return (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-lg text-xs font-extrabold',
          selected ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-background text-primary',
        )}
      >
        {getBankInitialLabel(getBankTileName(bank))}
      </span>
    );
  }

  return <img className="size-8 object-contain" src={src} alt="" onError={() => setFailed(true)} />;
}

function SummaryRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4', compact ? 'text-sm' : 'border-b border-border pb-3 last:border-b-0 last:pb-0')}>
      <dt className="shrink-0 font-semibold text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right font-extrabold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function ToastMessage({ open, text }: ToastState) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-x-5 bottom-5 z-50 mx-auto max-w-[360px] rounded-3xl bg-popover px-4 py-3 text-center text-sm font-bold text-popover-foreground shadow-xl ring-1 ring-border">
      {text}
    </div>
  );
}

function getBankTileName(bank: Bank) {
  const shortNames: Record<string, string> = {
    '002': 'KDB산업',
    '003': 'IBK기업',
    '004': 'KB국민',
    '007': '수협',
    '011': 'NH농협',
    '012': '지역농축협',
    '020': '우리',
    '023': 'SC제일',
    '027': '씨티',
    '030': '수협중앙회',
    '031': 'iM뱅크(대구)',
    '032': '부산',
    '034': '광주',
    '035': '제주',
    '037': '전북',
    '039': '경남',
    '045': '새마을',
    '048': '신협',
    '050': '저축은행',
    '054': 'HSBC',
    '060': 'BOA',
    '064': '산림조합',
    '071': '우체국',
    '081': '하나',
    '088': '신한',
    '089': '케이뱅크',
    '090': '카카오뱅크',
    '092': '토스뱅크',
  };

  return bank.officialCode == null ? getBankName(bank) || '직접입력' : shortNames[bank.officialCode] ?? bank.name;
}

function getBankInitialLabel(name: string) {
  const trimmed = name.trim();

  if (trimmed === '') {
    return '직접';
  }

  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(trimmed)) {
    return Array.from(trimmed).find(character => character.trim() !== '') ?? '직접';
  }

  const initials = trimmed
    .split(/\s+/)
    .map(word => word.match(/[A-Za-z0-9]/)?.[0] ?? '')
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return initials || Array.from(trimmed)[0]?.toUpperCase() || '직접';
}

function formatAmountInputValue(value: string) {
  const amount = normalizeAmount(value);
  return amount === '' ? '' : Number(amount).toLocaleString('ko-KR');
}

function createTransferText(info: PaymentInfo) {
  const parts = [getBankName(info.bank), info.account, info.holder, formatAmount(info.amount), info.memo, info.nickname]
    .filter((part): part is string => part != null && part.trim() !== '')
    .map(part => part.trim());

  return parts.join(' ');
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export default App;
