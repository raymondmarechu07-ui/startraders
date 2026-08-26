'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = params.get('success');
    const error = params.get('error');

    if (success === '1') {
      router.replace('/dashboard');
    } else if (error) {
      router.replace(`/?auth_error=${encodeURIComponent(error)}`);
    }
  }, [params, router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <div className="load-card">
        <div
          className="spinner"
          style={{ margin: '0 auto 16px' }}
        ></div>

        <h2>Completing your Deriv sign-in…</h2>

        <p
          style={{
            color: 'var(--text-2)',
            marginTop: 8,
          }}
        >
          Please wait while Star Traders securely connects your account.
        </p>
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
          }}
        >
          <div className="load-card">
            <div
              className="spinner"
              style={{ margin: '0 auto 16px' }}
            ></div>

            <h2>Completing your Deriv sign-in…</h2>

            <p
              style={{
                color: 'var(--text-2)',
                marginTop: 8,
              }}
            >
              Please wait while Star Traders securely connects your account.
            </p>
          </div>
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
