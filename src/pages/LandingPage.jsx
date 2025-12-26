import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-color)',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-primary)'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <motion.img
                        layoutId="shared-logo"
                        src={logo}
                        alt="CloudPocket Logo"
                        style={{
                            height: '64px',
                            width: 'auto'
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <motion.h1
                        layoutId="shared-title"
                        style={{
                            fontSize: '3rem',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            letterSpacing: '-0.01em',
                            margin: 0
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        CloudPocket
                    </motion.h1>
                </div>

                <p style={{
                    fontSize: '1.1rem',
                    maxWidth: '500px',
                    margin: '0 auto',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    fontWeight: 400
                }}>
                    Your highly secured personal file store.
                    <br />
                    Safely organize and access your most important documents from anywhere, anytime—just by logging in.
                </p>
            </div>

            <motion.button
                layoutId="shared-action"
                onClick={() => navigate('/login')}
                style={{
                    padding: '1rem 3rem',
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: 'var(--primary-btn-text)',
                    background: 'var(--primary-btn)',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    outline: 'none'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
            >
                Get Started
            </motion.button>

            {/* Footer with legal links */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
            }}>
                <span>© 2025 CloudPocket</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <a
                    onClick={() => navigate('/privacy')}
                    style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                    Privacy Policy
                </a>
                <span style={{ opacity: 0.5 }}>•</span>
                <a
                    onClick={() => navigate('/terms')}
                    style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                    Terms of Service
                </a>
            </div>
        </div>
    );
};

export default LandingPage;

