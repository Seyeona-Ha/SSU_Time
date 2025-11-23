import { getVisitorCount, incrementVisitorCount } from './firebase';

const VISITOR_STORAGE_KEY = 'ssu-time-visited';

/**
 * 방문자 수를 가져오고 증가시킵니다.
 * 로컬 스토리지를 사용하여 한 명이 여러 번 들어가도 카운트가 증가하지 않습니다.
 */
export async function trackVisitor(): Promise<number> {
  // 로컬 스토리지에서 이미 방문했는지 확인
  const hasVisited = localStorage.getItem(VISITOR_STORAGE_KEY);
  
  if (!hasVisited) {
    // 처음 방문한 경우에만 카운트 증가
    const newCount = await incrementVisitorCount();
    // 방문 기록 저장 (영구적으로 저장)
    localStorage.setItem(VISITOR_STORAGE_KEY, 'true');
    return newCount;
  } else {
    // 이미 방문한 경우 현재 카운트만 반환
    return await getVisitorCount();
  }
}

/**
 * 방문자 수를 가져옵니다 (증가 없이).
 */
export async function getCurrentVisitorCount(): Promise<number> {
  return await getVisitorCount();
}

