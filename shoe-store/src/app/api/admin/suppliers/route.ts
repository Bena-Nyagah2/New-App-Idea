import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactName, phone, email, location, paymentTerms, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Supplier name required' }, { status: 400 });
    }

    const id = `supplier-${Date.now()}`;

    await db.insert(suppliers).values({
      id,
      name,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      location: location || null,
      paymentTerms: paymentTerms || 'mpesa',
      notes: notes || null,
    });

    return NextResponse.json({ success: true, supplierId: id });
  } catch (error) {
    console.error('Error adding supplier:', error);
    return NextResponse.json({ error: 'Failed to add supplier' }, { status: 500 });
  }
}