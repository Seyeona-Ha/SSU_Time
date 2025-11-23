import { useState } from 'react';
import './CalendarSelection.css';
import requiredBadge from '../assets/required-badge.svg';
import { share } from '../utils/share';

interface CalendarSelectionProps {
  calendarType: 'apple' | 'google';
  onBack: () => void;
  onAdd: (selectedCategories: string[]) => void;
  isMobile?: boolean;
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

function CalendarSelection({ calendarType, onBack, onAdd, isMobile = false }: CalendarSelectionProps) {
  const handleShare = async () => {
    if (isMobile) {
      await share();
    }
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
      name: '교내 행사 일정',
      description: '학교 행사 및 주요 공지사항 일정을 추가할 수 있습니다.',
      detailTitle: '아래 일정이 추가돼요!',
      items: [
        { text: '총학생회 공지 이벤트 일정' },
      ]
    },
    {
      id: '3',
      name: '장학 일정',
      description: '등록금 납부 기간 및 관련 일정을 추가할 수 있습니다.',
      detailTitle: '아래 일정이 추가돼요!',
      items: [
        { text: '주요 장학 일정' },
      ]
    }
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSelectCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };


  const handleAdd = () => {
    if (selectedCategories.length > 0) {
      // onAdd 콜백 호출
      onAdd(selectedCategories);
      
      // 애플 캘린더 또는 구글 캘린더에 따라 다른 URL로 이동
      // 실제 구현 시 선택된 카테고리 정보와 함께 URL 파라미터로 전달
      const calendarUrl = calendarType === 'apple' 
        ? 'https://calendar.apple.com/add' 
        : 'https://calendar.google.com/calendar/render';
      
      // 선택된 카테고리 정보와 함께 URL로 이동
      window.location.href = calendarUrl;
    }
  };

  return (
    <div className="calendar-selection">
      <div className="calendar-selection-content">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <button className="back-button" onClick={onBack} aria-label="이전">
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

