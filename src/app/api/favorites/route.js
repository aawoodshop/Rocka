import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateMockOHLC, getLatestHILOSignal } from '@/lib/stockData';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const favorites = db.getFavoritesByUserId(session.userId);
  
  // Augment each favorite with its current signal state
  const augmentedFavorites = favorites.map(fav => {
    const data = generateMockOHLC(fav.symbol, 365);
    const { isBullish } = getLatestHILOSignal(data);
    return {
      ...fav,
      isBullish
    };
  });

  return NextResponse.json(augmentedFavorites);
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { symbol, companyName } = await request.json();
  if (!symbol || !companyName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const fav = db.addFavorite(session.userId, symbol, companyName);
  return NextResponse.json({ success: true, favorite: fav });
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }

  db.removeFavorite(session.userId, symbol);
  return NextResponse.json({ success: true });
}
