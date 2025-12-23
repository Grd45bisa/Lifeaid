-- ============================================
-- LIFEAID ADMIN DASHBOARD - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PRODUCTS TABLE (Bilingual + Markdown)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    image_base64 TEXT NOT NULL,
    thumbnails_base64 TEXT[] DEFAULT '{}',
    title_id TEXT NOT NULL,
    title_en TEXT NOT NULL,
    price TEXT NOT NULL,
    price_numeric INTEGER NOT NULL,
    description_id TEXT NOT NULL,  -- Markdown supported
    description_en TEXT NOT NULL,  -- Markdown supported
    condition_id TEXT DEFAULT 'Baru',
    condition_en TEXT DEFAULT 'New',
    min_order_id TEXT DEFAULT '1 Buah',
    min_order_en TEXT DEFAULT '1 Unit',
    category_id TEXT NOT NULL,
    category_en TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ============================================
-- 2. TESTIMONIALS TABLE (Bilingual)
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

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);

-- ============================================
-- 3. CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    type TEXT DEFAULT 'consultation',  -- 'consultation' or 'subscribe'
    is_read BOOLEAN DEFAULT false,
    is_replied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_type ON contact_messages(type);

-- ============================================
-- 4. WEBSITE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS website_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO website_settings (key, value) VALUES 
    ('whatsapp', ''),
    ('email', ''),
    ('phone', ''),
    ('address', ''),
    ('tokopedia', ''),
    ('shopee', ''),
    ('instagram', ''),
    ('facebook', ''),
    ('use_database_products', 'false')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 5. ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- In production, use hashed passwords!
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user (password: lifeaid!@#$)
INSERT INTO admin_users (username, password, name, role) VALUES 
    ('admin', 'lifeaid!@#$', 'Administrator', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- DISABLE ROW LEVEL SECURITY
-- (Required if using anon key without auth)
-- ============================================
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ENABLE REALTIME (Optional)
-- Uncomment if you want realtime updates
-- ============================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE products;
-- ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
-- ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
