import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, params.id)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    return NextResponse.json({ supplier: result[0] });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, contactName, phone, email, location, paymentTerms, notes, isActive } = body;

    const existing = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.id, params.id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    await db.update(suppliers).set({
      ...(name !== undefined && { name }),
      ...(contactName !== undefined && { contactName: contactName || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(email !== undefined && { email: email || null }),
      ...(location !== undefined && { location: location || null }),
      ...(paymentTerms !== undefined && { paymentTerms: paymentTerms || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(isActive !== undefined && { isActive }),
    }).where(eq(suppliers.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}
