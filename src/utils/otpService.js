/**
 * OTP Service using Vercel API for secure server-side OTP handling
 * Falls back to EmailJS client-side only in development
 */

import emailjs from '@emailjs/browser';

const API_BASE = '/api';

// EmailJS Credentials from Environment Variables (fallback for local dev)
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

/**
 * Generate a random 6-digit number (client-side fallback only)
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via server-side API (preferred) or client-side fallback
 * Returns OTP data for verification
 * 
 * @param {string} emailAddress - The target email address
 * @param {string} otp - The 6-digit OTP code (only used for fallback)
 * @returns {Promise<{success: boolean, otpHash?: string, expiresAt?: number, otp?: string}>}
 */
export const sendOTP = async (emailAddress, otp = null) => {
    // Try server-side API first (secure)
    try {
        const response = await fetch(`${API_BASE}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailAddress }),
        });

        if (response.ok) {
            const data = await response.json();
            // Return server response - OTP hash and expiry for verification
            return {
                success: true,
                otpHash: data.otpHash,
                expiresAt: data.expiresAt,
                serverSide: true
            };
        }

        console.warn('OTP API unavailable, using client-side fallback');
    } catch (error) {
        console.warn('OTP API error:', error.message);
    }

    // Fallback to client-side EmailJS (for local development)
    return sendOTPClientSide(emailAddress, otp);
};

/**
 * Verify OTP via server-side API or client-side comparison
 * 
 * @param {string} inputOtp - The OTP entered by user
 * @param {string} otpHash - The stored OTP hash (from server)
 * @param {number} expiresAt - The expiry timestamp
 * @param {string} storedOtp - The stored OTP (client-side fallback)
 * @param {boolean} serverSide - Whether OTP was generated server-side
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const verifyOTP = async (inputOtp, otpHash, expiresAt, storedOtp = null, serverSide = false) => {
    if (serverSide && otpHash && expiresAt) {
        // Verify via server API
        try {
            const response = await fetch(`${API_BASE}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    otp: inputOtp,
                    otpHash: otpHash,
                    expiresAt: expiresAt
                }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                return { valid: true };
            }

            return {
                valid: false,
                error: data.error || 'Invalid OTP',
                expired: data.expired || false
            };
        } catch (error) {
            console.warn('OTP verify API error:', error.message);
        }
    }

    // Client-side fallback: direct comparison
    if (storedOtp && inputOtp === storedOtp) {
        return { valid: true };
    }

    return { valid: false, error: 'Incorrect OTP' };
};

/**
 * Client-side OTP sending via EmailJS (fallback for local development)
 */
const sendOTPClientSide = async (emailAddress, otp) => {
    try {
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
            throw new Error('EmailJS credentials are missing in .env');
        }

        // Generate OTP if not provided
        const code = otp || generateOTP();

        // Calculate expiry time (current time + 15 minutes)
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
        const formattedExpiry = expiryTime.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const templateParams = {
            email: emailAddress,
            passcode: code,
            time: formattedExpiry,
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        if (response.status !== 200) {
            throw new Error('Failed to send email');
        }

        // Return OTP for client-side storage (fallback mode)
        return {
            success: true,
            otp: code,
            serverSide: false
        };
    } catch (error) {
        console.error('Error sending Email OTP:', error);
        throw error;
    }
};
