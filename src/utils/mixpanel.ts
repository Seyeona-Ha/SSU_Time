import mixpanel from 'mixpanel-browser';

/**
 * Mixpanel 초기화
 */
export function initMixpanel(): void {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  
  if (!token) {
    console.warn('Mixpanel token is not set');
    return;
  }

  mixpanel.init(token, {
    debug: false,
    track_pageview: false, // 수동으로 페이지뷰 추적
    persistence: 'localStorage',
  });
}

/**
 * 이벤트 트래킹
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | boolean | number>
): void {
  try {
    mixpanel.track(eventName, properties);
  } catch (error) {
    console.error('Mixpanel track error:', error);
  }
}

/**
 * 사용자 속성 설정
 */
export function setUserProperties(properties: Record<string, string | boolean | number>): void {
  try {
    mixpanel.people.set(properties);
  } catch (error) {
    console.error('Mixpanel set user properties error:', error);
  }
}

/**
 * 모듈 레벨 전역 플래그: 가장 강력한 중복 방지
 */
let hasTrackedHomeViewed = false;
const SESSION_KEY = 'ssutime_home_viewed_session';

/**
 * home_viewed 이벤트를 원자적으로 한 번만 전송하는 함수
 * Race Condition을 완전히 방지하기 위해 체크와 실행을 한 번에 처리
 * 
 * @param os - 운영체제 ('ios', 'android', 'other')
 * @param isBackNavigation - 뒤로가기로 돌아온 경우 true, 초기 진입인 경우 false
 */
export function trackHomeViewedOnce(
  os: 'ios' | 'android' | 'other',
  isBackNavigation: boolean = false
): void {
  // 1. 초기 로드 시의 중복 실행 방지 (동일 세션 내)
  const isAlreadyTrackedInSession = sessionStorage.getItem(SESSION_KEY) === '1';
  
  // 2. 이미 이 플래그가 true이거나 세션 내에서 이미 기록되었다면 즉시 종료
  // 단, 뒤로가기인 경우는 예외 (isBackNavigation이 true이면 허용)
  if (!isBackNavigation && (hasTrackedHomeViewed || isAlreadyTrackedInSession)) {
    return;
  }
  
  // 3. 뒤로가기인 경우: sessionStorage는 있지만 전역 플래그가 false인 경우만 허용
  if (isBackNavigation) {
    if (!isAlreadyTrackedInSession || hasTrackedHomeViewed) {
      return; // 초기 로드가 아니거나 이미 추적된 경우 무시
    }
  }
  
  // --- 체크 통과: 최초 실행 또는 뒤로가기 ---
  
  // 4. Race Condition 방지: 플래그를 가장 먼저 설정하여 다른 호출을 바로 막음
  hasTrackedHomeViewed = true;
  
  // 5. 이벤트 전송 조건: OS 감지가 완료된 후(os !== 'other')에만 전송
  if (os !== 'other') {
    try {
      mixpanel.track('home_viewed', {
        os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'other',
        is_initial_load: !isBackNavigation,
      });
      
      // 6. 세션 기록 (뒤로 가기 방지)
      if (!isBackNavigation) {
        sessionStorage.setItem(SESSION_KEY, '1');
      }
    } catch (error) {
      console.error('Mixpanel track error:', error);
      // 에러 발생 시 플래그 롤백
      hasTrackedHomeViewed = false;
    }
  } else {
    // os가 'other'인 경우 플래그를 롤백하여 2차 렌더링(OS 감지 후)을 허용
    hasTrackedHomeViewed = false;
  }
}

/**
 * 뒤로가기 시 전역 플래그를 리셋하는 함수
 */
export function resetHomeViewedFlag(): void {
  hasTrackedHomeViewed = false;
}



