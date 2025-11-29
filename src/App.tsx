import { useEffect, useState, useRef } from 'react'
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
  
  // useRef로 컴포넌트 인스턴스 레벨에서 초기 로드 추적
  const hasTrackedInitialLoadRef = useRef(false)

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
      const now = Date.now()
      
      // sessionStorage를 먼저 확인하여 초기 로드인지 뒤로가기인지 구분
      const hasTrackedInSession = sessionStorage.getItem(sessionKey) === '1'
      
      // 초기 로드인 경우: sessionStorage와 useRef 모두 확인
      if (!hasTrackedInSession && !hasTrackedInitialLoadRef.current) {
        // sessionStorage를 먼저 설정 (동기적으로)
        sessionStorage.setItem(sessionKey, '1')
        
        // useRef도 설정
        hasTrackedInitialLoadRef.current = true
        
        // 설정 후 즉시 다시 확인하여 동시 실행 방지
        const recheckSession = sessionStorage.getItem(sessionKey) === '1'
        
        // sessionStorage가 설정되었고 useRef도 true이면 이벤트 전송
        // (동시 실행 시 한 번만 이벤트 전송)
        if (recheckSession && hasTrackedInitialLoadRef.current) {
          const detectedOS = detectOS()
          trackEvent('home_viewed', {
            os: detectedOS === 'ios' ? 'ios' : detectedOS === 'android' ? 'android' : 'other',
            is_initial_load: true, // 초기 진입 구분
          })
        }
        return
      }
      
      // 뒤로가기로 돌아온 경우: sessionKey가 있지만 useRef가 false인 경우
      if (hasTrackedInSession && !hasTrackedInitialLoadRef.current) {
        const detectedOS = detectOS()
        trackEvent('home_viewed', {
          os: detectedOS === 'ios' ? 'ios' : detectedOS === 'android' ? 'android' : 'other',
          is_initial_load: false, // 뒤로가기로 돌아온 경우 구분
        })
        return
      }
      
      // 그 외의 경우 (이미 추적됨): 무시 (중복 방지)
    }
  }, [currentPage])

  const handleCalendarClick = (type: CalendarType) => {
    setSelectedCalendarType(type)
    setCurrentPage('calendar-selection')
    // 뒤로가기 시 home_viewed 이벤트를 위해 useRef만 리셋
    // sessionStorage는 유지하여 초기 로드와 구분
    hasTrackedInitialLoadRef.current = false
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
