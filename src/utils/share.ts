/**
 * 모바일 기기(iOS/Android)에서 Web Share API를 사용하여 공유 기능을 실행합니다.
 */
export async function share(): Promise<void> {
  const shareData: ShareData = {
    title: 'SSU Time - 학사 일정 추가 서비스',
    text: '흩어진 학사 일정을 모아 자동으로 캘린더에 추가할 수 있어요!',
    url: window.location.href,
  };

  try {
    // Web Share API 지원 확인
    if (navigator.share) {
      // 로고 이미지를 File 객체로 변환하여 공유에 포함 시도
      try {
        const logoResponse = await fetch('/logo.svg');
        if (!logoResponse.ok) throw new Error('로고 이미지를 찾을 수 없습니다');
        const logoBlob = await logoResponse.blob();
        const logoFile = new File([logoBlob], 'logo.svg', { type: 'image/svg+xml' });
        
        // files 속성이 지원되는 경우 이미지 포함
        if ('files' in navigator.share) {
          await navigator.share({
            ...shareData,
            files: [logoFile],
          } as ShareData & { files: File[] });
        } else {
          // files 속성이 지원되지 않으면 기본 공유
          await navigator.share(shareData);
        }
      } catch (imageError) {
        // 이미지 로드 실패 시 기본 공유
        console.warn('이미지 로드 실패, 기본 공유 진행:', imageError);
        await navigator.share(shareData);
      }
    } else {
      // Fallback: 클립보드에 복사
      await navigator.clipboard.writeText(shareData.url);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  } catch (error) {
    // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('공유 실패:', error);
      // 에러 발생 시 클립보드에 복사 시도
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('링크가 클립보드에 복사되었습니다.');
      } catch (clipboardError) {
        console.error('클립보드 복사 실패:', clipboardError);
      }
    }
  }
}

