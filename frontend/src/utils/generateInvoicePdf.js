/**
 * Dynamic PDF Invoice Generator for StyleWalk Footwear E-Commerce
 * Generates an official, beautifully styled PDF Invoice for customer orders.
 */

export function downloadInvoicePdf(order, user = {}) {
  const invoiceNumber = `INV-2026-${String(order.id).padStart(5, '0')}`;
  const purchaseDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const customerName = user.name || order.customer_name || 'Valued Customer';
  const customerEmail = user.email || order.customer_email || 'N/A';
  const shippingAddress = order.shipping_address || 'Address on file';
  const paymentMethod = order.payment_method || 'COD';
  const paymentStatus = order.payment_status || 'Confirmed';
  const trackingNumber = order.tracking_number || 'Pending Assignment';

  const items = Array.isArray(order.items) ? order.items : [];
  
  // Tax calculations (18% GST breakdown)
  const totalAmount = Number(order.total_amount) || 0;
  const discountAmount = Number(order.discount_amount) || 0;
  const subtotal = Number(order.subtotal) || (totalAmount + discountAmount);
  
  // Tax calculation: 18% GST (9% CGST + 9% SGST)
  const taxableValue = Math.round((subtotal / 1.18) * 100) / 100;
  const totalTax = Math.round((subtotal - taxableValue) * 100) / 100;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax / 2) * 100) / 100;

  const itemsHtml = items.map((item, index) => {
    const unitPrice = Number(item.price_inr || item.price || 0);
    const qty = Number(item.quantity || 1);
    const lineTotal = unitPrice * qty;
    const itemTaxable = Math.round((lineTotal / 1.18) * 100) / 100;
    const itemGst = Math.round((lineTotal - itemTaxable) * 100) / 100;

    return `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px; font-weight: 700; color: #475569;">${index + 1}</td>
        <td style="padding: 10px;">
          <strong style="color: #0F172A; display: block; font-size: 13px;">${item.name}</strong>
          <span style="font-size: 11px; color: #64748B;">Brand: ${item.brand || 'StyleWalk'} | Size: ${item.selectedSize || 'Standard'}</span>
        </td>
        <td style="padding: 10px; text-align: center; font-weight: 700; color: #0F172A;">${qty}</td>
        <td style="padding: 10px; text-align: right; font-weight: 600; color: #0F172A;">₹${unitPrice.toLocaleString('en-IN')}</td>
        <td style="padding: 10px; text-align: right; font-weight: 600; color: #64748B;">₹${itemGst.toLocaleString('en-IN')} (18%)</td>
        <td style="padding: 10px; text-align: right; font-weight: 800; color: #059669;">₹${lineTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoiceNumber} - StyleWalk Footwear</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          margin: 0;
          padding: 20px;
          background: #FFFFFF;
          font-size: 12px;
          line-height: 1.5;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #4F46E5;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .brand-title {
          font-size: 26px;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.5px;
        }
        .brand-accent { color: #4F46E5; }
        .invoice-badge {
          background: #EEF2FF;
          color: #4F46E5;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          border: 1px solid #C7D2FE;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .info-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px;
        }
        .info-card h4 {
          margin: 0 0 8px 0;
          font-size: 11px;
          text-transform: uppercase;
          color: #4F46E5;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #F1F5F9;
          color: #475569;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 10px;
          border-bottom: 2px solid #E2E8F0;
          text-align: left;
        }
        .totals-table {
          width: 320px;
          margin-left: auto;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 6px 10px;
          font-size: 12px;
        }
        .total-row {
          background: #ECFDF5;
          border-top: 2px solid #10B981;
          font-size: 15px;
          font-weight: 900;
          color: #047857;
        }
        .footer {
          margin-top: 36px;
          padding-top: 16px;
          border-top: 1px solid #E2E8F0;
          text-align: center;
          font-size: 11px;
          color: #64748B;
        }
        @media print {
          body { padding: 0; background: none; }
          .invoice-box { border: none; shadow: none; padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>

      <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; text-align: right;">
        <button onclick="window.print()" style="background: #4F46E5; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer;">
          🖨️ SAVE AS PDF / PRINT INVOICE
        </button>
      </div>

      <div class="invoice-box">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand-title">STYLE <span class="brand-accent">WALK</span></div>
            <p style="margin: 4px 0 0 0; color: #64748B; font-size: 11px; font-weight: 600;">
              Luxury Footwear &amp; Accessories Gallery<br/>
              GSTIN: 27AAAAA0000A1Z5 | Reg: SW-IND-2026
            </p>
          </div>
          <div style="text-align: right;">
            <span class="invoice-badge">OFFICIAL TAX INVOICE</span>
            <h2 style="margin: 8px 0 0 0; font-size: 18px; font-weight: 900; color: #0F172A;">${invoiceNumber}</h2>
            <p style="margin: 2px 0 0 0; color: #64748B; font-size: 11px;">
              Date: <strong>${purchaseDate}</strong>
            </p>
          </div>
        </div>

        <!-- Customer & Order Details Grid -->
        <div class="grid-2">
          <div class="info-card">
            <h4>Billed To (Customer Details)</h4>
            <strong style="font-size: 14px; color: #0F172A;">${customerName}</strong><br/>
            <span style="color: #64748B;">Email: ${customerEmail}</span><br/>
            <span style="color: #475569; display: block; margin-top: 6px; font-weight: 600;">
              <strong>Delivery Address:</strong><br/>
              ${shippingAddress}
            </span>
          </div>

          <div class="info-card">
            <h4>Payment &amp; Logistics Summary</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748B;">Payment Method:</span>
              <strong style="color: #0F172A;">${paymentMethod}</strong>
            </div>
            ${order.payment_screenshot && order.payment_screenshot.startsWith('RAZORPAY_ID:') ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748B;">Razorpay Txn ID:</span>
              <strong style="color: #4F46E5; font-family: monospace;">${order.payment_screenshot.replace('RAZORPAY_ID:', '')}</strong>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748B;">Payment Status:</span>
              <strong style="color: #059669; background: #ECFDF5; padding: 2px 8px; border-radius: 6px;">${paymentStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748B;">Order Status:</span>
              <strong style="color: #4F46E5;">${order.order_status || 'Confirmed'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Tracking Number:</span>
              <strong style="color: #0F172A; font-family: monospace;">${trackingNumber}</strong>
            </div>
          </div>
        </div>

        <!-- Itemized Products Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Product Details</th>
              <th style="text-align: center; width: 50px;">Qty</th>
              <th style="text-align: right; width: 100px;">Unit Price</th>
              <th style="text-align: right; width: 110px;">GST (18%)</th>
              <th style="text-align: right; width: 110px;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals & Financial Breakdown -->
        <table class="totals-table">
          <tr>
            <td style="color: #64748B;">Item Subtotal:</td>
            <td style="text-align: right; font-weight: 700;">₹${subtotal.toLocaleString('en-IN')}</td>
          </tr>
          ${discountAmount > 0 ? `
          <tr>
            <td style="color: #DC2626;">Coupon Discount (${order.coupon_used || 'Applied'}):</td>
            <td style="text-align: right; font-weight: 700; color: #DC2626;">-₹${discountAmount.toLocaleString('en-IN')}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: #64748B;">Taxable Value:</td>
            <td style="text-align: right; font-weight: 600;">₹${taxableValue.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="color: #64748B;">CGST (9%):</td>
            <td style="text-align: right; font-weight: 600;">₹${cgst.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="color: #64748B;">SGST (9%):</td>
            <td style="text-align: right; font-weight: 600;">₹${sgst.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-row">
            <td>Grand Total (Incl. Taxes):</td>
            <td style="text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <!-- Footer Disclaimer -->
        <div class="footer">
          <p style="margin: 0; font-weight: 700; color: #0F172A;">Thank you for shopping with StyleWalk Footwear!</p>
          <p style="margin: 4px 0 0 0;">For support or warranty claims, contact support@stylewalk.com | Keep this tax invoice for return &amp; exchange reference.</p>
        </div>
      </div>

    </body>
    </html>
  `;

  // Open printable window and trigger automatic save / print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    // Auto-trigger print to PDF dialog after document loads
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }
}
