/**
 * QR 코드 데이터 형식 파서
 *
 * 지원하는 QR 형식:
 * - moducon://session/{sessionId}  (세션 QR)
 * - moducon://booth/{boothId}      (부스 QR)
 * - moducon://paper/{paperId}      (포스터 QR)
 */

export interface QRCodeData {
  type: 'session' | 'booth' | 'paper';
  id: string;
}

/**
 * QR 코드 문자열을 파싱하여 타입과 ID 추출
 * @param qrData QR 코드 스캔 결과
 * @returns 파싱 결과 또는 null (유효하지 않은 경우)
 */
export function parseQRCode(qrData: string): QRCodeData | null {
  try {
    const trimmed = qrData.trim();

    // moducon:// 프로토콜 확인
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
        id: decodeURIComponent(id)
      };
    }

    // 레거시 포맷 지원 (부스 이름, 학회 이름 등)
    // 이전 QR 코드와 호환성 유지
    if (!trimmed.startsWith('/')) {
      // 부스 이름인 경우 (2025가 없고, Workshop이 없는 경우)
      if (!trimmed.includes('2025') && !trimmed.includes('Workshop')) {
        return {
          type: 'booth',
          id: trimmed
        };
      }

      // 학회/포스터 이름인 경우
      if (trimmed.includes('2025') || trimmed.includes('Workshop')) {
        return {
          type: 'paper',
          id: trimmed
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
