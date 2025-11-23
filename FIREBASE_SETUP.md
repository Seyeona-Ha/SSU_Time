# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "ssu-time")
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. Realtime Database 설정

1. Firebase Console에서 프로젝트 선택 (현재 "ssu-time" 프로젝트)
2. 왼쪽 사이드바에서 **"빌드" (Build)** 섹션을 펼치기 (아래 화살표 클릭)
3. **"Realtime Database"** 클릭
4. **"데이터베이스 만들기"** 버튼 클릭
5. 위치 선택:
   - 드롭다운에서 **"asia-northeast3 (Seoul)"** 또는 가장 가까운 지역 선택
   - "다음" 클릭
6. 보안 규칙 설정:
   - **"테스트 모드로 시작"** 선택 (개발 중에는 이렇게 설정)
   - "사용 설정" 클릭
7. 데이터베이스 생성 완료!

**참고**: 프로덕션 배포 시에는 보안 규칙을 더 엄격하게 설정하는 것을 권장합니다.

## 3. Firebase 설정 정보 가져오기

1. Firebase Console에서 프로젝트 설정(톱니바퀴 아이콘) 클릭
2. "프로젝트 설정" 페이지로 이동
3. "일반" 탭에서 "내 앱" 섹션 확인
4. 웹 앱 아이콘(</>) 클릭하여 앱 등록
5. 앱 닉네임 입력 (예: "ssu-time-web")
6. **설정 정보 복사**:
   - `apiKey`
   - `authDomain`
   - `databaseURL`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## 4. 코드에 설정 적용

`ssu-time/src/utils/firebase.ts` 파일을 열고 `firebaseConfig` 객체의 값들을 위에서 복사한 값으로 교체하세요:

```typescript
const firebaseConfig = {
  apiKey: "여기에_API_KEY_붙여넣기",
  authDomain: "여기에_AUTH_DOMAIN_붙여넣기",
  databaseURL: "여기에_DATABASE_URL_붙여넣기",
  projectId: "여기에_PROJECT_ID_붙여넣기",
  storageBucket: "여기에_STORAGE_BUCKET_붙여넣기",
  messagingSenderId: "여기에_MESSAGING_SENDER_ID_붙여넣기",
  appId: "여기에_APP_ID_붙여넣기"
};
```

## 5. 초기 데이터 설정 (선택사항)

Firebase Console의 Realtime Database에서 `visitorCount` 초기값 설정:

1. Realtime Database 페이지로 이동 (왼쪽 메뉴에서 "Realtime Database" 클릭)
2. 데이터베이스 화면에서 상단에 보이는 데이터 트리 확인
3. **"+" 버튼** 또는 **"추가"** 버튼 클릭 (데이터베이스 루트 레벨에서)
4. 새 키 추가:
   - **키 이름**: `visitorCount` 입력
   - **값**: `0` 입력 (숫자로)
5. **"추가"** 또는 **"저장"** 클릭

**또는 자동 생성:**
- 코드가 실행되면 자동으로 `visitorCount`가 생성되므로, 이 단계는 선택사항입니다.
- 하지만 초기값을 명시적으로 설정하고 싶다면 위 방법을 사용하세요.

## 6. 방문자 수 리셋 방법

배포 시 방문자 수를 리셋하려면:

1. Firebase Console의 Realtime Database에서
2. `visitorCount` 값을 `0`으로 변경

또는 코드에서 `resetVisitorCount()` 함수를 호출할 수 있습니다 (관리자 페이지 등에서).

## 보안 참고사항

- 프로덕션 환경에서는 Firebase 보안 규칙을 더 엄격하게 설정하는 것을 권장합니다
- API 키는 클라이언트에 노출되지만, 보안 규칙으로 데이터 접근을 제어할 수 있습니다

