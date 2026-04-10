'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
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
        <h2 className="heading-2" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
        <p className="text-muted" style={{ marginBottom: '2rem', textAlign: 'center' }}>Join to unlock premium market tools</p>
        
        {error && <div className="bg-sell" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              className="form-input" 
              placeholder="John Doe" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>

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
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-muted text-sm" style={{ marginTop: '2rem', textAlign: 'center' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
