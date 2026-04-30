import apiClient from './client';

/**
 * Authentication API calls
 * These functions communicate with the backend auth endpoints
 */

/**
 * Signup API call
 * @param {string} username - Username for the account
 * @param {string} email - Email address
 * @param {string} password - Password (minimum 8 characters)
 * @returns {Promise} Response with access_token, refresh_token, and user data
 */
export const authAPI = {
  signup: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Signup failed' };
    }
  },

  /**
   * Login API call
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {Promise} Response with access_token, refresh_token, and user data
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Promise} Response with new access_token and refresh_token
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Token refresh failed' };
    }
  },

  /**
   * TODO: Logout API call (implement when token blacklisting is added)
   * Sends the access token to backend to blacklist it
   */
  logout: async (accessToken) => {
    console.warn('Logout API endpoint not yet implemented. Token blacklisting TODO.');
    // try {
    //   const response = await apiClient.post(
    //     '/auth/logout',
    //     {},
    //     {
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //       },
    //     }
    //   );
    //   return response.data;
    // } catch (error) {
    //   throw error.response?.data || { detail: 'Logout failed' };
    // }
  },

  /**
   * TODO: Forgot password API call
   * Sends email to backend to initiate password reset flow
   */
  forgotPassword: async (email) => {
    console.warn('Password reset not yet implemented.');
    // try {
    //   const response = await apiClient.post('/auth/forgot-password', { email });
    //   return response.data;
    // } catch (error) {
    //   throw error.response?.data || { detail: 'Password reset request failed' };
    // }
  },

  /**
   * TODO: Reset password API call
   * Uses reset token from email to set new password
   */
  resetPassword: async (resetToken, newPassword) => {
    console.warn('Password reset not yet implemented.');
    // try {
    //   const response = await apiClient.post('/auth/reset-password', {
    //     reset_token: resetToken,
    //     password: newPassword,
    //   });
    //   return response.data;
    // } catch (error) {
    //   throw error.response?.data || { detail: 'Password reset failed' };
    // }
  },

  /**
   * TODO: Verify email API call
   * Uses verification token from email to confirm email address
   */
  verifyEmail: async (verificationToken) => {
    console.warn('Email verification not yet implemented.');
    // try {
    //   const response = await apiClient.post('/auth/verify-email', {
    //     verification_token: verificationToken,
    //   });
    //   return response.data;
    // } catch (error) {
    //   throw error.response?.data || { detail: 'Email verification failed' };
    // }
  },
};
