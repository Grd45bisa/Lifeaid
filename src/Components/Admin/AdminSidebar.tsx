import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from './AdminLanguageContext';
import './AdminSidebar.css';

// Icons as SVG components
const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const ChatIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const ProductIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

const TestimonialIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const MessageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const AdminSidebar = () => {
    const navigate = useNavigate();
    const { lang, setLang } = useAdminLanguage();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isAdminLoggedIn');
        navigate('/admin/login');
    };

    const closeMobileMenu = () => {
        setIsMobileOpen(false);
    };

    const toggleLanguage = () => {
        setLang(lang === 'id' ? 'en' : 'id');
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="mobile-header">
                <button
                    className="hamburger-btn"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
                <div className="mobile-logo">
                    <img src="/Logo-trans.webp" alt="LifeAid" />
                    <span>{t.sidebar.admin[lang]}</span>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div className="sidebar-overlay" onClick={closeMobileMenu} />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <img src="/Logo-trans.webp" alt="LifeAid Logo" />
                    <span>{t.sidebar.adminPanel[lang]}</span>
                </div>

                {/* User Info */}
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {(() => {
                            try {
                                const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
                                return (user.name || 'Admin').charAt(0).toUpperCase();
                            } catch { return 'A'; }
                        })()}
                    </div>
                    <div className="user-info">
                        <span className="user-name">
                            {(() => {
                                try {
                                    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
                                    return user.name || 'Administrator';
                                } catch { return 'Administrator'; }
                            })()}
                        </span>
                        <span className="user-role">
                            {(() => {
                                try {
                                    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
                                    return user.role || 'Admin';
                                } catch { return 'Admin'; }
                            })()}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-title">Menu</span>
                        <ul>
                            <li>
                                <NavLink
                                    to="/admin"
                                    end
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={closeMobileMenu}
                                >
                                    <DashboardIcon />
                                    <span>{t.sidebar.dashboard[lang]}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/chat-history"
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={closeMobileMenu}
                                >
                                    <ChatIcon />
                                    <span>{t.sidebar.chatHistory[lang]}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/products"
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={closeMobileMenu}
                                >
                                    <ProductIcon />
                                    <span>{t.sidebar.products[lang]}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/testimonials"
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={closeMobileMenu}
                                >
                                    <TestimonialIcon />
                                    <span>{t.sidebar.testimonials[lang]}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/messages"
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={closeMobileMenu}
                                >
                                    <MessageIcon />
                                    <span>{t.sidebar.messages[lang]}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/settings"
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={closeMobileMenu}
                                >
                                    <SettingsIcon />
                                    <span>{t.sidebar.settings[lang]}</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {/* Language Toggle */}
                    <button className="lang-toggle-btn" onClick={toggleLanguage}>
                        <span className={lang === 'id' ? 'active' : ''}>ID</span>
                        <span className={lang === 'en' ? 'active' : ''}>EN</span>
                    </button>

                    {/* Logout */}
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogoutIcon />
                        <span>{t.sidebar.logout[lang]}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
