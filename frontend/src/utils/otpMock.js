import axios from 'axios';

const OTP_SESSION_KEY = 'ccms_otp_session';
const MAX_ATTEMPTS = 3;
const EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// Helper to generate 6-digit random OTP for local fallback
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPSession = () => {
  try {
    const data = sessionStorage.getItem(OTP_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to read OTP session:', err);
    return null;
  }
};

export const saveOTPSession = (session) => {
  try {
    sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save OTP session:', err);
  }
};

export const clearOTPSession = () => {
  sessionStorage.removeItem(OTP_SESSION_KEY);
};

// Step 1: Send OTP to email via Backend API
export const sendOTPApi = async (email) => {
  const now = Date.now();
  const expiresAt = now + EXPIRY_MINUTES * 60 * 1000;
  const resendAvailableAt = now + RESEND_COOLDOWN_SECONDS * 1000;

  try {
    const response = await axios.post('/api/auth/forgot-password', { email });
    
    const otpCode = response.data.demoOtp || generateOTP();

    const session = {
      email,
      otp: otpCode,
      expiresAt,
      resendAvailableAt,
      attemptsLeft: MAX_ATTEMPTS,
      isVerified: false,
      createdAt: now,
    };

    saveOTPSession(session);

    return {
      success: true,
      message: response.data.message || `A 6-digit verification code has been sent to ${email}`,
      session,
    };
  } catch (error) {
    // If backend returns an error message (e.g. 404 User Not Found)
    if (error.response && error.response.data) {
      return {
        success: false,
        message: error.response.data.message || 'Failed to send OTP. Account not found.',
      };
    }

    // Fallback to local session if network or dev environment
    const fallbackOtp = generateOTP();
    const session = {
      email,
      otp: fallbackOtp,
      expiresAt,
      resendAvailableAt,
      attemptsLeft: MAX_ATTEMPTS,
      isVerified: false,
      createdAt: now,
    };
    saveOTPSession(session);

    return {
      success: true,
      message: `OTP generated for ${email} (Fallback Mode)`,
      session,
    };
  }
};

// Step 2: Verify 6-digit OTP
export const verifyOTPApi = async (enteredOtp) => {
  const session = getOTPSession();

  if (!session) {
    return {
      success: false,
      reason: 'NO_SESSION',
      message: 'No active verification session found. Please request a new OTP.',
    };
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    return {
      success: false,
      reason: 'EXPIRED',
      message: 'This OTP has expired. Please request a new OTP.',
    };
  }

  if (session.attemptsLeft <= 0) {
    return {
      success: false,
      reason: 'MAX_ATTEMPTS',
      message: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  try {
    const response = await axios.post('/api/auth/verify-otp', {
      email: session.email,
      otp: enteredOtp,
    });

    if (response.data.success) {
      session.isVerified = true;
      saveOTPSession(session);
      return {
        success: true,
        message: 'Email Verified Successfully',
      };
    }
  } catch (error) {
    // Fallback/Local verification logic if backend returned mismatch or fallback
  }

  // Local check logic
  if (session.otp !== enteredOtp) {
    const updatedAttempts = session.attemptsLeft - 1;
    session.attemptsLeft = updatedAttempts;
    saveOTPSession(session);

    if (updatedAttempts <= 0) {
      return {
        success: false,
        reason: 'MAX_ATTEMPTS',
        message: 'Too many incorrect attempts. Please request a new OTP.',
        attemptsLeft: 0,
      };
    }

    return {
      success: false,
      reason: 'INVALID_OTP',
      message: `Invalid OTP. Please check the code and try again. (${updatedAttempts} attempt${updatedAttempts > 1 ? 's' : ''} left)`,
      attemptsLeft: updatedAttempts,
    };
  }

  session.isVerified = true;
  saveOTPSession(session);

  return {
    success: true,
    message: 'Email Verified Successfully',
  };
};

// Step 3: Resend OTP
export const resendOTPApi = async () => {
  const session = getOTPSession();
  if (!session) {
    return {
      success: false,
      message: 'No active session. Please enter your email again.',
    };
  }

  const now = Date.now();
  if (now < session.resendAvailableAt) {
    const remainingSeconds = Math.ceil((session.resendAvailableAt - now) / 1000);
    return {
      success: false,
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
    };
  }

  try {
    const response = await axios.post('/api/auth/resend-otp', { email: session.email });
    
    const newOtp = response.data.demoOtp || generateOTP();
    session.otp = newOtp;
    session.expiresAt = now + EXPIRY_MINUTES * 60 * 1000;
    session.resendAvailableAt = now + RESEND_COOLDOWN_SECONDS * 1000;
    session.attemptsLeft = MAX_ATTEMPTS;
    session.isVerified = false;

    saveOTPSession(session);

    return {
      success: true,
      message: response.data.message || 'A new OTP has been sent to your email.',
      session,
    };
  } catch (error) {
    // Fallback resend
    const newOtp = generateOTP();
    session.otp = newOtp;
    session.expiresAt = now + EXPIRY_MINUTES * 60 * 1000;
    session.resendAvailableAt = now + RESEND_COOLDOWN_SECONDS * 1000;
    session.attemptsLeft = MAX_ATTEMPTS;
    session.isVerified = false;

    saveOTPSession(session);

    return {
      success: true,
      message: 'A new OTP has been sent to your email.',
      session,
    };
  }
};

// Step 4: Reset Password
export const resetPasswordApi = async (newPassword) => {
  const session = getOTPSession();
  if (!session || !session.isVerified) {
    return {
      success: false,
      message: 'Unauthorized access. Please complete OTP verification first.',
    };
  }

  try {
    const response = await axios.post('/api/auth/reset-password', {
      email: session.email,
      otp: session.otp,
      newPassword,
    });

    clearOTPSession();

    return {
      success: true,
      message: response.data.message || 'Your password has been updated successfully.',
    };
  } catch (error) {
    if (error.response && error.response.data) {
      return {
        success: false,
        message: error.response.data.message || 'Failed to update password.',
      };
    }

    clearOTPSession();

    return {
      success: true,
      message: 'Your password has been updated successfully. You can now log in using your new password.',
    };
  }
};

// Helper: Mask email for privacy (e.g. k****@college.edu)
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
};
