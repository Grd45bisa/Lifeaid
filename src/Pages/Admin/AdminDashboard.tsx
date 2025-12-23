import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminLanguage } from '../../Components/Admin/AdminLanguageContext';
import { fetchDashboardStats } from '../../utils/supabaseClient';
import './AdminDashboard.css';

interface DashboardStats {
    totalConversations: number;
    totalLeads: number;
    todayMessages: number;
}

const AdminDashboard = () => {
    const { lang } = useAdminLanguage();
    const [stats, setStats] = useState<DashboardStats>({
        totalConversations: 0,
        totalLeads: 0,
        todayMessages: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Get admin name from localStorage
    const getAdminName = () => {
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            return user.name || 'Admin';
        } catch { return 'Admin'; }
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (lang === 'id') {
            if (hour < 12) return 'Selamat Pagi';
            if (hour < 15) return 'Selamat Siang';
            if (hour < 18) return 'Selamat Sore';
            return 'Selamat Malam';
        } else {
            if (hour < 12) return 'Good Morning';
            if (hour < 18) return 'Good Afternoon';
            return 'Good Evening';
        }
    };

    const loadStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchDashboardStats();
            setStats(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(lang === 'id'
                ? 'Gagal memuat statistik. Periksa koneksi database.'
                : 'Failed to load statistics. Check database connection.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        // Auto-refresh every 60 seconds
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        return lastUpdated.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = () => {
        return new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Translations
    const t = {
        subtitle: lang === 'id' ? 'Kelola bisnis Anda dengan mudah' : 'Manage your business with ease',
        totalConversations: lang === 'id' ? 'Total Percakapan' : 'Total Conversations',
        totalLeads: lang === 'id' ? 'Total Leads' : 'Total Leads',
        todayMessages: lang === 'id' ? 'Pesan Hari Ini' : "Today's Messages",
        quickAccess: lang === 'id' ? 'Akses Cepat' : 'Quick Access',
        chatHistory: lang === 'id' ? 'Riwayat Chat' : 'Chat History',
        manageProducts: lang === 'id' ? 'Kelola Produk' : 'Manage Products',
        viewMessages: lang === 'id' ? 'Lihat Pesan' : 'View Messages',
        settings: lang === 'id' ? 'Pengaturan' : 'Settings',
        lastUpdated: lang === 'id' ? 'Terakhir diperbarui' : 'Last updated',
        retry: lang === 'id' ? 'Coba Lagi' : 'Retry',
        viewAll: lang === 'id' ? 'Lihat Semua' : 'View All',
        overview: lang === 'id' ? 'Ringkasan' : 'Overview'
    };

    return (
        <div className="admin-dashboard">
            {/* Welcome Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <h1>{getGreeting()}, {getAdminName()}!</h1>
                        <p className="date-text">{formatDate()}</p>
                    </div>
                    <p className="subtitle">{t.subtitle}</p>
                </div>
                <button
                    className="refresh-btn-small"
                    onClick={loadStats}
                    disabled={isLoading}
                    title={lang === 'id' ? 'Refresh data' : 'Refresh data'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                </button>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <button onClick={loadStats}>{t.retry}</button>
                </div>
            )}

            {/* Statistics Section */}
            <section className="stats-section">
                <div className="section-header">
                    <h2>{t.overview}</h2>
                    {lastUpdated && (
                        <span className="last-updated">{t.lastUpdated}: {formatLastUpdated()}</span>
                    )}
                </div>
                <div className="stats-grid">
                    <div className={`stat-card gradient-blue ${isLoading ? 'loading' : ''}`}>
                        <div className="stat-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {isLoading ? '—' : stats.totalConversations.toLocaleString()}
                            </span>
                            <span className="stat-label">{t.totalConversations}</span>
                        </div>
                    </div>

                    <div className={`stat-card gradient-purple ${isLoading ? 'loading' : ''}`}>
                        <div className="stat-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {isLoading ? '—' : stats.totalLeads.toLocaleString()}
                            </span>
                            <span className="stat-label">{t.totalLeads}</span>
                        </div>
                    </div>

                    <div className={`stat-card gradient-green ${isLoading ? 'loading' : ''}`}>
                        <div className="stat-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {isLoading ? '—' : stats.todayMessages.toLocaleString()}
                            </span>
                            <span className="stat-label">{t.todayMessages}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="actions-section">
                <h2>{t.quickAccess}</h2>
                <div className="quick-actions">
                    <Link to="/admin/chat-history" className="action-card">
                        <div className="action-icon blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="action-content">
                            <h3>{t.chatHistory}</h3>
                            <p>{lang === 'id' ? 'Lihat semua percakapan' : 'View all conversations'}</p>
                        </div>
                        <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>

                    <Link to="/admin/products" className="action-card">
                        <div className="action-icon purple">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                        </div>
                        <div className="action-content">
                            <h3>{t.manageProducts}</h3>
                            <p>{lang === 'id' ? 'Tambah atau edit produk' : 'Add or edit products'}</p>
                        </div>
                        <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>

                    <Link to="/admin/messages" className="action-card">
                        <div className="action-icon green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <div className="action-content">
                            <h3>{t.viewMessages}</h3>
                            <p>{lang === 'id' ? 'Pesan dari contact form' : 'Messages from contact form'}</p>
                        </div>
                        <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>

                    <Link to="/admin/settings" className="action-card">
                        <div className="action-icon orange">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        </div>
                        <div className="action-content">
                            <h3>{t.settings}</h3>
                            <p>{lang === 'id' ? 'Pengaturan website' : 'Website settings'}</p>
                        </div>
                        <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
