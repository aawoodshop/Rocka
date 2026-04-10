'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ padding: '1.5rem' }}>
      <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="heading-2" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <p className="text-muted" style={{ marginBottom: '2rem', textAlign: 'center' }}>Log in to access your dashboard</p>
        
        {error && <div className="bg-sell" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="you@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-muted text-sm" style={{ marginTop: '2rem', textAlign: 'center' }}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
