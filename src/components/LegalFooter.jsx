import { useNavigate } from 'react-router-dom';

const LegalFooter = ({ style = {} }) => {
    const navigate = useNavigate();

    const linkStyle = {
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            ...style
        }}>
            <span
                onClick={() => navigate('/privacy')}
                style={linkStyle}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
                Privacy Policy
            </span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span
                onClick={() => navigate('/terms')}
                style={linkStyle}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
                Terms of Service
            </span>
        </div>
    );
};

export default LegalFooter;
