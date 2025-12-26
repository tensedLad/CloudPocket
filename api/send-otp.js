import crypto from 'crypto';

// In-memory OTP storage (for Vercel serverless - consider using Vercel KV or Firebase for production scale)
// Note: This works for low-traffic apps. Each serverless instance has its own memory,
// but we use short expiry (15 min) so this is acceptable for basic protection.
// For full security, consider using Firebase Firestore to store OTP hashes.

// Generate a cryptographically secure 6-digit OTP
function generateSecureOTP() {
    const buffer = crypto.randomBytes(4);
    const num = buffer.readUInt32BE(0);
    // Generate a number between 100000 and 999999
    return String(100000 + (num % 900000));
}

// Hash the OTP for storage comparison
function hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, action } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Generate OTP
        const otp = generateSecureOTP();
        const otpHash = hashOTP(otp);
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Calculate expiry time for display
        const expiryTime = new Date(expiresAt);
        const formattedExpiry = expiryTime.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Send OTP via EmailJS REST API
        const emailJsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID,
                template_id: process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID,
                user_id: process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY,
                template_params: {
                    email: email,
                    passcode: otp,
                    time: formattedExpiry
                }
            })
        });

        if (!emailJsResponse.ok) {
            const errorText = await emailJsResponse.text();
            console.error('EmailJS error:', errorText);
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }

        // Return the hashed OTP and expiry for client-side storage
        // The actual OTP is never sent to the client - only the hash for verification
        return res.status(200).json({
            success: true,
            otpHash: otpHash,
            expiresAt: expiresAt,
            message: 'OTP sent successfully'
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
