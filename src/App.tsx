import { useEffect, useState } from 'react'
import { detectOS } from './utils/detectOS'
import HomeIOS from './components/HomeIOS'
import HomeAndroid from './components/HomeAndroid'
import CalendarSelection from './components/CalendarSelection'
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

  // currentPage가 'home'일 때 home_viewed 이벤트 전송
  // 원자적 함수를 사용하여 Race Condition 완전 방지
  useEffect(() => {
    if (currentPage === 'home') {
      // os 상태가 'other'에서 벗어났을 때만 함수를 호출하도록 보장
      // 뒤로가기인지 확인 (sessionStorage에 이미 기록이 있는지)
      const SESSION_KEY = 'ssutime_home_viewed_session'
      const isBackNavigation = sessionStorage.getItem(SESSION_KEY) === '1'
      
      trackHomeViewedOnce(os, isBackNavigation)
    }
  }, [currentPage, os])  // os 상태 변화에 집중

  const handleCalendarClick = (type: CalendarType) => {
    setSelectedCalendarType(type)
    setCurrentPage('calendar-selection')
    // 뒤로가기 시 home_viewed 이벤트를 위해 전역 플래그만 리셋
    // sessionStorage는 유지하여 초기 로드와 구분
    resetHomeViewedFlag()
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
