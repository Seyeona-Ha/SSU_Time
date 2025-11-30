import { useEffect, useState, useRef } from 'react'
import { detectOS } from './utils/detectOS'
import HomeIOS from './components/HomeIOS'
import HomeAndroid from './components/HomeAndroid'
import CalendarSelection from './components/CalendarSelection'
import { trackViewHomeOnce } from './utils/mixpanel'
import './App.css'

type Page = 'home' | 'calendar-selection'
type CalendarType = 'apple' | 'google'

function App() {
  const [os, setOS] = useState<'ios' | 'android' | 'other'>('other')
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedCalendarType, setSelectedCalendarType] = useState<CalendarType>('google')
  const isInitialMountRef = useRef(true)

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

  // 홈 화면 진입 시 view_home 이벤트 트래킹
  useEffect(() => {
    // currentPage가 'home'일 때만 트래킹
    if (currentPage !== 'home') {
      return
    }

    // OS 값 결정 (other인 경우에도 트래킹)
    const osValue = os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'other'
    
    // 초기 마운트인지 확인 (첫 렌더링인 경우에만 true)
    const isInitial = isInitialMountRef.current
    
    // 이벤트 트래킹
    trackViewHomeOnce(osValue, isInitial)
    
    // 초기 마운트 플래그 업데이트 (한 번만 false로 변경)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
    }
  }, [currentPage, os])

  const handleCalendarClick = (type: CalendarType) => {
    setSelectedCalendarType(type)
    setCurrentPage('calendar-selection')
  }

  const handleBack = () => {
    // 뒤로가기로 홈 화면으로 돌아올 때는 initial: false로 트래킹
    setCurrentPage('home')
    // currentPage가 'home'으로 변경되면 useEffect에서 자동으로 트래킹됨
    // 이때 isInitialMountRef.current는 false이므로 initial: false로 전송됨
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
