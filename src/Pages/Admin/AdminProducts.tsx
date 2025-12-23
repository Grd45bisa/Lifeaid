import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { fetchProducts, deleteProduct, type Product } from '../../utils/supabaseClient';
import './AdminProducts.css';

// Icons
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const AdminProducts = () => {
    const { lang } = useAdminLanguage();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchProducts();
            setProducts(data);
        } catch (err) {
            console.error('Error loading products:', err);
            setError(t.common.error[lang]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm(t.common.confirmDelete[lang])) return;

        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting product:', err);
            alert(t.common.error[lang]);
        }
    };

    const filteredProducts = products.filter(p => {
        const title = lang === 'id' ? p.title_id : p.title_en;
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="admin-products-page">
            {/* Header */}
            <header className="page-header">
                <div className="header-title">
                    <h1>{t.products.title[lang]}</h1>
                    <p>{lang === 'id' ? 'Kelola semua produk di website' : 'Manage all products on website'}</p>
                </div>
                <button className="add-btn" onClick={() => navigate('/admin/products/new')}>
                    <PlusIcon />
                    <span>{t.products.addNew[lang]}</span>
                </button>
            </header>

            {/* Search */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder={t.common.search[lang]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Error */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>{t.common.loading[lang]}</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <p>{t.common.noData[lang]}</p>
                    <Link to="/admin/products/new" className="add-link">
                        {t.products.addNew[lang]}
                    </Link>
                </div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-image">
                                {product.image_base64 ? (
                                    <img src={product.image_base64} alt={lang === 'id' ? product.title_id : product.title_en} />
                                ) : (
                                    <div className="no-image">No Image</div>
                                )}
                                <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                    {product.is_active ? t.common.active[lang] : t.common.inactive[lang]}
                                </span>
                            </div>
                            <div className="product-info">
                                <h3>{lang === 'id' ? product.title_id : product.title_en}</h3>
                                <p className="product-price">{product.price}</p>
                                <p className="product-category">
                                    {lang === 'id' ? product.category_id : product.category_en}
                                </p>
                            </div>
                            <div className="product-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                >
                                    <EditIcon />
                                    <span>{t.common.edit[lang]}</span>
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => product.id && handleDelete(product.id)}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
