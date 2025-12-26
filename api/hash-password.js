import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password } = req.body;

        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: 'Password is required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Hash the password with bcrypt
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        return res.status(200).json({ hash });
    } catch (error) {
        console.error('Hash password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
