import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(settings).where(eq(settings.key, 'theme')).limit(1);
    return NextResponse.json({ theme: result.length > 0 ? result[0].value : 'default' });
  } catch (error) {
    console.error('Error reading theme:', error);
    return NextResponse.json({ theme: 'default' });
  }
}

export async function POST(request: Request) {
  try {
    const { theme } = await request.json();
    if (!theme || typeof theme !== 'string') {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    const existing = await db.select().from(settings).where(eq(settings.key, 'theme')).limit(1);
    if (existing.length > 0) {
      await db.update(settings).set({ value: theme, updatedAt: new Date() }).where(eq(settings.key, 'theme'));
    } else {
      await db.insert(settings).values({ key: 'theme', value: theme });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving theme:', error);
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 });
  }
}
