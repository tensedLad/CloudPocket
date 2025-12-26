import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password, hash } = req.body;

        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: 'Password is required' });
        }

        if (!hash || typeof hash !== 'string') {
            return res.status(400).json({ error: 'Hash is required' });
        }

        // Verify the password against the hash
        const isValid = await bcrypt.compare(password, hash);

        return res.status(200).json({ valid: isValid });
    } catch (error) {
        console.error('Verify password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
