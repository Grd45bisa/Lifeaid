import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { createProduct, updateProduct, fetchProductById } from '../../utils/supabaseClient';
import './AdminProductForm.css';

// Icons for markdown toolbar
const BoldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>;
const ItalicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>;
const HeadingIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z" /></svg>;
const LinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>;

const AdminProductForm = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const textareaIdRef = useRef<HTMLTextAreaElement>(null);
    const textareaEnRef = useRef<HTMLTextAreaElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');
    const [formData, setFormData] = useState({
        slug: '',
        image_base64: '',
        thumbnails_base64: [] as string[],
        title_id: '',
        title_en: '',
        price: '',
        price_numeric: 0,
        description_id: '',
        description_en: '',
        condition_id: 'Baru',
        condition_en: 'New',
        min_order_id: '1 Buah',
        min_order_en: '1 Unit',
        category_id: '',
        category_en: '',
        is_active: true,
        sort_order: 0
    });

    // Load product if editing
    useEffect(() => {
        if (isEdit && id) {
            loadProduct(parseInt(id));
        }
    }, [id, isEdit]);

    const loadProduct = async (productId: number) => {
        setIsLoading(true);
        try {
            const product = await fetchProductById(productId);
            if (product) {
                setFormData({
                    slug: product.slug,
                    image_base64: product.image_base64,
                    thumbnails_base64: product.thumbnails_base64 || [],
                    title_id: product.title_id,
                    title_en: product.title_en,
                    price: product.price,
                    price_numeric: product.price_numeric,
                    description_id: product.description_id,
                    description_en: product.description_en,
                    condition_id: product.condition_id || 'Baru',
                    condition_en: product.condition_en || 'New',
                    min_order_id: product.min_order_id || '1 Buah',
                    min_order_en: product.min_order_en || '1 Unit',
                    category_id: product.category_id,
                    category_en: product.category_en,
                    is_active: product.is_active ?? true,
                    sort_order: product.sort_order || 0
                });
            }
        } catch (err) {
            console.error('Error loading product:', err);
            alert(t.common.error[lang]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Auto-generate slug from title_id
        if (field === 'title_id') {
            const slug = (value as string)
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }

        // Auto-parse price to numeric
        if (field === 'price') {
            const numericValue = parseInt((value as string).replace(/\D/g, '')) || 0;
            setFormData(prev => ({ ...prev, price_numeric: numericValue }));
        }
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

    // Markdown toolbar actions
    const insertMarkdown = (prefix: string, suffix: string = '', placeholder: string = '') => {
        const textarea = activeTab === 'id' ? textareaIdRef.current : textareaEnRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const field = activeTab === 'id' ? 'description_id' : 'description_en';
        const currentValue = formData[field];
        const selectedText = currentValue.substring(start, end) || placeholder;

        const newValue =
            currentValue.substring(0, start) +
            prefix + selectedText + suffix +
            currentValue.substring(end);

        handleChange(field, newValue);

        // Set cursor position after insertion
        setTimeout(() => {
            textarea.focus();
            const newPos = start + prefix.length + selectedText.length + suffix.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const handleBold = () => insertMarkdown('**', '**', 'teks tebal');
    const handleItalic = () => insertMarkdown('*', '*', 'teks miring');
    const handleList = () => insertMarkdown('\n• ', '', 'item');
    const handleHeading = () => insertMarkdown('\n## ', '\n', 'Judul');
    const handleLink = () => insertMarkdown('[', '](url)', 'teks link');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title_id || !formData.title_en) {
            alert(lang === 'id' ? 'Nama produk harus diisi' : 'Product name is required');
            return;
        }
        if (!formData.image_base64) {
            alert(lang === 'id' ? 'Gambar produk harus diupload' : 'Product image is required');
            return;
        }

        setIsSaving(true);
        try {
            if (isEdit && id) {
                await updateProduct(parseInt(id), formData);
            } else {
                await createProduct(formData);
            }
            navigate('/admin/products');
        } catch (err) {
            console.error('Error saving product:', err);
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
                <button className="back-btn" onClick={() => navigate('/admin/products')}>
                    ← {t.common.back[lang]}
                </button>
                <h1>{isEdit ? t.products.editProduct[lang] : t.products.addNew[lang]}</h1>
            </header>

            <form onSubmit={handleSubmit} className="product-form">
                {/* Image Upload */}
                <div className="form-section">
                    <h2>{t.products.image[lang]}</h2>
                    <div className="image-upload-area">
                        {formData.image_base64 ? (
                            <div className="image-preview">
                                <img src={formData.image_base64} alt="Preview" />
                                <button type="button" onClick={() => handleChange('image_base64', '')}>✕</button>
                            </div>
                        ) : (
                            <label className="upload-label">
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                <span>{t.products.uploadImage[lang]}</span>
                            </label>
                        )}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="form-section">
                    <h2>{lang === 'id' ? 'Informasi Dasar' : 'Basic Information'}</h2>

                    {/* Language Tabs */}
                    <div className="lang-tabs">
                        <button
                            type="button"
                            className={activeTab === 'id' ? 'active' : ''}
                            onClick={() => setActiveTab('id')}
                        >
                            🇮🇩 Bahasa Indonesia
                        </button>
                        <button
                            type="button"
                            className={activeTab === 'en' ? 'active' : ''}
                            onClick={() => setActiveTab('en')}
                        >
                            🇬🇧 English
                        </button>
                    </div>

                    {/* ID Fields */}
                    <div className={`lang-fields ${activeTab === 'id' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>{t.products.productName[lang]} (ID) *</label>
                            <input
                                type="text"
                                value={formData.title_id}
                                onChange={(e) => handleChange('title_id', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.category[lang]} (ID) *</label>
                            <input
                                type="text"
                                value={formData.category_id}
                                onChange={(e) => handleChange('category_id', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.description[lang]} (ID) *</label>
                            <div className="markdown-toolbar">
                                <button type="button" onClick={handleBold} title="Bold"><BoldIcon /></button>
                                <button type="button" onClick={handleItalic} title="Italic"><ItalicIcon /></button>
                                <button type="button" onClick={handleHeading} title="Heading"><HeadingIcon /></button>
                                <button type="button" onClick={handleList} title="List"><ListIcon /></button>
                                <button type="button" onClick={handleLink} title="Link"><LinkIcon /></button>
                            </div>
                            <textarea
                                ref={textareaIdRef}
                                value={formData.description_id}
                                onChange={(e) => handleChange('description_id', e.target.value)}
                                rows={8}
                                placeholder="Gunakan markdown: **bold**, *italic*, • list, ## heading"
                                required
                            />
                        </div>
                    </div>

                    {/* EN Fields */}
                    <div className={`lang-fields ${activeTab === 'en' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>{t.products.productName[lang]} (EN) *</label>
                            <input
                                type="text"
                                value={formData.title_en}
                                onChange={(e) => handleChange('title_en', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.category[lang]} (EN) *</label>
                            <input
                                type="text"
                                value={formData.category_en}
                                onChange={(e) => handleChange('category_en', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.description[lang]} (EN) *</label>
                            <div className="markdown-toolbar">
                                <button type="button" onClick={handleBold} title="Bold"><BoldIcon /></button>
                                <button type="button" onClick={handleItalic} title="Italic"><ItalicIcon /></button>
                                <button type="button" onClick={handleHeading} title="Heading"><HeadingIcon /></button>
                                <button type="button" onClick={handleList} title="List"><ListIcon /></button>
                                <button type="button" onClick={handleLink} title="Link"><LinkIcon /></button>
                            </div>
                            <textarea
                                ref={textareaEnRef}
                                value={formData.description_en}
                                onChange={(e) => handleChange('description_en', e.target.value)}
                                rows={8}
                                placeholder="Use markdown: **bold**, *italic*, • list, ## heading"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Price & Status */}
                <div className="form-section">
                    <h2>{t.products.price[lang]}</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t.products.price[lang]} *</label>
                            <input
                                type="text"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                placeholder="Rp 1.000.000"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => handleChange('slug', e.target.value)}
                                placeholder="product-slug"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Sort Order</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                />
                                {t.common.active[lang]}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/admin/products')}>
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

export default AdminProductForm;
