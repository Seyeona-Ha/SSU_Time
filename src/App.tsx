import { useEffect, useState } from 'react'
import { detectOS } from './utils/detectOS'
import HomeIOS from './components/HomeIOS'
import HomeAndroid from './components/HomeAndroid'
import CalendarSelection from './components/CalendarSelection'
import { trackEvent } from './utils/mixpanel'
import './App.css'

type Page = 'home' | 'calendar-selection'
type CalendarType = 'apple' | 'google'

function App() {
  const [os, setOS] = useState<'ios' | 'android' | 'other'>('other')
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedCalendarType, setSelectedCalendarType] = useState<CalendarType>('google')

  useEffect(() => {
    // 개발 환경에서 URL 파라미터로 OS 강제 설정 (예: ?os=ios 또는 ?os=android)
    const urlParams = new URLSearchParams(window.location.search)
    const forcedOS = urlParams.get('os') as 'ios' | 'android' | null
    
    if (forcedOS && (forcedOS === 'ios' || forcedOS === 'android')) {
      setOS(forcedOS)
    } else {
      const detectedOS = detectOS()
      setOS(detectedOS)
    }
  }, [])

  // currentPage가 'home'으로 바뀔 때마다 home_viewed 이벤트 전송
  useEffect(() => {
    if (currentPage === 'home') {
      const sessionKey = 'home_viewed_tracked'
      const lockKey = 'home_viewed_lock'
      const now = Date.now()
      
      // 락(lock)을 먼저 확인하고 설정
      const existingLock = sessionStorage.getItem(lockKey)
      
      // 초기 로드인 경우: 락이 없으면
      if (!existingLock) {
        // 고유한 락 ID 생성 (타임스탬프 + 랜덤)
        const lockId = `${now}-${Math.random().toString(36).substr(2, 9)}`
        
        // 락을 먼저 설정 (동기적으로)
        sessionStorage.setItem(lockKey, lockId)
        sessionStorage.setItem(sessionKey, '1')
        
        // 설정 후 즉시 다시 확인하여 동시 실행 방지
        // 만약 다른 useEffect가 이미 설정했다면 락 ID가 다를 수 있음
        const recheckLock = sessionStorage.getItem(lockKey)
        
        // 락이 방금 설정한 것과 같으면 이벤트 전송
        // (동시 실행 시 한 번만 이벤트 전송)
        if (recheckLock === lockId) {
          const detectedOS = detectOS()
          trackEvent('home_viewed', {
            os: detectedOS === 'ios' ? 'ios' : detectedOS === 'android' ? 'android' : 'other',
            is_initial_load: true, // 초기 진입 구분
          })
          // 이벤트 전송 후 락 해제 (100ms 후)
          setTimeout(() => {
            const currentLock = sessionStorage.getItem(lockKey)
            if (currentLock === lockId) {
              sessionStorage.removeItem(lockKey)
            }
          }, 100)
        }
        return
      }
      
      // 뒤로가기로 돌아온 경우: sessionKey가 있고 락이 없거나 오래된 경우
      if (sessionStorage.getItem(sessionKey) === '1' && (!existingLock || (now - parseInt(existingLock.split('-')[0])) > 1000)) {
        // 락을 제거하고 이벤트 전송
        sessionStorage.removeItem(lockKey)
        const detectedOS = detectOS()
        trackEvent('home_viewed', {
          os: detectedOS === 'ios' ? 'ios' : detectedOS === 'android' ? 'android' : 'other',
          is_initial_load: false, // 뒤로가기로 돌아온 경우 구분
        })
        return
      }
      
      // 그 외의 경우 (락이 있는 경우): 무시 (중복 방지)
    }
  }, [currentPage])

  const handleCalendarClick = (type: CalendarType) => {
    setSelectedCalendarType(type)
    setCurrentPage('calendar-selection')
    // 뒤로가기 시 home_viewed 이벤트를 위해 락만 제거
    // sessionKey는 유지하여 초기 로드와 구분
    sessionStorage.removeItem('home_viewed_lock')
  }

  const handleBack = () => {
    setCurrentPage('home')
  }

  const handleAdd = (selectedCategories: string[]) => {
    // 선택된 카테고리와 캘린더 타입에 따라 URL로 이동
    // 실제 구현은 CalendarSelection 컴포넌트에서 처리
    console.log('Adding to calendar:', selectedCalendarType, selectedCategories)
  }

  // 캘린더 선택 페이지
  if (currentPage === 'calendar-selection') {
    return (
      <CalendarSelection
        calendarType={selectedCalendarType}
        onBack={handleBack}
        onAdd={handleAdd}
      />
    )
  }

  // OS에 따라 적절한 홈화면 렌더링
  // key prop을 추가하여 currentPage가 변경될 때마다 컴포넌트가 재마운트되도록 함
  if (os === 'ios') {
    return <HomeIOS key={currentPage} onCalendarClick={handleCalendarClick} />
  }

  if (os === 'android') {
    return <HomeAndroid key={currentPage} onCalendarClick={handleCalendarClick} />
  }

  // 데스크톱이나 다른 OS의 경우 기본적으로 Android 버전 표시
  // (개발/테스트 환경에서 확인 가능하도록)
  return <HomeAndroid key={currentPage} onCalendarClick={handleCalendarClick} />
}

export default App
