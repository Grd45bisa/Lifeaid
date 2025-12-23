import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSession, onAuthStateChange, getCurrentUser } from '../../utils/supabaseClient';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check initial session
        const checkSession = async () => {
            try {
                const session = await getSession();
                setIsAuthenticated(!!session);

                // Store user info for sidebar display
                if (session) {
                    const user = await getCurrentUser();
                    if (user) {
                        localStorage.setItem('adminUser', JSON.stringify({
                            name: user.display_name,
                            role: user.role
                        }));
                    }
                }
            } catch (error) {
                console.error('Session check error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange((session) => {
            setIsAuthenticated(!!session);
            if (!session) {
                localStorage.removeItem('adminUser');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#f8fafc'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#224570',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page, but save the attempted URL
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
