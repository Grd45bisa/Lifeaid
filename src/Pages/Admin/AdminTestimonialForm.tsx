import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { createTestimonial, updateTestimonial, fetchTestimonials } from '../../utils/supabaseClient';
import './AdminTestimonialForm.css';

const AdminTestimonialForm = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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
                    <div className="form-group">
                        <label>{t.testimonials.name[lang]} *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t.testimonials.role[lang]} (ID)</label>
                            <input type="text" value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} placeholder="Ibu Rumah Tangga" />
                        </div>
                        <div className="form-group">
                            <label>{t.testimonials.role[lang]} (EN)</label>
                            <input type="text" value={formData.role_en} onChange={(e) => setFormData({ ...formData, role_en: e.target.value })} placeholder="Housewife" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t.testimonials.rating[lang]}</label>
                        <div className="rating-input">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" className={formData.rating >= star ? 'active' : ''} onClick={() => setFormData({ ...formData, rating: star })}>★</button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t.testimonials.comment[lang]} (ID) *</label>
                        <textarea value={formData.comment_id} onChange={(e) => setFormData({ ...formData, comment_id: e.target.value })} rows={4} required />
                    </div>
                    <div className="form-group">
                        <label>{t.testimonials.comment[lang]} (EN) *</label>
                        <textarea value={formData.comment_en} onChange={(e) => setFormData({ ...formData, comment_en: e.target.value })} rows={4} required />
                    </div>
                    <div className="form-group checkbox-group">
                        <label><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /> {t.common.active[lang]}</label>
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
