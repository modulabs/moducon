'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquareHeart, MapPin } from 'lucide-react';

const SURVEY_URL = 'https://forms.gle/xAja9Y5pyuhE3U4GA';
const POPUP_INTERVAL = 60 * 60 * 1000; // 1시간
const STORAGE_KEY = 'moducon_survey_popup_last';

export default function SurveyPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAndShowPopup = () => {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (!lastShown || now - parseInt(lastShown) >= POPUP_INTERVAL) {
        // 첫 방문 시 3초 후에 표시, 이후는 바로 표시
        const delay = lastShown ? 0 : 3000;
        setTimeout(() => {
          setIsVisible(true);
          localStorage.setItem(STORAGE_KEY, now.toString());
        }, delay);
      }
    };

    checkAndShowPopup();

    // 1시간마다 체크
    const interval = setInterval(checkAndShowPopup, POPUP_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSurveyClick = () => {
    window.open(SURVEY_URL, '_blank');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] p-4 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">모두콘 2025</h2>
              <p className="text-white/80 text-sm">즐거운 시간 보내고 계신가요?</p>
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-5 space-y-4">
          {/* 만족도 조사 */}
          <div className="text-center">
            <p className="text-gray-700 mb-3">
              모두콘에 대한 의견을 들려주세요!<br/>
              <span className="text-sm text-gray-500">소중한 피드백이 됩니다</span>
            </p>
            <button
              onClick={handleSurveyClick}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg"
            >
              만족도 조사 참여하기
            </button>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-100" />

          {/* 포스터 안내 */}
          <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">포스터 전시 안내</p>
              <p className="text-sm text-blue-700">
                논문 포스터는 <span className="font-bold">지하 2층</span>에서 볼 수 있습니다!
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-5 pb-4">
          <button
            onClick={handleClose}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
