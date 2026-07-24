const nodemailer = require('nodemailer');

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('EMAIL_USER or EMAIL_PASS not defined in environment variables. Email sending may fail.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const sendOTPEmail = async (toEmail, otpCode) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Campus Complaint Management System" <${process.env.EMAIL_USER || 'no-reply@ccms.edu'}>`,
    to: toEmail,
    subject: 'Campus Complaint Management System - OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0;">CCMS Portal</h2>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Campus Complaint Management System</p>
        </div>
        <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="color: #334155; font-size: 14px; margin-bottom: 12px;">Your 6-Digit Password Recovery OTP Code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; font-family: monospace;">${otpCode}</div>
          <p style="color: #64748b; font-size: 11px; margin-top: 12px;">This OTP is valid for <strong>5 minutes</strong> and can only be used once.</p>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          If you did not request a password reset, please ignore this email or contact your college IT administrator immediately.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 10px; text-align: center; margin: 0;">
          This is an automated security message. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
};
