import allStocks from './all-stocks.json';

export const MOCK_STOCKS = allStocks;

// Generate fake OHLC data for a symbol (back 1 year)
export function generateMockOHLC(symbol, days = 365) {
  const data = [];
  
  // Base date on exactly midnight today so it doesn't change intraday
  let endDate = new Date();
  endDate.setUTCHours(0, 0, 0, 0); 
  
  let currentDate = new Date(endDate);
  currentDate.setDate(currentDate.getDate() - days);
  
  // Seed price based on symbol string length + char codes to make it deterministic
  let seedNum = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let currentPrice = seedNum;

  // Simple pseudo-random number generator (Mulberry32)
  let prng = seedNum + endDate.getTime();
  const random = () => {
    let t = prng += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = 0; i < days; i++) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Add random volatility
      const volatility = currentPrice * 0.02; // max 2% change
      const random1 = random();
      const random2 = random();
      
      const change = (random1 - 0.48) * volatility; // slight upward bias
      
      const open = currentPrice + (random() - 0.5) * volatility * 0.5;
      const close = currentPrice + change;
      const high = Math.max(open, close) + random2 * volatility * 0.5;
      const low = Math.min(open, close) - random1 * volatility * 0.5;
      
      data.push({
        time: currentDate.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2))
      });
      
      currentPrice = close;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}

export function searchStocks(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  
  const matched = [];
  for (const s of MOCK_STOCKS) {
    if (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
      matched.push(s);
      if (matched.length >= 20) break;
    }
  }

  return matched.map(s => {
    // Give it a current fake price
    const data = generateMockOHLC(s.symbol, 10);
    return {
      ...s,
      currentPrice: data[data.length - 1].close
    };
  });
}

// Simple logic identical to Chart.js implementation, returning the final trend state
export function getLatestHILOSignal(data) {
  if (!data || data.length < 5) return { isBullish: true };
  
  const period = 5;
  let isBullish = true;
  
  for (let i = period; i < data.length; i++) {
    let sumHigh = 0;
    let sumLow = 0;
    for (let j = i - period; j < i; j++) {
      sumHigh += data[j].high;
      sumLow += data[j].low;
    }
    const highSMA = sumHigh / period;
    const lowSMA = sumLow / period;
    
    const currentClose = data[i].close;
    if (isBullish && currentClose < lowSMA) {
      isBullish = false;
    } else if (!isBullish && currentClose > highSMA) {
      isBullish = true;
    }
  }
  
  return { isBullish };
}
