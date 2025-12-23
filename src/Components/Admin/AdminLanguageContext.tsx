import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type AdminLanguage = 'id' | 'en';

interface AdminLanguageContextType {
    lang: AdminLanguage;
    setLang: (lang: AdminLanguage) => void;
    t: (id: string, en: string) => string;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export const AdminLanguageProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLangState] = useState<AdminLanguage>(() => {
        const saved = localStorage.getItem('admin-language');
        return (saved === 'id' || saved === 'en') ? saved : 'id';
    });

    const setLang = (newLang: AdminLanguage) => {
        setLangState(newLang);
        localStorage.setItem('admin-language', newLang);
    };

    // Helper function to get text based on language
    const t = (id: string, en: string): string => {
        return lang === 'id' ? id : en;
    };

    useEffect(() => {
        localStorage.setItem('admin-language', lang);
    }, [lang]);

    return (
        <AdminLanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </AdminLanguageContext.Provider>
    );
};

export const useAdminLanguage = (): AdminLanguageContextType => {
    const context = useContext(AdminLanguageContext);
    if (!context) {
        throw new Error('useAdminLanguage must be used within AdminLanguageProvider');
    }
    return context;
};

// Admin translations
export const adminTranslations = {
    sidebar: {
        dashboard: { id: 'Dashboard', en: 'Dashboard' },
        chatHistory: { id: 'Riwayat Chat', en: 'Chat History' },
        products: { id: 'Kelola Produk', en: 'Manage Products' },
        testimonials: { id: 'Kelola Testimoni', en: 'Manage Testimonials' },
        messages: { id: 'Pesan Kontak', en: 'Contact Messages' },
        settings: { id: 'Pengaturan', en: 'Settings' },
        logout: { id: 'Keluar', en: 'Logout' },
        admin: { id: 'Admin', en: 'Admin' },
        adminPanel: { id: 'Panel Admin', en: 'Admin Panel' }
    },
    common: {
        add: { id: 'Tambah', en: 'Add' },
        edit: { id: 'Edit', en: 'Edit' },
        delete: { id: 'Hapus', en: 'Delete' },
        save: { id: 'Simpan', en: 'Save' },
        cancel: { id: 'Batal', en: 'Cancel' },
        search: { id: 'Cari...', en: 'Search...' },
        loading: { id: 'Memuat...', en: 'Loading...' },
        noData: { id: 'Tidak ada data', en: 'No data' },
        confirmDelete: { id: 'Yakin ingin menghapus?', en: 'Are you sure you want to delete?' },
        success: { id: 'Berhasil!', en: 'Success!' },
        error: { id: 'Terjadi kesalahan', en: 'An error occurred' },
        back: { id: 'Kembali', en: 'Back' },
        active: { id: 'Aktif', en: 'Active' },
        inactive: { id: 'Nonaktif', en: 'Inactive' }
    },
    products: {
        title: { id: 'Kelola Produk', en: 'Manage Products' },
        addNew: { id: 'Tambah Produk', en: 'Add Product' },
        editProduct: { id: 'Edit Produk', en: 'Edit Product' },
        productName: { id: 'Nama Produk', en: 'Product Name' },
        price: { id: 'Harga', en: 'Price' },
        category: { id: 'Kategori', en: 'Category' },
        description: { id: 'Deskripsi', en: 'Description' },
        image: { id: 'Gambar', en: 'Image' },
        uploadImage: { id: 'Upload Gambar', en: 'Upload Image' }
    },
    testimonials: {
        title: { id: 'Kelola Testimoni', en: 'Manage Testimonials' },
        addNew: { id: 'Tambah Testimoni', en: 'Add Testimonial' },
        name: { id: 'Nama', en: 'Name' },
        role: { id: 'Jabatan/Peran', en: 'Role' },
        rating: { id: 'Rating', en: 'Rating' },
        comment: { id: 'Komentar', en: 'Comment' }
    },
    messages: {
        title: { id: 'Pesan Kontak', en: 'Contact Messages' },
        from: { id: 'Dari', en: 'From' },
        email: { id: 'Email', en: 'Email' },
        phone: { id: 'Telepon', en: 'Phone' },
        message: { id: 'Pesan', en: 'Message' },
        markRead: { id: 'Tandai Dibaca', en: 'Mark as Read' },
        markReplied: { id: 'Tandai Dibalas', en: 'Mark as Replied' },
        unread: { id: 'Belum Dibaca', en: 'Unread' },
        read: { id: 'Sudah Dibaca', en: 'Read' },
        replied: { id: 'Sudah Dibalas', en: 'Replied' }
    },
    settings: {
        title: { id: 'Pengaturan Website', en: 'Website Settings' },
        contact: { id: 'Informasi Kontak', en: 'Contact Information' },
        whatsapp: { id: 'Nomor WhatsApp', en: 'WhatsApp Number' },
        email: { id: 'Email', en: 'Email' },
        phone: { id: 'Nomor Telepon', en: 'Phone Number' },
        address: { id: 'Alamat', en: 'Address' },
        social: { id: 'Media Sosial', en: 'Social Media' },
        tokopedia: { id: 'Link Tokopedia', en: 'Tokopedia Link' },
        shopee: { id: 'Link Shopee', en: 'Shopee Link' }
    }
};
