/**
 * QR 코드 데이터 형식 파서
 *
 * 지원하는 QR 형식:
 * - URL 형식: https://moducon.vibemakers.kr/checkin?type=session&id=00-01
 * - moducon://session/{sessionId}     (세션 QR)
 * - moducon://booth/{boothId}         (부스 QR)
 * - moducon://paper/{paperId}         (포스터 QR)
 * - checkin-session-{sessionId}       (세션 체크인)
 * - checkin-booth-{boothId}           (부스 방문 체크인)
 * - checkin-paper-{paperId}           (포스터 열람 체크인)
 * - quiz-{quizId}                     (퀴즈 QR)
 * - hidden-{hiddenId}                 (히든 배지 QR)
 */

export interface QRCodeData {
  type: 'session' | 'booth' | 'paper' | 'checkin' | 'quiz' | 'hidden' | 'registration';
  id: string;
  action: 'navigate' | 'record' | 'quiz' | 'badge' | 'registration';
  route?: string;
  data?: Record<string, unknown>;
}

/**
 * QR 코드 문자열을 파싱하여 타입과 ID 추출
 * @param qrData QR 코드 스캔 결과
 * @returns 파싱 결과 또는 null (유효하지 않은 경우)
 */
export function parseQRCode(qrData: string): QRCodeData | null {
  try {
    const trimmed = qrData.trim();

    // 0. URL 형식 파싱 (최우선)
    // 예: https://moducon.vibemakers.kr/checkin?type=session&id=00-01
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        const type = url.searchParams.get('type');
        const id = url.searchParams.get('id');

        if (type && id) {
          // registration 타입 처리
          if (type === 'registration') {
            return {
              type: 'registration',
              id,
              action: 'registration',
              route: '/login',
              data: { registrationId: id }
            };
          }

          // session, booth, paper 타입 처리
          if (['session', 'booth', 'paper'].includes(type)) {
            const routeMap: Record<string, string> = {
              session: 'sessions',
              booth: 'booths',
              paper: 'papers'
            };

            return {
              type: 'checkin',
              id,
              action: 'record',
              route: `/${routeMap[type]}/${id}?checkin=true`,
              data: { checkinType: type, targetId: id }
            };
          }
        }
      } catch {
        // URL 파싱 실패 시 다른 형식으로 계속 진행
      }
    }

    // 1. 체크인 QR 파싱 (우선순위: 높음)
    if (trimmed.startsWith('checkin-session-')) {
      const id = trimmed.replace('checkin-session-', '');
      return {
        type: 'checkin',
        id,
        action: 'record',
        route: `/sessions/${id}?checkin=true`,
        data: { checkinType: 'session', targetId: id }
      };
    }

    if (trimmed.startsWith('checkin-booth-')) {
      const id = trimmed.replace('checkin-booth-', '');
      return {
        type: 'checkin',
        id,
        action: 'record',
        route: `/booths/${id}?checkin=true`,
        data: { checkinType: 'booth', targetId: id }
      };
    }

    if (trimmed.startsWith('checkin-paper-')) {
      const id = trimmed.replace('checkin-paper-', '');
      return {
        type: 'checkin',
        id,
        action: 'record',
        route: `/papers/${id}?checkin=true`,
        data: { checkinType: 'paper', targetId: id }
      };
    }

    // 2. 퀴즈 QR 파싱
    if (trimmed.startsWith('quiz-')) {
      const id = trimmed.replace('quiz-', '');
      return {
        type: 'quiz',
        id,
        action: 'quiz',
        data: { quizId: id }
      };
    }

    // 3. 히든 배지 QR 파싱
    if (trimmed.startsWith('hidden-')) {
      const id = trimmed.replace('hidden-', '');
      return {
        type: 'hidden',
        id,
        action: 'badge',
        data: { hiddenId: id }
      };
    }

    // 4. moducon:// 프로토콜 (기본 라우팅)
    if (trimmed.startsWith('moducon://')) {
      const url = new URL(trimmed);

      if (url.protocol !== 'moducon:') {
        return null;
      }

      const [type, id] = url.pathname.split('/').filter(Boolean);

      if (!type || !id) {
        return null;
      }

      if (!['session', 'booth', 'paper'].includes(type)) {
        return null;
      }

      return {
        type: type as 'session' | 'booth' | 'paper',
        id: decodeURIComponent(id),
        action: 'navigate',
        route: `/${type}s/${decodeURIComponent(id)}`
      };
    }

    // 5. 레거시 포맷 지원 (부스 이름, 학회 이름 등)
    if (!trimmed.startsWith('/')) {
      // 부스 이름인 경우 (2025가 없고, Workshop이 없는 경우)
      if (!trimmed.includes('2025') && !trimmed.includes('Workshop')) {
        return {
          type: 'booth',
          id: trimmed,
          action: 'navigate',
          route: `/booths/${trimmed}`
        };
      }

      // 학회/포스터 이름인 경우
      if (trimmed.includes('2025') || trimmed.includes('Workshop')) {
        return {
          type: 'paper',
          id: trimmed,
          action: 'navigate',
          route: `/papers/${trimmed}`
        };
      }
    }

    return null;
  } catch (error) {
    console.error('QR 코드 파싱 오류:', error);
    return null;
  }
}

/**
 * QR 데이터로부터 라우트 경로 생성
 * @param qrData 파싱된 QR 데이터
 * @returns Next.js 라우트 경로
 */
export function getRouteFromQRData(qrData: QRCodeData): string {
  const { type, id } = qrData;

  switch (type) {
    case 'session':
      return `/sessions/${id}`;
    case 'booth':
      return `/booths/${id}`;
    case 'paper':
      return `/papers/${id}`;
    default:
      throw new Error(`Unknown QR type: ${type}`);
  }
}

/**
 * QR 데이터 생성 (관리자용)
 * @param type QR 타입
 * @param id 엔티티 ID
 * @returns QR 코드 문자열
 */
export function generateQRCode(type: 'session' | 'booth' | 'paper', id: string): string {
  return `moducon://${type}/${encodeURIComponent(id)}`;
}
