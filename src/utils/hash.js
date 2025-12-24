/**
 * Hash utility using Web Crypto API (SHA-256)
 * With fallback for insecure contexts (HTTP on mobile)
 */

// Simple hash fallback for when crypto.subtle is unavailable (HTTP context)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to hex and pad to make it look like a hash
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(8);
};

export const hashPassword = async (password) => {
    // Check if crypto.subtle is available (only in HTTPS or localhost)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } else {
        // Fallback for HTTP (dev/testing only - NOT secure for production!)
        console.warn('crypto.subtle not available. Using fallback hash (insecure - dev only).');
        return simpleHash(password);
    }
};

export const verifyPassword = async (password, storedHash) => {
    const inputHash = await hashPassword(password);
    return inputHash === storedHash;
};
