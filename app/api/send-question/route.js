import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        const { customerName, customerEmail, question } = await request.json();

        if (!customerEmail || !question) {
            return NextResponse.json(
                { error: "Email and question are required" },
                { status: 400 },
            );
        }

        console.log("📧 Sending question from:", customerEmail);

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
                        background-color: #22c55e; 
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center; 
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                    }
                    .content { 
                        padding: 30px 20px; 
                        background-color: #ffffff; 
                    }
                    .question-box {
                        background-color: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #22c55e;
                        margin: 20px 0;
                    }
                    .customer-info {
                        background-color: #fff;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #e5e7eb;
                        margin: 20px 0;
                    }
                    .footer { 
                        text-align: center; 
                        padding: 30px 20px; 
                        background-color: #f9fafb;
                        color: #6b7280; 
                        font-size: 14px; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🩺 GOHEALTH</h1>
                        <p>New Customer Question</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #1f2937; margin-top: 0;">Customer Inquiry</h2>
                        <p style="color: #6b7280;">
                            You have received a new question from a customer.
                        </p>
                        
                        <div class="customer-info">
                            <h3 style="margin-top: 0; color: #1f2937; font-size: 16px;">Customer Information</h3>
                            <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString(
                                "id-ID",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                },
                            )}</p>
                        </div>
                        
                        <div class="question-box">
                            <h3 style="margin-top: 0; color: #1f2937; font-size: 16px;">Question/Concern:</h3>
                            <p style="color: #374151; font-size: 15px; margin: 10px 0;">
                                ${question}
                            </p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                            Please respond to the customer at: <a href="mailto:${customerEmail}" style="color: #22c55e;">${customerEmail}</a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p style="font-weight: 600; color: #1f2937;">© 2025 GOHEALTH. All rights reserved.</p>
                        <p>Your Trusted Health Partner</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Prepare email options
        const mailOptions = {
            from: `"${customerName}" <${customerEmail}>`,
            to: process.env.ADMIN_EMAIL || "admin@gohealth.com", // Email admin/CS
            replyTo: customerEmail,
            subject: `New Customer Question from ${customerName}`,
            html: htmlContent,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Question email sent successfully:", info.messageId);
        console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));

        return NextResponse.json(
            {
                success: true,
                message: "Question sent successfully",
                messageId: info.messageId,
                previewUrl: nodemailer.getTestMessageUrl(info),
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("❌ Error sending question email:", error);
        return NextResponse.json(
            {
                error: "Failed to send question",
                details: error.message,
            },
            { status: 500 },
        );
    }
}
