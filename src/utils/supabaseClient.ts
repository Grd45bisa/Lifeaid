import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// NOTE: Replace these with your actual Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for chat_memory table
export interface ChatMessage {
    id?: number;
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: {
        name?: string;
        email?: string;
        phone?: string;
        [key: string]: unknown;
    };
    created_at?: string;
}

export interface ChatSession {
    session_id: string;
    user_name: string;
    user_email: string;
    latest_message: string;
    created_at: string;
    message_count: number;
}

// Fetch all unique chat sessions with metadata
export const fetchChatSessions = async (): Promise<ChatSession[]> => {
    const { data, error } = await supabase
        .from('chat_memory')
        .select('session_id, role, content, metadata, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching chat sessions:', error);
        throw error;
    }

    // Group messages by session_id
    const sessionsMap = new Map<string, {
        messages: ChatMessage[];
        metadata: ChatMessage['metadata'];
        firstCreatedAt: string;
    }>();

    data?.forEach((msg: ChatMessage) => {
        const existing = sessionsMap.get(msg.session_id);
        if (existing) {
            existing.messages.push(msg);
            // Keep the earliest metadata that has user info
            if (msg.metadata?.email && !existing.metadata?.email) {
                existing.metadata = msg.metadata;
            }
        } else {
            sessionsMap.set(msg.session_id, {
                messages: [msg],
                metadata: msg.metadata || {},
                firstCreatedAt: msg.created_at || new Date().toISOString()
            });
        }
    });

    // Convert to array of ChatSession
    const sessions: ChatSession[] = [];
    sessionsMap.forEach((value, sessionId) => {
        // Find latest user message for preview
        const userMessages = value.messages.filter(m => m.role === 'user');
        const latestMessage = userMessages.length > 0
            ? userMessages[userMessages.length - 1].content
            : 'Tidak ada pesan';

        sessions.push({
            session_id: sessionId,
            user_name: value.metadata?.name || 'Tidak diketahui',
            user_email: value.metadata?.email || 'Tidak ada email',
            latest_message: latestMessage.substring(0, 100) + (latestMessage.length > 100 ? '...' : ''),
            created_at: value.firstCreatedAt,
            message_count: value.messages.length
        });
    });

    // Sort by created_at descending
    sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return sessions;
};

// Fetch all messages for a specific session
export const fetchChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
    }

    return data || [];
};

// Get dashboard statistics
export const fetchDashboardStats = async () => {
    interface StatsData {
        session_id: string;
        metadata?: { email?: string;[key: string]: unknown };
        created_at: string;
    }

    const { data, error } = await supabase
        .from('chat_memory')
        .select('session_id, metadata, created_at');

    if (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }

    const typedData = data as StatsData[] | null;

    // Calculate stats
    const uniqueSessions = new Set(typedData?.map((d: StatsData) => d.session_id) || []);
    const uniqueEmails = new Set(
        typedData?.filter((d: StatsData) => d.metadata?.email).map((d: StatsData) => d.metadata?.email) || []
    );

    // Count today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = typedData?.filter((d: StatsData) =>
        new Date(d.created_at) >= today
    ).length || 0;

    return {
        totalConversations: uniqueSessions.size,
        totalLeads: uniqueEmails.size,
        todayMessages: todayMessages
    };
};

// ============================================
// PRODUCT TYPES & CRUD
// ============================================

export interface Product {
    id?: number;
    slug: string;
    image_base64: string;
    thumbnails_base64?: string[];
    title_id: string;
    title_en: string;
    price: string;
    price_numeric: number;
    description_id: string;  // Markdown supported
    description_en: string;  // Markdown supported
    condition_id?: string;
    condition_en?: string;
    min_order_id?: string;
    min_order_en?: string;
    category_id: string;
    category_en: string;
    is_active?: boolean;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
}

