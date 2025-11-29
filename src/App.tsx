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
      const timestampKey = 'home_viewed_timestamp'
      const lastTimestamp = sessionStorage.getItem(timestampKey)
      const now = Date.now()
      
      // 타임스탬프가 없거나 500ms 이상 지났으면 이벤트 전송
      // (초기 로드이거나 뒤로가기로 돌아온 경우)
      if (!lastTimestamp || now - parseInt(lastTimestamp) > 500) {
        // 타임스탬프를 먼저 저장하여 동시 실행 방지
        sessionStorage.setItem(timestampKey, now.toString())
        const detectedOS = detectOS()
        trackEvent('home_viewed', {
          os: detectedOS === 'ios' ? 'ios' : detectedOS === 'android' ? 'android' : 'other',
        })
      }
      // 500ms 이내에 다시 실행된 경우는 무시 (중복 방지)
    }
  }, [currentPage])

  const handleCalendarClick = (type: CalendarType) => {
    setSelectedCalendarType(type)
    setCurrentPage('calendar-selection')
    // 뒤로가기 시 home_viewed 이벤트를 위해 타임스탬프 리셋
    sessionStorage.removeItem('home_viewed_timestamp')
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
