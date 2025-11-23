import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

// Firebase 설정
// TODO: Firebase 콘솔에서 프로젝트를 생성하고 아래 설정을 교체하세요
const firebaseConfig = {
    apiKey: "AIzaSyBSdylna8ElqyRTZ_RJFh4S4xbyPu5GFYw",
    authDomain: "ssu-time.firebaseapp.com",
    databaseURL: "https://ssu-time-default-rtdb.firebaseio.com",
    projectId: "ssu-time",
    storageBucket: "ssu-time.firebasestorage.app",
    messagingSenderId: "434156086906",
    appId: "1:434156086906:web:8f9ba02cce5cf99b80fdc3"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * 방문자 수를 가져옵니다.
 */
export async function getVisitorCount(): Promise<number> {
  try {
    const visitorRef = ref(database, 'visitorCount');
    const snapshot = await get(visitorRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as number;
    } else {
      // 초기값 설정
      await set(visitorRef, 0);
      return 0;
    }
  } catch (error) {
    console.error('방문자 수 가져오기 실패:', error);
    return 0;
  }
}

/**
 * 방문자 수를 증가시킵니다.
 */
export async function incrementVisitorCount(): Promise<number> {
  try {
    const visitorRef = ref(database, 'visitorCount');
    
    // 현재 값 가져오기
    const snapshot = await get(visitorRef);
    let currentCount = 0;
    
    if (snapshot.exists()) {
      currentCount = snapshot.val() as number;
    }
    
    // 1 증가
    const newCount = currentCount + 1;
    await set(visitorRef, newCount);
    
    return newCount;
  } catch (error) {
    console.error('방문자 수 증가 실패:', error);
    return 0;
  }
}

/**
 * 방문자 수를 리셋합니다 (관리자용).
 */
export async function resetVisitorCount(): Promise<void> {
  try {
    const visitorRef = ref(database, 'visitorCount');
    await set(visitorRef, 0);
  } catch (error) {
    console.error('방문자 수 리셋 실패:', error);
  }
}

