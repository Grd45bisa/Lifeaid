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

