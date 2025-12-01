/**
 * Firebase 방문자 수를 0으로 초기화하는 스크립트
 * 실행: node reset-visitor-count.js
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBSdylna8ElqyRTZ_RJFh4S4xbyPu5GFYw",
    authDomain: "ssu-time.firebaseapp.com",
    databaseURL: "https://ssu-time-default-rtdb.firebaseio.com",
    projectId: "ssu-time",
    storageBucket: "ssu-time.firebasestorage.app",
    messagingSenderId: "434156086906",
    appId: "1:434156086906:web:8f9ba02cce5cf99b80fdc3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function resetVisitorCount() {
    try {
        const visitorRef = ref(database, 'visitorCount');
        await set(visitorRef, 0);
        console.log('✅ 방문자 수가 0으로 초기화되었습니다.');
        process.exit(0);
    } catch (error) {
        console.error('❌ 방문자 수 초기화 실패:', error);
        process.exit(1);
    }
}

resetVisitorCount();

