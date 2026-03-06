'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link. No token provided.');
      return;
    }

    const confirmEmail = async () => {
      try {
        // For email confirmation, we verify the OTP token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) {
          // Try magic link type as fallback
          const { error: magicError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'magiclink',
          });

          if (magicError) {
            console.error('Confirmation error:', magicError);
            setStatus('error');
            setMessage('Confirmation failed. The link may have expired.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully!');
          }
        } else {
          setStatus('success');
          setMessage('Email confirmed successfully!');
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Confirming your email...</h1>
          <p className="text-muted-foreground">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Email Confirmed!</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
