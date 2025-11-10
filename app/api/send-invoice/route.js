import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        const {
            to,
            subject,
            orderId,
            customerName,
            items,
            total,
            paymentMethod,
            pdfBase64,
        } = await request.json();

        console.log("📧 Sending email to:", to);

        // Setup Mailtrap transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
            port: process.env.MAILTRAP_PORT || 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });

        // HTML Email Template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        margin: 0;
                        padding: 0;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 0;
                    }
                    .header { 
                        background-color: #16a34a; 
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center; 
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        font-size: 16px;
                    }
                    .content { 
                        padding: 30px 20px; 
                        background-color: #ffffff; 
                    }
                    .order-info { 
                        background-color: #f9fafb; 
                        padding: 20px; 
                        margin: 20px 0; 
                        border-radius: 8px; 
                        border-left: 4px solid #16a34a;
                    }
                    .order-info-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 8px 0;
                    }
                    .order-details { 
                        background-color: white; 
                        padding: 20px; 
                        margin: 20px 0; 
                        border-radius: 8px; 
                        border: 1px solid #e5e7eb;
                    }
                    .item { 
                        padding: 12px 0; 
                        border-bottom: 1px solid #e5e7eb; 
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .item:last-child {
                        border-bottom: none;
                    }
                    .item-name {
                        font-weight: 500;
                        color: #1f2937;
                    }
                    .item-price {
                        font-weight: 600;
                        color: #16a34a;
                    }
                    .total { 
                        font-size: 20px; 
                        font-weight: bold; 
                        color: #16a34a; 
                        margin-top: 20px; 
                        padding-top: 20px;
                        border-top: 2px solid #16a34a;
                        display: flex;
                        justify-content: space-between;
                    }
                    .attachment-notice {
                        background-color: #fef3c7;
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 4px solid #f59e0b;
                        margin: 20px 0;
                    }
                    .footer { 
                        text-align: center; 
                        padding: 30px 20px; 
                        background-color: #f9fafb;
                        color: #6b7280; 
                        font-size: 14px; 
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>GOHEALTH</h1>
                        <p>Invoice Pembelian</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #1f2937; margin-top: 0;">Terima kasih atas pembelian Anda! 🎉</h2>
                        <p style="color: #6b7280; font-size: 16px;">
                            Halo <strong>${customerName}</strong>, pesanan Anda telah kami terima dan sedang diproses.
                        </p>
                        
                        <div class="order-info">
                            <h3 style="margin-top: 0; color: #1f2937;">Informasi Pesanan</h3>
                            <div class="order-info-row">
                                <span style="color: #6b7280;">Order ID:</span>
                                <strong style="color: #1f2937;">${orderId}</strong>
                            </div>
                            <div class="order-info-row">
                                <span style="color: #6b7280;">Metode Pembayaran:</span>
                                <strong style="color: #1f2937;">${paymentMethod}</strong>
                            </div>
                            <div class="order-info-row">
                                <span style="color: #6b7280;">Tanggal:</span>
                                <strong style="color: #1f2937;">${new Date().toLocaleDateString(
                                    "id-ID",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    },
                                )}</strong>
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <h3 style="margin-top: 0; color: #1f2937;">Detail Pesanan</h3>
                            ${items
                                .map(
                                    (item) => `
                                <div class="item">
                                    <div>
                                        <span class="item-name">${
                                            item.name
                                        }</span>
                                        <span style="color: #6b7280; font-size: 14px;"> × ${
                                            item.quantity
                                        }</span>
                                    </div>
                                    <span class="item-price">Rp ${item.price.toLocaleString(
                                        "id-ID",
                                    )}</span>
                                </div>
                            `,
                                )
                                .join("")}
                            
                            <div class="total">
                                <span>TOTAL PEMBAYARAN</span>
                                <span>Rp ${total.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                        
                        <div class="attachment-notice">
                            <strong>📎 Invoice PDF</strong>
                            <p style="margin: 8px 0 0 0; color: #78350f;">
                                File invoice PDF terlampir pada email ini. Silakan download untuk arsip Anda.
                            </p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
                            Pesanan Anda akan segera kami proses. Anda akan menerima notifikasi lebih lanjut 
                            mengenai status pengiriman pesanan Anda.
                        </p>
                        
                        <p style="color: #6b7280; font-size: 15px; margin-top: 20px;">
                            Jika ada pertanyaan, jangan ragu untuk menghubungi customer service kami.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p style="font-weight: 600; color: #1f2937;">© 2025 GOHEALTH. All rights reserved.</p>
                        <p>Your Trusted Health Partner</p>
                        <p style="margin-top: 15px;">
                            <a href="#" style="color: #16a34a; text-decoration: none; margin: 0 10px;">Hubungi Kami</a> |
                            <a href="#" style="color: #16a34a; text-decoration: none; margin: 0 10px;">FAQ</a> |
                            <a href="#" style="color: #16a34a; text-decoration: none; margin: 0 10px;">Kebijakan Privasi</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Prepare email options
        const mailOptions = {
            from: '"GOHEALTH" <noreply@gohealth.com>',
            to: to,
            subject: subject,
            html: htmlContent,
            attachments: pdfBase64
                ? [
                      {
                          filename: `Invoice_${orderId}.pdf`,
                          content: pdfBase64,
                          encoding: "base64",
                      },
                  ]
                : [],
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent successfully:", info.messageId);
        console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));

        return NextResponse.json(
            {
                success: true,
                message: "Email sent successfully",
                messageId: info.messageId,
                previewUrl: nodemailer.getTestMessageUrl(info),
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return NextResponse.json(
            {
                error: "Failed to send email",
                details: error.message,
            },
            { status: 500 },
        );
    }
}
