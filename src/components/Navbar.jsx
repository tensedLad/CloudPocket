import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout, viewingUser, unlinkFamilyMember, setViewingUser } = useAuth();

    // Unlink Member State
    const [showUnlinkModal, setShowUnlinkModal] = useState(false);
    const [unlinkPassword, setUnlinkPassword] = useState('');
    const [unlinkError, setUnlinkError] = useState('');
    const [unlinking, setUnlinking] = useState(false);
    const [showUnlinkPassword, setShowUnlinkPassword] = useState(false);

    const handleUnlinkMember = async () => {
        try {
            setUnlinking(true);
            setUnlinkError('');
            await unlinkFamilyMember(viewingUser.phone, unlinkPassword);
            setShowUnlinkModal(false);
            setUnlinkPassword('');
            setViewingUser(user); // Return to self
        } catch (err) {
            console.error(err);
            setUnlinkError(err.message || "Failed to remove member.");
        } finally {
            setUnlinking(false);
        }
    };

    return (
        <>
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2.5rem 0',
                marginBottom: '1rem',
            }}>
                <div style={{
                    fontWeight: 500,
                    fontSize: '1rem',
                    letterSpacing: '-0.01em',
                    color: 'var(--text-secondary)', // Subtle logo/brand
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <img src={logo} alt="CloudPocket" style={{ height: '24px', width: 'auto' }} />
                    CloudPocket
                </div>
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {viewingUser?.phone && viewingUser.phone !== user.phone && (
                            <button
                                onClick={() => setShowUnlinkModal(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ddd',
                                    borderRadius: '2rem',
                                    padding: '0 1rem',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    transition: 'background 0.2s, color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>link_off</span>
                                Unlink Member
                            </button>
                        )}
                        <button
                            onClick={logout}
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
                                height: '36px', width: '36px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                                e.currentTarget.style.color = '#D32F2F'; // Red on hover for logout
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            title="Logout"
                        >
                            <span className="material-icons">logout</span>
                        </button>
                    </div>
                )}
            </nav>

            {/* Unlink Confirmation Modal */}
            {showUnlinkModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(17, 17, 17, 0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }} onClick={() => {
                    setShowUnlinkModal(false);
                    setUnlinkPassword('');
                    setUnlinkError('');
                }}>
                    <div style={{
                        background: '#EFEDE8', padding: '2rem', borderRadius: 'var(--radius)',
                        width: '90%', maxWidth: '360px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        border: '1px solid #EBE9E4'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ width: '50px', height: '50px', background: '#FBE8E8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <span className="material-icons" style={{ color: '#D32F2F', fontSize: '1.5rem' }}>link_off</span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.8rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                            Remove {viewingUser.name}?
                        </h3>
                        {unlinkError && <p style={{ color: '#D32F2F', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>{unlinkError}</p>}

                        <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                            This will remove their access from your account. Please enter your password to confirm.
                        </p>

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <input
                                type={showUnlinkPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={unlinkPassword}
                                onChange={e => setUnlinkPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1.2rem',
                                    background: '#F7F6F3',
                                    border: '1px solid transparent',
                                    borderRadius: '2rem',
                                    fontFamily: 'inherit',
                                    fontSize: '0.95rem'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !unlinking && unlinkPassword) {
                                        handleUnlinkMember();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowUnlinkPassword(prev => !prev)}
                                style={{
                                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none', cursor: 'pointer', color: '#888',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>{showUnlinkPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>

                        <button
                            onClick={handleUnlinkMember}
                            disabled={unlinking || !unlinkPassword}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '2rem',
                                background: '#D32F2F', // Red for destructive action
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '1rem',
                                opacity: (unlinking || !unlinkPassword) ? 0.7 : 1,
                                marginBottom: '0.5rem',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {unlinking ? 'Removing...' : 'Remove Member'}
                        </button>

                        <button
                            onClick={() => {
                                setShowUnlinkModal(false);
                                setUnlinkPassword('');
                                setUnlinkError('');
                            }}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'transparent',
                                border: '1px solid transparent',
                                borderRadius: '2rem',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#111'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
