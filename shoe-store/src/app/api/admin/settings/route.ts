import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allSettings = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (const s of allSettings) map[s.key] = s.value;
    return NextResponse.json({
      theme: map.theme || 'default',
      'theme-mode': map['theme-mode'] || 'auto',
    });
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ theme: 'default', 'theme-mode': 'auto' });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key || typeof key !== 'string' || !value || typeof value !== 'string') {
      return NextResponse.json({ error: 'Invalid key or value' }, { status: 400 });
    }

    const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}
