# Security Policy

## 🔐 Secure Configuration

### Environment Variables

This project uses environment variables to store sensitive credentials. **Never** commit actual API keys or secrets to version control.

### Required Environment Variables

See `.env.example` for a complete list of required environment variables:

-   Firebase configuration (API key, Auth Domain, Project ID, etc.)
-   Cloudinary configuration (Cloud Name, Upload Preset)

### Setup Instructions

1.  Copy `.env.example` to `.env.local`
2.  Fill in your actual credentials in `.env.local`
3.  Ensure `.env.local` is listed in `.gitignore` (it is by default)

## ⚠️ If Credentials Were Exposed

If you've accidentally committed credentials to version control:

### Immediate Actions

1.  **Rotate ALL exposed credentials immediately**
    -   Firebase: Generate new API keys in Firebase Console
    -   Cloudinary: Rotate API keys and upload presets

2.  **Update your local `.env.local`** with new credentials

3.  **Review access logs** in both Firebase and Cloudinary for any unauthorized access

### Firebase Security Hardening

1.  **Enable Firebase App Check**:
    -   Protects your Firebase resources from abuse
    -   Add reCAPTCHA or other attestation providers

2.  **Configure Security Rules**:
    ```javascript
    // Example Firestore Security Rules
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Only authenticated users can read/write their own data
        match /users/{userId}/{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

3.  **Set up API Key Restrictions**:
    -   In Firebase Console → Project Settings → API Keys
    -   Restrict keys to specific domains/apps
    -   Enable only required APIs

4.  **Enable Authentication Email Verification**
5.  **Set up Firebase Authentication security settings** (rate limiting, etc.)

### Cloudinary Security Hardening

1.  **Use Signed Uploads** for sensitive content:
    -   Requires server-side signature generation
    -   Prevents unauthorized uploads

2.  **Configure Upload Presets**:
    -   Set to "unsigned" only if necessary
    -   Restrict file types and sizes
    -   Enable moderation if needed

3.  **Set up Access Control**:
    -   Configure folder-level permissions
    -   Use signed URLs for private resources

### Git History Cleanup (Advanced)

⚠️ **Warning**: This rewrites git history and requires coordination with all team members.

Option 1: Using BFG Repo-Cleaner (Recommended):
```bash
# Install BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive files
bfg --delete-files firebaseConfig.js --no-blob-protection

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (requires admin access)
git push --force --all
```

Option 2: Using git-filter-repo:
```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove sensitive data
git filter-repo --path src/firebaseConfig.js --invert-paths

# Force push
git push --force --all
```

⚠️ **Note**: After rewriting history, all collaborators must re-clone the repository.

## 🛡️ Best Practices

1.  **Never commit**:
    -   `.env`, `.env.local`, or any environment files with real credentials
    -   API keys, secrets, or passwords
    -   Private keys or certificates

2.  **Always**:
    -   Use environment variables for sensitive data
    -   Keep `.env.example` updated with required variables (using dummy values)
    -   Rotate credentials periodically
    -   Review security settings regularly
    -   Monitor access logs for suspicious activity

3.  **Before committing**:
    -   Review your changes with `git diff`
    -   Check for accidentally included sensitive data
    -   Ensure `.gitignore` is properly configured

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email the repository owner instead of opening a public issue.

## 📚 Additional Resources

-   [Firebase Security Documentation](https://firebase.google.com/docs/rules)
-   [Cloudinary Security Best Practices](https://cloudinary.com/documentation/security)
-   [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
