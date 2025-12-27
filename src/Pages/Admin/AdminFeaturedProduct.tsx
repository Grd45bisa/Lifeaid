import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { fetchFeaturedProduct, updateFeaturedProduct, type FeaturedProductContent, defaultFeaturedProduct, fetchProducts, type Product } from '../../utils/supabaseClient';
import { translateMultiple } from '../../utils/translateService';
import { parseMarkdown } from '../../utils/simpleMarkdown';
import '../Admin/AdminProductForm.css';

// Icons for markdown toolbar
const BoldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>;
const ItalicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>;
const HeadingIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>;
const LinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>;
const TableIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path></svg>;
const TranslateIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" /></svg>;

const AdminFeaturedProduct = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();

    // Markdown Refs
    const productDescIdRef = useRef<HTMLTextAreaElement>(null);
    const productDescEnRef = useRef<HTMLTextAreaElement>(null);

    // Helper: Insert Markdown
    const insertMarkdown = (
        ref: React.RefObject<HTMLTextAreaElement | null>,
        field: keyof FeaturedProductContent,
        prefix: string,
        suffix: string,
        placeholder: string
    ) => {
        const textarea = ref.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + (selection || placeholder) + suffix + after;

        // Update form data (using parent handleChange logic)
        setFormData(prev => ({ ...prev, [field]: newText }));

        // Restore focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length + (selection ? 0 : placeholder.length)
            );
        }, 0);
    };

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');
    const [formData, setFormData] = useState<FeaturedProductContent>(defaultFeaturedProduct);
    const [products, setProducts] = useState<Product[]>([]);

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
                        transform: `translateX(${activeBtn.offsetLeft - 4}px)` // -4 for padding offset
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

    // Load content
    useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            try {
                const [content, productList] = await Promise.all([
                    fetchFeaturedProduct(),
                    fetchProducts()
                ]);
                setFormData(content);
                setProducts(productList);
            } catch (err) {
                console.error('Error loading content:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, []);

    const handleChange = (field: keyof FeaturedProductContent, value: string | number) => {
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

    // Auto translate handler
    const handleAutoTranslate = async () => {
        setIsTranslating(true);
        try {
            const sourceLang = activeTab;
            const targetLang = activeTab === 'id' ? 'en' : 'id';

            // Build source texts based on active tab
            const sourceTexts: Record<string, string> = {};
            if (sourceLang === 'id') {
                if (formData.badge_id) sourceTexts.badge = formData.badge_id;
                if (formData.title_id) sourceTexts.title = formData.title_id;
                if (formData.subtitle_id) sourceTexts.subtitle = formData.subtitle_id;
                if (formData.product_title_id) sourceTexts.product_title = formData.product_title_id;
                if (formData.product_desc_id) sourceTexts.product_desc = formData.product_desc_id;
                if (formData.main_function_title_id) sourceTexts.main_function_title = formData.main_function_title_id;
                if (formData.main_function_desc_id) sourceTexts.main_function_desc = formData.main_function_desc_id;
                if (formData.suitable_for_title_id) sourceTexts.suitable_for_title = formData.suitable_for_title_id;
                if (formData.suitable_for_desc_id) sourceTexts.suitable_for_desc = formData.suitable_for_desc_id;
            } else {
                if (formData.badge_en) sourceTexts.badge = formData.badge_en;
                if (formData.title_en) sourceTexts.title = formData.title_en;
                if (formData.subtitle_en) sourceTexts.subtitle = formData.subtitle_en;
                if (formData.product_title_en) sourceTexts.product_title = formData.product_title_en;
                if (formData.product_desc_en) sourceTexts.product_desc = formData.product_desc_en;
                if (formData.main_function_title_en) sourceTexts.main_function_title = formData.main_function_title_en;
                if (formData.main_function_desc_en) sourceTexts.main_function_desc = formData.main_function_desc_en;
                if (formData.suitable_for_title_en) sourceTexts.suitable_for_title = formData.suitable_for_title_en;
                if (formData.suitable_for_desc_en) sourceTexts.suitable_for_desc = formData.suitable_for_desc_en;
            }

            if (Object.keys(sourceTexts).length === 0) {
                alert(lang === 'id' ? 'Tidak ada teks untuk diterjemahkan' : 'No text to translate');
                return;
            }

            const translated = await translateMultiple(sourceTexts, sourceLang, targetLang);

            // Apply translations
            const suffix = targetLang === 'en' ? '_en' : '_id';
            Object.entries(translated).forEach(([key, value]) => {
                handleChange((key + suffix) as keyof FeaturedProductContent, value);
            });

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
            <header className="form-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="back-btn" onClick={() => navigate('/admin')}>
                        ← {t.common.back[lang]}
                    </button>
                    <h1>{lang === 'id' ? 'Edit Produk Unggulan' : 'Edit Featured Product'}</h1>
                </div>

                {/* SHORTCUT EDIT BUTTON */}
                {formData.linked_product_id && (
                    <button
                        type="button"
                        className="edit-details-btn"
                        onClick={() => navigate(`/admin/products/edit/${formData.linked_product_id}`)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        {lang === 'id' ? 'Edit Detail Produk' : 'Edit Product Details'}
                    </button>
                )}
            </header>

            <form onSubmit={handleSubmit} className="product-form">

                {/* Linked Product Selection */}
                <div className="form-section">
                    <h2>{lang === 'id' ? 'Hubungkan Produk' : 'Link Product'}</h2>
                    <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {lang === 'id'
                            ? 'Pilih produk dari database yang akan dihubungkan dengan bagian Featured Product ini.'
                            : 'Select a product from the database to link with this Featured Product section.'}
                    </p>
                    <div className="form-group">
                        <label>{lang === 'id' ? 'Pilih Produk' : 'Select Product'}</label>
                        <select
                            value={formData.linked_product_id || ''}
                            onChange={(e) => handleChange('linked_product_id', Number(e.target.value))}
                            style={{ maxWidth: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="">-- {lang === 'id' ? 'Pilih Produk' : 'Select Product'} --</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {lang === 'id' ? product.title_id : product.title_en}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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

                {/* Content with Tab Layout */}
                <div className="form-section">
                    <h2>{lang === 'id' ? 'Konten' : 'Content'}</h2>

                    {/* Lang Tabs Header with Translate Button */}
                    <div className="lang-tabs-header">
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
                        <button
                            type="button"
                            className="translate-btn"
                            onClick={handleAutoTranslate}
                            disabled={isTranslating}
                        >
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
                            <label>Badge</label>
                            <input type="text" value={formData.badge_id} onChange={(e) => handleChange('badge_id', e.target.value)} placeholder="PRODUK UNGGULAN" />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Utama' : 'Main Title'}</label>
                            <input type="text" value={formData.title_id} onChange={(e) => handleChange('title_id', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Subtitle</label>
                            <textarea value={formData.subtitle_id} onChange={(e) => handleChange('subtitle_id', e.target.value)} rows={2} />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Produk' : 'Product Title'}</label>
                            <input type="text" value={formData.product_title_id} onChange={(e) => handleChange('product_title_id', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Produk' : 'Product Description'}</label>

                            <div className="markdown-editor-container">
                                {/* Editor Side */}
                                <div className="markdown-input-area">
                                    <div className="markdown-toolbar">
                                        <button type="button" onClick={() => insertMarkdown(productDescIdRef, 'product_desc_id', '**', '**', 'teks tebal')} title="Bold"><BoldIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescIdRef, 'product_desc_id', '*', '*', 'teks miring')} title="Italic"><ItalicIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescIdRef, 'product_desc_id', '\n## ', '\n', 'Judul')} title="Heading"><HeadingIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescIdRef, 'product_desc_id', '\n• ', '', 'item')} title="List"><ListIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescIdRef, 'product_desc_id', '[', '](url)', 'teks link')} title="Link"><LinkIcon /></button>
                                    </div>
                                    <textarea
                                        ref={productDescIdRef}
                                        value={formData.product_desc_id}
                                        onChange={(e) => handleChange('product_desc_id', e.target.value)}
                                        rows={12}
                                    />
                                </div>

                                {/* Preview Side */}
                                <div className="markdown-preview-area">
                                    <span className="preview-label">Live Preview</span>
                                    <div
                                        className="markdown-preview"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.product_desc_id) }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Fungsi Utama' : 'Main Function Title'}</label>
                                <input type="text" value={formData.main_function_title_id} onChange={(e) => handleChange('main_function_title_id', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Cocok Untuk' : 'Suitable For Title'}</label>
                                <input type="text" value={formData.suitable_for_title_id} onChange={(e) => handleChange('suitable_for_title_id', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Fungsi Utama' : 'Main Function Description'}</label>
                            <textarea value={formData.main_function_desc_id} onChange={(e) => handleChange('main_function_desc_id', e.target.value)} rows={2} />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Cocok Untuk' : 'Suitable For Description'}</label>
                            <textarea value={formData.suitable_for_desc_id} onChange={(e) => handleChange('suitable_for_desc_id', e.target.value)} rows={2} />
                        </div>
                    </div>

                    {/* English Fields */}
                    <div className={`lang-fields ${activeTab === 'en' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>Badge</label>
                            <input type="text" value={formData.badge_en} onChange={(e) => handleChange('badge_en', e.target.value)} placeholder="FEATURED PRODUCT" />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Utama' : 'Main Title'}</label>
                            <input type="text" value={formData.title_en} onChange={(e) => handleChange('title_en', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Subtitle</label>
                            <textarea value={formData.subtitle_en} onChange={(e) => handleChange('subtitle_en', e.target.value)} rows={2} />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Judul Produk' : 'Product Title'}</label>
                            <input type="text" value={formData.product_title_en} onChange={(e) => handleChange('product_title_en', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Produk' : 'Product Description'}</label>

                            <div className="markdown-editor-container">
                                {/* Editor Side */}
                                <div className="markdown-input-area">
                                    <div className="markdown-toolbar">
                                        <button type="button" onClick={() => insertMarkdown(productDescEnRef, 'product_desc_en', '**', '**', 'bold text')} title="Bold"><BoldIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescEnRef, 'product_desc_en', '*', '*', 'italic text')} title="Italic"><ItalicIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescEnRef, 'product_desc_en', '\n## ', '\n', 'Heading')} title="Heading"><HeadingIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescEnRef, 'product_desc_en', '\n• ', '', 'item')} title="List"><ListIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(productDescEnRef, 'product_desc_en', '[', '](url)', 'link text')} title="Link"><LinkIcon /></button>
                                    </div>
                                    <textarea
                                        ref={productDescEnRef}
                                        value={formData.product_desc_en}
                                        onChange={(e) => handleChange('product_desc_en', e.target.value)}
                                        rows={12}
                                    />
                                </div>

                                {/* Preview Side */}
                                <div className="markdown-preview-area">
                                    <span className="preview-label">Live Preview</span>
                                    <div
                                        className="markdown-preview"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.product_desc_en) }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Fungsi Utama' : 'Main Function Title'}</label>
                                <input type="text" value={formData.main_function_title_en} onChange={(e) => handleChange('main_function_title_en', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>{lang === 'id' ? 'Judul Cocok Untuk' : 'Suitable For Title'}</label>
                                <input type="text" value={formData.suitable_for_title_en} onChange={(e) => handleChange('suitable_for_title_en', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Fungsi Utama' : 'Main Function Description'}</label>
                            <textarea value={formData.main_function_desc_en} onChange={(e) => handleChange('main_function_desc_en', e.target.value)} rows={2} />
                        </div>
                        <div className="form-group">
                            <label>{lang === 'id' ? 'Deskripsi Cocok Untuk' : 'Suitable For Description'}</label>
                            <textarea value={formData.suitable_for_desc_en} onChange={(e) => handleChange('suitable_for_desc_en', e.target.value)} rows={2} />
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
