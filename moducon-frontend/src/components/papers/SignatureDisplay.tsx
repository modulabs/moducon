'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface SignatureDisplayProps {
  authorName: string;
  className?: string;
}

export default function SignatureDisplay({ authorName, className = '' }: SignatureDisplayProps) {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSignature = async () => {
      // 작가 이름에서 서명 검색 시도
      // 실제 구현에서는 papers 데이터에 phone_last4 정보가 없으므로
      // 임시로 하드코딩된 데이터를 사용
      const testData: { [key: string]: string } = {
        '조해창': '1234', // 예시 데이터
        '김현': '5678', // 예시 데이터
      };

      const phone_last4 = testData[authorName];
      if (!phone_last4) {
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const result = await authAPI.getSignatureByUser(authorName, phone_last4);
        if (result && result.signature_data) {
          setSignatureData(result.signature_data);
        }
      } catch (err) {
        console.error('Failed to load signature:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (authorName) {
      loadSignature();
    }
  }, [authorName]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !signatureData) {
    return (
      <div className={`flex items-center justify-center text-gray-400 text-xs ${className}`}>
        -
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={signatureData}
        alt={`${authorName} 서명`}
        className="max-h-12 w-auto object-contain"
        style={{ filter: 'contrast(1.2)' }}
      />
    </div>
  );
}