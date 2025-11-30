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
 * Mixpanel distinctId 설정 (백엔드에서 생성한 userId와 통일)
 */
export function identifyUser(userId: string): void {
  try {
    mixpanel.identify(userId);
    // localStorage에 저장하여 이후에도 사용
    localStorage.setItem('mixpanel_user_id', userId);
  } catch (error) {
    console.error('Mixpanel identify error:', error);
  }
}

/**
 * 저장된 userId로 identify (앱 초기화 시 호출)
 */
export function identifyUserFromStorage(): void {
  try {
    const userId = localStorage.getItem('mixpanel_user_id');
    if (userId) {
      mixpanel.identify(userId);
    }
  } catch (error) {
    console.error('Mixpanel identify from storage error:', error);
  }
}

/**
 * view_home 이벤트를 중복 없이 트래킹
 * - sessionStorage를 사용하여 세션 내 중복 방지
 * - timestamp 기반 필터링으로 race condition 방지
 * - initial 플래그는 첫 진입인지 확인
 */
let lastViewHomeTime = 0;
const VIEW_HOME_DEBOUNCE_MS = 500; // 500ms 이내 중복 호출 방지

export function trackViewHomeOnce(os: string, isInitial: boolean): void {
  try {
    const currentTime = Date.now();
    const sessionKey = 'mixpanel_view_home_initial_tracked';
    const sessionTimestampKey = 'mixpanel_view_home_timestamp';
    
    // 1. timestamp 기반 중복 방지 (race condition 방지)
    if (currentTime - lastViewHomeTime < VIEW_HOME_DEBOUNCE_MS) {
      return;
    }
    
    // 2. sessionStorage 기반 중복 방지 (세션 내 중복 방지)
    const lastTrackedTime = sessionStorage.getItem(sessionTimestampKey);
    if (lastTrackedTime) {
      const timeDiff = currentTime - parseInt(lastTrackedTime, 10);
      if (timeDiff < VIEW_HOME_DEBOUNCE_MS) {
        return;
      }
    }
    
    // 3. initial 플래그 처리
    let finalInitial = isInitial;
    
    if (isInitial) {
      // 첫 진입인 경우, 이미 트래킹했는지 확인
      const hasTrackedInitial = sessionStorage.getItem(sessionKey);
      if (hasTrackedInitial === 'true') {
        // 이미 초기 진입을 트래킹했으므로, 이번에는 initial: false로 전송
        finalInitial = false;
      } else {
        // 첫 진입이므로 initial: true로 전송하고 플래그 설정
        sessionStorage.setItem(sessionKey, 'true');
        finalInitial = true;
      }
    } else {
      // 뒤로가기로 돌아온 경우 항상 initial: false
      finalInitial = false;
    }
    
    // 이벤트 전송
    trackEvent('view_home', {
      os: os,
      initial: finalInitial,
    });
    
    // timestamp 기록
    sessionStorage.setItem(sessionTimestampKey, currentTime.toString());
    lastViewHomeTime = currentTime;
  } catch (error) {
    console.error('Mixpanel trackViewHomeOnce error:', error);
  }
}



