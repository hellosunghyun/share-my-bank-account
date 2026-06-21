# share-my-bank-account

GitHub Pages에 올릴 수 있는 정적 계좌 정보 공유 페이지입니다. 서버에 계좌 정보를 저장하지 않고 URL 파라미터만 사용합니다.

## 사용

```txt
?bank=090&account=3333-00-0000000&holder=김성현&amount=12000&memo=참가비&nickname=아카데미
```

지원 파라미터:

- `bank`: 금융결제원 3자리 공식 코드, 토스페이먼츠 코드, 한글 코드, 영문 코드, 직접 입력 은행명
- `account`: 계좌번호
- `holder`: 예금주
- `amount`: 금액
- `memo`: 메모
- `nickname`: 닉네임
- `clean`: `1` 또는 `true`이면 페이지가 열린 뒤 주소창의 계좌 정보 파라미터를 지움
- `edit`: `1` 또는 `true`이면 계좌 정보 URL로 처음 열어도 수정 버튼을 표시함

파라미터가 없으면 계좌 정보를 입력하는 수정 화면이 열립니다. 계좌 정보 파라미터가 있으면 기본적으로 공유/QR 보기 화면으로 열리고 수정 버튼은 숨깁니다. 금액, 메모, 닉네임은 선택사항입니다.

## 기능

- 송금 정보 복사
- 토스 앱 송금 딥링크 열기
- 현재 링크 QR 보기
- 토스 송금 딥링크 QR 보기
- 열람 후 URL 정보 숨기기
- 공유받은 계좌 화면에서 수정 버튼 숨기기
- 로고가 있는 은행 선택
- 목록에 없는 은행 직접입력

토스 송금 딥링크 형식:

```txt
supertoss://send?amount=12000&bank=카카오뱅크&accountNo=3333000000000&origin=qr
```

금액이 없으면 토스 딥링크와 QR에서 `amount` 파라미터를 생략합니다.

## 개발

```bash
npm install
npm run dev
npm run build
```

## GitHub Pages 배포

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드하고 GitHub Pages에 배포합니다.
필요하면 GitHub Actions 탭에서 `Deploy GitHub Pages` 워크플로우를 수동 실행할 수도 있습니다.

`vite.config.ts`의 `base`를 `./`로 설정해서 사용자/프로젝트 GitHub Pages 경로 모두에서 정적 asset을 상대 경로로 불러옵니다.
