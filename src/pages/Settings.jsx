import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user, updateProfile, changePassword, deleteAccount } = useAuth();

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Modals State
    const [showPassModal, setShowPassModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form inputs
    const [passForm, setPassForm] = useState({ old: '', new: '' });
    const [deletePass, setDeletePass] = useState('');
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showDeletePass, setShowDeletePass] = useState(false);

    // Feedback
    const [loading, setLoading] = useState(false);

    // Mobile responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- Handlers ---
    const handleUpdateName = async () => {
        try {
            setUpdatingProfile(true);
            await updateProfile(name);
            toast.success('Name updated successfully');
            setIsEditingName(false);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await changePassword(passForm.old, passForm.new);
            setShowPassModal(false);
            setPassForm({ old: '', new: '' });
            toast.success('Password changed successfully');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            await deleteAccount(deletePass);
            // Redirect happens in App.jsx via AuthContext/logout
        } catch (err) {
            toast.error(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <button
                    onClick={() => navigate('/home')}
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
                    title="Back to Home"
                >
                    <span className="material-icons">arrow_back</span>
                </button>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 400,
                    letterSpacing: '-0.03em',
                    margin: 0
                }}>
                    Settings
                </h1>
            </div>

            {/* Main Content */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                {/* Profile Section */}
                <section style={{
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    border: '1px solid var(--card-border)'
                }}>
                    <h2 style={{
                        fontSize: '1.2rem',
                        fontWeight: 500,
                        marginBottom: '1.5rem',
                        color: 'var(--text-primary)'
                    }}>Profile Details</h2>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Name Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={name}
                                    disabled={!isEditingName}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1.2rem',
                                        paddingRight: '5rem',
                                        background: isEditingName ? 'transparent' : 'rgba(0,0,0,0.03)',
                                        border: isEditingName ? '1px solid var(--text-primary)' : 'none',
                                        borderRadius: '50px'
                                    }}
                                />
                                {!isEditingName ? (
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        style={{
                                            position: 'absolute',
                                            right: '0.5rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            color: 'var(--text-secondary)',
                                            padding: '0.5rem',
                                            display: 'flex'
                                        }}
                                        title="Edit Name"
                                    >
                                        <span className="material-icons" style={{ fontSize: '20px' }}>edit</span>
                                    </button>
                                ) : (
                                    <div style={{
                                        position: 'absolute',
                                        right: '0.5rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        gap: '0.25rem'
                                    }}>
                                        <button
                                            onClick={handleUpdateName}
                                            disabled={updatingProfile}
                                            style={{
                                                background: 'var(--primary-btn)',
                                                color: '#fff',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '50px',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setName(user?.name || '');
                                                setIsEditingName(false);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                color: 'var(--text-secondary)',
                                                padding: '0.4rem',
                                                display: 'flex'
                                            }}
                                        >
                                            <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Phone Number</label>
                            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                <span style={{
                                    padding: '0.8rem 1rem',
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: '2rem 0 0 2rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>+91</span>
                                <input
                                    type="text"
                                    value={(() => {
                                        const p = user?.phone?.replace('+91', '') || '';
                                        return p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p;
                                    })()}
                                    disabled
                                    style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.03)',
                                        border: 'none',
                                        borderRadius: '0 2rem 2rem 0',
                                        padding: '0.8rem 1.2rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.03)',
                                    border: 'none',
                                    borderRadius: '50px',
                                    padding: '0.8rem 1.2rem'
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section style={{
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    border: '1px solid var(--card-border)'
                }}>
                    <h2 style={{
                        fontSize: '1.2rem',
                        fontWeight: 500,
                        marginBottom: '1.5rem',
                        color: 'var(--text-primary)'
                    }}>Security</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Password</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Change your account password securely.</p>
                            </div>
                            <button
                                onClick={() => setShowPassModal(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '50px',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)'
                                }}
                            >
                                Change Password
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 0.25rem 0', color: '#DC2626' }}>Delete Account</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Permanently delete your account and all data.</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '50px',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: '#DC2626'
                                }}
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </section>

                {/* Spacer for mobile footer */}
                {isMobile && <div style={{ height: '2rem' }} />}
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPassModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2000
                        }}
                        onClick={() => {
                            setShowPassModal(false);
                            setPassForm({ old: '', new: '' });
                            setShowOldPass(false);
                            setShowNewPass(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: 'var(--bg-color)',
                                padding: '2rem',
                                borderRadius: 'var(--radius-lg)',
                                maxWidth: '380px',
                                width: '90%',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                textAlign: 'center'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: 500 }}>Change Password</h2>
                            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1rem' }}>
                                {/* Current Password */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showOldPass ? "text" : "password"}
                                        placeholder="Current Password"
                                        required
                                        value={passForm.old}
                                        onChange={e => setPassForm({ ...passForm, old: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.03)',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '1rem 3rem 1rem 1.2rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPass(prev => !prev)}
                                        style={{
                                            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                                            {showOldPass ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                {/* New Password */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showNewPass ? "text" : "password"}
                                        placeholder="New Password"
                                        required
                                        value={passForm.new}
                                        onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.03)',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '1rem 3rem 1rem 1.2rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPass(prev => !prev)}
                                        style={{
                                            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                                            {showNewPass ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        marginTop: '0.5rem',
                                        background: 'var(--primary-btn)',
                                        color: '#fff',
                                        borderRadius: '50px',
                                        fontWeight: 500,
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPassModal(false);
                                        setPassForm({ old: '', new: '' });
                                        setShowOldPass(false);
                                        setShowNewPass(false);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        fontWeight: 500
                                    }}
                                >
                                    Cancel
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2000
                        }}
                        onClick={() => {
                            setShowDeleteModal(false);
                            setDeletePass('');
                            setShowDeletePass(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: 'var(--bg-color)',
                                padding: '2rem',
                                borderRadius: 'var(--radius-lg)',
                                maxWidth: '380px',
                                width: '90%',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                textAlign: 'center'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Delete Icon */}
                            <div style={{ marginBottom: '1rem' }}>
                                <span className="material-icons" style={{ fontSize: '40px', color: '#DC2626' }}>delete</span>
                            </div>

                            <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>Delete Account?</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                Are you sure you want to delete your account?<br />
                                This action cannot be undone.
                            </p>

                            <form onSubmit={handleDeleteAccount} style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showDeletePass ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        value={deletePass}
                                        onChange={e => setDeletePass(e.target.value)}
                                        style={{
                                            width: '100%',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '50px',
                                            padding: '0.8rem 3rem 0.8rem 1.2rem',
                                            textAlign: 'left'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDeletePass(prev => !prev)}
                                        style={{
                                            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                                            {showDeletePass ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeletePass('');
                                            setShowDeletePass(false);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem',
                                            background: 'var(--secondary-btn)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '50px',
                                            fontWeight: 500
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem',
                                            background: '#DC2626',
                                            color: '#fff',
                                            borderRadius: '50px',
                                            fontWeight: 500,
                                            opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        {loading ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    );
};

export default Settings;
