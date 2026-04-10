import { NextResponse } from 'next/server';
import { generateMockOHLC, MOCK_STOCKS } from '@/lib/stockData';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();
  const stockInfo = MOCK_STOCKS.find(s => s.symbol === symbol);
  
  if (!stockInfo) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  const data = generateMockOHLC(symbol, 365); // 1 year of data
  
  return NextResponse.json({
    symbol: stockInfo.symbol,
    name: stockInfo.name,
    data
  });
}
