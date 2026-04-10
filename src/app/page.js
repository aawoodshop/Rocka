'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-page flex-col items-center justify-center w-full min-h-screen">
      <nav className="flex justify-between items-center w-full p-6 container" style={{ position: 'absolute', top: 0 }}>
        <div className="logo heading-3">
          <span style={{ color: 'var(--accent-blue)' }}>Stock</span>Dash
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="btn btn-outline">Log In</Link>
          <Link href="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <div className="hero container flex-col items-center justify-center pt-24" style={{ textAlign: 'center', maxWidth: "800px", margin: "0 auto" }}>
        <h1 className="heading-1 animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          Master the Markets with <span style={{ color: 'var(--accent-blue)' }}>HILO Intelligence</span>
        </h1>
        <p className="text-lg text-muted animate-fade-in animate-delay-1" style={{ marginBottom: '2.5rem' }}>
          Search top stocks, track your favorites, and visualize clear buy and sell moments through advanced yet intuitive HILO indicators. A premium dashboard, built for everyone.
        </p>

        <div className="flex gap-4 justify-center animate-fade-in animate-delay-2">
          <Link href="/signup" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Get Started Now
          </Link>
          <Link href="/login" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Access Dashboard
          </Link>
        </div>

        <div className="disclaimer animate-fade-in animate-delay-3" style={{ marginTop: '4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          * Disclaimer: The HILO indicators and stock market data provided by this tool are for educational and demonstrative purposes only and do not constitute financial advice. Mock data is used for demonstration.
        </div>
      </div>
    </div>
  );
}
