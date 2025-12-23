-- ============================================
-- LIFEAID WEBSITE - COMPLETE DATABASE SCHEMA
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. WEBSITE SETTINGS
-- Menyimpan pengaturan website (key-value)
-- ============================================
CREATE TABLE IF NOT EXISTS website_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS untuk akses publik
ALTER TABLE website_settings DISABLE ROW LEVEL SECURITY;

-- Insert default settings
INSERT INTO website_settings (key, value) VALUES 
    ('use_database_products', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. PRODUCTS
-- Menyimpan data produk
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    image_base64 TEXT,
    thumbnails_base64 JSONB DEFAULT '[]',
    title_id TEXT NOT NULL,
    title_en TEXT NOT NULL,
    price TEXT,
    price_numeric INTEGER DEFAULT 0,
    description_id TEXT,
    description_en TEXT,
    condition_id TEXT,
    condition_en TEXT,
    min_order_id TEXT,
    min_order_en TEXT,
    category_id TEXT,
    category_en TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. TESTIMONIALS
-- Menyimpan testimoni pelanggan
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role_id TEXT,
    role_en TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    comment_id TEXT NOT NULL,
    comment_en TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CONTACT MESSAGES
-- Menyimpan pesan dari form kontak
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_replied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CHAT MEMORY
-- Menyimpan riwayat chat AI
-- ============================================
CREATE TABLE IF NOT EXISTS chat_memory (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE chat_memory DISABLE ROW LEVEL SECURITY;

-- Index untuk query session
CREATE INDEX IF NOT EXISTS idx_chat_memory_session 
    ON chat_memory(session_id, created_at);

-- ============================================
-- 6. ADMIN PROFILES (untuk Supabase Auth)
-- Menyimpan profil admin tambahan
-- ============================================
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SAMPLE DATA (Optional - hapus jika tidak diperlukan)
-- ============================================

-- Sample Testimonial
INSERT INTO testimonials (name, role_id, role_en, rating, comment_id, comment_en, is_active, sort_order) VALUES 
    ('Sinta', 'Pelanggan Tokopedia', 'Tokopedia Customer', 5, 
     'Barang datang sesuai dengan pesanan. Penjual amanah dan pengiriman cepat!', 
     'The goods arrived as ordered. Trusted seller and fast delivery!', 
     true, 1),
    ('Dani', 'Pelanggan Tokopedia', 'Tokopedia Customer', 5, 
     'Seller sangat membantu proses order dan pengiriman.', 
     'The seller was very helpful with the ordering and delivery process.', 
     true, 2),
    ('Tiara', 'Pelanggan Shopee', 'Shopee Customer', 5, 
     'Barang bagus dan sesuai, kualitas bagus, seller responsif dan membantu sekali. Sangat rekomendasi!', 
     'Good product and as expected, good quality, seller is responsive and very helpful. Highly recommended!', 
     true, 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
