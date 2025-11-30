export function detectOS(): 'ios' | 'android' | 'other' {
  if (typeof window === 'undefined') {
    return 'other';
  }
  const userAgent = window.navigator.userAgent.toLowerCase();
  // 맥OS(macOS) 또는 iOS 디바이스 감지
  if (
    /iphone|ipad|ipod/.test(userAgent) ||
    /macintosh|mac os x/.test(userAgent)
  ) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  return 'other';
}







