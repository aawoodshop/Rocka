'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          if (data.user.hasPaid) {
            router.push('/dashboard');
          }
        }
      });
  }, [router]);

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout_sessions', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-dark">
      <div className="panel animate-fade-in text-center max-w-lg w-full" style={{ padding: '3rem 2rem' }}>
        <h1 className="heading-1 mb-4">Unlock Premium Access</h1>
        <p className="text-muted mb-8" style={{ fontSize: '1.1rem', lineHeight: 1.5 }}>
          Get unrestricted access to the complete stock dashboard, including real-time mock tracking across ALL US equities, HILO trend analysis, and custom watchlists.
        </p>

        <div className="flex-col gap-4 p-8 mb-8" style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h2 className="heading-2">Yearly Plan</h2>
          <div className="text-buy font-bold" style={{ fontSize: '3rem', margin: '1rem 0' }}>
            $179<span className="text-muted text-sm font-normal">/year</span>
          </div>
          <ul className="text-left text-muted mb-4 flex-col gap-2" style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
            <li>Track over 7,000+ US Stocks</li>
            <li>Advanced HILO momentum indicator</li>
            <li>Unlimited custom watchlists</li>
            <li>Zero ads or interruptions</li>
          </ul>
        </div>

        <button 
          onClick={handleSubscribe} 
          disabled={isLoading}
          className="btn btn-primary w-full" 
          style={{ padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center' }}
        >
          {isLoading ? 'Processing...' : user ? 'Subscribe Now' : 'Create Account to Subscribe'}
        </button>

        {!user && (
          <p className="text-muted text-sm mt-6">
            Already have an account? <Link href="/login" className="text-buy">Log in here</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
