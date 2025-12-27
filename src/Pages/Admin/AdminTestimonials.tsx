import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { fetchTestimonials, deleteTestimonial, type Testimonial } from '../../utils/supabaseClient';
import './AdminTestimonials.css';

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const AdminTestimonials = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTestimonials = async () => {
        setIsLoading(true);
        try {
            const data = await fetchTestimonials();
            setTestimonials(data);
        } catch (err) {
            console.error(err);
            setError(t.common.error[lang]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadTestimonials(); }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm(t.common.confirmDelete[lang])) return;
        try {
            await deleteTestimonial(id);
            setTestimonials(testimonials.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
            alert(t.common.error[lang]);
        }
    };

    return (
        <div className="admin-testimonials-page">
            <header className="page-header">
                <div className="header-title">
                    <h1>{t.testimonials.title[lang]}</h1>
                </div>
                <button className="add-btn" onClick={() => navigate('/admin/testimonials/new')}>
                    <PlusIcon /><span>{t.testimonials.addNew[lang]}</span>
                </button>
            </header>

            {error && <div className="error-message"><p>{error}</p></div>}

            {isLoading ? (
                <div className="loading-state"><div className="spinner"></div><p>{t.common.loading[lang]}</p></div>
            ) : testimonials.length === 0 ? (
                <div className="empty-state"><p>{t.common.noData[lang]}</p></div>
            ) : (
                <div className="testimonials-grid">
                    {testimonials.map((item) => (
                        <div key={item.id} className="testimonial-card">
                            <div className="testimonial-header">
                                <div className="testimonial-avatar">{item.name.charAt(0).toUpperCase()}</div>
                                <div className="testimonial-info">
                                    <h3>{item.name}</h3>
                                    <p>{lang === 'id' ? item.role_id : item.role_en}</p>
                                </div>
                                <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                                    {item.is_active ? t.common.active[lang] : t.common.inactive[lang]}
                                </span>
                            </div>
                            <div className="testimonial-rating">
                                {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} filled={star <= item.rating} />)}
                            </div>
                            <p className="testimonial-comment">{lang === 'id' ? item.comment_id : item.comment_en}</p>
                            <div className="testimonial-actions">
                                <button className="edit-btn" onClick={() => navigate(`/admin/testimonials/edit/${item.id}`)} title={t.common.edit[lang]}>
                                    <EditIcon /> <span className="btn-text">{t.common.edit[lang]}</span>
                                </button>
                                <button className="delete-btn" onClick={() => item.id && handleDelete(item.id)} title={t.common.delete[lang]}>
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminTestimonials;
