const OTP_SESSION_KEY = 'ccms_otp_session';
const MAX_ATTEMPTS = 3;
const EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// Helper to generate 6-digit random OTP
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

// Step 1: Generate OTP locally
export const sendOTPApi = async (email) => {
  // Simulate short UI delay for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 600));

  const otp = generateOTP();
  const now = Date.now();
  const expiresAt = now + EXPIRY_MINUTES * 60 * 1000;
  const resendAvailableAt = now + RESEND_COOLDOWN_SECONDS * 1000;

  const session = {
    email,
    otp,
    expiresAt,
    resendAvailableAt,
    attemptsLeft: MAX_ATTEMPTS,
    isVerified: false,
    createdAt: now,
  };

  saveOTPSession(session);

  return {
    success: true,
    message: `OTP generated for ${email}`,
    session,
  };
};

// Step 2: Verify 6-digit OTP locally
export const verifyOTPApi = async (enteredOtp) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const session = getOTPSession();

  if (!session) {
    return {
      success: false,
      reason: 'NO_SESSION',
      message: 'No active verification session found. Please generate a new OTP.',
    };
  }

  const now = Date.now();

  // Check Expiry
  if (now > session.expiresAt) {
    return {
      success: false,
      reason: 'EXPIRED',
      message: 'This OTP has expired. Please generate a new OTP.',
    };
  }

  // Check Attempt Count
  if (session.attemptsLeft <= 0) {
    return {
      success: false,
      reason: 'MAX_ATTEMPTS',
      message: 'Too many incorrect attempts. Please generate a new OTP.',
    };
  }

  // Check OTP Match
  if (session.otp !== enteredOtp) {
    const updatedAttempts = session.attemptsLeft - 1;
    session.attemptsLeft = updatedAttempts;
    saveOTPSession(session);

    if (updatedAttempts <= 0) {
      return {
        success: false,
        reason: 'MAX_ATTEMPTS',
        message: 'Too many incorrect attempts. Please generate a new OTP.',
        attemptsLeft: 0,
      };
    }

    return {
      success: false,
      reason: 'INVALID_OTP',
      message: 'Invalid OTP. Please check the code and try again.',
      attemptsLeft: updatedAttempts,
    };
  }

  // Match Successful
  session.isVerified = true;
  saveOTPSession(session);

  return {
    success: true,
    message: 'Email Verified Successfully',
  };
};

// Step 3: Resend OTP (Generates NEW OTP, resets attempts to 3)
export const resendOTPApi = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600));

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

  const newOtp = generateOTP();
  session.otp = newOtp;
  session.expiresAt = now + EXPIRY_MINUTES * 60 * 1000;
  session.resendAvailableAt = now + RESEND_COOLDOWN_SECONDS * 1000;
  session.attemptsLeft = MAX_ATTEMPTS;
  session.isVerified = false;

  saveOTPSession(session);

  return {
    success: true,
    message: 'A new 6-digit OTP has been generated.',
    session,
  };
};

// Step 4: Reset Password
export const resetPasswordApi = async (newPassword) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const session = getOTPSession();
  if (!session || !session.isVerified) {
    return {
      success: false,
      message: 'Unauthorized access. Please complete OTP verification first.',
    };
  }

  // Clean up session upon successful password reset
  clearOTPSession();

  return {
    success: true,
    message: 'Your password has been updated successfully. You can now log in using your new password.',
  };
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
