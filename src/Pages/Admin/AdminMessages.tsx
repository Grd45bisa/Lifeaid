import { useState, useEffect } from 'react';
import { useAdminLanguage, adminTranslations as t } from '../../Components/Admin/AdminLanguageContext';
import { fetchContactMessages, markMessageAsRead, markMessageAsReplied, type ContactMessage } from '../../utils/supabaseClient';
import './AdminMessages.css';

const AdminMessages = () => {
    const { lang } = useAdminLanguage();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const data = await fetchContactMessages();
            setMessages(data);
        } catch (err) {
            console.error(err);
            setError(t.common.error[lang]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadMessages(); }, []);

    const handleMarkRead = async (id: number) => {
        await markMessageAsRead(id);
        setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
    };

    const handleMarkReplied = async (id: number) => {
        await markMessageAsReplied(id);
        setMessages(messages.map(m => m.id === id ? { ...m, is_read: true, is_replied: true } : m));
    };

    const handleSelectMessage = (id: number, isRead: boolean) => {
        setSelectedId(id);
        if (!isRead) handleMarkRead(id);
    };

    const handleBackToList = () => {
        setSelectedId(null);
    };

    const selectedMessage = messages.find(m => m.id === selectedId);
    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.is_read;
        if (filter === 'replied') return m.is_replied;
        return true;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`admin-messages-page ${selectedId ? 'detail-open' : ''}`}>
            <header className="page-header">
                <h1>{t.messages.title[lang]}</h1>
                <div className="filter-tabs">
                    <div className={`tab-item ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        {lang === 'id' ? 'Semua' : 'All'} ({messages.length})
                    </div>
                    <div className={`tab-item ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                        {t.messages.unread[lang]} ({messages.filter(m => !m.is_read).length})
                    </div>
                    <div className={`tab-item ${filter === 'replied' ? 'active' : ''}`} onClick={() => setFilter('replied')}>
                        {t.messages.replied[lang]} ({messages.filter(m => m.is_replied).length})
                    </div>
                </div>
            </header>

            {error && <div className="error-message"><p>{error}</p></div>}

            <div className="messages-layout">
                <div className="messages-list">
                    {isLoading ? (
                        <div className="loading-state"><div className="spinner"></div></div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="empty-state"><p>{t.common.noData[lang]}</p></div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message-item ${selectedId === msg.id ? 'selected' : ''} ${!msg.is_read ? 'unread' : ''}`}
                                onClick={() => handleSelectMessage(msg.id!, msg.is_read!)}
                            >
                                <div className="message-item-header">
                                    <span className="message-name">{msg.name}</span>
                                    <span className="message-date">{formatDate(msg.created_at)}</span>
                                </div>
                                <p className="message-email">{msg.email}</p>
                                <p className="message-preview">{msg.message.substring(0, 80)}...</p>
                                {msg.is_replied && <span className="replied-badge">{t.messages.replied[lang]}</span>}
                            </div>
                        ))
                    )}
                </div>

                <div className="message-detail">
                    {selectedMessage ? (
                        <>
                            <button className="mobile-back-btn" onClick={handleBackToList}>
                                ← {lang === 'id' ? 'Kembali' : 'Back'}
                            </button>
                            <div className="detail-header">
                                <h2>{selectedMessage.name}</h2>
                                <span className="detail-date">{formatDate(selectedMessage.created_at)}</span>
                            </div>
                            <p className="detail-email"><strong>{t.messages.email[lang]}:</strong> {selectedMessage.email}</p>
                            {selectedMessage.phone && <p className="detail-phone"><strong>{t.messages.phone[lang]}:</strong> {selectedMessage.phone}</p>}
                            <div className="detail-message">
                                <strong>{t.messages.message[lang]}:</strong>
                                <p>{selectedMessage.message}</p>
                            </div>
                            <div className="detail-actions">
                                {!selectedMessage.is_replied && (
                                    <button className="mark-replied-btn" onClick={() => selectedMessage.id && handleMarkReplied(selectedMessage.id)}>
                                        ✓ {t.messages.markReplied[lang]}
                                    </button>
                                )}
                                <a href={`mailto:${selectedMessage.email}`} className="email-btn">📧 {lang === 'id' ? 'Kirim Email' : 'Send Email'}</a>
                            </div>
                        </>
                    ) : (
                        <div className="no-selection"><p>{lang === 'id' ? 'Pilih pesan untuk melihat detail' : 'Select a message to view details'}</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
