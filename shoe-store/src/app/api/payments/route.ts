import { NextResponse } from 'next/server';
import { initializePayment } from '@/lib/paystack';
import { z } from 'zod';

const paymentSchema = z.object({
  email: z.string().email(),
  total: z.number().positive(),
  name: z.string().min(2),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().min(1),
  })),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = paymentSchema.parse(body);
    
    const reference = `SHOE-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`;

    try {
      const response = await initializePayment({
        email: data.email,
        amount: data.total, // in cents
        reference,
        callbackUrl,
        metadata: {
          name: data.name,
          items: JSON.stringify(data.items),
        },
      });

      if (response.data.status) {
        return NextResponse.json({
          status: 'success',
          authorizationUrl: response.data.authorization_url,
          reference,
        });
      } else {
        return NextResponse.json({
          status: 'error',
          error: 'Payment initialization failed',
        }, { status: 400 });
      }
    } catch (paystackError) {
      console.error('Paystack initialization error:', paystackError);
      return NextResponse.json({
        status: 'error',
        error: 'Failed to initialize payment gateway. Please try again.',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payment data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}