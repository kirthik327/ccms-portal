const nodemailer = require('nodemailer');
const https = require('https');

// Helper to send email via Resend HTTP API
const sendViaResend = (apiKey, fromAddress, toEmail, subject, htmlContent, textContent) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      from: fromAddress || 'CCMS Portal <onboarding@resend.dev>',
      to: [toEmail],
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Resend API Error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

// Helper to send email via Nodemailer SMTP (Gmail / Custom SMTP)
const sendViaNodemailer = async (toEmail, subject, htmlContent, textContent) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM || emailUser || 'no-reply@ccms.edu';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return await transporter.sendMail({
    from: `"Campus Complaint Management System" <${emailFrom}>`,
    to: toEmail,
    subject: subject,
    text: textContent,
    html: htmlContent,
  });
};

const sendOTPEmail = async (toEmail, otpCode) => {
  const resendKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'CCMS Security <no-reply@ccms.edu>';
  const subject = 'CCMS Password Reset Verification Code';

  const textContent = `Hello,

We received a request to reset your password for the Campus Complaint Management System.

Your verification code is: ${otpCode}

This verification code will expire in 5 minutes.

If you did not request a password reset, you can safely ignore this email.

For your security, never share this verification code with anyone.

Regards,
Campus Complaint Management System`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1e3a8a; margin: 0; font-size: 20px; font-weight: 800; tracking-tight: -0.02em;">Campus Complaint Management System</h2>
        <p style="color: #64748b; font-size: 12px; margin-top: 4px; font-weight: 500;">Password Reset Verification</p>
      </div>
      <div style="color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">Hello,</p>
        <p>We received a request to reset your password for the Campus Complaint Management System.</p>
      </div>
      <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; margin: 24px 0;">
        <p style="color: #64748b; font-size: 12px; margin-top: 0; margin-bottom: 8px; font-weight: 600; uppercase; tracking: 0.05em;">Your Verification Code</p>
        <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace; line-height: 1;">${otpCode}</div>
        <p style="color: #ef4444; font-size: 11px; margin-top: 12px; margin-bottom: 0; font-weight: 600;">⚠️ Code expires in 5 minutes</p>
      </div>
      <div style="color: #64748b; font-size: 12px; line-height: 1.6;">
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="font-weight: 600; color: #475569;">For your security, never share this verification code with anyone.</p>
      </div>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        Regards,<br>
        <strong>Campus Complaint Management System</strong>
      </p>
    </div>
  `;

  // Use Resend if API key is configured; otherwise fallback to Nodemailer SMTP
  if (resendKey) {
    try {
      console.log(`Sending OTP via Resend API to ${toEmail}...`);
      return await sendViaResend(resendKey, emailFrom, toEmail, subject, htmlContent, textContent);
    } catch (resendErr) {
      console.warn('Resend API failed, trying Nodemailer SMTP fallback:', resendErr.message);
    }
  }

  // Nodemailer fallback
  console.log(`Sending OTP via Nodemailer to ${toEmail}...`);
  return await sendViaNodemailer(toEmail, subject, htmlContent, textContent);
};

module.exports = {
  sendOTPEmail,
};
