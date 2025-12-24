import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar />
            <main style={{ flex: 1, paddingBottom: '12rem' }}>
                {children}
            </main>
            <footer style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1rem 0',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                background: 'rgba(239, 237, 232, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000
            }}>
                <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} CloudPocket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
