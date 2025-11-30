import { useMemo, useState, useEffect, useRef } from 'react';
import './CalendarSelection.css';
import requiredBadge from '../assets/required-badge.svg';
import { share } from '../utils/share';
import { detectOS } from '../utils/detectOS';
import { trackEvent, identifyUser } from '../utils/mixpanel';

interface CalendarSelectionProps {
  calendarType: 'apple' | 'google';
  onBack: () => void;
  onAdd: (selectedCategories: string[]) => void;
}

interface CalendarItem {
  text: string;
}

interface CalendarCategory {
  id: string;
  name: string;
  description: string;
  detailTitle: string;
  items: CalendarItem[];
}

function CalendarSelection({ calendarType, onBack, onAdd }: CalendarSelectionProps) {
  const os = useMemo(() => detectOS(), []);

  const handleShare = async () => {
    trackEvent('share_click_selection', {
      os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'web',
      provider: calendarType === 'apple' ? 'apple' : 'google',
    });
    await share();
  };
  // 캘린더 카테고리 데이터
  const categories: CalendarCategory[] = [
    {
      id: '1',
      name: '기본 학사일정',
      description: '수강신청, 중간고사, 기말고사 등 학사 관련 일정을 추가할 수 있습니다.',
      detailTitle: '아래 일정이 추가돼요!',
      items: [
        { text: '교내 학사 캘린더 일정' },
        { text: '국가・교내 장학금' },
      ]
    },
    {
      id: '2',
      name: '장학 일정',
      description: '등록금 납부 기간 및 관련 일정을 추가할 수 있습니다.',
      detailTitle: '아래 일정이 추가돼요!',
      items: [
        { text: '주요 장학 일정' },
      ]
    },
    {
      id: '3',
      name: '교내 행사 일정',
      description: '학교 행사 및 주요 공지사항 일정을 추가할 수 있습니다.',
      detailTitle: '아래 일정이 추가돼요!',
      items: [
        { text: '총학생회 공지 이벤트 일정' },
      ]
    }
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>(['1']); // 기본 학사일정 자동 선택
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]); // 모든 카테고리를 닫힌 상태로 시작
  const selectedCategoriesRef = useRef(selectedCategories);
  
  // selectedCategories가 변경될 때마다 ref 업데이트
  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);

  // calendar_selection_viewed 이벤트 트래킹
  useEffect(() => {
    trackEvent('calendar_selection_viewed', {
      os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'web',
      provider: calendarType === 'apple' ? 'apple' : 'google',
    });
  }, [os, calendarType]);

  /**
   * 선택된 카테고리 조합에 따라 캘린더 URL을 매핑합니다.
   * key는 카테고리 ID를 정렬해 쉼표로 연결한 문자열입니다.
   */
  const calendarCombinationUrls: Record<string, { apple?: string; google?: string }> = {
    // 기본형&장학형&행사형 (ALL)
    '1,2,3': {
      apple: 'webcal://ssu-time-crawler-output.s3.ap-northeast-2.amazonaws.com/merged/merged_all.ics',
      google: 'https://calendar.google.com/calendar/u/0/render?cid=6vq8mejv3c2c36576tqk7veh8m80oh6v@import.calendar.google.com'
    },
    // 기본형만 선택했을 때
    '1': {
      apple: 'webcal://ssu-time-crawler-output.s3.ap-northeast-2.amazonaws.com/merged/merged_standard.ics',
      google: 'https://calendar.google.com/calendar/u/0/render?cid=qn4kvnnp835euccq6pdh3se8qqi791ti@import.calendar.google.com'
    },
    // 장학형만 선택했을 때
    '2': {
      apple: 'webcal://ssu-time-crawler-output.s3.ap-northeast-2.amazonaws.com/merged/merged_scholarship.ics',
      google: 'https://calendar.google.com/calendar/u/0/render?cid=50pg1o9jp22h1q67arkr324vq1uslgnf@import.calendar.google.com'
    },
    // 행사형만 선택했을 때
    '3': {
      apple: 'webcal://ssu-time-crawler-output.s3.ap-northeast-2.amazonaws.com/merged/merged_event.ics',
      google: 'https://calendar.google.com/calendar/u/0/render?cid=3fbu9qde17u224b69bssv1fimtfi5dju@import.calendar.google.com'
    },
    // 기본형&장학형
    '1,2': {
      apple: 'webcal://ssu-time-crawler-output.s3.ap-northeast-2.amazonaws.com/merged/merged_standard_scholarship.ics',
      google: 'https://calendar.google.com/calendar/u/0/render?cid=h3pr9s3ah9ukqi0t0nqq6o4uaj8n7auh@import.calendar.google.com'
    },
    // 기본형&행사형
    '1,3': {
      apple: 'webcal://ssu-time-crawler-output.s3.ap-northeast-2.amazonaws.com/merged/merged_standard_event.ics',
      google: 'https://calendar.google.com/calendar/u/0/render?cid=e9lkkk7nl6eqo809heol1jevg695t52e@import.calendar.google.com'
    },
    // 장학형&행사형
    '2,3': {
      apple: 'webcal://ssu-time-crawler-output.s3.ap-northeast-2.amazonaws.com/merged/merged_scholarship_event.ics',
      google: 'https://calendar.google.com/calendar/u/0/render?cid=364n62j1hcf268fi4hbsurpuh55d2250@import.calendar.google.com'
    }
  };

  const getCombinationKey = (categoryIds: string[]) =>
    [...categoryIds].sort().join(',');

  const toggleExpandCategory = (categoryId: string) => {
    // 클릭 후 상태를 미리 계산 (현재는 닫혀있으면 열리고, 열려있으면 닫힘)
    const willBeExpanded = !expandedCategories.includes(categoryId);
    
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    
    // category_expand_click 이벤트 트래킹
    // 카테고리 ID를 calendar_category로 변환: '1' = "standard", '2' = "scholarship", '3' = "event"
    const categoryMap: Record<string, string> = {
      '1': 'standard',
      '2': 'scholarship',
      '3': 'event',
    };
    const calendarCategory = categoryMap[categoryId] || 'standard';
    
    trackEvent('category_expand_click', {
      os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'web',
      provider: calendarType === 'apple' ? 'apple' : 'google',
      calendar_category: calendarCategory,
      is_expanded: willBeExpanded,
    });
  };

  const toggleSelectCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 클릭 후 상태를 미리 계산 (현재는 선택되어있으면 해제되고, 해제되어있으면 선택됨)
    const willBeSelected = !selectedCategories.includes(categoryId);
    
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    
    // category_toggle_click 이벤트 트래킹
    // 카테고리 ID를 calendar_category로 변환: '1' = "standard", '2' = "scholarship", '3' = "event"
    const categoryMap: Record<string, string> = {
      '1': 'standard',
      '2': 'scholarship',
      '3': 'event',
    };
    const calendarCategory = categoryMap[categoryId] || 'standard';
    
    trackEvent('category_toggle_click', {
      os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'web',
      provider: calendarType === 'apple' ? 'apple' : 'google',
      calendar_category: calendarCategory,
      is_selected: willBeSelected,
    });
  };


  const handleAdd = async () => {
    if (selectedCategories.length > 0) {
      // calendar_create_click 이벤트 트래킹
      trackEvent('calendar_create_click', {
        os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'web',
        provider: calendarType === 'apple' ? 'apple' : 'google',
        option_basic: selectedCategories.includes('1'),
        option_scholarship: selectedCategories.includes('2'),
        option_event: selectedCategories.includes('3'),
      });
      
      // onAdd 콜백 호출
      onAdd(selectedCategories);
      
      try {
        // 카테고리 ID를 백엔드 형식으로 변환
        const categoryMap: Record<string, string> = {
          '1': 'STANDARD',
          '2': 'SCHOLARSHIP',
          '3': 'EVENT',
        };
        const backendCategories = selectedCategories
          .map(id => categoryMap[id])
          .filter(Boolean) as string[];
        
        // 백엔드 API 호출
        const response = await fetch('https://api.ssutime.yourssu.com/api/v1/calendar/subscribe-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': navigator.userAgent, // OS 정보 수집용
          },
          body: JSON.stringify({
            categories: backendCategories,
            provider: calendarType === 'apple' ? 'apple' : 'google',
          }),
        });
        
        if (response.status === 201) {
          // Location 헤더에서 구독 URL 및 userId 가져오기
          const location = response.headers.get('Location');
          if (location) {
            // Location 헤더에서 userId 추출: /api/v1/calendar/{userId}
            const userIdMatch = location.match(/\/api\/v1\/calendar\/([^\/]+)/);
            if (userIdMatch && userIdMatch[1]) {
              const userId = userIdMatch[1];
              // Mixpanel distinctId 설정 (백엔드와 통일)
              identifyUser(userId);
            }
            
            // 상대 경로인 경우 절대 경로로 변환
            const calendarUrl = location.startsWith('http')
              ? location
              : `https://api.ssutime.yourssu.com${location}`;
            
            // Android 딥링크 처리
            if (calendarType === 'google' && os === 'android') {
              const googleIntentTarget = calendarUrl.replace(/^https?:\/\//, '');
              const fallbackEncoded = encodeURIComponent(calendarUrl);
              const androidDeepLink = `intent://${googleIntentTarget}#Intent;scheme=https;package=com.google.android.calendar;S.browser_fallback_url=${fallbackEncoded};end`;
              window.location.href = androidDeepLink;
              return;
            }
            
            window.location.href = calendarUrl;
            return;
          }
        }
        
        // API 호출 실패 시 기존 하드코딩된 URL로 폴백
        throw new Error('API 호출 실패');
      } catch (error) {
        console.error('백엔드 API 호출 실패, 하드코딩된 URL로 폴백:', error);
        
        // 기존 하드코딩된 URL 로직 (폴백)
        const combinationKey = getCombinationKey(selectedCategories);
        const combination = calendarCombinationUrls[combinationKey];

        const calendarUrl =
          combination?.[calendarType] ??
          (calendarType === 'apple'
            ? 'https://calendar.apple.com/add'
            : 'https://calendar.google.com/calendar/render');
        
        if (calendarType === 'google' && os === 'android') {
          const googleIntentTarget = calendarUrl.replace(/^https?:\/\//, '');
          const fallbackEncoded = encodeURIComponent(calendarUrl);
          const androidDeepLink = `intent://${googleIntentTarget}#Intent;scheme=https;package=com.google.android.calendar;S.browser_fallback_url=${fallbackEncoded};end`;
          window.location.href = androidDeepLink;
          return;
        }
        
        window.location.href = calendarUrl;
      }
    }
  };

  return (
    <div className="calendar-selection">
      <div className="calendar-selection-content">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <button className="back-button" onClick={() => {
              trackEvent('back_click', {
                os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'web',
                provider: calendarType === 'apple' ? 'apple' : 'google',
              });
              onBack();
            }} aria-label="이전">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="share-button" aria-label="공유" onClick={handleShare}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="#000000"/>
              </svg>
            </button>
          </div>
          <h1 className="page-title">
            원하는 학사일정을<br />모두 캘린더에 추가하세요
          </h1>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="calendar-categories">
            {categories.map(category => {
              const isSelected = selectedCategories.includes(category.id);
              const isExpanded = expandedCategories.includes(category.id);
              
              return (
                <div key={category.id} className={`category-item ${isExpanded ? 'expanded' : ''}`}>
                  <div 
                    className="category-header"
                    onClick={() => toggleExpandCategory(category.id)}
                  >
                    {/* 체크박스 */}
                    <button
                      className={`checkbox-button ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => toggleSelectCategory(category.id, e)}
                      aria-label={isSelected ? `${category.name} 선택 해제` : `${category.name} 선택`}
                    >
                      {isSelected && (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="18" height="18" rx="6" fill="#FE2B27"/>
                          <path d="M5 9L7.32843 11.3284L13 5.67157" stroke="white" strokeWidth="1.77469" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {!isSelected && (
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="0.5" y="0.5" width="16" height="16" rx="5.5" stroke="#9C9C9C"/>
                        </svg>
                      )}
                    </button>
                    
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      {category.id === '1' && (
                        <img 
                          src={requiredBadge} 
                          alt="필수" 
                          className="required-badge"
                        />
                      )}
                    </div>
                    
                    {/* 오른쪽 화살표 - 확장 시 아래로 회전 */}
                    <div className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="#7D7D7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* 확장된 상세 설명 */}
                  {isExpanded && (
                    <div className="category-detail">
                      <p className="detail-title">{category.detailTitle}</p>
                      <ul className="detail-items">
                        {category.items.map((item, index) => (
                          <li key={index} className="detail-item">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="detail-check-icon">
                              <path d="M4.33333 9.83333L7 12.5L13.6667 5.83333" stroke="#9C9C9C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="detail-item-text">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <button
            className={`add-button ${selectedCategories.length === 0 ? 'disabled' : ''}`}
            onClick={handleAdd}
            disabled={selectedCategories.length === 0}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarSelection;

