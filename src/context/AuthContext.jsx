import { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { hashPassword, verifyPassword } from '../utils/hash';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);

    // Generate unique session ID
    const generateSessionId = () => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Check for existing session in localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('cloudpocket_user');
        const storedSessionId = localStorage.getItem('cloudpocket_session');
        if (storedUser && storedSessionId) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setViewingUser(parsedUser);
            setSessionId(storedSessionId);
        }
        setLoading(false);
    }, []);

    // Periodically validate session (every 30 seconds)
    useEffect(() => {
        if (!user || !sessionId) return;

        const validateSession = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.phone));
                if (userDoc.exists()) {
                    const currentSessionId = userDoc.data().sessionId;
                    if (currentSessionId && currentSessionId !== sessionId) {
                        // Session mismatch - another device logged in
                        console.log('Session expired: logged in from another device');
                        toast.error('Your account was logged in on another device');
                        // Small delay to let toast show before redirect
                        setTimeout(() => logout(), 1500);
                    }
                }
            } catch (err) {
                console.error('Session validation error:', err);
            }
        };

        // Validate immediately, then every 30 seconds
        validateSession();
        const interval = setInterval(validateSession, 30000);

        return () => clearInterval(interval);
    }, [user, sessionId]);

    // Check if phone or email is registered
    const checkUserExists = async (phone, email) => {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        // Check Phone (ID)
        const phoneDoc = await getDoc(doc(db, "users", formattedPhone));
        if (phoneDoc.exists()) {
            const userData = phoneDoc.data();

            // If email is provided, verify it matches the registered email
            if (email && userData.email && userData.email.toLowerCase() !== email.toLowerCase()) {
                return { exists: true, error: 'Email does not match the registered account', emailMismatch: true };
            }

            return { exists: true, error: 'Phone number already registered', data: userData, phone: formattedPhone };
        }

        // Phone doesn't exist - check if email is already used by someone else
        if (email) {
            const { collection, query, where, getDocs } = await import("firebase/firestore");
            const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return { exists: true, error: 'Email address already registered to another account' };
            }
        }

        return { exists: false, phone: formattedPhone };
    };

    // Register new user
    const register = async (phone, email, name, password) => {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        // Hash the password
        const passwordHash = await hashPassword(password);

        // Create user document
        const userData = {
            name: name,
            phone: formattedPhone,
            email: email,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString(),
            linkedAccounts: [] // Initialize empty
        };

        await setDoc(doc(db, "users", formattedPhone), userData);

        // Generate and store session ID
        const newSessionId = generateSessionId();
        await updateDoc(doc(db, "users", formattedPhone), { sessionId: newSessionId });

        // Set session
        const sessionUser = { name, phone: formattedPhone, email, linkedAccounts: [] };
        setUser(sessionUser);
        setViewingUser(sessionUser);
        setSessionId(newSessionId);
        localStorage.setItem('cloudpocket_user', JSON.stringify(sessionUser));
        localStorage.setItem('cloudpocket_session', newSessionId);

        return sessionUser;
    };

    // Login existing user
    const login = async (phone, password) => {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        // Get user from Firestore
        const userDoc = await getDoc(doc(db, "users", formattedPhone));

        if (!userDoc.exists()) {
            throw new Error('User not found. Please register first.');
        }

        const userData = userDoc.data();

        // Verify password
        const isValid = await verifyPassword(password, userData.passwordHash);

        if (!isValid) {
            throw new Error('Incorrect password.');
        }

        // Generate and store session ID
        const newSessionId = generateSessionId();
        await updateDoc(doc(db, "users", formattedPhone), { sessionId: newSessionId });

        // Set session
        const sessionUser = {
            name: userData.name,
            phone: formattedPhone,
            email: userData.email || '',
            linkedAccounts: userData.linkedAccounts || []
        };
        setUser(sessionUser);
        setViewingUser(sessionUser);
        setSessionId(newSessionId);
        localStorage.setItem('cloudpocket_user', JSON.stringify(sessionUser));
        localStorage.setItem('cloudpocket_session', newSessionId);

        return sessionUser;
    };

    // Reset password (forgot password flow)
    const resetPassword = async (phone, newPassword) => {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        // Get user from Firestore
        const userDoc = await getDoc(doc(db, "users", formattedPhone));

        if (!userDoc.exists()) {
            throw new Error('User not found.');
        }

        // Hash new password and update
        const newHash = await hashPassword(newPassword);
        await updateDoc(doc(db, "users", formattedPhone), {
            passwordHash: newHash
        });

        return true;
    };

    // Link a family member
    const linkFamilyMember = async (targetPhone, targetEmail, targetPassword, nickname) => {
        // Remove whitespace and format
        const cleanPhone = targetPhone.replace(/\s/g, '');
        const formattedTargetPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
        const cleanEmail = targetEmail.trim().toLowerCase();

        // Validate inputs
        if (!cleanEmail) {
            throw new Error("Email address is required.");
        }

        // Prevent self-linking
        if (formattedTargetPhone === user.phone) {
            throw new Error("You cannot link your own account.");
        }

        // 1. Check if target user exists
        const targetUserDoc = await getDoc(doc(db, "users", formattedTargetPhone));

        if (!targetUserDoc.exists()) {
            throw new Error('Family member account not found.');
        }

        const targetUserData = targetUserDoc.data();

        // 2. Verify Email matches
        if (!targetUserData.email || targetUserData.email.toLowerCase() !== cleanEmail) {
            throw new Error('Email does not match the registered account.');
        }

        // 3. Verify Password
        const isValid = await verifyPassword(targetPassword, targetUserData.passwordHash);
        if (!isValid) {
            throw new Error('Incorrect password for family member.');
        }

        // 3. Add to current user's linkedAccounts
        const newLink = {
            phone: formattedTargetPhone,
            name: nickname || targetUserData.name || "Family Member",
            linkedAt: new Date().toISOString()
        };

        // Check if already linked
        if (user.linkedAccounts?.some(acc => acc.phone === formattedTargetPhone)) {
            throw new Error('This member is already linked.');
        }

        await updateDoc(doc(db, "users", user.phone), {
            linkedAccounts: arrayUnion(newLink)
        });

        // Update local state
        const updatedUser = {
            ...user,
            linkedAccounts: [...(user.linkedAccounts || []), newLink]
        };
        setUser(updatedUser);
        localStorage.setItem('cloudpocket_user', JSON.stringify(updatedUser));

        return newLink;
    };

    // Unlink a family member
    const unlinkFamilyMember = async (targetPhone, currentUserPassword) => {
        // 1. Verify Current User's Password
        const userDoc = await getDoc(doc(db, "users", user.phone));
        if (!userDoc.exists()) throw new Error("User not found.");

        const userData = userDoc.data();
        const isValid = await verifyPassword(currentUserPassword, userData.passwordHash);

        if (!isValid) {
            throw new Error('Incorrect password.');
        }

        // 2. Remove from linkedAccounts
        // We filter out the member to be removed
        const updatedLinkedAccounts = (userData.linkedAccounts || []).filter(
            acc => acc.phone !== targetPhone
        );

        if (updatedLinkedAccounts.length === (userData.linkedAccounts || []).length) {
            throw new Error("Family member not found in your list.");
        }

        // 3. Update Firestore
        await updateDoc(doc(db, "users", user.phone), {
            linkedAccounts: updatedLinkedAccounts
        });

        // 4. Update Local State & Session
        const updatedUser = {
            ...user,
            linkedAccounts: updatedLinkedAccounts
        };
        setUser(updatedUser);
        localStorage.setItem('cloudpocket_user', JSON.stringify(updatedUser));

        return true;
    };

    // Update User Profile (Name only)
    const updateProfile = async (newName) => {
        if (!newName || !newName.trim()) throw new Error("Name cannot be empty.");

        await updateDoc(doc(db, "users", user.phone), {
            name: newName
        });

        const updatedUser = { ...user, name: newName };
        setUser(updatedUser);
        localStorage.setItem('cloudpocket_user', JSON.stringify(updatedUser));
        return true;
    };

    // Change Password
    const changePassword = async (oldPassword, newPassword) => {
        // 1. Verify Old Password
        const userDoc = await getDoc(doc(db, "users", user.phone));
        if (!userDoc.exists()) throw new Error("User not found.");

        const userData = userDoc.data();
        const isValid = await verifyPassword(oldPassword, userData.passwordHash);

        if (!isValid) throw new Error("Incorrect old password.");

        // 2. Hash New Password
        const newPasswordHash = await hashPassword(newPassword);

        // 3. Update Firestore
        await updateDoc(doc(db, "users", user.phone), {
            passwordHash: newPasswordHash
        });

        return true;
    };

    // Delete Account
    const deleteAccount = async (password) => {
        // 1. Verify Password
        const userDoc = await getDoc(doc(db, "users", user.phone));
        if (!userDoc.exists()) throw new Error("User not found.");

        const userData = userDoc.data();
        const isValid = await verifyPassword(password, userData.passwordHash);

        if (!isValid) throw new Error("Incorrect password.");

        // 2. Delete User Document
        await deleteDoc(doc(db, "users", user.phone));

        // 3. Logout
        logout();
        return true;
    };

    const logout = () => {
        setUser(null);
        setViewingUser(null);
        setSessionId(null);

        // Clear all CloudPocket data from localStorage
        localStorage.removeItem('cloudpocket_user');
        localStorage.removeItem('cloudpocket_session');
        localStorage.removeItem('cloudpocket_lockout');

        // Clear sessionStorage completely
        sessionStorage.clear();

        // Clear any cached data (optional but recommended for shared devices)
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
    };

    return (
        <AuthContext.Provider value={{
            user, viewingUser, setViewingUser, loading,
            checkUserExists, register, login, logout, resetPassword,
            linkFamilyMember, unlinkFamilyMember,
            updateProfile, changePassword, deleteAccount
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
