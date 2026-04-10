'use client';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [timeframe, setTimeframe] = useState('1Y');
  const [trendInfo, setTrendInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const filteredStockData = useMemo(() => {
    if (!stockData || stockData.length === 0) return [];
    switch (timeframe) {
      case '1D': return stockData.slice(-2);
      case '5D': return stockData.slice(-5);
      case '1M': return stockData.slice(-22);
      case '6M': return stockData.slice(-130);
      case 'YTD': {
        const currentYear = new Date().getFullYear();
        const idx = stockData.findIndex(d => parseInt(d.time.split('-')[0]) === currentYear);
        return idx !== -1 ? stockData.slice(idx) : stockData;
      }
      case '1Y':
      default:
        return stockData;
    }
  }, [stockData, timeframe]);

  // Initial load & Subscription Check
  useEffect(() => {
    const checkAuthAndSession = async () => {
      const sessionId = searchParams.get('session_id');

      // 1. If recovering from a checkout redirect, verify the payment first
      if (sessionId) {
        try {
          await fetch('/api/checkout_sessions/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          // Remove from URL so we don't re-verify on refresh
          window.history.replaceState({}, '', '/dashboard');
        } catch (err) {
          console.error('Session verify error:', err);
        }
      }

      // 2. Fetch User State
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (!data.user) {
            router.push('/login');
          } else if (!data.user.hasPaid) {
            router.push('/pricing'); // Paywall!
          } else {
            setUser(data.user);
            loadFavorites();
            loadStock('AAPL'); // Default fallback stock
          }
        });
    };

    checkAuthAndSession();
  }, [router, searchParams]);

  const loadFavorites = async () => {
    const res = await fetch('/api/favorites');
    const data = await res.json();
    setFavorites(data || []);
  };

  const loadStock = async (symbol) => {
    setIsLoading(true);
    setSearchQuery('');
    setSearchResults([]);
    try {
      const res = await fetch(`/api/stocks/${symbol}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setSelectedStock({ symbol: data.symbol, name: data.name });
      setStockData(data.data);
    } catch {
      // In case fallback or clicked stock fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 0) {
      const res = await fetch(`/api/stocks/search?q=${q}`);
      const data = await res.json();
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddFavorite = async (symbol, name) => {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, companyName: name })
    });
    loadFavorites();
  };

  const handleRemoveFavorite = async (symbol) => {
    await fetch(`/api/favorites?symbol=${symbol}`, { method: 'DELETE' });
    loadFavorites();
  };

  const currentPrice = stockData.length ? stockData[stockData.length - 1].close : 0;
  const prevPrice = filteredStockData.length > 1 ? filteredStockData[0].close : (stockData.length > 1 ? stockData[stockData.length - 2].close : 0);
  const priceChange = currentPrice - prevPrice;
  const percentChange = prevPrice > 0 ? ((priceChange / prevPrice) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <aside className="panel flex-col gap-8" style={{ width: '280px', borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0, padding: '2rem 1.5rem', flexShrink: 0 }}>
        <div className="logo heading-3">
          <span style={{ color: 'var(--accent-blue)' }}>Stock</span>Dash
        </div>
        
        <div className="flex-col gap-4" style={{ flexGrow: 1 }}>
          <h4 className="text-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Watchlist</h4>
          {favorites.length === 0 ? (
            <p className="text-sm text-muted">No favorites yet.</p>
          ) : (
            <ul className="flex-col gap-2">
              {favorites.map(f => (
                <li key={f.symbol} className="flex justify-between items-center" style={{ padding: '0.5rem', backgroundColor: selectedStock?.symbol === f.symbol ? 'var(--bg-panel-hover)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
                  <button onClick={() => loadStock(f.symbol)} style={{ textAlign: 'left', flexGrow: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600 }}>{f.symbol}</div>
                      <div className="text-sm text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{f.companyName}</div>
                    </div>

                    <div className={`text-xs ${f.isBullish ? 'bg-buy' : 'bg-sell'}`} style={{ padding: '0.2rem 0.5rem', borderRadius: '0.2rem', fontWeight: 'bold' }}>
                      {f.isBullish ? 'BUY' : 'SELL'}
                    </div>

                  </button>
                  <button onClick={() => handleRemoveFavorite(f.symbol)} className="text-muted" style={{ padding: '0.2rem', marginLeft: '0.5rem' }}>x</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-col gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div className="text-sm">Logged in as <strong style={{color: 'var(--text-main)'}}>{user.name}</strong></div>
          <Link href="/profile" className="btn btn-outline w-full" style={{ padding: '0.5rem' }}>Settings</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-col w-full" style={{ padding: '2rem' }}>
        
        {/* Search Header */}
        <div className="flex justify-between items-center w-full" style={{ marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <input 
              type="text" 
              className="form-input w-full" 
              placeholder="Search stocks by name or ticker..." 
              value={searchQuery}
              onChange={handleSearch}
              style={{ borderRadius: 'var(--radius-full)' }}
            />
            {searchResults.length > 0 && (
              <div className="panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', zIndex: 10, padding: '0.5rem' }}>
                {searchResults.map(s => (
                  <div key={s.symbol} onClick={() => loadStock(s.symbol)} className="flex justify-between items-center" style={{ padding: '0.75rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.symbol}</div>
                      <div className="text-sm text-muted">{s.name}</div>
                    </div>
                    {/* Only show add button if not already in favorites */}
                    {!favorites.some(f => f.symbol === s.symbol) && (
                      <button onClick={(e) => { e.stopPropagation(); handleAddFavorite(s.symbol, s.name); }} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ Add</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        {isLoading ? (
          <div>Loading stock data...</div>
        ) : selectedStock && stockData.length > 0 ? (
          <div className="flex gap-4 items-start">
            
            <div className="flex-col w-full gap-4" style={{ flexGrow: 1 }}>
              <div className="panel animate-fade-in flex justify-between items-end">
                <div>
                  <h1 className="heading-2">{selectedStock.name}</h1>
                  <h3 className="text-muted" style={{ fontWeight: 500, marginTop: '0.2rem' }}>{selectedStock.symbol}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="heading-2">${currentPrice.toFixed(2)}</div>
                  <div className={isPositive ? 'text-buy' : 'text-sell'} style={{ fontWeight: 600 }}>
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange}%)
                  </div>
                </div>
              </div>

              <div className="panel animate-fade-in animate-delay-1 w-full" style={{ padding: '1rem' }}>
                <div className="flex gap-2" style={{ marginBottom: '1rem' }}>
                  {['1D', '5D', '1M', '6M', 'YTD', '1Y'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTimeframe(t)}
                      className={`btn ${t === timeframe ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                
                <Chart data={filteredStockData} setTrendInfo={setTrendInfo} />
              </div>
            </div>

            {/* Analysis Panel */}
            <div className="panel animate-fade-in animate-delay-2" style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '2rem' }}>
              <h3 className="heading-3" style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>HILO Analysis</h3>
              
              {trendInfo ? (
                <div className="flex-col gap-4">
                  <div className="flex-col gap-2 p-4" style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                    <div className="text-muted text-sm">Current Trend</div>
                    <div className={`text-lg font-bold ${trendInfo.isBullish ? 'text-buy' : 'text-sell'}`} style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                      {trendInfo.isBullish ? 'UPTREND ↗' : 'DOWNTREND ↘'}
                    </div>
                  </div>

                  <div className="flex-col gap-2 p-4" style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                    <div className="text-muted text-sm">Latest Signal</div>
                    {trendInfo.latestSignal ? (
                      <>
                        <div className={`text-lg font-bold ${trendInfo.latestSignal.type === 'Buy' ? 'bg-buy' : 'bg-sell'}`} style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)', width: 'fit-content', fontWeight: 700 }}>
                          {trendInfo.latestSignal.type.toUpperCase()} @ ${trendInfo.latestSignal.price.toFixed(2)}
                        </div>
                        <div className="text-muted text-sm">Issued on {trendInfo.latestSignal.date}</div>
                      </>
                    ) : (
                      <div className="text-muted">No recent signals.</div>
                    )}
                  </div>

                  <div className="text-sm text-muted" style={{ marginTop: '1rem', lineHeight: 1.6 }}>
                    <strong>How it works:</strong> The HILO indicator tracks market momentum. A <span className="text-buy">Buy</span> signal fires when the price closes above the high average. A <span className="text-sell">Sell</span> signal fires when it drops below the low average.
                  </div>
                </div>
              ) : (
                <p>Analyzing...</p>
              )}
            </div>

          </div>
        ) : (
          <div className="panel text-center text-muted">
            Search for a stock or select one from your watchlist to view the chart.
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
