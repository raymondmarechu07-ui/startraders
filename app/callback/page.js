'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
export default function CallbackPage() {
  const params = useSearchParams(); const router = useRouter();
  useEffect(() => {
    if (params.get('success') === '1') router.replace('/dashboard');
    else if (params.get('error')) router.replace(`/?auth_error=${encodeURIComponent(params.get('error'))}`);
  }, [params, router]);
  return <main style={{ minHeight:'100vh', display:'grid', placeItems:'center', padding:24 }}><div className="load-card"><div className="spinner" style={{margin:'0 auto 16px'}}></div><h2>Completing your Deriv sign-in…</h2><p style={{color:'var(--text-2)',marginTop:8}}>Please wait while Star Traders securely connects your account.</p></div></main>;
}
