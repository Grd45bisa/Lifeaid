import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { createProduct, updateProduct, fetchProductById } from '../../utils/supabaseClient';
import { translateMultiple } from '../../utils/translateService';
import { parseMarkdown } from '../../utils/simpleMarkdown';
import './AdminProductForm.css';

// Icons for markdown toolbar
const BoldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>;
const ItalicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>;
const HeadingIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z" /></svg>;
const LinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>;
const TranslateIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" /></svg>;

const MAX_IMAGES = 5;

const AdminProductForm = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const textareaIdRef = useRef<HTMLTextAreaElement>(null);
    const textareaEnRef = useRef<HTMLTextAreaElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [inputLang, setInputLang] = useState<'id' | 'en'>('id');

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

        // Run initially and on change
        updateSlider();

        // Small delay to ensure layout
        const timer = setTimeout(updateSlider, 50);

        window.addEventListener('resize', updateSlider);
        return () => {
            window.removeEventListener('resize', updateSlider);
            clearTimeout(timer);
        };
    }, [inputLang]);

    // Images array - first image is the main image
    const [images, setImages] = useState<string[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        slug: '',
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
                // Combine main image and thumbnails into single array
                const allImages: string[] = [];
                if (product.image_base64) {
                    allImages.push(product.image_base64);
                }
                if (product.thumbnails_base64 && product.thumbnails_base64.length > 0) {
                    allImages.push(...product.thumbnails_base64.filter(img => img !== product.image_base64));
                }
                setImages(allImages);

                setFormData({
                    slug: product.slug,
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

        // Auto-format and parse price to Rupiah format
        if (field === 'price') {
            // Extract only numbers
            const numericValue = parseInt((value as string).replace(/\D/g, '')) || 0;

            // Format to Rupiah: Rp 1.000.000
            const formatted = numericValue > 0
                ? 'Rp ' + numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                : '';

            setFormData(prev => ({
                ...prev,
                price: formatted,
                price_numeric: numericValue
            }));
        }
    };

    // Handle multiple image upload
    const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = MAX_IMAGES - images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => {
                    if (prev.length >= MAX_IMAGES) return prev;
                    return [...prev, reader.result as string];
                });
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
    };

    // Remove image
    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        // Reorder images
        setImages(prev => {
            const newImages = [...prev];
            const [draggedItem] = newImages.splice(draggedIndex, 1);
            newImages.splice(index, 0, draggedItem);
            return newImages;
        });
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Markdown toolbar actions
    const insertMarkdown = (targetRef: React.RefObject<HTMLTextAreaElement | null>, field: 'description_id' | 'description_en', prefix: string, suffix: string = '', placeholder: string = '') => {
        const textarea = targetRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
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

    // Auto translate handler
    const handleAutoTranslate = async () => {
        setIsTranslating(true);
        try {
            const sourceLang = inputLang;
            const targetLang = inputLang === 'id' ? 'en' : 'id';

            // Build source texts based on input language
            const sourceTexts: Record<string, string> = {};
            if (sourceLang === 'id') {
                if (formData.title_id) sourceTexts.title = formData.title_id;
                if (formData.category_id) sourceTexts.category = formData.category_id;
                if (formData.description_id) sourceTexts.description = formData.description_id;
            } else {
                if (formData.title_en) sourceTexts.title = formData.title_en;
                if (formData.category_en) sourceTexts.category = formData.category_en;
                if (formData.description_en) sourceTexts.description = formData.description_en;
            }

            if (Object.keys(sourceTexts).length === 0) {
                alert(lang === 'id' ? 'Tidak ada teks untuk diterjemahkan' : 'No text to translate');
                return;
            }

            const translated = await translateMultiple(sourceTexts, sourceLang, targetLang);

            // Apply translations
            if (targetLang === 'en') {
                if (translated.title) handleChange('title_en', translated.title);
                if (translated.category) handleChange('category_en', translated.category);
                if (translated.description) handleChange('description_en', translated.description);
            } else {
                if (translated.title) handleChange('title_id', translated.title);
                if (translated.category) handleChange('category_id', translated.category);
                if (translated.description) handleChange('description_id', translated.description);
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

        // Validation
        if (!formData.title_id || !formData.title_en) {
            alert(lang === 'id' ? 'Nama produk harus diisi' : 'Product name is required');
            return;
        }
        if (images.length === 0) {
            alert(lang === 'id' ? 'Minimal 1 gambar produk harus diupload' : 'At least 1 product image is required');
            return;
        }

        // Prepare data - first image is main, rest are thumbnails
        const productData = {
            ...formData,
            image_base64: images[0],
            thumbnails_base64: images
        };

        setIsSaving(true);
        try {
            if (isEdit && id) {
                await updateProduct(parseInt(id), productData);
            } else {
                await createProduct(productData);
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
                {/* Multi-Image Upload */}
                <div className="form-section">
                    <h2>
                        {t.products.image[lang]}
                        <span className="image-count">({images.length}/{MAX_IMAGES})</span>
                    </h2>
                    <p className="image-hint">
                        {lang === 'id'
                            ? 'Drag untuk mengatur urutan. Foto pertama akan menjadi foto utama.'
                            : 'Drag to reorder. First photo will be the main image.'}
                    </p>

                    <div className="image-gallery">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className={`gallery-item ${index === 0 ? 'main-image' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                            >
                                <img src={img} alt={`Product ${index + 1}`} />
                                {index === 0 && (
                                    <span className="main-badge">
                                        {lang === 'id' ? 'Utama' : 'Main'}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    ✕
                                </button>
                                <span className="drag-hint">⋮⋮</span>
                            </div>
                        ))}

                        {images.length < MAX_IMAGES && (
                            <label className="upload-slot">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImagesUpload}
                                />
                                <span className="plus-icon">+</span>
                                <span className="upload-text">
                                    {lang === 'id' ? 'Tambah Foto' : 'Add Photo'}
                                </span>
                            </label>
                        )}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="form-section">
                    <h2>{lang === 'id' ? 'Informasi Dasar' : 'Basic Information'}</h2>

                    {/* Lang Tabs Header with Translate Button */}
                    <div className="lang-tabs-header">
                        <div className="lang-tabs" ref={tabsRef}>
                            <div className="slider" style={sliderStyle}></div>
                            <button
                                type="button"
                                className={`tab-item ${inputLang === 'id' ? 'active' : ''}`}
                                onClick={() => setInputLang('id')}
                            >
                                <span className="t-short">ID</span>
                                <span className="t-full">ID INDONESIA</span>
                            </button>
                            <button
                                type="button"
                                className={`tab-item ${inputLang === 'en' ? 'active' : ''}`}
                                onClick={() => setInputLang('en')}
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
                                    : (inputLang === 'id' ? 'Translate → EN' : 'Translate → ID')}
                            </span>
                        </button>
                    </div>

                    {/* Indonesian Fields */}
                    <div className={`lang-fields ${inputLang === 'id' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>{t.products.productName[lang]} *</label>
                            <input
                                type="text"
                                value={formData.title_id}
                                onChange={(e) => handleChange('title_id', e.target.value)}
                                placeholder="Nama produk dalam Bahasa Indonesia"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.category[lang]} *</label>
                            <input
                                type="text"
                                value={formData.category_id}
                                onChange={(e) => handleChange('category_id', e.target.value)}
                                placeholder="Kategori dalam Bahasa Indonesia"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.description[lang]} *</label>

                            <div className="markdown-editor-container">
                                {/* Editor Side */}
                                <div className="markdown-input-area">
                                    <div className="markdown-toolbar">
                                        <button type="button" onClick={() => insertMarkdown(textareaIdRef, 'description_id', '**', '**', 'teks tebal')} title="Bold"><BoldIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaIdRef, 'description_id', '*', '*', 'teks miring')} title="Italic"><ItalicIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaIdRef, 'description_id', '\n## ', '\n', 'Judul')} title="Heading"><HeadingIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaIdRef, 'description_id', '\n• ', '', 'item')} title="List"><ListIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaIdRef, 'description_id', '[', '](url)', 'teks link')} title="Link"><LinkIcon /></button>
                                    </div>
                                    <textarea
                                        ref={textareaIdRef}
                                        value={formData.description_id}
                                        onChange={(e) => handleChange('description_id', e.target.value)}
                                        rows={12}
                                        placeholder="Deskripsi dalam Bahasa Indonesia"
                                        required
                                    />
                                </div>

                                {/* Preview Side */}
                                <div className="markdown-preview-area">
                                    <span className="preview-label">Live Preview</span>
                                    <div
                                        className="markdown-preview"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.description_id) }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* English Fields */}
                    <div className={`lang-fields ${inputLang === 'en' ? 'active' : ''}`}>
                        <div className="form-group">
                            <label>{t.products.productName[lang]} *</label>
                            <input
                                type="text"
                                value={formData.title_en}
                                onChange={(e) => handleChange('title_en', e.target.value)}
                                placeholder="Product name in English"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.category[lang]} *</label>
                            <input
                                type="text"
                                value={formData.category_en}
                                onChange={(e) => handleChange('category_en', e.target.value)}
                                placeholder="Category in English"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.products.description[lang]} *</label>

                            <div className="markdown-editor-container">
                                {/* Editor Side */}
                                <div className="markdown-input-area">
                                    <div className="markdown-toolbar">
                                        <button type="button" onClick={() => insertMarkdown(textareaEnRef, 'description_en', '**', '**', 'bold text')} title="Bold"><BoldIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaEnRef, 'description_en', '*', '*', 'italic text')} title="Italic"><ItalicIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaEnRef, 'description_en', '\n## ', '\n', 'Heading')} title="Heading"><HeadingIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaEnRef, 'description_en', '\n• ', '', 'item')} title="List"><ListIcon /></button>
                                        <button type="button" onClick={() => insertMarkdown(textareaEnRef, 'description_en', '[', '](url)', 'link text')} title="Link"><LinkIcon /></button>
                                    </div>
                                    <textarea
                                        ref={textareaEnRef}
                                        value={formData.description_en}
                                        onChange={(e) => handleChange('description_en', e.target.value)}
                                        rows={12}
                                        placeholder="Description in English"
                                        required
                                    />
                                </div>

                                {/* Preview Side */}
                                <div className="markdown-preview-area">
                                    <span className="preview-label">Live Preview</span>
                                    <div
                                        className="markdown-preview"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.description_en) }}
                                    />
                                </div>
                            </div>
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
                            <label htmlFor="product-slug">Slug</label>
                            <input
                                id="product-slug"
                                type="text"
                                value={formData.slug}
                                onChange={(e) => handleChange('slug', e.target.value)}
                                placeholder="product-slug"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="product-sort-order">Sort Order</label>
                            <input
                                id="product-sort-order"
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
