'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = params.get('success');
    const error = params.get('error');

    if (success === '1') {
      const timer = setTimeout(() => router.replace('/dashboard'), 900);
      return () => clearTimeout(timer);
    }

    if (error) {
      router.replace(`/?auth_error=${encodeURIComponent(error)}`);
    }
  }, [params, router]);

  return (
    <LoadingScreen
      message="Completing your Deriv sign-in..."
      indeterminate
    />
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen message="Completing your Deriv sign-in..." indeterminate />
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
