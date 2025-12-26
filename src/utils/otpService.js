import emailjs from '@emailjs/browser';

// EmailJS Credentials from Environment Variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

/**
 * Generate a random 6-digit number
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends OTP via EmailJS
 * 
 * @param {string} emailAddress - The target email address
 * @param {string} otp - The 6-digit OTP code
 * @returns {Promise<boolean>}
 */
export const sendOTP = async (emailAddress, otp) => {
    try {
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
            throw new Error('EmailJS credentials are missing in .env');
        }

        // Calculate expiry time (current time + 15 minutes)
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
        const formattedExpiry = expiryTime.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // IMPORTANT: These must match the template variables EXACTLY
        // Your template uses: {{email}}, {{passcode}}, {{time}}
        const templateParams = {
            email: emailAddress,       // For "To Email" field in template
            passcode: otp,             // For {{passcode}} in email body
            time: formattedExpiry,     // For {{time}} in email body (e.g., "2:07 PM")
        };

        console.log('Sending OTP with variables:', templateParams);

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        if (response.status !== 200) {
            throw new Error('Failed to send email');
        }

        return true;
    } catch (error) {
        console.error('Error sending Email OTP:', error);
        if (error.text) {
            console.error('EmailJS Error Text:', error.text);
        }
        throw error;
    }
};
