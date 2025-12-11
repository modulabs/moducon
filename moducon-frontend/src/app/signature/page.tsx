'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function SignatureForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/home';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const { user, updateUser } = useAuthStore();

  // Redirect if user is not logged in or already has a signature
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.has_signature) {
      router.push('/home');
    }
  }, [user, router]);

  // Prevent scrolling on touch devices while drawing
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    document.body.addEventListener('touchstart', preventScroll, { passive: false });
    document.body.addEventListener('touchend', preventScroll, { passive: false });
    document.body.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.removeEventListener('touchstart', preventScroll);
      document.body.removeEventListener('touchend', preventScroll);
      document.body.removeEventListener('touchmove', preventScroll);
    };
  }, [isDrawing]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setIsEmpty(false);
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const saveSignature = async () => {
    if (isEmpty) {
      alert('서명을 작성해주세요.');
      return;
    }
    if (!hasConsented) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSubmitting(true);
    try {
      const signatureData = canvas.toDataURL('image/png');
      await authAPI.saveSignature(signatureData);
      if (user) {
        updateUser({ ...user, has_signature: true });
      }
      router.push(redirectTo);
    } catch (error) {
      console.error('Failed to save signature:', error);
      alert('서명 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">디지털 서명 및 동의</CardTitle>
          <CardDescription>
            원활한 컨퍼런스 경험을 위해 개인정보 수집 및 이용에 동의하고 서명을 완료해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full h-64 rounded-lg border-2 border-dashed bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                이곳에 서명해주세요
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="consent" checked={hasConsented} onCheckedChange={(checked) => setHasConsented(!!checked)} />
            <Label htmlFor="consent" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              (필수) 개인정보 수집 및 이용에 동의합니다.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearSignature}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            다시 작성
          </Button>
          <Button
            type="button"
            onClick={saveSignature}
            className="w-full sm:flex-1"
            disabled={isSubmitting || isEmpty || !hasConsented}
          >
            {isSubmitting ? '저장 중...' : '동의 및 서명 완료'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignaturePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">로딩 중...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SignatureForm />
    </Suspense>
  );
}