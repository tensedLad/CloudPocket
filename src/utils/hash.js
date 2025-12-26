/**
 * Hash utility using Vercel API for secure bcrypt hashing
 * Falls back to client-side SHA-256 only in development when API is unavailable
 */

const API_BASE = '/api';

/**
 * Hash password using server-side bcrypt (via Vercel API)
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The bcrypt hash
 */
export const hashPassword = async (password) => {
    try {
        const response = await fetch(`${API_BASE}/hash-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.hash;
        }

        // If API fails, log warning and use fallback
        console.warn('Password hash API unavailable, using client-side fallback');
    } catch (error) {
        console.warn('Password hash API error:', error.message);
    }

    // Fallback to client-side SHA-256 (for local development only)
    return clientSideHash(password);
};

/**
 * Verify password against stored hash using server-side bcrypt (via Vercel API)
 * @param {string} password - The password to verify
 * @param {string} storedHash - The stored hash to compare against
 * @returns {Promise<boolean>} - Whether the password matches
 */
export const verifyPassword = async (password, storedHash) => {
    // Check if it's a bcrypt hash (starts with $2)
    if (storedHash && storedHash.startsWith('$2')) {
        try {
            const response = await fetch(`${API_BASE}/verify-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password, hash: storedHash }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.valid;
            }
        } catch (error) {
            console.warn('Password verify API error:', error.message);
        }
    }

    // Fallback: Compare with client-side hash (for legacy SHA-256 hashes or local dev)
    const inputHash = await clientSideHash(password);
    return inputHash === storedHash;
};

/**
 * Client-side fallback hash (SHA-256) - used only when API is unavailable
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The SHA-256 hash
 */
const clientSideHash = async (password) => {
    // Check if crypto.subtle is available (only in HTTPS or localhost)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } else {
        // Simple hash fallback for HTTP (dev only - NOT secure for production!)
        console.warn('crypto.subtle not available. Using fallback hash (insecure - dev only).');
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0').repeat(8);
    }
};
