import * as SibApiV3Sdk from '@sendinblue/client';
import { siteConfig } from '@/lib/site-config';
import { formatPrice } from '@/lib/utils';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

const SENDER = {
  email: process.env.BREVO_SENDER_EMAIL || 'orders@yourstore.vercel.app',
  name: process.env.BREVO_SENDER_NAME || siteConfig.name,
};

export async function sendOrderConfirmationEmail(data: {
  to: string;
  name: string;
  orderId: string;
  items: Array<{ name: string; size: string; color: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: string;
  paymentMethod: string;
  address: string;
}): Promise<boolean> {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.size} / ${item.color}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ed8914 0%, #e06d0f 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 👟</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px;">Hi ${data.name},</p>
        <p>Thank you for your order! We're getting your shoes ready.</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #374151;">Order #${data.orderId}</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Size/Color</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Subtotal</span>
              <span>${formatPrice(data.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Delivery (${data.deliveryType})</span>
              <span>${formatPrice(data.deliveryFee)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-weight: bold; font-size: 18px;">
              <span>Total</span>
              <span>${formatPrice(data.total)}</span>
            </div>
          </div>
        </div>

        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; font-size: 16px;">Delivery Details</h3>
          <p style="margin: 8px 0;"><strong>Method:</strong> ${data.deliveryType === 'boda' ? 'Uber Boda (Same/Next Day)' : data.deliveryType}</p>
          <p style="margin: 8px 0;"><strong>Payment:</strong> ${data.paymentMethod === 'paystack' ? 'Paid Online (Card/M-Pesa)' : 'Cash on Delivery'}</p>
          <p style="margin: 8px 0;"><strong>Address:</strong> ${data.address}</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">We'll notify you when your order is out for delivery. Questions? Reply to this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">${siteConfig.name} • ${siteConfig.address}</p>
      </div>
    </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: data.to, name: data.name }],
      subject: `Order Confirmed - #${data.orderId} • ${siteConfig.name}`,
      htmlContent: html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

export async function sendAdminNewOrderEmail(data: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  itemsCount: number;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
      <h2 style="color: #ed8914;">🔔 New Order #${data.orderId}</h2>
      <p><strong>Customer:</strong> ${data.customerName} (${data.customerPhone})</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>Total:</strong> ${formatPrice(data.total)}</p>
      <p><strong>Payment:</strong> ${data.paymentMethod === 'paystack' ? 'Online' : 'COD'}</p>
      <p><strong>Items:</strong> ${data.itemsCount}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${data.orderId}" style="background: #ed8914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order</a></p>
    </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: process.env.BREVO_SENDER_EMAIL!, name: 'Admin' }],
      subject: `🔔 New Order #${data.orderId} - ${formatPrice(data.total)} • ${siteConfig.name}`,
      htmlContent: html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

export async function sendDeliveryUpdateEmail(data: {
  to: string;
  name: string;
  orderId: string;
  status: 'shipped' | 'delivered';
  riderName?: string;
  riderPhone?: string;
  trackingUrl?: string;
}): Promise<boolean> {
  const isDelivered = data.status === 'delivered';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${isDelivered ? '#10b981' : '#ed8914'}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">${isDelivered ? '📦 Delivered!' : '🚚 Out for Delivery'}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
        <p>Hi ${data.name},</p>
        <p>Your order <strong>#${data.orderId}</strong> ${isDelivered ? 'has been delivered' : 'is on the way'}!</p>
        
        ${data.riderName ? `
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px;">Rider Details</h3>
          <p><strong>Name:</strong> ${data.riderName}</p>
          <p><strong>Phone:</strong> ${data.riderPhone}</p>
        </div>
        ` : ''}
        
        ${data.trackingUrl ? `
        <p style="text-align: center; margin: 24px 0;">
          <a href="${data.trackingUrl}" style="background: #ed8914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Track Order</a>
        </p>
        ` : ''}
        
        ${isDelivered ? `
        <p>Enjoy your new shoes! 👟</p>
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shoes" style="color: #ed8914;">Shop more styles →</a>
        </p>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: data.to, name: data.name }],
      subject: `${isDelivered ? '📦 Delivered' : '🚚 Out for Delivery'} - Order #${data.orderId}`,
      htmlContent: html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send delivery update:', error);
    return false;
  }
}

export async function sendSupplierPayoutEmail(data: {
  to: string;
  name: string;
  amount: number;
  reference: string;
  orders: string[];
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
      <h2 style="color: #10b981;">💰 Payout Sent</h2>
      <p>Hi ${data.name},</p>
      <p>Your weekly payout of <strong>${formatPrice(data.amount)}</strong> has been sent via M-Pesa.</p>
      <p><strong>Reference:</strong> ${data.reference}</p>
      <p><strong>Orders included:</strong> ${data.orders.join(', ')}</p>
      <p>Thank you for partnering with us!</p>
    </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: data.to, name: data.name }],
      subject: `💰 Payout: ${formatPrice(data.amount)} - ${siteConfig.name}`,
      htmlContent: html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send payout email:', error);
    return false;
  }
}