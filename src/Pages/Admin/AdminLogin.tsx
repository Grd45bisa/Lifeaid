import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import './AdminLogin.css';

// Fallback credentials (when Supabase is not available)
const FALLBACK_CREDENTIALS = {
    username: 'admin',
    password: 'lifeaid!@#$'
};

const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Try to authenticate via Supabase
            const { data, error: dbError } = await supabase
                .from('admin_users')
                .select('id, username, name, role, is_active, password')
                .eq('username', username)
                .eq('is_active', true);

            if (dbError) {
                console.warn('Supabase query error:', dbError);
                // Fallback to hardcoded credentials
                if (
                    username === FALLBACK_CREDENTIALS.username &&
                    password === FALLBACK_CREDENTIALS.password
                ) {
                    loginSuccess({ username: 'admin', name: 'Administrator', role: 'superadmin' });
                    return;
                }
                throw new Error('Database error');
            }

            // Check if user found and password matches
            const user = data?.find(u => u.password === password);

            if (!user) {
                // Fallback to hardcoded credentials
                if (
                    username === FALLBACK_CREDENTIALS.username &&
                    password === FALLBACK_CREDENTIALS.password
                ) {
                    loginSuccess({ username: 'admin', name: 'Administrator', role: 'superadmin' });
                    return;
                }
                throw new Error('Invalid credentials');
            }

            // Update last login timestamp
            await supabase
                .from('admin_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);

            loginSuccess({ id: user.id, username: user.username, name: user.name, role: user.role });
        } catch (err) {
            console.error('Login error:', err);
            setError('Username atau password salah!');
        } finally {
            setIsLoading(false);
        }
    };

    const loginSuccess = (userData: { id?: number; username: string; name: string; role: string }) => {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify(userData));
        navigate('/admin');
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                {/* Logo */}
                <div className="login-logo">
                    <img src="/Logo-trans-blue.svg" alt="LifeAid Logo" />
                    <h1>Admin Panel</h1>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Memproses...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="login-footer">
                    © {new Date().getFullYear()} LifeAid. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
