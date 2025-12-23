import { useState, useEffect } from 'react';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { supabase } from '../../utils/supabaseClient';
import './AdminSettings.css';

interface SettingsData {
    whatsapp: string;
    email: string;
    phone: string;
    address: string;
    tokopedia: string;
    shopee: string;
    instagram: string;
    facebook: string;
    use_database_products: string; // 'true' or 'false'
}

const defaultSettings: SettingsData = {
    whatsapp: '',
    email: '',
    phone: '',
    address: '',
    tokopedia: '',
    shopee: '',
    instagram: '',
    facebook: '',
    use_database_products: 'false'
};

const AdminSettings = () => {
    const { lang } = useAdminLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [useLocalStorage, setUseLocalStorage] = useState(false);
    const [formData, setFormData] = useState<SettingsData>(defaultSettings);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('website_settings')
                .select('key, value');

            if (error) {
                console.warn('Supabase error, using localStorage:', error.message);
                setUseLocalStorage(true);
                loadFromLocalStorage();
                return;
            }

            if (data && data.length > 0) {
                const settings: Partial<SettingsData> = {};
                data.forEach((item: { key: string; value: string }) => {
                    if (item.key in defaultSettings) {
                        settings[item.key as keyof SettingsData] = item.value || '';
                    }
                });
                setFormData(prev => ({ ...prev, ...settings }));
            } else {
                loadFromLocalStorage();
            }
        } catch (err) {
            console.warn('Error loading from Supabase:', err);
            setUseLocalStorage(true);
            loadFromLocalStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('website-settings');
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch { }
        }
    };

    const handleChange = (field: keyof SettingsData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Always save to localStorage first
        localStorage.setItem('website-settings', JSON.stringify(formData));

        if (!useLocalStorage) {
            try {
                for (const [key, value] of Object.entries(formData)) {
                    const { error } = await supabase
                        .from('website_settings')
                        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
                    if (error) throw error;
                }
            } catch (err) {
                console.warn('Supabase save failed, saved to localStorage only:', err);
            }
        }

        setIsSaving(false);
        alert(t.common.success[lang]);
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
        <div className="admin-settings-page">
            <header className="page-header">
                <h1>{t.settings.title[lang]}</h1>
                <p>{lang === 'id' ? 'Kelola informasi kontak dan link website' : 'Manage contact info and website links'}</p>
                {useLocalStorage && (
                    <small style={{ color: '#f59e0b', marginTop: '0.5rem', display: 'block' }}>
                        ⚠️ {lang === 'id' ? 'Menggunakan penyimpanan lokal (Supabase belum tersedia)' : 'Using local storage (Supabase not available)'}
                    </small>
                )}
            </header>

            <div className="settings-form">
                <section className="settings-section">
                    <h2>{t.settings.contact[lang]}</h2>
                    <div className="form-group">
                        <label>{t.settings.whatsapp[lang]}</label>
                        <input type="text" value={formData.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="628123456789" />
                        <small>{lang === 'id' ? 'Contoh: 628123456789 (tanpa + atau spasi)' : 'Example: 628123456789 (without + or spaces)'}</small>
                    </div>
                    <div className="form-group">
                        <label>{t.settings.email[lang]}</label>
                        <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="contact@lifeaid.com" />
                    </div>
                    <div className="form-group">
                        <label>{t.settings.phone[lang]}</label>
                        <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="021-1234567" />
                    </div>
                    <div className="form-group">
                        <label>{t.settings.address[lang]}</label>
                        <textarea value={formData.address} onChange={(e) => handleChange('address', e.target.value)} rows={3} placeholder={lang === 'id' ? 'Alamat lengkap toko' : 'Full store address'} />
                    </div>
                </section>

                <section className="settings-section">
                    <h2>{lang === 'id' ? 'Link Marketplace' : 'Marketplace Links'}</h2>
                    <div className="form-group">
                        <label>{t.settings.tokopedia[lang]}</label>
                        <input type="url" value={formData.tokopedia} onChange={(e) => handleChange('tokopedia', e.target.value)} placeholder="https://tokopedia.com/..." />
                    </div>
                    <div className="form-group">
                        <label>{t.settings.shopee[lang]}</label>
                        <input type="url" value={formData.shopee} onChange={(e) => handleChange('shopee', e.target.value)} placeholder="https://shopee.co.id/..." />
                    </div>
                </section>

                <section className="settings-section">
                    <h2>{t.settings.social[lang]}</h2>
                    <div className="form-group">
                        <label>Instagram</label>
                        <input type="url" value={formData.instagram} onChange={(e) => handleChange('instagram', e.target.value)} placeholder="https://instagram.com/..." />
                    </div>
                    <div className="form-group">
                        <label>Facebook</label>
                        <input type="url" value={formData.facebook} onChange={(e) => handleChange('facebook', e.target.value)} placeholder="https://facebook.com/..." />
                    </div>
                </section>

                <section className="settings-section">
                    <h2>{lang === 'id' ? 'Sumber Data Produk' : 'Product Data Source'}</h2>
                    <div className="form-group toggle-group">
                        <div className="toggle-label">
                            <label>{lang === 'id' ? 'Gunakan Data dari Database' : 'Use Database Products'}</label>
                            <small>{lang === 'id'
                                ? 'Jika aktif, halaman produk user akan menggunakan data dari tabel products di Supabase. Jika nonaktif, menggunakan data default statis.'
                                : 'When enabled, user-facing product pages will use data from Supabase products table. When disabled, uses static default data.'
                            }</small>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={formData.use_database_products === 'true'}
                                onChange={(e) => handleChange('use_database_products', e.target.checked ? 'true' : 'false')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </section>

                <div className="form-actions">
                    <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? t.common.loading[lang] : t.common.save[lang]}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
