const nodemailer = require("nodemailer");

// ─── Transporter ──────────────────────────────────────────────────────────────
// Uses Gmail SMTP. Requires GMAIL_USER + GMAIL_APP_PASSWORD in .env
// Generate an App Password at: https://myaccount.google.com/apppasswords
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
};

// ─── OTP Email Template ───────────────────────────────────────────────────────
const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MCloud Email Verification</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a24;border-radius:16px;overflow:hidden;border:1px solid #2a2a3a;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c63ff,#4f46e5);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">☁ MCloud</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Secure Cloud Storage</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 36px;">
              <h2 style="margin:0 0 12px;color:#e2e2f0;font-size:20px;font-weight:600;">Verify your email address</h2>
              <p style="margin:0 0 28px;color:#9090a8;font-size:15px;line-height:1.6;">
                Use the OTP below to complete your registration. This code is valid for <strong style="color:#c0c0d8;">10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:#0f0f13;border:1px solid #2a2a3a;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#6c63ff;font-family:'Courier New',monospace;">${otp}</span>
              </div>
              <p style="margin:0;color:#6060780;font-size:13px;line-height:1.6;color:#60607a;">
                If you didn't request this, you can safely ignore this email. Someone may have typed your email address by mistake.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0f0f13;padding:20px 36px;text-align:center;border-top:1px solid #2a2a3a;">
              <p style="margin:0;color:#40405a;font-size:12px;">© ${new Date().getFullYear()} MCloud. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Send OTP Email ───────────────────────────────────────────────────────────
const sendOTPEmail = async (email, otp) => {
    // Always log OTP to console for development convenience
    console.log(`\n\n=== VERIFICATION OTP ===\nEmail: ${email}\nOTP: ${otp}\n========================\n\n`);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn("⚠️  GMAIL_USER or GMAIL_APP_PASSWORD not set in .env — skipping email send.");
        return true;
    }

    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"MCloud" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your MCloud Verification OTP",
            html: otpEmailTemplate(otp),
        });
        console.log(`✅ OTP email sent to ${email}`);
        return true;
    } catch (err) {
        console.error("❌ Failed to send OTP email:", err.message || err);
        // Don't fail registration — user can use the console OTP
        return true;
    }
};

module.exports = { sendOTPEmail };
