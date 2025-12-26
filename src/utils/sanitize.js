/**
 * Sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize a string by removing or escaping potentially dangerous characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return '';

    return input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Escape special HTML characters
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        // Remove potential script injections
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        // Trim whitespace
        .trim();
};

/**
 * Sanitize a filename - more permissive but safe
 * @param {string} filename - The filename to sanitize
 * @returns {string} - The sanitized filename
 */
export const sanitizeFilename = (filename) => {
    if (typeof filename !== 'string') return 'untitled';

    return filename
        // Remove path traversal attempts
        .replace(/\.\./g, '')
        .replace(/[\/\\]/g, '')
        // Remove HTML/script tags
        .replace(/<[^>]*>/g, '')
        // Remove null bytes
        .replace(/\0/g, '')
        // Keep only safe characters for filenames
        .replace(/[^a-zA-Z0-9\s\-_\.()]/g, '')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ')
        .trim()
        // Provide default if empty
        || 'untitled';
};

/**
 * Validate and sanitize email
 * @param {string} email - The email to validate
 * @returns {string|null} - The sanitized email or null if invalid
 */
export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return null;

    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(sanitized) ? sanitized : null;
};

/**
 * Sanitize phone number - keep only digits
 * @param {string} phone - The phone number to sanitize
 * @returns {string} - The sanitized phone number (digits only)
 */
export const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') return '';
    return phone.replace(/\D/g, '');
};
