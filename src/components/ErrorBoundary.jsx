import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development, could be sent to logging service in production
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: 'var(--bg-color)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        background: '#FEF2F2',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <span className="material-icons" style={{ fontSize: '40px', color: '#DC2626' }}>
                            error_outline
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Something went wrong
                    </h1>

                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '2rem',
                        maxWidth: '400px'
                    }}>
                        We're sorry, but something unexpected happened. Please try refreshing the page or go back to home.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '2rem',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={this.handleGoHome}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '2rem',
                                border: 'none',
                                background: 'var(--primary-btn)',
                                color: 'var(--primary-btn-text)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
