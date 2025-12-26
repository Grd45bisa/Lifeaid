import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { getCurrentUser, updateUserEmail, updateUserPassword, updateAdminProfile, type AdminProfile } from '../../utils/supabaseClient';
import './AdminProfile.css';

const AdminProfilePage = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<AdminProfile | null>(null);

    // Form states
    const [displayName, setDisplayName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Status states
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    setProfile(user);
                    setDisplayName(user.display_name || '');
                    setNewEmail(user.email);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingName(true);
        try {
            await updateAdminProfile(displayName);
            localStorage.setItem('adminUser', JSON.stringify({
                name: displayName,
                role: profile?.role
            }));
            showMessage('success', lang === 'id' ? 'Nama berhasil diubah!' : 'Name updated successfully!');
        } catch (err) {
            console.error(err);
            showMessage('error', t.common.error[lang]);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newEmail === profile?.email) {
            showMessage('error', lang === 'id' ? 'Email sama dengan yang lama' : 'Email is the same');
            return;
        }
        setIsSavingEmail(true);
        try {
            await updateUserEmail(newEmail);
            showMessage('success', lang === 'id'
                ? 'Email konfirmasi telah dikirim ke email baru!'
                : 'Confirmation email sent to new email!');
        } catch (err) {
            console.error(err);
            showMessage('error', t.common.error[lang]);
        } finally {
            setIsSavingEmail(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            showMessage('error', lang === 'id'
                ? 'Password minimal 6 karakter'
                : 'Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('error', lang === 'id'
                ? 'Password tidak cocok'
                : 'Passwords do not match');
            return;
        }

        setIsSavingPassword(true);
        try {
            await updateUserPassword(newPassword);
            setNewPassword('');
            setConfirmPassword('');
            showMessage('success', lang === 'id'
                ? 'Password berhasil diubah!'
                : 'Password updated successfully!');
        } catch (err) {
            console.error(err);
            showMessage('error', t.common.error[lang]);
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>{t.common.loading[lang]}</p>
            </div>
        );
    }

    return (
        <div className="admin-profile-page">
            <header className="profile-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>
                    ← {t.common.back[lang]}
                </button>
                <h1>{lang === 'id' ? 'Profil Admin' : 'Admin Profile'}</h1>
            </header>

            {message && (
                <div className={`message-alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-sections">
                {/* Display Name Section */}
                <section className="profile-section">
                    <h2>{lang === 'id' ? 'Nama Tampilan' : 'Display Name'}</h2>
                    <form onSubmit={handleUpdateName}>
                        <div className="form-group">
                            <label htmlFor="profile-name">{lang === 'id' ? 'Nama' : 'Name'}</label>
                            <input
                                id="profile-name"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder={lang === 'id' ? 'Masukkan nama' : 'Enter name'}
                                required
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={isSavingName}>
                            {isSavingName ? t.common.loading[lang] : t.common.save[lang]}
                        </button>
                    </form>
                </section>

                {/* Email Section */}
                <section className="profile-section">
                    <h2>{lang === 'id' ? 'Ubah Email' : 'Change Email'}</h2>
                    <form onSubmit={handleUpdateEmail}>
                        <div className="form-group">
                            <label htmlFor="profile-email">Email</label>
                            <input
                                id="profile-email"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder={lang === 'id' ? 'Masukkan email baru' : 'Enter new email'}
                                required
                            />
                        </div>
                        <p className="form-hint">
                            {lang === 'id'
                                ? 'Email konfirmasi akan dikirim ke email baru'
                                : 'Confirmation will be sent to new email'}
                        </p>
                        <button type="submit" className="save-btn" disabled={isSavingEmail}>
                            {isSavingEmail ? t.common.loading[lang] : (lang === 'id' ? 'Ubah Email' : 'Change Email')}
                        </button>
                    </form>
                </section>

                {/* Password Section */}
                <section className="profile-section">
                    <h2>{lang === 'id' ? 'Ubah Password' : 'Change Password'}</h2>
                    <form onSubmit={handleUpdatePassword}>
                        <div className="form-group">
                            <label htmlFor="profile-password">{lang === 'id' ? 'Password Baru' : 'New Password'}</label>
                            <input
                                id="profile-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={lang === 'id' ? 'Minimal 6 karakter' : 'Minimum 6 characters'}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile-password-confirm">{lang === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}</label>
                            <input
                                id="profile-password-confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={lang === 'id' ? 'Ulangi password baru' : 'Repeat new password'}
                                required
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={isSavingPassword}>
                            {isSavingPassword ? t.common.loading[lang] : (lang === 'id' ? 'Ubah Password' : 'Change Password')}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default AdminProfilePage;
