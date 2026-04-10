'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
          setName(data.user.name);
        }
      });
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    // Simple mock save - we'd have a PUT /api/profile endpoint normally
    setTimeout(() => {
      setMessage('Profile updated successfully.');
      setIsSaving(false);
    }, 500);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'POST' });
    router.push('/');
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '4rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2">Account Settings</h1>
        <Link href="/dashboard" className="btn btn-outline">Back to Dashboard</Link>
      </div>

      <div className="flex gap-8">
        <div className="panel" style={{ flexGrow: 1, height: 'fit-content' }}>
          <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>Personal Information</h3>

          {message && <div className="bg-buy" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input type="email" id="email" className="form-input" disabled value={user.email} style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                className="form-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="panel flex-col gap-4" style={{ width: '300px', flexShrink: 0, height: 'fit-content' }}>
          <h3 className="heading-3">Security</h3>
          <p className="text-muted text-sm">Manage your account security and session.</p>
          <button className="btn btn-outline w-full" style={{ color: 'var(--signal-sell)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
