import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';

const Dashboard = () => {
    const { user, linkFamilyMember, logout, viewingUser, setViewingUser } = useAuth();
    const [docs, setDocs] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Linked Members State
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkPhone, setLinkPhone] = useState('');
    const [linkEmail, setLinkEmail] = useState('');
    const [linkPassword, setLinkPassword] = useState('');
    const [linkNickname, setLinkNickname] = useState('');
    const [linkError, setLinkError] = useState('');
    const [linking, setLinking] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Mobile responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Constant categories definition (stabilized)
    const activeCatRef = useRef('All'); // For resize listener access without re-binding
    const categories = useRef(['Identity', 'Education', 'Medical', 'Financial', 'Vehicle', 'Work', 'Property', 'Government Schemes', 'Legal', 'Travel', 'Utility', 'Personal', 'Subscriptions']).current;

    const [activeCat, setActiveCat] = useState('All');
    const [error, setError] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Identity');
    const [editingDoc, setEditingDoc] = useState(null); // Track doc being edited
    const [deleteConfirmation, setDeleteConfirmation] = useState(null); // Track doc to delete

    // Modal Sliding Tab State
    const [modalPillStyle, setModalPillStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });
    const modalTabsRef = useRef([]);

    // Sliding Tab State (Dashboard)
    const [pillStyle, setPillStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });
    const tabsRef = useRef([]);

    // Unified category list for mapping
    const allTabs = ['All', ...categories];

    useEffect(() => {
        if (!showModal) return;

        const timer = setTimeout(() => {
            const activeIndex = categories.indexOf(selectedCategory);
            const currentTab = modalTabsRef.current[activeIndex];

            if (currentTab) {
                setModalPillStyle({
                    left: currentTab.offsetLeft,
                    top: currentTab.offsetTop,
                    width: currentTab.offsetWidth,
                    height: currentTab.offsetHeight
                });
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [selectedCategory, showModal]);

    useEffect(() => {
        const activeIndex = allTabs.indexOf(activeCat);
        const currentTab = tabsRef.current[activeIndex];

        if (currentTab) {
            setPillStyle({
                left: currentTab.offsetLeft,
                top: currentTab.offsetTop,
                width: currentTab.offsetWidth,
                height: currentTab.offsetHeight
            });
        }
    }, [activeCat]); // Remove allTabs from dependency as it is derived from stable categories

    useEffect(() => {
        // Recalculate on resize to handle wrapping changes
        const handleResize = () => {
            const activeIndex = allTabs.indexOf(activeCat);
            // Safety check
            if (activeIndex === -1 || !tabsRef.current[activeIndex]) return;

            const currentTab = tabsRef.current[activeIndex];
            if (currentTab) {
                setPillStyle({
                    left: currentTab.offsetLeft,
                    top: currentTab.offsetTop,
                    width: currentTab.offsetWidth,
                    height: currentTab.offsetHeight
                });
            }
        };

        // Debounce slightly to avoid excessive updates
        let timeoutId;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, [activeCat]);

    useEffect(() => {
        if (!viewingUser?.phone) return;

        const q = query(
            collection(db, "documents"),
            where("userId", "==", viewingUser.phone)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setDocs(documents);
        });

        return () => unsubscribe();
    }, [viewingUser]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        if (!editingDoc) {
            setFileName(''); // Clear name so placeholder shows default (without extension) for NEW uploads
        }
    };

    const handleSave = async () => {
        setUploading(true);
        setError('');

        try {
            if (editingDoc) {
                // Update existing document logic
                const docRef = doc(db, "documents", editingDoc.id);
                // Prepare updates
                const updates = {
                    name: fileName || editingDoc.name,
                    category: selectedCategory
                };

                // If file is changed, upload and add file details to updates
                if (selectedFile) {
                    const data = await uploadToCloudinary(selectedFile);
                    updates.url = data.url;
                    updates.originalName = data.name;
                    updates.type = data.format;
                    updates.size = (data.size / 1024).toFixed(1) + 'KB';
                }

                await updateDoc(docRef, updates);

                closeModal(); // Reuse close modal which resets state
            } else {
                // Create new document logic
                if (!selectedFile) return;
                const uploadedData = await uploadToCloudinary(selectedFile);

                await addDoc(collection(db, "documents"), {
                    userId: user.phone,
                    name: fileName || selectedFile.name.replace(/\.[^/.]+$/, ""),
                    originalName: uploadedData.name,
                    url: uploadedData.url,
                    type: uploadedData.format,
                    size: (uploadedData.size / 1024).toFixed(1) + 'KB',
                    category: selectedCategory,
                    createdAt: new Date().toISOString(),
                });
                closeModal();
            }
        } catch (err) {
            console.error("Save failed", err);
            toast.error('Failed to save. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (docId) => {
        setDeleteConfirmation(docId);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;
        try {
            await deleteDoc(doc(db, "documents", deleteConfirmation));
            setDeleteConfirmation(null);
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete document");
        }
    };

    const handleEdit = (doc) => {
        setEditingDoc(doc);
        setFileName(doc.name);
        setSelectedCategory(doc.category);
        setShowModal(true);
    };

    const handleLinkMember = async () => {
        try {
            setLinking(true);
            setLinkError('');
            await linkFamilyMember(linkPhone, linkEmail, linkPassword, linkNickname);
            setShowLinkModal(false);
            setLinkPhone('');
            setLinkEmail('');
            setLinkPassword('');
            setLinkNickname('');
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to link member.");
        } finally {
            setLinking(false);
        }
    };



    const closeModal = () => {
        setShowModal(false);
        setSelectedFile(null);
        setFileName('');
        setError('');
        setEditingDoc(null); // Clear editing state
    };

    const filteredDocs = activeCat === 'All' ? docs : docs.filter(d => d.category === activeCat);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Viewer State
    const [previewDoc, setPreviewDoc] = useState(null);

    const handlePreview = (doc) => {
        setPreviewDoc(doc);
    };

    return (
        <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                        {viewingUser?.phone === user?.phone ? (
                            <>Welcome {user?.name?.split(' ')[0] || 'User'}</>
                        ) : (
                            <>Viewing {viewingUser?.name}'s Docs</>
                        )}
                    </h1>

                    {/* User Details (Phone & Email) */}
                    <div style={{
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.5rem',
                        fontWeight: 500,
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: isMobile ? '0.2rem' : '0.4rem'
                    }}>
                        <span>{(() => {
                            const p = viewingUser?.phone || user?.phone || '';
                            // Format: +91 98765 43210
                            const match = p.match(/^(\+91)(\d{5})(\d{5})$/);
                            return match ? `${match[1]} ${match[2]} ${match[3]}` : p;
                        })()}</span>
                        {(viewingUser?.email || user?.email) && (
                            <span>
                                {isMobile ? '' : '| '}{viewingUser?.email || user?.email}
                            </span>
                        )}
                    </div>
                </div>

                {/* Account Switcher / Linker */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Me */}
                    {/* Me - Only show if there are linked members */}
                    {user?.linkedAccounts?.length > 0 && (
                        <button
                            onClick={() => setViewingUser(user)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                border: viewingUser?.phone === user?.phone ? '2px solid var(--text-primary)' : '1px solid #ddd',
                                background: viewingUser?.phone === user?.phone ? 'rgba(0,0,0,0.05)' : 'transparent',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Me
                        </button>
                    )}

                    {/* Linked Members */}
                    {user?.linkedAccounts?.map((acc, idx) => (
                        <button
                            key={idx}
                            onClick={() => setViewingUser(acc)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                border: viewingUser?.phone === acc.phone ? '2px solid var(--text-primary)' : '1px solid #ddd',
                                background: viewingUser?.phone === acc.phone ? 'rgba(0,0,0,0.05)' : 'transparent',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            {acc.name}
                        </button>
                    ))}

                    {/* Add Member Button */}
                    <button
                        onClick={() => setShowLinkModal(true)}
                        style={{
                            padding: (!user?.linkedAccounts || user.linkedAccounts.length === 0) ? '0.5rem 1rem' : '0',
                            width: (!user?.linkedAccounts || user.linkedAccounts.length === 0) ? 'auto' : '36px',
                            height: '36px',
                            borderRadius: (!user?.linkedAccounts || user.linkedAccounts.length === 0) ? '2rem' : '50%',
                            border: '1px dashed #999',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#666',
                            gap: '0.4rem',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                        title="Link Family Member"
                    >
                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>add</span>
                        {(!user?.linkedAccounts || user.linkedAccounts.length === 0) && "Link a Family Member"}
                    </button>
                </div>
            </div>

            <div className="category-tabs" style={{
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                position: 'relative',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem'
            }}>
                {/* Sliding Pill */}
                <div style={{
                    position: 'absolute',
                    left: pillStyle.left,
                    top: pillStyle.top,
                    width: pillStyle.width,
                    height: pillStyle.height,
                    background: 'var(--text-primary)',
                    borderRadius: '2rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    zIndex: 0
                }} />

                {allTabs.map((cat, index) => (
                    <button
                        key={cat}
                        className="category-tab"
                        ref={el => tabsRef.current[index] = el}
                        onClick={() => setActiveCat(cat)}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: 'transparent',
                            color: activeCat === cat ? '#fff' : 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 1,
                            transition: 'color 0.2s',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', alignItems: 'center', gap: '1rem' }}>

            </div>

            {/* Link Member Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(17, 17, 17, 0.4)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                        }} onClick={() => {
                            setShowLinkModal(false);
                            setLinkPhone('');
                            setLinkEmail('');
                            setLinkPassword('');
                            setLinkNickname('');
                            setLinkError('');
                        }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#EFEDE8', padding: '2rem', borderRadius: 'var(--radius)',
                                width: '90%', maxWidth: '360px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                border: '1px solid #EBE9E4'
                            }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 400, marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                                Link Family Member
                            </h3>


                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Phone Input with Prefix */}
                                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                    <span style={{
                                        padding: '0.8rem 1rem',
                                        background: '#E8E6E1',
                                        border: '1px solid transparent',
                                        borderRight: 'none',
                                        borderRadius: '2rem 0 0 2rem',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>+91</span>
                                    <input
                                        type="tel"
                                        placeholder="98765 43210"
                                        value={linkPhone}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            const formatted = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5)}` : raw;
                                            setLinkPhone(formatted);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem 1.2rem',
                                            background: '#F7F6F3',
                                            border: '1px solid transparent',
                                            borderRadius: '0 2rem 2rem 0',
                                            fontFamily: 'inherit',
                                            fontSize: '0.95rem',
                                            flex: 1
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !linking && linkPhone && linkPassword) {
                                                handleLinkMember();
                                            }
                                        }}
                                    />
                                </div>
                                {/* Email input */}
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={linkEmail}
                                    onChange={e => setLinkEmail(e.target.value)}
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
                                        if (e.key === 'Enter' && !linking && linkPhone && linkEmail && linkPassword) {
                                            handleLinkMember();
                                        }
                                    }}
                                />
                                {/* Password input */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter the Password"
                                        value={linkPassword}
                                        onChange={e => setLinkPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem 1.2rem',
                                            background: '#F7F6F3',
                                            border: '1px solid transparent',
                                            borderRadius: '2rem',
                                            fontFamily: 'inherit',
                                            fontSize: '0.95rem',
                                            marginBottom: 0
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !linking && linkPhone && linkPassword) {
                                                handleLinkMember();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        style={{
                                            position: 'absolute',
                                            right: '1.5rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-secondary)',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nickname (e.g. Mom, Dad)"
                                    value={linkNickname}
                                    onChange={e => setLinkNickname(e.target.value)}
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
                                        if (e.key === 'Enter' && !linking && linkPhone && linkPassword) {
                                            handleLinkMember();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleLinkMember}
                                    disabled={linking || !linkPhone || !linkPassword}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '2rem',
                                        background: 'var(--text-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer',
                                        marginTop: '0.5rem',
                                        fontWeight: 500,
                                        fontSize: '1rem',
                                        opacity: (linking || !linkPhone || !linkPassword) ? 0.7 : 1,
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    {linking ? 'Linking...' : 'Link Account'}
                                </button>

                                <button
                                    onClick={() => {
                                        setShowLinkModal(false);
                                        setLinkPhone('');
                                        setLinkEmail('');
                                        setLinkPassword('');
                                        setLinkNickname('');
                                        setLinkError('');
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(17, 17, 17, 0.4)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000
                        }} onClick={closeModal}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-content"
                            style={{
                                background: '#EFEDE8',
                                padding: '2rem',
                                borderRadius: 'var(--radius)',
                                width: '90%',
                                maxWidth: '480px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                border: '1px solid #EBE9E4'
                            }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 400, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
                                {editingDoc ? 'Edit Document' : 'Upload Document'}
                            </h3>

                            {/* File Picker */}
                            <label style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed #CCC',
                                borderRadius: 'var(--radius)',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginBottom: '1.5rem',
                                background: '#F7F6F3',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#999'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CCC'}
                            >
                                <span style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>+</span>
                                {selectedFile ? (
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-all' }}>
                                        {selectedFile.name}
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--text-secondary)' }}>Click to select file</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    capture="environment"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                />
                            </label>

                            {/* File Name Input */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    placeholder={selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : 'Document Name'}
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: '1px solid transparent',
                                        borderRadius: '2rem',
                                        background: '#F7F6F3',
                                        fontSize: '1rem',
                                        color: 'var(--text-primary)'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const isDisabled = uploading || (editingDoc ? (fileName === editingDoc.name && selectedCategory === editingDoc.category && !selectedFile) : !selectedFile);
                                            if (!isDisabled) {
                                                handleSave();
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Category Selector */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                    Category
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', position: 'relative' }}>
                                    {/* Modal Sliding Pill */}
                                    <div style={{
                                        position: 'absolute',
                                        left: modalPillStyle.left,
                                        top: modalPillStyle.top,
                                        width: modalPillStyle.width,
                                        height: modalPillStyle.height,
                                        background: 'var(--text-primary)',
                                        borderRadius: '2rem',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        zIndex: 0
                                    }} />

                                    {categories.map((cat, index) => (
                                        <button
                                            key={cat}
                                            className="modal-category-btn"
                                            ref={el => modalTabsRef.current[index] = el}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '2rem',
                                                border: 'none',
                                                background: 'transparent',
                                                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                zIndex: 1,
                                                transition: 'color 0.2s',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={
                                        uploading ||
                                        (editingDoc
                                            ? (fileName === editingDoc.name && selectedCategory === editingDoc.category && !selectedFile)
                                            : !selectedFile)
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '1.2rem',
                                        background: 'var(--text-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '2rem',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        opacity: (uploading || (editingDoc ? (fileName === editingDoc.name && selectedCategory === editingDoc.category && !selectedFile) : !selectedFile)) ? 0.6 : 1,
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    {uploading ? 'Saving...' : (editingDoc ? 'Save Changes' : 'Upload File')}
                                </button>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: 'transparent',
                                        border: '1px solid transparent', // Remove border for clean look if below
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(17, 17, 17, 0.4)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1100
                        }} onClick={() => setDeleteConfirmation(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#EFEDE8',
                                padding: '2rem',
                                borderRadius: '1.5rem',
                                width: '90%',
                                maxWidth: '380px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                border: '1px solid #EBE9E4',
                                textAlign: 'center'
                            }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ width: '50px', height: '50px', background: '#FBE8E8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <span className="material-icons" style={{ color: '#D32F2F', fontSize: '1.5rem' }}>delete_outline</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Delete Document?</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Are you sure you want to delete this document? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button
                                    onClick={() => setDeleteConfirmation(null)}
                                    style={{
                                        flex: 1,
                                        padding: '0.9rem',
                                        borderRadius: '2rem',
                                        border: '1px solid #ddd',
                                        background: 'transparent',
                                        color: '#555',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    style={{
                                        flex: 1,
                                        padding: '0.9rem',
                                        borderRadius: '2rem',
                                        border: 'none',
                                        background: '#D32F2F',
                                        color: '#fff',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document Grid */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                justifyContent: 'center', // Center cards horizontally
                minHeight: '40vh', // Ensure enough height for centering
                alignContent: 'flex-start', // Align content start if present
                position: 'relative',
                paddingBottom: isMobile ? '10rem' : '6rem' // Extra space for upload button
            }}>
                {filteredDocs.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        width: '100%'
                    }}>
                        {activeCat === 'All' ? 'No Documents available.' : 'No documents in this category.'}
                    </div>
                )}
                {filteredDocs.map(doc => {
                    // Extract extension
                    const fileExt = doc.url.split('.').pop().toUpperCase(); // get ext from URL as doc.name is now user friendly

                    const displayName = doc.name;

                    return (
                        <div key={doc.id} className="document-card" style={{
                            background: '#F7F6F3',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            border: '1px solid transparent',
                            position: 'relative',
                            width: '100%',
                            maxWidth: '400px'
                        }}>
                            {/* Header: Name and Tag */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.3
                                }}>
                                    {displayName}
                                </h3>
                                <span style={{
                                    background: 'var(--text-primary)',
                                    color: '#fff',
                                    padding: '0.25rem 0.7rem',
                                    borderRadius: '2rem',
                                    fontSize: '0.65rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}>
                                    {doc.category}
                                </span>
                            </div>



                            {/* Metadata */}
                            {/* Metadata */}
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 500, color: '#666' }}>{fileExt} Document</span>
                                <span style={{ fontSize: '0.5rem', opacity: 0.5 }}>●</span>
                                <span>{formatDate(doc.createdAt)}</span>
                                <span style={{ fontSize: '0.5rem', opacity: 0.5 }}>●</span>
                                <span style={{ fontFamily: 'monospace' }}>{doc.size}</span>
                            </div>

                            {/* Actions */}
                            <div className="document-actions" style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handlePreview(doc)}
                                    style={{
                                        flex: viewingUser?.phone !== user?.phone ? 1 : 'initial',
                                        padding: '0 1.25rem',
                                        height: '42px',
                                        borderRadius: '2rem',
                                        border: '1px solid #ddd',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                    <span className="material-icons" style={{ fontSize: '1.2rem', color: '#555' }}>visibility</span>
                                    View
                                </button>
                                <button
                                    onClick={() => {
                                        // Attempt to force download via Cloudinary transformation or generic link
                                        const downloadUrl = doc.url.replace('/upload/', '/upload/fl_attachment/');
                                        window.open(downloadUrl, '_blank');
                                    }}
                                    style={{
                                        flex: viewingUser?.phone !== user?.phone ? 1 : 'initial',
                                        padding: '0 1.25rem',
                                        height: '42px',
                                        borderRadius: '2rem',
                                        border: 'none',
                                        background: 'var(--text-primary)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>download</span>
                                    Download
                                </button>

                                {viewingUser?.phone === user?.phone && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="icon-button"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(doc); }}
                                            style={{
                                                width: '38px', height: '38px', borderRadius: '50%', background: '#fff', border: '1px solid #ddd',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555',
                                                flexShrink: 0
                                            }}
                                            title="Edit"
                                        >
                                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>edit</span>
                                        </button>
                                        <button
                                            className="icon-button"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                            style={{
                                                width: '38px', height: '38px', borderRadius: '50%', background: '#fff', border: '1px solid #ddd',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#d32f2f',
                                                flexShrink: 0
                                            }}
                                            title="Delete"
                                        >
                                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fixed Bottom Upload Button - Positioned above the fixed footer */}
            {!showModal && (
                <div style={{
                    position: 'fixed',
                    bottom: '4.5rem',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 1001,
                    pointerEvents: 'none',
                    visibility: (viewingUser?.phone === user?.phone) ? 'visible' : 'hidden'
                }}>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            pointerEvents: 'auto',
                            background: 'var(--text-primary)',
                            color: '#fff',
                            padding: '1rem 3.5rem',
                            borderRadius: '3rem',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            border: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '1.4rem' }}>cloud_upload</span>
                        <span>Upload New Document</span>
                    </button>
                </div>
            )}
            {/* Custom Document Viewer Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 2000,
                            display: 'flex',
                            flexDirection: 'column'
                        }} onClick={() => setPreviewDoc(null)}>

                        {/* Viewer Header */}
                        <div style={{
                            padding: '1.2rem 2rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className="material-icons" style={{ color: '#fff' }}>
                                    {previewDoc.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 500 }}>
                                        {previewDoc.displayName || previewDoc.name}
                                    </h3>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                        {previewDoc.type.toUpperCase()} • {previewDoc.size}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a
                                    href={previewDoc.url.replace('/upload/', '/upload/fl_attachment/')}
                                    download
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '2rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>download</span>
                                    Download
                                </a>
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: '50%',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span className="material-icons" style={{ fontSize: '1.5rem' }}>close</span>
                                </button>
                            </div>
                        </div>

                        {/* Viewer Content */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '2rem',
                            overflow: 'hidden'
                        }}>
                            {previewDoc.type === 'pdf' || previewDoc.url.endsWith('.pdf') ? (
                                <iframe
                                    src={previewDoc.url.replace('http://', 'https://') + '#navpanes=0&toolbar=1&view=FitH'} // Sidebar closed, Toolbar open
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '1000px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#fff',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                    }}
                                    title="Document Preview"
                                />
                            ) : (
                                <img
                                    src={previewDoc.url}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '85vh',
                                        borderRadius: '8px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                        objectFit: 'contain'
                                    }}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default Dashboard;
