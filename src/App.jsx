import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route (redirects to /home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Landing Page - Public */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* Login Page - Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Layout>
                <Login />
              </Layout>
            </PublicRoute>
          }
        />

        {/* Dashboard/Home - Protected */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Settings - Protected */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Privacy Policy - Public */}
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Terms of Service - Public */}
        <Route path="/terms" element={<TermsOfService />} />

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#EAE8E3',
                color: '#111111',
                borderRadius: '50px',
                padding: '12px 24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: '0.95rem',
                fontWeight: 500
              },
              success: {
                iconTheme: {
                  primary: '#166534',
                  secondary: '#F0FDF4'
                }
              },
              error: {
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FEF2F2'
                }
              }
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
