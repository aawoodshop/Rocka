import { NextResponse } from 'next/server';
import { searchStocks, MOCK_STOCKS } from '@/lib/stockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json(MOCK_STOCKS);
  }

  const results = searchStocks(q);
  return NextResponse.json(results);
}
