import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MoveRight, PhoneCall, ShieldCheck, ArrowDown } from 'lucide-react';
import logo from '../assets/logo.png';
import intro from '../assets/intro.png';
import { PricingSection } from '../components/blocks/pricing-section';

const LandingPage = () => {
    const navigate = useNavigate();

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const scrollToFeatures = () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToPricing = () => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
            const elementPosition = pricingSection.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition + 50,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: 'var(--bg-color)',
            color: 'var(--text-primary)',
            overflowX: 'hidden'
        }}>
            {/* Navbar */}
            <nav style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1350px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <img src={logo} alt="CloudPocket" style={{ height: '32px', width: 'auto' }} />
                    <span style={{ fontWeight: 600, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>CloudPocket</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={scrollToPricing}
                        style={{
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            padding: '0.6rem 1.2rem',
                            fontSize: '1rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Pricing
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'var(--primary-btn)',
                            color: 'var(--primary-btn-text)',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section (Hero1 Layout) */}
            <section style={{
                padding: '6rem 1.5rem',
                maxWidth: '1200px',
                margin: '0 auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}
                >
                    {/* Badge */}
                    <div style={{
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'default'
                    }}>
                        Secure Document Storage
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        marginTop: '0.5rem',
                        fontSize: 'clamp(3rem, 6vw, 5rem)',
                        fontWeight: 600,
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        maxWidth: '900px',
                        textAlign: 'center'
                    }}>
                        Your digital life,<br /> securely organized.
                    </h1>

                    {/* Subtext */}
                    <p style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                        color: 'var(--text-secondary)',
                        maxWidth: '650px',
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        CloudPocket is the secure home for your most important documents.
                        Stop digging through emails—access IDs, warranties, and records instantly.
                    </p>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginTop: '1.5rem'
                    }}>
                        <motion.button
                            onClick={scrollToFeatures}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                cursor: 'pointer'
                            }}
                            whileHover={{ background: 'rgba(0,0,0,0.02)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Why CloudPocket? <ArrowDown size={18} />
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                fontWeight: 500,
                                color: 'var(--primary-btn-text)',
                                background: 'var(--primary-btn)',
                                borderRadius: '50px',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                            whileHover={{ opacity: 0.9, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get CloudPocket <MoveRight size={18} />
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* Visual placeholder - Intro Image */}
            <motion.div
                initial="initial"
                whileHover="hover"
                variants={{
                    initial: { height: '300px' },
                    hover: { height: '500px' }
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    width: '100%',
                    background: 'linear-gradient(180deg, var(--card-bg) 0%, rgba(255,255,255,0) 100%)',
                    border: '1px solid var(--border-color)',
                    borderBottom: 'none',
                    borderRadius: '24px 24px 0 0',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <img
                    src={intro}
                    alt="CloudPocket Interface"
                    style={{
                        width: '95%',
                        maxWidth: '1100px',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: '12px 12px 0 0',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        display: 'block',
                        margin: '30px auto 0 auto'
                    }}
                />
            </motion.div>


            {/* Features Section */}
            <section id="features" style={{
                padding: '6rem 1.5rem',
                background: '#fff',
                borderTop: '1px solid var(--border-color)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                            Why CloudPocket?
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                            Designed for simplicity, built for security.
                        </p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '1.5rem'
                        }}
                    >
                        <FeatureCard
                            icon="lock"
                            title="Universe-Grade Security"
                            description="Your data is yours alone. Not us, not hackers, not even governments can access what you store. True zero-knowledge encryption."
                        />
                        <FeatureCard
                            icon="cloud_queue"
                            title="Access Anywhere"
                            description="Travel lighter. Access your passport, insurance, and medical records from any device, anytime."
                        />
                        <FeatureCard
                            icon="folder_open"
                            title="Smart Organization"
                            description="Stop digging through emails. Keep your life's paperwork neatly sorted and instantly searchable."
                        />
                        <FeatureCard
                            icon="family_restroom"
                            title="Family Linking"
                            description="Share access with your family members securely. Manage documents for your loved ones from one account—effortlessly."
                        />
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <div id="pricing">
                <PricingSection
                    tiers={[
                        {
                            name: "Free",
                            price: { monthly: 0, yearly: 0 },
                            description: "",
                            icon: <span className="material-icons">cloud</span>,
                            features: [
                                { name: "20 Documents Max", description: "Document Vault", included: true },
                                { name: "Basic Encryption", description: "Standard Safe", included: true },
                                { name: "Up to 2 Members", description: "Family Sharing", included: true },
                                { name: "Smart Conversion", description: "Not Available", included: false },
                                { name: "Photo Resizer", description: "Not Available", included: false },
                                { name: "Contains Ads", description: "Ad Experience", included: true },
                                { name: "Standard Support", description: "Customer Support", included: true },
                            ],
                        },
                        {
                            name: "Pro",
                            price: { monthly: 99, yearly: 999 },
                            highlight: true,
                            icon: <span className="material-icons">workspace_premium</span>,
                            features: [
                                { name: "Unlimited Documents", description: "Document Vault", included: true },
                                { name: "Zero-Knowledge Encryption", description: "Military Grade", included: true },
                                { name: "Unlimited Family Members", description: "Family Sharing", included: true },
                                { name: "Smart Conversion", description: "PDF ↔ Image ↔ ZIP", included: true },
                                { name: "Photo Resizer", description: "10% to 200%", included: true },
                                { name: "100% Ad-Free", description: "Ad Experience", included: true },
                                { name: "Lightning Fast Support", description: "Customer Support", included: true },
                            ],
                        },
                    ]}
                />
            </div>

            {/* Footer */}
            <footer style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: '#FAFAFA'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <img src={logo} alt="CloudPocket" style={{ height: '24px', opacity: 0.6 }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>© 2025 CloudPocket. All rights reserved.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem' }}>
                    <a onClick={() => navigate('/privacy')} style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Privacy Policy</a>
                    <a onClick={() => navigate('/terms')} style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Terms of Service</a>
                </div>
            </footer>
        </div>
    );
};

// Helper Component for Feature Cards
const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
        }}
        style={{
            padding: '1.2rem',
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
        }}
    >
        <div style={{
            width: '40px',
            height: '40px',
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
            <span className="material-icons" style={{ fontSize: '1.2rem', color: '#333' }}>{icon}</span>
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.85rem' }}>{description}</p>
    </motion.div>
);

export default LandingPage;
