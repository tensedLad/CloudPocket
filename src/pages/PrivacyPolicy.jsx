import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'background 0.2s, color 0.2s',
                            height: '40px', width: '40px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                        title="Go Back"
                    >
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 400,
                        letterSpacing: '-0.03em',
                        margin: 0
                    }}>
                        Privacy Policy
                    </h1>
                </div>

                {/* Content */}
                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    border: '1px solid var(--card-border)',
                    lineHeight: 1.8,
                    color: 'var(--text-primary)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        <strong>Last Updated:</strong> December 2024
                    </p>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>1. Introduction</h2>
                        <p style={{ marginBottom: '1rem' }}>
                            CloudPocket ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our document management service.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>2. Information We Collect</h2>
                        <p style={{ marginBottom: '0.5rem' }}><strong>Personal Information:</strong></p>
                        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Phone number (used as your unique identifier)</li>
                            <li>Email address (for account verification and communications)</li>
                            <li>Name (for personalization)</li>
                        </ul>
                        <p style={{ marginBottom: '0.5rem' }}><strong>Documents & Files:</strong></p>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li>Documents you upload for storage</li>
                            <li>Document metadata (name, category, upload date)</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>3. How We Use Your Information</h2>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li>To provide and maintain our service</li>
                            <li>To verify your identity through OTP</li>
                            <li>To allow you to store and access your documents</li>
                            <li>To enable family member linking features</li>
                            <li>To communicate with you about your account</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>4. Third-Party Services</h2>
                        <p style={{ marginBottom: '1rem' }}>We use the following third-party services:</p>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li><strong>Firebase (Google Cloud):</strong> Database and authentication infrastructure</li>
                            <li><strong>Cloudinary:</strong> Secure document storage and delivery</li>
                            <li><strong>EmailJS:</strong> Email delivery for OTP verification</li>
                        </ul>
                        <p style={{ marginTop: '1rem' }}>
                            Each of these services has their own privacy policies. We encourage you to review them.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information, including:
                        </p>
                        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>Encrypted data transmission (HTTPS)</li>
                            <li>Secure password hashing</li>
                            <li>Single-session authentication</li>
                            <li>Access controls on stored documents</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>6. Your Rights</h2>
                        <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li>Access your personal data</li>
                            <li>Update your profile information</li>
                            <li>Delete your account and all associated data</li>
                            <li>Download your documents at any time</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>7. Data Retention</h2>
                        <p>
                            We retain your personal data for as long as your account is active. Upon account deletion, your data will be permanently removed from our systems within 30 days.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>8. Children's Privacy</h2>
                        <p>
                            CloudPocket is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>9. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>10. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us through the app or reach out to our support team.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                }}>
                    © 2025 CloudPocket. All Rights Reserved.
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