export const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const fetchProductById = async (id: number): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .update({ ...product, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ============================================
// TESTIMONIAL TYPES & CRUD
// ============================================

export interface Testimonial {
    id?: number;
    name: string;
    role_id?: string;
    role_en?: string;
    rating: number;
    comment_id: string;  // Markdown supported
    comment_en: string;  // Markdown supported
    is_active?: boolean;
    sort_order?: number;
    created_at?: string;
}

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

// Fetch only active testimonials for public display
export const fetchPublicTestimonials = async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at'>): Promise<Testimonial> => {
    const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateTestimonial = async (id: number, testimonial: Partial<Testimonial>): Promise<Testimonial> => {
    const { data, error } = await supabase
        .from('testimonials')
        .update(testimonial)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteTestimonial = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ============================================
// CONTACT MESSAGE TYPES & CRUD
// ============================================

export interface ContactMessage {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    message: string;
    is_read?: boolean;
    is_replied?: boolean;
    created_at?: string;
}

export const fetchContactMessages = async (): Promise<ContactMessage[]> => {
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const createContactMessage = async (message: Omit<ContactMessage, 'id' | 'created_at' | 'is_read' | 'is_replied'>): Promise<ContactMessage> => {
    const { data, error } = await supabase
        .from('contact_messages')
        .insert(message)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const markMessageAsRead = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

    if (error) throw error;
};

export const markMessageAsReplied = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('contact_messages')
        .update({ is_replied: true, is_read: true })
        .eq('id', id);

    if (error) throw error;
};

// ============================================
// VIDEO TYPES & CRUD
// ============================================

export interface Video {
    id?: number;
    youtube_id: string;
    title_id: string;
    title_en: string;
    description_id?: string;  // Markdown supported
    description_en?: string;  // Markdown supported
    is_active?: boolean;
    sort_order?: number;
    created_at?: string;
}

export const fetchVideos = async (): Promise<Video[]> => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const createVideo = async (video: Omit<Video, 'id' | 'created_at'>): Promise<Video> => {
    const { data, error } = await supabase
        .from('videos')
        .insert(video)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateVideo = async (id: number, video: Partial<Video>): Promise<Video> => {
    const { data, error } = await supabase
        .from('videos')
        .update(video)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteVideo = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ============================================
// PUBLIC WEBSITE UTILITIES
// ============================================

// Fetch a single setting value
export const fetchSetting = async (key: string): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('website_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            console.warn(`Failed to fetch setting ${key}:`, error.message);
            return null;
        }
        return data?.value || null;
    } catch {
        return null;
    }
};

// Update a setting value (upsert)
export const updateSetting = async (key: string, value: string): Promise<void> => {
    const { error } = await supabase
        .from('website_settings')
        .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
        console.error(`Failed to update setting ${key}:`, error.message);
        throw error;
    }
};

// Check if database products mode is enabled
export const isUsingDatabaseProducts = async (): Promise<boolean> => {
    const value = await fetchSetting('use_database_products');
    return value === 'true';
};

// Fetch products for public website
export interface PublicProduct {
    id: number;
    slug: string;
    image_base64?: string;
    title_id: string;
    title_en: string;
    price: string;
    price_numeric: number;
    description_id: string;
    description_en: string;
    condition_id: string;
    condition_en: string;
    min_order_id: string;
    min_order_en: string;
    category_id: string;
    category_en: string;
    is_active: boolean;
    thumbnails_base64?: string[];
}

export const fetchPublicProducts = async (): Promise<PublicProduct[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching public products:', error);
        return [];
    }
    return data || [];
};

// Fetch single product by slug for ProductDetailPage
export const fetchProductBySlug = async (slug: string): Promise<PublicProduct | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching product by slug:', error);
        return null;
    }
    return data;
};

// ============================================
// FEATURED PRODUCT CONTENT
// ============================================

export interface FeaturedProductContent {
    badge_id: string;
    badge_en: string;
    title_id: string;
    title_en: string;
    subtitle_id: string;
    subtitle_en: string;
    product_title_id: string;
    product_title_en: string;
    product_desc_id: string;
    product_desc_en: string;
    main_function_title_id: string;
    main_function_title_en: string;
    main_function_desc_id: string;
    main_function_desc_en: string;
    suitable_for_title_id: string;
    suitable_for_title_en: string;
    suitable_for_desc_id: string;
    suitable_for_desc_en: string;
    image_base64?: string;
    linked_product_id?: number;
}

