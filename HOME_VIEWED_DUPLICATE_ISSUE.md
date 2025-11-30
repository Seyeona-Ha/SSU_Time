# home_viewed 이벤트 중복 발생 문제 분석

## 문제 상황
- 초기 진입 시 `home_viewed` 이벤트가 Mixpanel에 **두 번** 전송됨
- 뒤로가기는 정상적으로 한 번만 전송됨
- StrictMode는 이미 제거됨

## 현재 코드 구조

### App.tsx의 문제가 될 수 있는 지점들

1. **os 상태 변경으로 인한 재렌더링**
   ```typescript
   const [os, setOS] = useState<'ios' | 'android' | 'other'>('other')
   
   useEffect(() => {
     // OS 감지 후 setOS 호출
     const detectedOS = detectOS()
     setOS(detectedOS)  // 이로 인해 App 컴포넌트 재렌더링
   }, [])
   ```
   - 초기값: `'other'`
   - useEffect에서 OS 감지 후 상태 변경
   - **문제**: `os` 상태 변경 → App 재렌더링 → `currentPage`가 'home'이면 useEffect 재실행 가능성

2. **useEffect 의존성 배열**
   ```typescript
   useEffect(() => {
     if (currentPage === 'home') {
       // home_viewed 이벤트 전송 로직
     }
   }, [currentPage])  // currentPage만 의존성
   ```
   - `currentPage`만 의존성으로 설정
   - 하지만 `os` 상태 변경으로 인한 재렌더링 시에도 실행될 수 있음

3. **sessionStorage와 useRef의 동시 실행 문제**
   ```typescript
   if (!hasTrackedInSession && !hasTrackedInitialLoadRef.current) {
     sessionStorage.setItem(sessionKey, '1')
     hasTrackedInitialLoadRef.current = true
     // 이벤트 전송
   }
   ```
   - 두 개의 useEffect가 **동시에** 실행되면:
     - 둘 다 `hasTrackedInSession`을 확인 → 둘 다 `false`
     - 둘 다 sessionStorage를 '1'로 설정
     - 둘 다 이벤트 전송
   - **문제**: sessionStorage.setItem과 useRef 설정 사이에 타이밍 이슈

4. **HomeIOS/HomeAndroid 컴포넌트의 key prop**
   ```typescript
   <HomeIOS key={currentPage} onCalendarClick={handleCalendarClick} />
   ```
   - `key={currentPage}`로 설정되어 있음
   - `os` 상태가 변경되면 다른 컴포넌트로 전환 (예: 'other' → 'ios')
   - 이로 인해 컴포넌트가 언마운트/마운트될 수 있음

## 가능한 원인들

### 1. os 상태 변경으로 인한 이중 실행 (가장 유력)
- **시나리오**:
  1. 초기 렌더링: `os = 'other'` → `currentPage = 'home'` → useEffect 실행 → 이벤트 전송
  2. OS 감지 완료: `os = 'ios'` → App 재렌더링 → `currentPage`는 여전히 'home' → useEffect 재실행 → 이벤트 재전송

### 2. sessionStorage 동시 접근 문제
- 두 개의 useEffect가 동시에 실행되면 둘 다 sessionStorage를 확인하고 둘 다 '1'이 아니라고 판단
- Race condition 발생 가능

### 3. Mixpanel 자체의 중복 전송
- Mixpanel 라이브러리가 내부적으로 이벤트를 두 번 전송하는 경우
- 네트워크 재시도 등

### 4. 브라우저 특정 동작
- 특정 브라우저나 환경에서 useEffect가 두 번 실행되는 경우
- Service Worker나 다른 스크립트의 간섭

## 확인해야 할 사항

### 질문 1: os 상태 변경이 원인인가?
```typescript
// 디버깅용 로그 추가
useEffect(() => {
  console.log('OS detection effect:', os)
  // ...
}, [])

useEffect(() => {
  console.log('Home viewed effect:', { currentPage, os, hasTrackedInSession, hasTrackedRef: hasTrackedInitialLoadRef.current })
  // ...
}, [currentPage, os])  // os도 의존성에 추가하여 확인
```

### 질문 2: useEffect가 실제로 두 번 실행되는가?
- React DevTools Profiler로 확인
- console.log로 실행 횟수 확인

### 질문 3: sessionStorage가 제대로 작동하는가?
```typescript
// 디버깅용
console.log('Before:', sessionStorage.getItem(sessionKey))
sessionStorage.setItem(sessionKey, '1')
console.log('After:', sessionStorage.getItem(sessionKey))
```

### 질문 4: Mixpanel이 중복 전송하는가?
- Mixpanel 네트워크 탭에서 실제 요청 횟수 확인
- `trackEvent` 함수에 로그 추가

## 해결 방안 제안

### 방안 1: os 상태 변경을 고려한 로직
```typescript
useEffect(() => {
  if (currentPage === 'home') {
    // os가 'other'가 아닐 때만 이벤트 전송
    if (os !== 'other') {
      // 이벤트 전송 로직
    }
  }
}, [currentPage, os])  // os도 의존성에 추가
```

### 방안 2: 더 강력한 락 메커니즘
```typescript
// 전역 변수 사용 (모듈 레벨)
let isTracking = false

useEffect(() => {
  if (currentPage === 'home' && !isTracking) {
    isTracking = true
    // 이벤트 전송
    setTimeout(() => { isTracking = false }, 100)
  }
}, [currentPage])
```

### 방안 3: 이벤트 전송을 지연
```typescript
useEffect(() => {
  if (currentPage === 'home') {
    const timer = setTimeout(() => {
      // 이벤트 전송 로직
    }, 100)  // os 상태 변경 후 실행되도록 지연
    
    return () => clearTimeout(timer)
  }
}, [currentPage, os])
```

### 방안 4: os 상태 변경 완료 후에만 이벤트 전송
```typescript
const [osDetected, setOSDetected] = useState(false)

useEffect(() => {
  // OS 감지 완료 후
  setOSDetected(true)
}, [])

useEffect(() => {
  if (currentPage === 'home' && osDetected && os !== 'other') {
    // 이벤트 전송 로직
  }
}, [currentPage, os, osDetected])
```

## 디버깅 체크리스트

- [ ] React DevTools로 컴포넌트 렌더링 횟수 확인
- [ ] useEffect 실행 횟수 로그로 확인
- [ ] sessionStorage 값 변화 추적
- [ ] Mixpanel 네트워크 요청 횟수 확인
- [ ] os 상태 변경 타이밍 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] 다른 스크립트나 Service Worker 간섭 확인

## 환경 정보
- React 버전: 확인 필요
- Vite 버전: 확인 필요
- Mixpanel 버전: 2.72.0
- 배포 환경: Vercel
- 테스트 환경: iOS Safari, Android Chrome



