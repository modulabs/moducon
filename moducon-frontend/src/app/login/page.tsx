'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  phone_last4: z.string().length(4, '전화번호 뒷 4자리를 입력해주세요'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [expiredMessage, setExpiredMessage] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/home';

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setExpiredMessage(true);
    }
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const result = await authAPI.login(data.name, data.phone_last4);
      login(result.token, result.user);

      // Check if signature is required
      if (!result.user.has_signature) {
        router.push('/signature');
      } else {
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다';
      setError(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">모두콘 2025 디지털 컨퍼런스 북</CardTitle>
        <CardDescription>사전 신청 시 등록한 정보로 로그인해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="홍길동"
              {...register('name')}
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone_last4">전화번호 뒷 4자리</Label>
            <Input
              id="phone_last4"
              placeholder="1234"
              maxLength={4}
              {...register('phone_last4')}
              className="mt-1"
            />
            {errors.phone_last4 && (
              <p className="mt-1 text-sm text-red-500">{errors.phone_last4.message}</p>
            )}
          </div>

          {expiredMessage && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                로그인이 만료되었습니다. 다시 로그인해주세요.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '입장하기'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          사전 신청을 하지 않으셨나요? 현장 등록 데스크에 문의해주세요.
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">로딩 중...</p>
          </CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