// Default featured product content
export const defaultFeaturedProduct: FeaturedProductContent = {
    badge_id: 'PRODUK UNGGULAN',
    badge_en: 'FEATURED PRODUCTS',
    title_id: 'Koleksi Alat Bantu Mobilitas Terlengkap',
    title_en: 'Complete Collection of Mobility Aids',
    subtitle_id: 'Temukan alat angkat pasien elektrik terpercaya untuk transfer pasien yang aman, nyaman, dan mudah.',
    subtitle_en: 'Find trusted electric patient lifts for safe, comfortable, and easy patient transfers.',
    product_title_id: 'Electric Patient Lifter, alat untuk membantu mengangkat pasien stroke.',
    product_title_en: 'Electric Patient Lifter, tool to help lift stroke patients.',
    product_desc_id: 'Pengangkat Pasien Listrik adalah alat bantu angkat bertenaga baterai yang dirancang untuk memindahkan pasien stroke, lumpuh, atau yang memiliki gangguan mobilitas dengan aman dan mudah.',
    product_desc_en: 'Electric Patient Lifter is a battery-powered lifting aid designed to move stroke patients, paralyzed, or those with mobility impairments safely and easily.',
    main_function_title_id: 'Fungsi Utama:',
    main_function_title_en: 'Main Function:',
    main_function_desc_id: 'Memindahkan pasien dari tempat tidur ke kursi roda, mobil, atau bak mandi untuk kebutuhan sehari-hari.',
    main_function_desc_en: 'Move patients from bed to wheelchair, car, or bathtub for daily needs.',
    suitable_for_title_id: 'Cocok Untuk:',
    suitable_for_title_en: 'Suitable For:',
    suitable_for_desc_id: 'Lansia, pengguna kursi roda, penyandang disabilitas, dan pasien yang terbaring di tempat tidur atau mengalami patah tulang.',
    suitable_for_desc_en: 'Elderly, wheelchair users, people with disabilities, and bedridden patients or those with broken bones.',
    image_base64: '',
    linked_product_id: undefined
};

// Fetch featured product content from settings
export const fetchFeaturedProduct = async (): Promise<FeaturedProductContent> => {
    try {
        const value = await fetchSetting('featured_product_content');
        if (value) {
            return JSON.parse(value);
        }
    } catch {
        console.error('Error fetching featured product content');
    }
    return defaultFeaturedProduct;
};

// Update featured product content
export const updateFeaturedProduct = async (content: FeaturedProductContent): Promise<boolean> => {
    try {
        const jsonValue = JSON.stringify(content);
        await updateSetting('featured_product_content', jsonValue);
        return true;
    } catch {
        console.error('Error updating featured product content');
        return false;
    }
};

// ============================================
// SUPABASE AUTHENTICATION
// ============================================

export interface AdminProfile {
    id: string;
    email: string;
    display_name?: string;
    role?: string;
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
};

// Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Get current session
export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

// Get current user
export const getCurrentUser = async (): Promise<AdminProfile | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Try to get profile from admin_profiles table
    // Use maybeSingle() to avoid 406 error when profile doesn't exist
    const { data: profile } = await supabase
        .from('admin_profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .maybeSingle();

    return {
        id: user.id,
        email: user.email || '',
        display_name: profile?.display_name || user.email?.split('@')[0] || 'Admin',
        role: profile?.role || 'admin'
    };
};

// Update user email
export const updateUserEmail = async (newEmail: string) => {
    const { data, error } = await supabase.auth.updateUser({
        email: newEmail
    });

    if (error) throw error;
    return data;
};

// Update user password
export const updateUserPassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) throw error;
    return data;
};

// Update admin profile (display name)
export const updateAdminProfile = async (displayName: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('admin_profiles')
        .upsert({
            id: user.id,
            display_name: displayName
        }, { onConflict: 'id' });

    if (error) throw error;
};

// Listen for auth state changes
export const onAuthStateChange = (callback: (session: unknown) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
};

