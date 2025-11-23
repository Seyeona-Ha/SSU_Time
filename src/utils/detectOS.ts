export function detectOS(): 'ios' | 'android' | 'other' {
  if (typeof window === 'undefined') {
    return 'other';
  }
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (
    /iphone|ipad|ipod/.test(userAgent) ||
    (userAgent.includes('mac') && 'ontouchend' in document)
  ) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  return 'other';
}







