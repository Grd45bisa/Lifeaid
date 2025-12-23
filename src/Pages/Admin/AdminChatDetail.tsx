import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, fetchChatMessages, type ChatMessage } from '../../utils/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import './AdminChatDetail.css';

// Icons
const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const LiveIcon = () => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
        <circle cx="4" cy="4" r="4" />
    </svg>
);

const AdminChatDetail = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [userData, setUserData] = useState<{ name: string; email: string; phone?: string }>({
        name: 'Tidak diketahui',
        email: 'Tidak ada email'
    });
    const channelRef = useRef<RealtimeChannel | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const loadMessages = async () => {
        if (!sessionId) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchChatMessages(sessionId);
            setMessages(data);

            // Extract user data from first message with metadata
            const messageWithMeta = data.find(m => m.metadata?.email);
            if (messageWithMeta?.metadata) {
                setUserData({
                    name: messageWithMeta.metadata.name || 'Tidak diketahui',
                    email: messageWithMeta.metadata.email || 'Tidak ada email',
                    phone: messageWithMeta.metadata.phone
                });
            }
        } catch (err) {
            setError('Gagal memuat pesan. Pastikan koneksi Supabase sudah dikonfigurasi.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load and Realtime subscription
    useEffect(() => {
        loadMessages();

        if (!sessionId) return;

        // Subscribe to realtime changes for this session only
        const channel = supabase
            .channel(`chat_session_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_memory',
                    filter: `session_id=eq.${sessionId}`
                },
                (payload) => {
                    console.log('Realtime: New message for this session', payload);
                    const newMessage = payload.new as ChatMessage;
                    setMessages((prev) => [...prev, newMessage]);

                    // Auto-scroll to bottom
                    setTimeout(() => {
                        if (chatContainerRef.current) {
                            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                        }
                    }, 100);
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
                setIsLive(status === 'SUBSCRIBED');
            });

        channelRef.current = channel;

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [sessionId]);

    // Auto-scroll when messages load
    useEffect(() => {
        if (chatContainerRef.current && messages.length > 0) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Format time for message bubble
    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format date for header
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Group messages by date
    const getMessageDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toDateString();
    };

    return (
        <div className="chat-detail-page">
            {/* Header */}
            <header className="chat-detail-header">
                <Link to="/admin/chat-history" className="back-btn">
                    <BackIcon />
                    <span>Kembali</span>
                </Link>
                <div className="user-info">
                    <div className="user-avatar">
                        {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <h1>
                            {userData.name}
                            {isLive && (
                                <span className="live-indicator">
                                    <LiveIcon />
                                    Live
                                </span>
                            )}
                        </h1>
                        <p>{userData.email}</p>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Memuat percakapan...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="empty-state">
                    <p>Tidak ada pesan dalam sesi ini</p>
                </div>
            ) : (
                <div className="chat-container" ref={chatContainerRef}>
                    {messages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        const showDate = index === 0 ||
                            getMessageDate(msg.created_at) !== getMessageDate(messages[index - 1].created_at);

                        return (
                            <div key={msg.id || index} className="message-wrapper">
                                {/* Date Separator */}
                                {showDate && (
                                    <div className="date-separator">
                                        <span>{formatDate(msg.created_at)}</span>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
                                    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
                                        <div className="message-sender">
                                            {isUser ? userData.name : 'Lifeaid AI Assistant'}
                                        </div>
                                        <div
                                            className="message-content"
                                            dangerouslySetInnerHTML={{
                                                __html: formatMessageContent(msg.content)
                                            }}
                                        />
                                        <div className="message-time">
                                            {formatTime(msg.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Session Info Footer */}
            {!isLoading && messages.length > 0 && (
                <div className="session-info">
                    <p>Session ID: <code>{sessionId}</code></p>
                    <p>Total Pesan: {messages.length}</p>
                    {isLive && <p className="live-status">🔴 Realtime aktif</p>}
                </div>
            )}
        </div>
    );
};

// Format message content - convert markdown-like to HTML
const formatMessageContent = (content: string): string => {
    if (!content) return '';

    let formatted = content;

    // Bold text **text** or __text__
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic text *text* or _text_
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links [label](url)
    formatted = formatted.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Auto-link bare URLs
    formatted = formatted.replace(
        /(?<!["\\(])(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
};

export default AdminChatDetail;
