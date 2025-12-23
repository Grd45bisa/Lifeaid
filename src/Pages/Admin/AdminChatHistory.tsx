import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdminLanguage } from '../../Components/Admin/AdminLanguageContext';
import { supabase, fetchChatSessions, type ChatSession } from '../../utils/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import './AdminChatHistory.css';

const AdminChatHistory = () => {
    const { lang } = useAdminLanguage();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [readSessions, setReadSessions] = useState<Set<string>>(new Set());
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Load read sessions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('admin-read-sessions');
        if (saved) {
            try {
                setReadSessions(new Set(JSON.parse(saved)));
            } catch { /* ignore */ }
        }
    }, []);

    // Mark session as read
    const markAsRead = (sessionId: string) => {
        const updated = new Set(readSessions);
        updated.add(sessionId);
        setReadSessions(updated);
        localStorage.setItem('admin-read-sessions', JSON.stringify([...updated]));
    };

    // Translations
    const t = {
        title: lang === 'id' ? 'Riwayat Chat' : 'Chat History',
        subtitle: lang === 'id' ? 'Percakapan pengunjung dengan asisten' : 'Visitor conversations with assistant',
        refresh: lang === 'id' ? 'Refresh' : 'Refresh',
        loading: lang === 'id' ? 'Memuat...' : 'Loading...',
        loadingChat: lang === 'id' ? 'Memuat riwayat chat...' : 'Loading chat history...',
        noChat: lang === 'id' ? 'Belum ada percakapan' : 'No conversations yet',
        noChatDesc: lang === 'id' ? 'Percakapan akan muncul di sini secara realtime' : 'Conversations will appear here in realtime',
        search: lang === 'id' ? 'Cari nama atau email...' : 'Search name or email...',
        justNow: lang === 'id' ? 'Baru saja' : 'Just now',
        minutesAgo: lang === 'id' ? 'menit lalu' : 'minutes ago',
        hoursAgo: lang === 'id' ? 'jam lalu' : 'hours ago',
        daysAgo: lang === 'id' ? 'hari lalu' : 'days ago',
        errorLoad: lang === 'id' ? 'Gagal memuat data. Periksa koneksi database.' : 'Failed to load data. Check database connection.',
        newChat: lang === 'id' ? 'Baru' : 'New'
    };

    const loadSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchChatSessions();
            setSessions(data);
        } catch (err) {
            setError(t.errorLoad);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();

        const channel = supabase
            .channel('chat_memory_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_memory' }, () => {
                loadSessions();
            })
            .subscribe((status) => {
                setIsLive(status === 'SUBSCRIBED');
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t.justNow;
        if (diffMins < 60) return `${diffMins} ${t.minutesAgo}`;
        if (diffHours < 24) return `${diffHours} ${t.hoursAgo}`;
        if (diffDays < 7) return `${diffDays} ${t.daysAgo}`;

        return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const filteredSessions = sessions.filter(s =>
        s.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isUnread = (sessionId: string) => !readSessions.has(sessionId);

    return (
        <div className="chat-history-page">
            <header className="chat-history-header">
                <div className="header-title">
                    <h1>
                        {t.title}
                        {isLive && (
                            <span className="live-indicator">
                                <span className="live-dot"></span>
                                Live
                            </span>
                        )}
                    </h1>
                    <p>{t.subtitle}</p>
                </div>
                <button className="refresh-btn" onClick={loadSessions} disabled={isLoading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    <span>{isLoading ? t.loading : t.refresh}</span>
                </button>
            </header>

            <div className="search-bar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>{t.loadingChat}</p>
                </div>
            ) : filteredSessions.length === 0 ? (
                <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <h3>{t.noChat}</h3>
                    <p>{t.noChatDesc}</p>
                </div>
            ) : (
                <div className="chat-list">
                    {filteredSessions.map((session) => (
                        <Link
                            key={session.session_id}
                            to={`/admin/chat-history/${session.session_id}`}
                            className={`chat-card ${isUnread(session.session_id) ? 'unread' : ''}`}
                            onClick={() => markAsRead(session.session_id)}
                        >
                            <div className="chat-card-avatar">
                                {session.user_name.charAt(0).toUpperCase()}
                                {isUnread(session.session_id) && <span className="unread-dot"></span>}
                            </div>
                            <div className="chat-card-content">
                                <div className="chat-card-header">
                                    <span className="chat-card-name">
                                        {session.user_name}
                                        {isUnread(session.session_id) && <span className="new-badge">{t.newChat}</span>}
                                    </span>
                                    <span className="chat-card-time">{formatDate(session.created_at)}</span>
                                </div>
                                <p className="chat-card-email">{session.user_email}</p>
                                <p className="chat-card-preview">{session.latest_message}</p>
                            </div>
                            {isUnread(session.session_id) && (
                                <div className="chat-card-badge">
                                    {session.message_count}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminChatHistory;
