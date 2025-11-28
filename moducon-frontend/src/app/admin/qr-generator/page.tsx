'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { generateQRCode } from '@/lib/qrParser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function QRGeneratorPage() {
  const [type, setType] = useState<'session' | 'booth' | 'paper'>('booth');
  const [id, setId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!id.trim()) {
      alert('ID를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const data = generateQRCode(type, id.trim());
      const url = await QRCode.toDataURL(data, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrUrl(url);
    } catch (error) {
      console.error('QR 코드 생성 오류:', error);
      alert('QR 코드 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrUrl) return;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${type}-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          QR 코드 생성
        </h1>

        <div className="space-y-6">
          {/* 타입 선택 */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              QR 타입
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setType('session')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  type === 'session'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                📅 세션
              </button>
              <button
                onClick={() => setType('booth')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  type === 'booth'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🏢 부스
              </button>
              <button
                onClick={() => setType('paper')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  type === 'paper'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                📄 포스터
              </button>
            </div>
          </div>

          {/* ID 입력 */}
          <div>
            <Label htmlFor="qr-id" className="text-base font-semibold mb-3 block">
              ID 입력
            </Label>
            <Input
              id="qr-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={
                type === 'session'
                  ? 'track1-session1'
                  : type === 'booth'
                  ? '클라비'
                  : 'cvpr2024-001'
              }
              className="text-base p-3"
            />
            <p className="mt-2 text-sm text-gray-600">
              {type === 'session' && '예시: track1-session1, keynote-opening'}
              {type === 'booth' && '예시: 클라비, K-HP, 모두의연구'}
              {type === 'paper' && '예시: cvpr2024-001, neurips2024-poster-5'}
            </p>
          </div>

          {/* 생성 버튼 */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !id.trim()}
            className="w-full py-6 text-lg font-semibold"
          >
            {loading ? '생성 중...' : 'QR 코드 생성'}
          </Button>

          {/* QR 코드 미리보기 */}
          {qrUrl && (
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xl font-semibold text-center">생성된 QR 코드</h2>
              <div className="bg-gray-50 p-6 rounded-lg flex justify-center">
                <img src={qrUrl} alt="Generated QR Code" className="w-80 h-80" />
              </div>

              {/* 정보 표시 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>타입:</strong>{' '}
                  {type === 'session' ? '세션' : type === 'booth' ? '부스' : '포스터'}
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <strong>ID:</strong> {id}
                </p>
                <p className="text-sm text-blue-900 mt-1 break-all">
                  <strong>QR 데이터:</strong> {generateQRCode(type, id)}
                </p>
              </div>

              {/* 다운로드 버튼 */}
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full py-4 text-base font-semibold"
              >
                📥 QR 코드 다운로드
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <p className="text-sm text-yellow-900">
          <strong>💡 사용 방법:</strong> QR 코드를 생성한 후 다운로드하여 부스, 세션, 포스터에 부착하세요.
          참가자가 QR 코드를 스캔하면 자동으로 해당 페이지로 이동합니다.
        </p>
      </div>
    </div>
  );
}
