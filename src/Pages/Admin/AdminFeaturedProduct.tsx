import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { fetchFeaturedProduct, updateFeaturedProduct, type FeaturedProductContent, defaultFeaturedProduct } from '../../utils/supabaseClient';
import '../Admin/AdminProductForm.css';

const AdminFeaturedProduct = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');
    const [formData, setFormData] = useState<FeaturedProductContent>(defaultFeaturedProduct);

    // Load content
    useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            try {
                const content = await fetchFeaturedProduct();
                setFormData(content);
            } catch (err) {
                console.error('Error loading content:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, []);

    const handleChange = (field: keyof FeaturedProductContent, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Image to Base64
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image_base64: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const success = await updateFeaturedProduct(formData);
            if (success) {
                alert(lang === 'id' ? 'Berhasil disimpan!' : 'Saved successfully!');
            } else {
                alert(t.common.error[lang]);
            }
        } catch (err) {
            console.error('Error saving:', err);
            alert(t.common.error[lang]);
        } finally {
            setIsSaving(false);
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
        <div className="admin-product-form-page">
            <header className="form-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>
                    ← {t.common.back[lang]}
                </button>
                <h1>{lang === 'id' ? 'Edit Produk Unggulan' : 'Edit Featured Product'}</h1>
            </header>

            <form onSubmit={handleSubmit} className="product-form">
                {/* Product Image */}
                <div className="form-section">
                    <h2>{lang === 'id' ? 'Gambar Produk' : 'Product Image'}</h2>
                    <div className="image-upload-area">
                        {formData.image_base64 ? (
                            <div className="image-preview">
                                <img src={formData.image_base64} alt="Preview" />
                                <button type="button" onClick={() => handleChange('image_base64', '')}>✕</button>
                            </div>
                        ) : (
                            <label className="upload-label">
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                <span>{lang === 'id' ? 'Upload Gambar' : 'Upload Image'}</span>
                            </label>
                        )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
                        {lang === 'id'
                            ? 'Kosongkan untuk menggunakan gambar default (/Product.webp)'
                            : 'Leave empty to use default image (/Product.webp)'}
                    </p>
                </div>

                {/* Content with Language Tabs */}
                <div className="form-section">
                    <h2>{lang === 'id' ? 'Konten' : 'Content'}</h2>

                    {/* Language Tabs */}
                    <div className="lang-tabs">
                        <div
                            className={`tab-item ${activeTab === 'id' ? 'active' : ''}`}
                            onClick={() => setActiveTab('id')}
                        >
                            🇮🇩 Bahasa Indonesia
                        </div>
                        <div
                            className={`tab-item ${activeTab === 'en' ? 'active' : ''}`}
                            onClick={() => setActiveTab('en')}
                        >
                            🇬🇧 English
                        </div>
                    </div>

                    {/* Indonesian Fields */}
                    <div className={`lang-fields ${activeTab === 'id' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>Badge</label>
                            <input
                                type="text"
                                value={formData.badge_id}
                                onChange={(e) => handleChange('badge_id', e.target.value)}
                                placeholder="PRODUK UNGGULAN"
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Utama' : 'Main Title'}</label>
                            <input
                                type="text"
                                value={formData.title_id}
                                onChange={(e) => handleChange('title_id', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subtitle</label>
                            <textarea
                                value={formData.subtitle_id}
                                onChange={(e) => handleChange('subtitle_id', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Produk' : 'Product Title'}</label>
                            <input
                                type="text"
                                value={formData.product_title_id}
                                onChange={(e) => handleChange('product_title_id', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Produk' : 'Product Description'}</label>
                            <textarea
                                value={formData.product_desc_id}
                                onChange={(e) => handleChange('product_desc_id', e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Fungsi Utama' : 'Main Function Title'}</label>
                                <input
                                    type="text"
                                    value={formData.main_function_title_id}
                                    onChange={(e) => handleChange('main_function_title_id', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Cocok Untuk' : 'Suitable For Title'}</label>
                                <input
                                    type="text"
                                    value={formData.suitable_for_title_id}
                                    onChange={(e) => handleChange('suitable_for_title_id', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Fungsi Utama' : 'Main Function Description'}</label>
                            <textarea
                                value={formData.main_function_desc_id}
                                onChange={(e) => handleChange('main_function_desc_id', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Cocok Untuk' : 'Suitable For Description'}</label>
                            <textarea
                                value={formData.suitable_for_desc_id}
                                onChange={(e) => handleChange('suitable_for_desc_id', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* English Fields */}
                    <div className={`lang-fields ${activeTab === 'en' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>Badge</label>
                            <input
                                type="text"
                                value={formData.badge_en}
                                onChange={(e) => handleChange('badge_en', e.target.value)}
                                placeholder="FEATURED PRODUCTS"
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Utama' : 'Main Title'}</label>
                            <input
                                type="text"
                                value={formData.title_en}
                                onChange={(e) => handleChange('title_en', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subtitle</label>
                            <textarea
                                value={formData.subtitle_en}
                                onChange={(e) => handleChange('subtitle_en', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Produk' : 'Product Title'}</label>
                            <input
                                type="text"
                                value={formData.product_title_en}
                                onChange={(e) => handleChange('product_title_en', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Produk' : 'Product Description'}</label>
                            <textarea
                                value={formData.product_desc_en}
                                onChange={(e) => handleChange('product_desc_en', e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Fungsi Utama' : 'Main Function Title'}</label>
                                <input
                                    type="text"
                                    value={formData.main_function_title_en}
                                    onChange={(e) => handleChange('main_function_title_en', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Cocok Untuk' : 'Suitable For Title'}</label>
                                <input
                                    type="text"
                                    value={formData.suitable_for_title_en}
                                    onChange={(e) => handleChange('suitable_for_title_en', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Fungsi Utama' : 'Main Function Description'}</label>
                            <textarea
                                value={formData.main_function_desc_en}
                                onChange={(e) => handleChange('main_function_desc_en', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Cocok Untuk' : 'Suitable For Description'}</label>
                            <textarea
                                value={formData.suitable_for_desc_en}
                                onChange={(e) => handleChange('suitable_for_desc_en', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/admin')}>
                        {t.common.cancel[lang]}
                    </button>
                    <button type="submit" className="save-btn" disabled={isSaving}>
                        {isSaving ? t.common.loading[lang] : t.common.save[lang]}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminFeaturedProduct;
