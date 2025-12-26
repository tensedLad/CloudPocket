import crypto from 'crypto';

// Hash the OTP for comparison
function hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { otp, otpHash, expiresAt } = req.body;

        if (!otp || typeof otp !== 'string') {
            return res.status(400).json({ error: 'OTP is required' });
        }

        if (!otpHash || typeof otpHash !== 'string') {
            return res.status(400).json({ error: 'OTP hash is required' });
        }

        if (!expiresAt || typeof expiresAt !== 'number') {
            return res.status(400).json({ error: 'Expiry time is required' });
        }

        // Check if OTP has expired
        if (Date.now() > expiresAt) {
            return res.status(400).json({ error: 'OTP has expired', expired: true });
        }

        // Verify the OTP
        const inputHash = hashOTP(otp);
        const isValid = inputHash === otpHash;

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP', valid: false });
        }

        return res.status(200).json({ valid: true, message: 'OTP verified successfully' });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
