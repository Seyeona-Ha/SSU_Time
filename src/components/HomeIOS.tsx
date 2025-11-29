import { useEffect, useState } from 'react';
import './HomeIOS.css';
import logoSvg from '../assets/logo.svg';
import appleCalendarCard from '../assets/apple-calendar-card.svg';
import googleCalendarCard from '../assets/google-calendar-card.svg';
import usersGroupSvg from '../assets/users-group.svg';
import { share } from '../utils/share';
import { trackVisitor, getCurrentVisitorCount } from '../utils/visitorCount';
import { trackEvent } from '../utils/mixpanel';
import { detectOS } from '../utils/detectOS';

interface HomeIOSProps {
  onCalendarClick: (type: 'apple' | 'google') => void;
}

function HomeIOS({ onCalendarClick }: HomeIOSProps) {
  const [visitorCount, setVisitorCount] = useState<number | null>(null); // 초기값 null

  useEffect(() => {
    // home_viewed 이벤트 트래킹
    const os = detectOS();
    trackEvent('home_viewed', {
      os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'other',
    });

    // 컴포넌트가 마운트될 때마다 방문자 수 추적 및 가져오기
    // 처음 방문한 경우에만 카운트 증가, 이미 방문한 경우 최신 카운트만 가져오기
    trackVisitor().then(count => {
      setVisitorCount(count);
    }).catch(error => {
      console.error('방문자 수 가져오기 실패:', error);
      // 에러 발생 시 최신 카운트만 가져오기 시도
      getCurrentVisitorCount().then(count => {
        setVisitorCount(count);
      }).catch(() => {
        setVisitorCount(0);
      });
    });
  }, []);

  const handleShare = async () => {
    const os = detectOS();
    trackEvent('share_click_home', {
      os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'other',
    });
    await share();
  };
  return (
    <div className="home-ios">
      <div className="home-content">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            {/* Logo SVG로 교체 - 기존 로고 아이콘 + 텍스트 대신 */}
            <img src={logoSvg} alt="ssutime logo" className="header-logo" />
            <button className="share-button" aria-label="공유" onClick={handleShare}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="#000000"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="info-section">
            <h2 className="info-title">흩어진 학사 일정을 모아</h2>
            <h2 className="info-title">자동으로 캘린더에 추가할 수 있어요</h2>
            <p className="info-subtitle">추가하고 싶은 캘린더를 선택하세요</p>
          </div>

          {/* Calendar Cards - 애플 캘린더와 구글 캘린더 나란히 배치 */}
          <div className="calendar-card-wrapper">
            <img 
              src={appleCalendarCard} 
              alt="애플 캘린더에 추가하기" 
              className="apple-calendar-card"
              onClick={() => {
                const os = detectOS();
                trackEvent('calendar_apple_click', {
                  os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'other',
                });
                onCalendarClick('apple');
              }}
            />
            <img 
              src={googleCalendarCard} 
              alt="구글 캘린더에 추가하기" 
              className="google-calendar-card"
              onClick={() => {
                const os = detectOS();
                trackEvent('calendar_google_click', {
                  os: os === 'ios' ? 'ios' : os === 'android' ? 'android' : 'other',
                });
                onCalendarClick('google');
              }}
            />
          </div>
          {/* Footer - 캘린더 카드 바로 아래 위치 */}
          <div className="footer">
            <img src={usersGroupSvg} alt="사용자 그룹" className="users-icon" />
            <span className="users-text">
              {visitorCount !== null ? `현재 ${visitorCount}명이 이용했어요` : '로딩 중...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeIOS;
