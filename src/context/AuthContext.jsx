import { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { hashPassword, verifyPassword } from '../utils/hash';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session in localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('cloudpocket_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setViewingUser(parsedUser);
        }
        setLoading(false);
    }, []);

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

        // Set session
        const sessionUser = { name, phone: formattedPhone, email, linkedAccounts: [] };
        setUser(sessionUser);
        setViewingUser(sessionUser);
        localStorage.setItem('cloudpocket_user', JSON.stringify(sessionUser));

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

        // Set session
        const sessionUser = {
            name: userData.name,
            phone: formattedPhone,
            email: userData.email || '',
            linkedAccounts: userData.linkedAccounts || []
        };
        setUser(sessionUser);
        setViewingUser(sessionUser);
        localStorage.setItem('cloudpocket_user', JSON.stringify(sessionUser));

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
        localStorage.removeItem('cloudpocket_user');
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
