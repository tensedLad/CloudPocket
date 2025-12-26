import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
                        Terms of Service
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
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using CloudPocket, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>2. Description of Service</h2>
                        <p>
                            CloudPocket is a personal document management service that allows you to securely store, organize, and share important documents with family members. The service is provided "as is" and we reserve the right to modify or discontinue it at any time.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>3. User Accounts</h2>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li>You must provide accurate and complete information when creating an account</li>
                            <li>You are responsible for maintaining the security of your account credentials</li>
                            <li>You must be at least 13 years old to use this service</li>
                            <li>One person may not maintain multiple accounts</li>
                            <li>You must notify us immediately of any unauthorized use of your account</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>4. Acceptable Use</h2>
                        <p style={{ marginBottom: '1rem' }}>You agree NOT to:</p>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li>Upload illegal, harmful, or offensive content</li>
                            <li>Use the service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Upload viruses, malware, or other malicious code</li>
                            <li>Interfere with or disrupt the service</li>
                            <li>Violate the intellectual property rights of others</li>
                            <li>Share your account credentials with others</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>5. Document Storage</h2>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li>You retain ownership of all documents you upload</li>
                            <li>You are solely responsible for the content of your documents</li>
                            <li>We do not access or view your documents except as necessary to provide the service</li>
                            <li>You should maintain backup copies of important documents</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>6. Family Linking</h2>
                        <p>
                            The family linking feature allows you to share document access with trusted family members. By linking another account:
                        </p>
                        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>You grant them read-only access to your documents</li>
                            <li>You can revoke access at any time</li>
                            <li>You are responsible for ensuring you have permission to link their account</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>7. Limitation of Liability</h2>
                        <p style={{ marginBottom: '1rem' }}>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                        </p>
                        <ul style={{ marginLeft: '1.5rem' }}>
                            <li>The service is provided "as is" without warranties of any kind</li>
                            <li>We are not liable for any data loss or service interruptions</li>
                            <li>We are not responsible for the content of documents you upload</li>
                            <li>Our total liability shall not exceed the amount you paid for the service</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>8. Account Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account if you violate these Terms of Service. You may delete your account at any time through the Settings page.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>9. Changes to Terms</h2>
                        <p>
                            We may update these Terms of Service from time to time. Continued use of the service after any changes constitutes your acceptance of the new terms.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>10. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>11. Contact</h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us through the app.
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

export default TermsOfService;
