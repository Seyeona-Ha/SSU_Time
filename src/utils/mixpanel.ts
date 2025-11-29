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

