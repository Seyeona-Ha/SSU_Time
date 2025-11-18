import './HomeIOS.css';

interface HomeIOSProps {
  onCalendarClick: (type: 'apple' | 'google') => void;
}

function HomeIOS({ onCalendarClick }: HomeIOSProps) {
  return (
    <div className="home-ios">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-bar-left">
          <span className="time">9:41</span>
        </div>
        <div className="status-bar-right">
          <span className="signal">📶</span>
          <span className="wifi">📶</span>
          <span className="battery">🔋</span>
        </div>
      </div>
      
      <div className="home-content">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <h1 className="app-logo">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="5" fill="#FF0000"/>
                  <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="logo-text">ssutime</span>
            </h1>
            <button className="share-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="black"/>
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

          <div className="calendar-cards">
            <div className="calendar-card apple" onClick={() => onCalendarClick('apple')}>
              <div className="calendar-icon apple-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="black">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
                <div className="apple-logo-inside">🍎</div>
              </div>
              <p className="calendar-card-text">애플 캘린더에 추가하기</p>
            </div>

            <div className="calendar-card google" onClick={() => onCalendarClick('google')}>
              <div className="calendar-icon google-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
                <div className="google-logo-inside">G</div>
              </div>
              <p className="calendar-card-text">구글 캘린더에 추가하기</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <span className="users-icon">👥</span>
          <span className="users-text">현재 93명이 이용했어요</span>
        </div>
      </div>
    </div>
  );
}

export default HomeIOS;


