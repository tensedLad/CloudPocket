import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { generateOTP, sendOTP, verifyOTP } from '../utils/otpService';

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const Login = () => {
    const { checkUserExists, register, login, resetPassword } = useAuth();
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState('phone'); // 'phone', 'verify', 'register', 'password', 'forgotVerify', 'resetPassword'
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otpData, setOtpData] = useState(null); // For server-side OTP: { otpHash, expiresAt, serverSide }
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState(''); // Keep for inline display if needed
    const [loading, setLoading] = useState(false);
    const [sendingResetOtp, setSendingResetOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [userEmail, setUserEmail] = useState(''); // Store registered email for forgot password
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutRemaining, setLockoutRemaining] = useState(0);

    // Check and update lockout status
    useEffect(() => {
        const checkLockout = () => {
            const lockoutData = localStorage.getItem('cloudpocket_lockout');
            if (lockoutData) {
                const { until, attempts } = JSON.parse(lockoutData);
                if (until && Date.now() < until) {
                    setIsLockedOut(true);
                    setLockoutRemaining(Math.ceil((until - Date.now()) / 1000));
                } else if (until && Date.now() >= until) {
                    // Lockout expired, reset
                    localStorage.removeItem('cloudpocket_lockout');
                    setIsLockedOut(false);
                    setLockoutRemaining(0);
                }
            }
        };

        checkLockout();
        const interval = setInterval(checkLockout, 1000);
        return () => clearInterval(interval);
    }, []);

    // Track failed login attempt
    const trackFailedAttempt = () => {
        const lockoutData = localStorage.getItem('cloudpocket_lockout');
        let attempts = 1;

        if (lockoutData) {
            const data = JSON.parse(lockoutData);
            attempts = (data.attempts || 0) + 1;
        }

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            // Lock out the user
            const until = Date.now() + LOCKOUT_DURATION_MS;
            localStorage.setItem('cloudpocket_lockout', JSON.stringify({ attempts, until }));
            setIsLockedOut(true);
            setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
            toast.error(`Too many failed attempts. Please try again in 5 minutes.`);
        } else {
            localStorage.setItem('cloudpocket_lockout', JSON.stringify({ attempts }));
            toast.error(`Incorrect password. ${MAX_LOGIN_ATTEMPTS - attempts} attempts remaining.`);
        }
    };

    // Reset attempts on successful login
    const resetAttempts = () => {
        localStorage.removeItem('cloudpocket_lockout');
        setIsLockedOut(false);
        setLockoutRemaining(0);
    };

    // Timer logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOTP = async (emailAddr) => {
        setLoading(true);
        setError('');
        try {
            // Use server-side OTP service
            const result = await sendOTP(emailAddr);

            if (result.success) {
                if (result.serverSide) {
                    // Store server-side OTP data for verification
                    setOtpData({
                        otpHash: result.otpHash,
                        expiresAt: result.expiresAt,
                        serverSide: true
                    });
                } else {
                    // Client-side fallback (local dev)
                    setGeneratedOtp(result.otp);
                    setOtpData({ serverSide: false });
                }
                setTimer(30);
                setStep('verify');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to send OTP to your email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await verifyOTP(
                otp,
                otpData?.otpHash,
                otpData?.expiresAt,
                generatedOtp,
                otpData?.serverSide
            );

            if (result.valid) {
                setStep('register');
                setError('');
            } else {
                if (result.expired) {
                    toast.error('OTP has expired. Please request a new one.');
                } else {
                    toast.error('Incorrect OTP. Please check your email.');
                }
            }
        } catch (err) {
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanPhone = phone.replace(/\s/g, '');

        // ===== ALL VALIDATIONS FIRST (before any network calls) =====

        // 1. Phone validation
        if (cleanPhone.length < 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        if (cleanPhone.length > 10) {
            toast.error('Phone number cannot exceed 10 digits');
            return;
        }
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            toast.error('Please enter a valid Indian mobile number');
            return;
        }

        // 2. Email validation (strict - must have proper format)
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) {
            toast.error('Please enter your email address');
            return;
        }

        // Comprehensive email regex - checks for proper format including TLD
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.error('Please enter a valid email address (e.g. name@example.com)');
            return;
        }

        // Only allow known email providers
        const emailDomain = trimmedEmail.split('@')[1];
        const allowedDomains = [
            'gmail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in',
            'hotmail.com', 'outlook.com', 'live.com',
            'icloud.com', 'me.com',
            'rediffmail.com', 'aol.com',
            'protonmail.com', 'proton.me',
            'zoho.com', 'yandex.com',
        ];
        if (!allowedDomains.includes(emailDomain)) {
            toast.error('Please use a valid email provider (Gmail, Yahoo, Outlook, etc.)');
            return;
        }

        // ===== NOW START NETWORK OPERATIONS =====
        setLoading(true);
        try {
            // Check if phone or email exists in database
            const result = await checkUserExists(cleanPhone, trimmedEmail);

            if (result.emailMismatch) {
                // Phone exists but email doesn't match
                toast.error('This phone number is registered with a different email address.');
            } else if (result.exists && result.error === 'Phone number already registered') {
                // User exists by Phone -> Login Flow
                setDisplayName(result.data.name);
                setUserEmail(result.data.email); // Store email for forgot password
                setStep('password');
            } else if (result.exists) {
                // Email already registered to another account
                toast.error(result.error || 'This email is already linked to another account.');
            } else {
                // All validations passed, user is new -> Send OTP
                console.log('All validations passed! Sending OTP...');
                await handleSendOTP(trimmedEmail);
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Check if locked out
        if (isLockedOut) {
            const minutes = Math.floor(lockoutRemaining / 60);
            const seconds = lockoutRemaining % 60;
            toast.error(`Account locked. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}`);
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const cleanPhone = phone.replace(/\s/g, '');
            await login(cleanPhone, password);
            resetAttempts(); // Clear failed attempts on successful login
        } catch (err) {
            if (err.message === 'Incorrect password.') {
                trackFailedAttempt();
            } else {
                toast.error(err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (name.trim().length < 2) {
            toast.error('Please enter your name');
            return;
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const cleanPhone = phone.replace(/\s/g, '');
            await register(cleanPhone, email, name, password);
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password - Send OTP
    const handleForgotPassword = async () => {
        setSendingResetOtp(true);
        try {
            // Use server-side OTP service
            const result = await sendOTP(userEmail);

            if (result.success) {
                if (result.serverSide) {
                    setOtpData({
                        otpHash: result.otpHash,
                        expiresAt: result.expiresAt,
                        serverSide: true
                    });
                } else {
                    setGeneratedOtp(result.otp);
                    setOtpData({ serverSide: false });
                }
                setTimer(30);
                setStep('forgotVerify');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to send OTP. Please try again.');
        } finally {
            setSendingResetOtp(false);
        }
    };

    // Forgot Password - Verify OTP
    const handleVerifyForgotOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await verifyOTP(
                otp,
                otpData?.otpHash,
                otpData?.expiresAt,
                generatedOtp,
                otpData?.serverSide
            );

            if (result.valid) {
                setStep('resetPassword');
                setOtp('');
            } else {
                if (result.expired) {
                    toast.error('OTP has expired. Please request a new one.');
                } else {
                    toast.error('Incorrect OTP. Please check your email.');
                }
            }
        } catch (err) {
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password - Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const cleanPhone = phone.replace(/\s/g, '');
            await resetPassword(cleanPhone, newPassword);
            toast.success('Password reset successfully! Please login.');
            // Reset and go back to password step
            setNewPassword('');
            setPassword('');
            setStep('password');
        } catch (err) {
            toast.error(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '1.2rem',
        background: '#F7F6F3',
        border: '1px solid transparent',
        borderRadius: '2rem'
    };

    const getHeading = () => {
        switch (step) {
            case 'phone': return 'Get Started';
            case 'verify': return 'Verify Email';
            case 'register': return 'Create Account';
            case 'password': return `Welcome Back ${displayName ? displayName.split(' ')[0] : ''}`;
            case 'forgotVerify': return 'Reset Password';
            case 'resetPassword': return 'Set New Password';
            default: return 'Login';
        }
    };

    const getSubHeading = () => {
        switch (step) {
            case 'phone': return 'Enter your details to login or sign up.';
            case 'verify': return <span>We sent a code to <strong>{email}</strong></span>;
            case 'register': return 'Set up your account with a name and password.';
            case 'password': return 'Enter your password to continue.';
            case 'forgotVerify': return <span>Enter the OTP sent to <strong>{userEmail}</strong></span>;
            case 'resetPassword': return 'Choose a strong new password for your account.';
            default: return '';
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '60vh',
            maxWidth: '480px',
            margin: '0 auto'
        }}>

            <div style={{ marginBottom: '2rem' }}>
                <motion.h2
                    layoutId="shared-action"
                    style={{ fontSize: '2.5rem', fontWeight: 400, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    {getHeading()}
                </motion.h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>
                    {getSubHeading()}
                </p>
            </div>

            {/* Step 1: Phone + Email */}
            {step === 'phone' && (
                <form onSubmit={handleInitialSubmit}>
                    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: '1rem' }}>
                        <span style={{
                            padding: '1.2rem 1rem',
                            background: '#E8E6E1',
                            border: '1px solid transparent',
                            borderRight: 'none',
                            borderRadius: '2rem 0 0 2rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 500
                        }}>+91</span>
                        <input
                            type="tel"
                            placeholder="98765 43210"
                            value={phone}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                                const formatted = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5)}` : raw;
                                setPhone(formatted);
                            }}
                            style={{ ...inputStyle, borderRadius: '0 2rem 2rem 0', flex: 1 }}
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '1.5rem' }}
                        disabled={loading}
                    />



                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '1.2rem',
                        background: 'var(--primary-btn)',
                        color: 'var(--primary-btn-text)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Continue' : 'Continue'}
                    </button>
                </form>
            )}

            {/* Step 1.5: Verify OTP */}
            {step === 'verify' && (
                <form onSubmit={handleVerifyOTP}>
                    <input
                        type="text"
                        placeholder="Enter 6-digit Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{ ...inputStyle, marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.2rem' }}
                        autoFocus
                        disabled={loading}
                    />

                    {error && <p style={{ color: '#D32F2F', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '1.2rem',
                        background: 'var(--primary-btn)',
                        color: 'var(--primary-btn-text)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        marginBottom: '1rem',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Change Details
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSendOTP(email)}
                            disabled={timer > 0 || loading}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: timer > 0 ? '#aaa' : 'var(--primary-btn)',
                                cursor: timer > 0 ? 'default' : 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: Register (New User) */}
            {step === 'register' && (
                <form onSubmit={handleRegister}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}><strong>{email}</strong> is <span style={{ color: 'green' }}>Verified</span></p>

                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '1rem' }}
                        autoFocus
                        disabled={loading}
                    />

                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ ...inputStyle, marginBottom: 0 }}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '1.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>



                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '1.2rem',
                        background: 'var(--primary-btn)',
                        color: 'var(--primary-btn-text)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            )}

            {/* Step 2a: Login (Existing User) */}
            {step === 'password' && (
                <form onSubmit={handleLogin}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>+91 {phone}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>{email}</p>

                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ ...inputStyle, marginBottom: 0 }}
                            autoFocus
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '1.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>

                    {error && <p style={{ color: '#D32F2F', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '1.2rem',
                        background: 'var(--primary-btn)',
                        color: 'var(--primary-btn-text)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={sendingResetOtp}
                        style={{
                            width: '100%',
                            padding: '0.4rem',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            marginTop: '0.2rem',
                            fontSize: '0.9rem',
                            textDecoration: sendingResetOtp ? 'none' : 'underline',
                            cursor: sendingResetOtp ? 'default' : 'pointer'
                        }}
                    >
                        {sendingResetOtp ? 'Sending OTP...' : 'Forgot Password?'}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setStep('phone'); setPassword(''); setError(''); }}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                        }}
                    >
                        Change Details
                    </button>
                </form>
            )}

            {/* Forgot Password - OTP Verification Step */}
            {step === 'forgotVerify' && (
                <form onSubmit={handleVerifyForgotOTP}>
                    <input
                        type="text"
                        placeholder="Enter 6-digit Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{ ...inputStyle, marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.2rem' }}
                        autoFocus
                        disabled={loading}
                    />

                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '1.2rem',
                        background: 'var(--primary-btn)',
                        color: 'var(--primary-btn-text)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        marginBottom: '1rem',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={() => { setStep('password'); setOtp(''); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Back to Login
                        </button>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={timer > 0 || loading}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: timer > 0 ? '#aaa' : 'var(--primary-btn)',
                                cursor: timer > 0 ? 'default' : 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                        </button>
                    </div>
                </form>
            )}

            {/* Reset Password Step */}
            {step === 'resetPassword' && (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column' }}>

                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ ...inputStyle, marginBottom: 0 }}
                            autoFocus
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{
                                position: 'absolute',
                                right: '1.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                                {showNewPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '1.2rem',
                        background: 'var(--primary-btn)',
                        color: 'var(--primary-btn-text)',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setStep('password'); setNewPassword(''); }}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            marginTop: '0.5rem',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};

export default Login;
