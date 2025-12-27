import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { createTestimonial, updateTestimonial, fetchTestimonials } from '../../utils/supabaseClient';
import { translateMultiple } from '../../utils/translateService';
import './AdminTestimonialForm.css';
import '../Admin/AdminProductForm.css';

// Translate icon
const TranslateIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" /></svg>;

const AdminTestimonialForm = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');

    // Language Switcher Logic
    const tabsRef = useRef<HTMLDivElement>(null);
    const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        const updateSlider = () => {
            if (tabsRef.current) {
                const activeBtn = tabsRef.current.querySelector('.tab-item.active') as HTMLElement;
                if (activeBtn) {
                    setSliderStyle({
                        width: `${activeBtn.offsetWidth}px`,
                        transform: `translateX(${activeBtn.offsetLeft - 4}px)`
                    });
                }
            }
        };
        updateSlider();
        const timer = setTimeout(updateSlider, 50);
        window.addEventListener('resize', updateSlider);
        return () => {
            window.removeEventListener('resize', updateSlider);
            clearTimeout(timer);
        };
    }, [activeTab]);
    const [formData, setFormData] = useState({
        name: '',
        role_id: '',
        role_en: '',
        rating: 5,
        comment_id: '',
        comment_en: '',
        is_active: true,
        sort_order: 0
    });

    useEffect(() => {
        if (isEdit && id) {
            loadTestimonial(parseInt(id));
        }
    }, [id, isEdit]);

    const loadTestimonial = async (testimonialId: number) => {
        setIsLoading(true);
        try {
            const data = await fetchTestimonials();
            const item = data.find(d => d.id === testimonialId);
            if (item) {
                setFormData({
                    name: item.name,
                    role_id: item.role_id || '',
                    role_en: item.role_en || '',
                    rating: item.rating,
                    comment_id: item.comment_id,
                    comment_en: item.comment_en,
                    is_active: item.is_active ?? true,
                    sort_order: item.sort_order || 0
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto translate handler
    const handleAutoTranslate = async () => {
        setIsTranslating(true);
        try {
            const sourceLang = activeTab;
            const targetLang = activeTab === 'id' ? 'en' : 'id';

            const sourceTexts: Record<string, string> = {};
            if (sourceLang === 'id') {
                if (formData.role_id) sourceTexts.role = formData.role_id;
                if (formData.comment_id) sourceTexts.comment = formData.comment_id;
            } else {
                if (formData.role_en) sourceTexts.role = formData.role_en;
                if (formData.comment_en) sourceTexts.comment = formData.comment_en;
            }

            if (Object.keys(sourceTexts).length === 0) {
                alert(lang === 'id' ? 'Tidak ada teks untuk diterjemahkan' : 'No text to translate');
                return;
            }

            const translated = await translateMultiple(sourceTexts, sourceLang, targetLang);

            if (targetLang === 'en') {
                if (translated.role) setFormData(prev => ({ ...prev, role_en: translated.role }));
                if (translated.comment) setFormData(prev => ({ ...prev, comment_en: translated.comment }));
            } else {
                if (translated.role) setFormData(prev => ({ ...prev, role_id: translated.role }));
                if (translated.comment) setFormData(prev => ({ ...prev, comment_id: translated.comment }));
            }

            alert(lang === 'id' ? 'Terjemahan berhasil!' : 'Translation complete!');
        } catch (error) {
            console.error('Translation error:', error);
            alert(lang === 'id' ? 'Terjemahan gagal. Coba lagi nanti.' : 'Translation failed. Try again later.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.comment_id || !formData.comment_en) {
            alert(lang === 'id' ? 'Nama dan komentar harus diisi' : 'Name and comments are required');
            return;
        }
        setIsSaving(true);
        try {
            if (isEdit && id) {
                await updateTestimonial(parseInt(id), formData);
            } else {
                await createTestimonial(formData);
            }
            navigate('/admin/testimonials');
        } catch (err) {
            console.error(err);
            alert(t.common.error[lang]);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="loading-state"><div className="spinner"></div><p>{t.common.loading[lang]}</p></div>;
    }

    return (
        <div className="admin-testimonial-form-page">
            <header className="form-header">
                <button className="back-btn" onClick={() => navigate('/admin/testimonials')}>← {t.common.back[lang]}</button>
                <h1>{isEdit ? t.common.edit[lang] : t.testimonials.addNew[lang]}</h1>
            </header>
            <form onSubmit={handleSubmit} className="testimonial-form">
                <div className="form-section">
                    {/* Name field */}
                    <div className="form-group">
                        <label>{t.testimonials.name[lang]} *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>

                    {/* Rating */}
                    <div className="form-group">
                        <label>{t.testimonials.rating[lang]}</label>
                        <div className="rating-input">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" className={formData.rating >= star ? 'active' : ''} onClick={() => setFormData({ ...formData, rating: star })}>★</button>
                            ))}
                        </div>
                    </div>

                    {/* Lang Tabs Header with Translate Button */}
                    <div className="lang-tabs-header" style={{ marginTop: '1.5rem' }}>
                        <div className="lang-tabs" ref={tabsRef}>
                            <div className="slider" style={sliderStyle}></div>
                            <button
                                type="button"
                                className={`tab-item ${activeTab === 'id' ? 'active' : ''}`}
                                onClick={() => setActiveTab('id')}
                            >
                                <span className="t-short">ID</span>
                                <span className="t-full">ID INDONESIA</span>
                            </button>
                            <button
                                type="button"
                                className={`tab-item ${activeTab === 'en' ? 'active' : ''}`}
                                onClick={() => setActiveTab('en')}
                            >
                                <span className="t-short">EN</span>
                                <span className="t-full">EN ENGLISH</span>
                            </button>
                        </div>
                        <button type="button" className="translate-btn" onClick={handleAutoTranslate} disabled={isTranslating}>
                            <TranslateIcon />
                            <span className="btn-text">
                                {isTranslating
                                    ? (lang === 'id' ? 'Menerjemahkan...' : 'Translating...')
                                    : (activeTab === 'id' ? 'Translate → EN' : 'Translate → ID')}
                            </span>
                        </button>
                    </div>

                    {/* Indonesian Fields */}
                    <div className={`lang-fields ${activeTab === 'id' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>{t.testimonials.role[lang]}</label>
                            <input type="text" value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} placeholder="Ibu Rumah Tangga" />
                        </div>
                        <div className="form-group">
                            <label>{t.testimonials.comment[lang]} *</label>
                            <textarea value={formData.comment_id} onChange={(e) => setFormData({ ...formData, comment_id: e.target.value })} rows={4} required />
                        </div>
                    </div>

                    {/* English Fields */}
                    <div className={`lang-fields ${activeTab === 'en' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>{t.testimonials.role[lang]}</label>
                            <input type="text" value={formData.role_en} onChange={(e) => setFormData({ ...formData, role_en: e.target.value })} placeholder="Housewife" />
                        </div>
                        <div className="form-group">
                            <label>{t.testimonials.comment[lang]} *</label>
                            <textarea value={formData.comment_en} onChange={(e) => setFormData({ ...formData, comment_en: e.target.value })} rows={4} required />
                        </div>
                    </div>

                    {/* Active checkbox */}
                    <div className="form-group checkbox-group" style={{ marginTop: '1rem' }}>
                        <label>
                            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                            {t.common.active[lang]}
                        </label>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/admin/testimonials')}>{t.common.cancel[lang]}</button>
                    <button type="submit" className="save-btn" disabled={isSaving}>{isSaving ? t.common.loading[lang] : t.common.save[lang]}</button>
                </div>
            </form>
        </div>
    );
};

export default AdminTestimonialForm;
