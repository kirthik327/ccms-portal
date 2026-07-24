import axios from 'axios';

const RESET_TOKEN_KEY = 'ccms_reset_token';
const RESET_EMAIL_KEY = 'ccms_reset_email';

export const saveResetSession = (email, resetToken = null) => {
  try {
    sessionStorage.setItem(RESET_EMAIL_KEY, email);
    if (resetToken) {
      sessionStorage.setItem(RESET_TOKEN_KEY, resetToken);
    }
  } catch (err) {
    console.error('Failed to save reset session:', err);
  }
};

export const getResetEmail = () => {
  try {
    return sessionStorage.getItem(RESET_EMAIL_KEY) || '';
  } catch (err) {
    return '';
  }
};

export const getResetToken = () => {
  try {
    return sessionStorage.getItem(RESET_TOKEN_KEY) || '';
  } catch (err) {
    return '';
  }
};

export const clearResetSession = () => {
  try {
    sessionStorage.removeItem(RESET_TOKEN_KEY);
    sessionStorage.removeItem(RESET_EMAIL_KEY);
  } catch (err) {
    console.error('Failed to clear reset session:', err);
  }
};

// 1. Send OTP to email
export const sendOTPApi = async (email) => {
  try {
    const response = await axios.post('/api/auth/forgot-password', { email });
    saveResetSession(email);
    return {
      success: true,
      message: response.data.message || 'If an account exists with this email address, a verification code has been sent.',
    };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to send verification code. Please try again.';
    return {
      success: false,
      message,
    };
  }
};

// 2. Verify 6-digit OTP
export const verifyOTPApi = async (otp) => {
  const email = getResetEmail();
  if (!email) {
    return {
      success: false,
      reason: 'NO_SESSION',
      message: 'No active session found. Please enter your email address again.',
    };
  }

  try {
    const response = await axios.post('/api/auth/verify-otp', { email, otp });
    
    if (response.data.success && response.data.resetToken) {
      saveResetSession(email, response.data.resetToken);
      return {
        success: true,
        message: 'Email Verified Successfully',
        resetToken: response.data.resetToken,
      };
    }

    return {
      success: false,
      message: response.data.message || 'Verification failed.',
    };
  } catch (error) {
    const data = error.response?.data || {};
    return {
      success: false,
      reason: data.reason || 'ERROR',
      message: data.message || 'Invalid OTP. Please check the code and try again.',
    };
  }
};

// 3. Resend OTP
export const resendOTPApi = async () => {
  const email = getResetEmail();
  if (!email) {
    return {
      success: false,
      message: 'No active session found. Please enter your email again.',
    };
  }

  try {
    const response = await axios.post('/api/auth/resend-otp', { email });
    return {
      success: true,
      message: response.data.message || 'A new verification code has been sent to your email.',
    };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to resend verification code. Please try again.';
    return {
      success: false,
      message,
    };
  }
};

// 4. Reset Password with Reset Token
export const resetPasswordApi = async (newPassword) => {
  const resetToken = getResetToken();
  if (!resetToken) {
    return {
      success: false,
      message: 'Unauthorized access. Please verify your OTP code first.',
    };
  }

  try {
    const response = await axios.post('/api/auth/reset-password', {
      resetToken,
      newPassword,
    });

    clearResetSession();
    return {
      success: true,
      message: response.data.message || 'Your password has been updated successfully.',
    };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update password. Please try again.';
    return {
      success: false,
      message,
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
