import { useEffect, useState } from 'react'
import { detectOS } from './utils/detectOS'
import HomeIOS from './components/HomeIOS'
import HomeAndroid from './components/HomeAndroid'
import CalendarSelection from './components/CalendarSelection'
import { trackEvent } from './utils/mixpanel'
import './App.css'

type Page = 'home' | 'calendar-selection'
type CalendarType = 'apple' | 'google'

// 모듈 레벨 전역 변수로 초기 로드 추적
let hasTrackedInitialHome = false


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
      if (!hasTrackedInitialHome) {
        // 초기 로드 시: sessionStorage에 먼저 설정하여 두 번째 실행 방지
        const sessionKey = 'home_viewed_tracked'
        sessionStorage.setItem(sessionKey, '1')
        hasTrackedInitialHome = true
        const detectedOS = detectOS()
        trackEvent('home_viewed', {
          os: detectedOS === 'ios' ? 'ios' : detectedOS === 'android' ? 'android' : 'other',
        })
      } else {
        // 뒤로가기로 돌아온 경우
        const detectedOS = detectOS()
        trackEvent('home_viewed', {
          os: detectedOS === 'ios' ? 'ios' : detectedOS === 'android' ? 'android' : 'other',
        })
      }
    }
  }, [currentPage])

  const handleCalendarClick = (type: CalendarType) => {
    setSelectedCalendarType(type)
    setCurrentPage('calendar-selection')
    // 뒤로가기 시 home_viewed 이벤트를 위해 전역 변수 리셋
    hasTrackedInitialHome = false
    homeViewEffectRunCount = 0
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
