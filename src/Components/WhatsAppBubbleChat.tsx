import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/WhatsAppBubbleChat.css';
import emailjs from '@emailjs/browser';
import { supabase } from '../utils/supabaseClient';
import OptimizedImage from './ui/OptimizedImage';

type Language = 'id' | 'en';
type ChatMode = 'choice' | 'whatsapp' | 'website' | 'form';

interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'support';
  time: string;
}

// ============================================================================
// TRANSLATIONS
// ============================================================================
const translations = {
  id: {
    supportName: 'Lifeaid Smart Assistant',
    statusText: 'Online 24/7',
    greeting: '<b>Halo! Saya Lifeaid Smart Assistant 🤖</b><br>Saya siap membantu menjawab pertanyaan Anda seputar produk dan layanan kami. Apa yang ingin Anda ketahui hari ini?',
    placeholder: 'Ketik pertanyaan Anda...',
    hoverText: 'Tanya Asisten Pintar',
    justNow: 'Baru saja',
    choiceTitle: 'Pilih Metode Chat',
    choiceSubtitle: 'Pilih cara komunikasi yang paling nyaman untuk Anda',
    whatsappOption: 'Chat Via WhatsApp',
    whatsappDesc: 'Terhubung dengan tim kami di WhatsApp',
    websiteOption: 'Chat dengan Asisten Pintar',
    websiteDesc: 'Dapatkan jawaban instan dari AI kami',
    sendingMessage: 'Sedang mengetik...',
    messageSent: 'Terkirim',
    messageError: 'Gagal mengirim. Silakan coba lagi.',
    formTitle: 'Data Pengunjung',
    formSubtitle: 'Bantu kami mengenal Anda lebih baik',
    nameLabel: 'Nama Lengkap*',
    emailLabel: 'Email*',
    phoneLabel: 'No. WhatsApp (Opsional)',
    namePlaceholder: 'Nama Anda',
    emailPlaceholder: 'nama@email.com',
    phonePlaceholder: '0812xxxx',
    startChat: 'Mulai Percakapan',
    nameRequired: 'Mohon isi nama Anda',
    emailRequired: 'Mohon isi email Anda',
    emailInvalid: 'Format email tidak valid',
    endChat: 'Akhiri Chat',
    confirmEndChat: 'Apakah Anda yakin ingin mengakhiri sesi chat? Transkrip akan dikirim ke email kami.',
    chatEnded: 'Sesi chat telah berakhir. Transkrip telah dikirim.',
    chatClosingWarning: 'Chat akan berakhir otomatis dalam 2 menit karena tidak ada aktivitas.',
    sessionExpired: 'Sesi telah berakhir karena tidak ada aktivitas. Silakan isi form lagi untuk memulai chat baru.',
    sessionActive: 'Sesi aktif',
    chatActive: 'Chat aktif',
    typeMessage: 'Ketik pesan...'
  },
  en: {
    supportName: 'Lifeaid Smart Assistant',
    statusText: 'Online 24/7',
    greeting: '<b>Hi! I\'m Lifeaid Smart Assistant 🤖</b><br>I\'m here to help answer your questions about our products and services. What would you like to know today?',
    placeholder: 'Type your question...',
    hoverText: 'Ask Smart Assistant',
    justNow: 'Just now',
    choiceTitle: 'Choose Chat Method',
    choiceSubtitle: 'Select the communication way that suits you best',
    whatsappOption: 'Chat Via WhatsApp',
    whatsappDesc: 'Connect with our team on WhatsApp',
    websiteOption: 'Chat with Smart Assistant',
    websiteDesc: 'Get instant answers from our AI',
    sendingMessage: 'Typing...',
    messageSent: 'Sent',
    messageError: 'Failed to send. Please try again.',
    formTitle: 'Visitor Details',
    formSubtitle: 'Help us get to know you better',
    nameLabel: 'Full Name*',
    emailLabel: 'Email*',
    phoneLabel: 'WhatsApp Number (Optional)',
    namePlaceholder: 'Your Name',
    emailPlaceholder: 'name@email.com',
    phonePlaceholder: '0812xxxx',
    startChat: 'Start Conversation',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email format',
    endChat: 'End Chat',
    confirmEndChat: 'Are you sure you want to end this chat session? The transcript will be sent to our email.',
    chatEnded: 'Chat session ended. Transcript has been sent.',
    chatClosingWarning: 'Chat will end automatically in 2 minutes due to inactivity.',
    sessionExpired: 'Session has expired due to inactivity. Please fill out the form again to start a new chat.',
    sessionActive: 'Session active',
    chatActive: 'Chat active',
    typeMessage: 'Type a message...'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'id';

  const savedLang = localStorage.getItem('preferred-language') as Language;
  if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
    return savedLang;
  }

  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('id') ? 'id' : 'en';
};

const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const WhatsAppBubbleChat: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('choice');
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [initialEmailSent, setInitialEmailSent] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [chatTimeRemaining, setChatTimeRemaining] = useState<number | null>(null);

  // ============================================================================
  // REFS
  // ============================================================================
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Timer refs
  const sessionExpiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatInactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef<boolean>(false);
  const sessionCountdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatCountdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data refs (for closures)
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  const userDataRef = useRef<UserData>({ name: '', email: '', phone: '' });
  const currentLangRef = useRef<Language>(currentLang);
  const isOpenRef = useRef(isOpen);

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  const CONFIG = {
    phoneNumber: '6281219751605',
    // Bypass proxy, use direct URL
    n8nWebhook: 'https://n8n.teratai.web.id/webhook/387dbe3f-1bc1-4346-90c8-1235f20d2fae/chat',
    emailjs: {
      serviceId: 'service_ovo0bkw',
      templateId: 'template_du5kp9t',
      publicKey: '-k0Z6rJV5VsKb-VXV'
    },
    timers: {
      sessionExpiry: 5 * 60, // 5 minutes in seconds
      chatInactivity: 7 * 60, // 7 minutes in seconds
      warningBefore: 2 * 60 // Show warning 2 minutes before timeout
    }
  };

  // ============================================================================
  // UPDATE REFS ON STATE CHANGES
  // ============================================================================
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);
  useEffect(() => { userDataRef.current = userData; }, [userData]);
  useEffect(() => { currentLangRef.current = currentLang; }, [currentLang]);

  // ============================================================================
  // SESSION PERSISTENCE (sessionStorage)
  // ============================================================================
  // Check if session is still valid (within 7 minutes)
  const isSessionValid = useCallback((): boolean => {
    const sessionTimestamp = sessionStorage.getItem('lifeaid_chat_session_timestamp');
    if (!sessionTimestamp) return false;

    const elapsed = Date.now() - parseInt(sessionTimestamp);
    const sevenMinutes = 7 * 60 * 1000; // 7 minutes in milliseconds
    return elapsed < sevenMinutes;
  }, []);

  useEffect(() => {
    // Restore session on mount
    const savedSessionId = sessionStorage.getItem('lifeaid_chat_session_id');
    const savedUserData = sessionStorage.getItem('lifeaid_chat_user_data');
    const savedHistory = sessionStorage.getItem('lifeaid_chat_history');
    const savedMode = sessionStorage.getItem('lifeaid_chat_mode');
    const savedEmailSent = sessionStorage.getItem('lifeaid_initial_email_sent');

    // Only restore if session is still valid (within 7 minutes)
    if (savedSessionId && savedUserData && savedMode === 'website' && isSessionValid()) {
      setSessionId(savedSessionId);
      setUserData(JSON.parse(savedUserData));
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);

        // If chat history exists, start chat inactivity timer with restored time
        if (parsedHistory.length > 0) {
          console.log('✅ Session restored with chat history - restoring chat timer');
          // We'll start the timer after a brief delay to ensure refs are updated
          setTimeout(() => {
            startChatInactivityTimer(true); // Restore from saved expiry time
          }, 100);
        }
      }
      // CRITICAL: Mark email as already sent to prevent duplicates on refresh
      setInitialEmailSent(savedEmailSent === 'true');
      setChatMode('website');
      console.log('✅ Session restored from sessionStorage:', savedSessionId);
      console.log('📧 Email sent status:', savedEmailSent === 'true' ? 'Already sent' : 'Not sent yet');
    } else if (savedSessionId && !isSessionValid()) {
      // Session expired - clear all session data
      console.log('⏱️ Session expired (7+ minutes) - clearing session data');
      sessionStorage.removeItem('lifeaid_chat_session_id');
      sessionStorage.removeItem('lifeaid_chat_user_data');
      sessionStorage.removeItem('lifeaid_chat_history');
      sessionStorage.removeItem('lifeaid_chat_mode');
      sessionStorage.removeItem('lifeaid_initial_email_sent');
      sessionStorage.removeItem('lifeaid_chat_session_timestamp');
      sessionStorage.removeItem('chat_start_time');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save session to sessionStorage
  useEffect(() => {
    if (chatMode === 'website' && sessionId) {
      sessionStorage.setItem('lifeaid_chat_session_id', sessionId);
      sessionStorage.setItem('lifeaid_chat_user_data', JSON.stringify(userData));
      sessionStorage.setItem('lifeaid_chat_history', JSON.stringify(chatHistory));
      sessionStorage.setItem('lifeaid_chat_mode', chatMode);
      sessionStorage.setItem('lifeaid_initial_email_sent', String(initialEmailSent));
      // Update timestamp to keep session fresh
      sessionStorage.setItem('lifeaid_chat_session_timestamp', String(Date.now()));
    }
  }, [sessionId, userData, chatHistory, chatMode, initialEmailSent]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  const getCurrentTime = (): string => {
    const now = new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = now.toDateString() === today.toDateString();
    const isYesterday = now.toDateString() === yesterday.toDateString();

    const timeStr = now.toLocaleTimeString(currentLang === 'id' ? 'id-ID' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) {
      return timeStr;
    } else if (isYesterday) {
      return currentLang === 'id' ? `Kemarin ${timeStr}` : `Yesterday ${timeStr}`;
    } else {
      const dateStr = now.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return `${dateStr} ${timeStr}`;
    }
  };

  const formatResponseText = (text: string): string => {
    if (!text) return '';

    let formatted = text.replace(/\n{3,}/g, '\n\n');
    const links: string[] = [];
    const placeholder = (index: number) => `{{{LINK-REF-${index}}}}`;

    // Handle Markdown links [label](url)
    formatted = formatted.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      (_, label, url) => {
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">${label}</a>`;
        links.push(linkHtml);
        return placeholder(links.length - 1);
      }
    );

    // Convert markdown formatting
    formatted = formatted
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>');

    // Auto-link URLs
    formatted = formatted.replace(
      /((https?:\/\/|www\.)[^\s<"']+)/g,
      (match) => {
        let url = match;
        const punctuation = /[.,;:)]$/;
        let suffix = '';
        if (punctuation.test(url)) {
          suffix = url.charAt(url.length - 1);
          url = url.slice(0, -1);
        }

        let href = url;
        if (url.startsWith('www.')) {
          href = 'https://' + url;
        }

        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">${url}</a>${suffix}`;
      }
    );

    // Restore placeholders
    links.forEach((link, index) => {
      formatted = formatted.replace(placeholder(index), link);
    });

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted.trim();
  };

  // ============================================================================
  // EMAIL FUNCTIONS
  // ============================================================================

  // EMAIL #1: New Lead Captured (sent immediately on form submit)
  const sendLeadCaptureEmail = useCallback(async (data: UserData) => {
    if (!data.email || !CONFIG.emailjs.serviceId) return;

    const deviceInfo = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    const pageUrl = window.location.href;
    const timestamp = new Date().toLocaleString('id-ID');

    const templateParams = {
      user_name: data.name,
      user_email: data.email,
      user_phone: data.phone || 'Tidak diisi',
      chat_transcript: `
        <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 15px;">
          <p style="margin: 0; color: #856404; font-size: 14px; font-weight: 600;">
            🔥 New Lead Captured
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px; width: 100px;">🌐 Page URL:</td>
            <td style="padding: 8px 0; font-size: 13px;"><a href="${pageUrl}" style="color: #224570;">${pageUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">💻 Device:</td>
            <td style="padding: 8px 0; font-size: 13px;">${deviceInfo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">🕐 Timestamp:</td>
            <td style="padding: 8px 0; font-size: 13px;">${timestamp}</td>
          </tr>
        </table>
        <p style="margin-top: 15px; padding: 12px; background-color: #e7f3ff; border-radius: 4px; color: #0066cc; font-size: 13px;">
          ⏱️ <strong>Status:</strong> User telah mengisi form dan masuk ke chat room.<br>
          Menunggu pesan pertama atau session akan berakhir dalam 5 menit.
        </p>
      `
    };

    try {
      await emailjs.send(
        CONFIG.emailjs.serviceId,
        CONFIG.emailjs.templateId,
        templateParams,
        CONFIG.emailjs.publicKey
      );
      console.log('✅ Email #1: New Lead sent successfully');
    } catch (error) {
      console.error('❌ Failed to send New Lead email:', error);
    }
  }, [CONFIG.emailjs]);

  // EMAIL #2: Chat Transcript (sent on chat end or timeout)
  const sendTranscriptEmail = useCallback(async (reason: 'manual' | 'timeout' | 'browser_close' = 'manual') => {
    const user = userDataRef.current;
    if (!user.email || !CONFIG.emailjs.serviceId || chatHistoryRef.current.length === 0) return;

    const history = chatHistoryRef.current;
    const startTime = sessionStorage.getItem('chat_start_time');
    const duration = startTime ? Math.round((Date.now() - parseInt(startTime)) / 1000 / 60) : 0;
    const endTime = getCurrentTime();

    // Status config
    const statusConfig = {
      manual: { label: '✅ Chat Completed', color: '#28a745' },
      timeout: { label: '⏱️ Chat Timeout (7m)', color: '#ffc107' },
      browser_close: { label: '🚪 Browser Closed', color: '#dc3545' }
    };

    const { label, color } = statusConfig[reason];

    // Generate Chat Bubbles HTML
    const chatBubbles = history.map(msg => {
      const isUser = msg.sender === 'user';
      return `
        <div style="margin-bottom: 12px; overflow: hidden;">
          <div style="float: ${isUser ? 'right' : 'left'}; max-width: 75%; 
                      background-color: ${isUser ? '#224570' : '#f0f2f5'}; 
                      color: ${isUser ? '#ffffff' : '#111b21'}; 
                      padding: 10px 14px; border-radius: ${isUser ? '12px 12px 0 12px' : '0 12px 12px 12px'};">
            <div style="font-size: 11px; font-weight: 600; opacity: 0.85; margin-bottom: 4px;">
              ${isUser ? (user.name || 'User') : 'Assistant'}
            </div>
            <div style="font-size: 13px; white-space: pre-wrap; line-height: 1.4;">${msg.text}</div>
            <div style="font-size: 10px; text-align: right; opacity: 0.7; margin-top: 4px;">${msg.time}</div>
          </div>
        </div>`;
    }).join('');

    // Generate Plain Text Log
    const plainTextLog = history
      .map(msg => `[${msg.time}] ${msg.sender === 'user' ? (user.name || 'User') : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const templateParams = {
      user_name: user.name,
      user_email: user.email,
      user_phone: user.phone || '-',
      chat_transcript: `
        <div style="padding: 10px; background-color: ${color}; color: white; border-radius: 6px; text-align: center; margin-bottom: 20px;">
          <strong>${label}</strong>
        </div>
        <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
          <tr><td style="color:#666;width:100px;">Total Messages:</td><td><strong>${history.length}</strong></td></tr>
          <tr><td style="color:#666;">Duration:</td><td><strong>${duration} min</strong></td></tr>
          <tr><td style="color:#666;">Ended At:</td><td><strong>${endTime}</strong></td></tr>
        </table>
        <div style="border-top: 1px solid #eee; padding-top: 15px;">${chatBubbles}</div>
        <details style="margin-top: 20px;">
          <summary style="font-size: 12px; color: #666; cursor: pointer;">Raw Log</summary>
          <pre style="background:#f8f9fa; padding:10px; font-size:11px; overflow:auto; max-height:150px;">${plainTextLog}</pre>
        </details>
      `
    };

    try {
      await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, templateParams, CONFIG.emailjs.publicKey);
      // console.log(`Email sent: ${reason}`); // Reduced logging
    } catch (e) {
      console.error('Email failed:', e);
    }
  }, [CONFIG.emailjs, getCurrentTime]);

  // ============================================================================
  // TIMER MANAGEMENT
  // ============================================================================

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (sessionExpiryTimeoutRef.current) {
      clearTimeout(sessionExpiryTimeoutRef.current);
      sessionExpiryTimeoutRef.current = null;
    }
    if (chatInactivityTimeoutRef.current) {
      clearTimeout(chatInactivityTimeoutRef.current);
      chatInactivityTimeoutRef.current = null;
    }
    if (sessionCountdownIntervalRef.current) {
      clearInterval(sessionCountdownIntervalRef.current);
      sessionCountdownIntervalRef.current = null;
    }
    if (chatCountdownIntervalRef.current) {
      clearInterval(chatCountdownIntervalRef.current);
      chatCountdownIntervalRef.current = null;
    }
    setSessionTimeRemaining(null);
    setChatTimeRemaining(null);
    warningShownRef.current = false;
  }, []);

  // Start Session Expiry Timer (5 minutes)
  const startSessionExpiryTimer = useCallback((restoreFromSaved: boolean = false) => {
    clearAllTimers();

    let expiryTime: number;

    if (restoreFromSaved) {
      // Try to restore from saved expiry time
      const savedExpiryTime = sessionStorage.getItem('lifeaid_session_expiry_time');
      if (savedExpiryTime) {
        expiryTime = parseInt(savedExpiryTime);
        // If already expired, don't start timer
        if (expiryTime <= Date.now()) {
          console.log('⏱️ Session timer already expired');
          return;
        }
      } else {
        expiryTime = Date.now() + (CONFIG.timers.sessionExpiry * 1000);
      }
    } else {
      expiryTime = Date.now() + (CONFIG.timers.sessionExpiry * 1000);
    }

    // Save expiry time to sessionStorage
    sessionStorage.setItem('lifeaid_session_expiry_time', String(expiryTime));

    // Countdown display
    sessionCountdownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      setSessionTimeRemaining(remaining);

      if (remaining === 0) {
        if (sessionCountdownIntervalRef.current) {
          clearInterval(sessionCountdownIntervalRef.current);
        }
      }
    }, 1000);

    // Calculate remaining time for timeout
    const remainingMs = expiryTime - Date.now();

    // Actual timeout
    sessionExpiryTimeoutRef.current = setTimeout(() => {
      // Only expire if NO messages sent yet
      if (chatHistoryRef.current.length === 0) {
        console.log('⏱️ Session expired (5 min without message)');

        const expiryMsg: ChatMessage = {
          text: translations[currentLangRef.current].sessionExpired,
          sender: 'support',
          time: getCurrentTime()
        };
        setChatHistory([expiryMsg]);

        // Clear session
        sessionStorage.clear();

        setTimeout(() => {
          setChatMode('choice');
          setSessionId('');
          setChatHistory([]);
          setUserData({ name: '', email: '', phone: '' });
          setInitialEmailSent(false);
        }, 3000);
      }

      clearAllTimers();
    }, remainingMs);

    const remainingSecs = Math.floor(remainingMs / 1000);
    console.log(`⏱️ Session expiry timer started (${remainingSecs}s remaining)`);
  }, [CONFIG.timers.sessionExpiry, clearAllTimers, getCurrentTime]);

  // Start Chat Inactivity Timer (7 minutes)
  const startChatInactivityTimer = useCallback((restoreFromSaved: boolean = false) => {
    // Clear previous chat timer
    if (chatInactivityTimeoutRef.current) {
      clearTimeout(chatInactivityTimeoutRef.current);
    }
    if (chatCountdownIntervalRef.current) {
      clearInterval(chatCountdownIntervalRef.current);
    }

    warningShownRef.current = false;

    let expiryTime: number;

    if (restoreFromSaved) {
      // Try to restore from saved expiry time
      const savedExpiryTime = sessionStorage.getItem('lifeaid_chat_expiry_time');
      if (savedExpiryTime) {
        expiryTime = parseInt(savedExpiryTime);
        // If already expired, don't start timer
        if (expiryTime <= Date.now()) {
          console.log('⏱️ Chat timer already expired');
          return;
        }
        // Restore warning shown state
        const savedWarningShown = sessionStorage.getItem('lifeaid_chat_warning_shown');
        warningShownRef.current = savedWarningShown === 'true';
      } else {
        expiryTime = Date.now() + (CONFIG.timers.chatInactivity * 1000);
      }
    } else {
      expiryTime = Date.now() + (CONFIG.timers.chatInactivity * 1000);
      // Reset warning state for new timer
      sessionStorage.removeItem('lifeaid_chat_warning_shown');
    }

    // Save expiry time to sessionStorage
    sessionStorage.setItem('lifeaid_chat_expiry_time', String(expiryTime));

    // Countdown display
    chatCountdownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      setChatTimeRemaining(remaining);

      // Show warning 2 minutes before timeout
      if (remaining === CONFIG.timers.warningBefore && !warningShownRef.current) {
        const warningMsg: ChatMessage = {
          text: translations[currentLangRef.current].chatClosingWarning,
          sender: 'support',
          time: getCurrentTime()
        };
        setChatHistory(prev => [...prev, warningMsg]);

        if (!isOpenRef.current) {
          setUnreadCount(prev => prev + 1);
        }

        warningShownRef.current = true;
        sessionStorage.setItem('lifeaid_chat_warning_shown', 'true');
      }

      if (remaining === 0 && chatCountdownIntervalRef.current) {
        clearInterval(chatCountdownIntervalRef.current);
      }
    }, 1000);

    // Calculate remaining time for timeout
    const remainingMs = expiryTime - Date.now();

    // Actual timeout
    chatInactivityTimeoutRef.current = setTimeout(() => {
      console.log('⏱️ Chat inactivity timeout (7 minutes)');

      sendTranscriptEmail('timeout');

      const timeoutMsg: ChatMessage = {
        text: currentLangRef.current === 'id'
          ? 'Sesi berakhir karena tidak ada aktivitas. Transkrip telah dikirim.'
          : 'Session ended due to inactivity. Transcript has been sent.',
        sender: 'support',
        time: getCurrentTime()
      };
      setChatHistory(prev => [...prev, timeoutMsg]);

      // Clear session
      sessionStorage.clear();

      setTimeout(() => {
        setChatMode('choice');
        setSessionId('');
        setChatHistory([]);
        setUserData({ name: '', email: '', phone: '' });
        setInitialEmailSent(false);
      }, 3000);

      clearAllTimers();
    }, remainingMs);

    const remainingSecs = Math.floor(remainingMs / 1000);
    console.log(`⏱️ Chat inactivity timer started (${remainingSecs}s remaining)`);
  }, [CONFIG.timers, clearAllTimers, sendTranscriptEmail, getCurrentTime]);

  // ============================================================================
  // SUPABASE FUNCTIONS
  // ============================================================================
  const saveMessageToSupabase = useCallback(async (
    role: 'user' | 'assistant' | 'system',
    content: string
  ) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase.from('chat_memory').insert({
        session_id: sessionId,
        role: role,
        content: content,
        metadata: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        }
      });

      if (error) {
        console.error('❌ Supabase save error:', error);
      } else {
        console.log(`✅ Message saved to Supabase: ${role}`);
      }
    } catch (err) {
      console.error('❌ Failed to save message to Supabase:', err);
    }
  }, [sessionId, userData]);

  // ============================================================================
  // N8N WEBHOOK FUNCTION
  // ============================================================================
  const sendToN8n = useCallback(async (messageText: string) => {
    try {
      const payload = {
        chatInput: messageText,
        message: messageText,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: currentLang,
        source: 'website-chat',
        userAgent: navigator.userAgent,
        url: window.location.href,
        userData: userData,
        sessionId: sessionId
      };

      console.log('📤 Sending to n8n:', payload);

      const response = await fetch(CONFIG.n8nWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('❌ n8n Error Body:', responseText);
        throw new Error(`n8n returned ${response.status}: ${responseText}`);
      }

      try {
        return JSON.parse(responseText);
      } catch {
        return { success: true, message: responseText };
      }
    } catch (error) {
      console.error('❌ Error sending to n8n:', error);
      throw error;
    }
  }, [CONFIG.n8nWebhook, currentLang, userData, sessionId]);

  // ============================================================================
  // FORM HANDLING
  // ============================================================================
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!userData.name.trim()) {
      errors.name = translations[currentLang].nameRequired;
      isValid = false;
    }

    if (!userData.email.trim()) {
      errors.email = translations[currentLang].emailRequired;
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = translations[currentLang].emailInvalid;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setChatMode('website');

    // Generate session ID
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // Save initial entry to Supabase
    try {
      const { error } = await supabase.from('chat_memory').insert({
        session_id: newSessionId,
        role: 'system',
        content: currentLang === 'id'
          ? `📋 Form terisi: ${userData.name} (${userData.email})${userData.phone ? ` - ${userData.phone}` : ''}`
          : `📋 Form submitted: ${userData.name} (${userData.email})${userData.phone ? ` - ${userData.phone}` : ''}`,
        metadata: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          type: 'form_submission'
        }
      });
      if (error) {
        console.error('❌ Supabase initial save error:', error);
      } else {
        console.log('✅ Initial form entry saved to Supabase');
      }
    } catch (err) {
      console.error('❌ Failed to save initial entry:', err);
    }

    // === EMAIL #1: NEW LEAD CAPTURED ===
    // CRITICAL: Only send if this is a BRAND NEW session (not restored from sessionStorage)
    // This prevents duplicate emails on page refresh
    if (!initialEmailSent) {
      await sendLeadCaptureEmail(userData);
      setInitialEmailSent(true);
      console.log('📧 Email #1 sent for NEW session');
    } else {
      console.log('⏭️ Email #1 skipped - session was restored from sessionStorage (page refresh)');
    }

    // === TIMER #1: SESSION EXPIRY (5 minutes) ===
    // Only start if no chat history yet (brand new session or restored without messages)
    if (chatHistoryRef.current.length === 0) {
      startSessionExpiryTimer();
    } else {
      // Session restored with chat history - start chat timer instead
      console.log('✅ Session restored with chat history - starting chat timer');
      startChatInactivityTimer();
    }
  };

  const handleInputChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ============================================================================
  // MESSAGE SENDING
  // ============================================================================
  const sendMessage = async () => {
    const msg = message.trim();
    if (!msg || isSending) return;

    if (chatMode === 'whatsapp') {
      const encodedMessage = encodeURIComponent(msg);
      const whatsappURL = `https://wa.me/${CONFIG.phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappURL, '_blank');
      setMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      return;
    }

    if (chatMode === 'website') {
      // === FIRST MESSAGE LOGIC ===
      const isFirstMessage = chatHistoryRef.current.length === 0;

      if (isFirstMessage) {
        console.log('✅ First message sent - clearing session expiry timer');
        clearAllTimers();
        sessionStorage.setItem('chat_start_time', String(Date.now()));
      }

      // Add user message
      const userMsg: ChatMessage = {
        text: msg,
        sender: 'user',
        time: getCurrentTime()
      };

      const updatedHistory = [...chatHistoryRef.current, userMsg];
      chatHistoryRef.current = updatedHistory;
      setChatHistory(updatedHistory);

      // Save to Supabase
      await saveMessageToSupabase('user', msg);

      // Clear input
      setMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }

      // Start/Reset chat inactivity timer
      startChatInactivityTimer();

      // Send to n8n
      setIsSending(true);
      try {
        const result = await sendToN8n(msg);

        setTimeout(async () => {
          let responseText = '';

          if (result && typeof result === 'object') {
            responseText = result.output || result.message || result.reply || result.text || '';
          } else if (typeof result === 'string') {
            responseText = result;
          }

          if (!responseText.trim()) {
            responseText = currentLang === 'id'
              ? 'Terima kasih! Pesan Anda telah kami terima. Tim kami akan segera merespons.'
              : 'Thank you! Your message has been received. Our team will respond shortly.';
          }

          const formattedText = formatResponseText(responseText);
          const supportMsg: ChatMessage = {
            text: formattedText,
            sender: 'support',
            time: getCurrentTime()
          };

          const updatedWithSupport = [...chatHistoryRef.current, supportMsg];
          chatHistoryRef.current = updatedWithSupport;
          setChatHistory(updatedWithSupport);

          await saveMessageToSupabase('assistant', responseText);

          if (!isOpenRef.current) {
            setUnreadCount(prev => prev + 1);
          }

          // Reset chat inactivity timer after AI response
          startChatInactivityTimer();

          setIsSending(false);
        }, 800);
      } catch (error) {
        console.error('❌ Failed to send message:', error);

        const errorMsg: ChatMessage = {
          text: currentLang === 'id'
            ? 'Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi atau hubungi kami via WhatsApp.'
            : 'Sorry, there was an error sending your message. Please try again or contact us via WhatsApp.',
          sender: 'support',
          time: getCurrentTime()
        };

        const updatedWithError = [...chatHistoryRef.current, errorMsg];
        chatHistoryRef.current = updatedWithError;
        setChatHistory(updatedWithError);

        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // ============================================================================
  // CHAT CONTROLS
  // ============================================================================

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !sessionId) {
      setChatMode('choice');
    }
  };

  const handleModeSelect = (mode: 'whatsapp' | 'website') => {
    if (mode === 'website') {
      // Check if there's an existing valid session (within 7 minutes)
      if (sessionId && userData.name && userData.email && isSessionValid()) {
        // Session still valid - go directly to chat without re-filling form
        setChatMode('website');
        console.log('✅ Returning to existing session - no form needed');

        // Restart the chat inactivity timer if there's chat history (restore from saved time)
        if (chatHistoryRef.current.length > 0) {
          startChatInactivityTimer(true);
        } else {
          startSessionExpiryTimer(true);
        }
      } else {
        // No valid session - show form
        setChatMode('form');
      }
    } else {
      setChatMode(mode);
    }
  };

  const handleBackToChoice = () => {
    // Just go back to choice mode but PRESERVE session data
    // User can return to chat without re-filling the form within 7 minutes
    setChatMode('choice');
    setMessage('');

    // Update timestamp to keep session fresh when going back
    if (sessionId) {
      sessionStorage.setItem('lifeaid_chat_session_timestamp', String(Date.now()));
      console.log('⏪ Back to choice - session data preserved');
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Language detection
  useEffect(() => {
    const checkLanguage = () => {
      const lang = detectLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    };

    checkLanguage();
    window.addEventListener('storage', checkLanguage);
    return () => window.removeEventListener('storage', checkLanguage);
  }, [currentLang]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && chatMode !== 'choice') {
      inputRef.current.focus();
    }
  }, [isOpen, chatMode]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  // Navbar toggle listener
  useEffect(() => {
    const handleNavbarToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.isOpen) {
        setIsOpen(false);
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    };

    window.addEventListener('navbar-menu-toggle', handleNavbarToggle);
    return () => window.removeEventListener('navbar-menu-toggle', handleNavbarToggle);
  }, []);

  // Send transcript on browser close/navigate away
  useEffect(() => {
    let transcriptSentRef = { sent: false }; // Flag prevent duplicate

    const sendBeaconData = () => {
      // Logic for Beacon/Fetch
      if (chatHistoryRef.current.length > 0 && sessionId && !transcriptSentRef.sent) {
        transcriptSentRef.sent = true;
        const user = userDataRef.current;
        const history = chatHistoryRef.current;
        const startTime = sessionStorage.getItem('chat_start_time');
        const duration = startTime ? Math.round((Date.now() - parseInt(startTime)) / 1000 / 60) : 0;

        // Plain text log
        const plainTextLog = history
          .map(msg => `[${msg.time}] ${msg.sender === 'user' ? (user.name || 'User') : 'Assistant'}: ${msg.text}`)
          .join('\n');

        const beaconData = {
          type: 'chat_transcript_close',
          sessionId, userData: user, duration, reason: 'browser_close',
          timestamp: new Date().toISOString(),
          chatHistory: history.map(m => ({ sender: m.sender, text: m.text, time: m.time })),
          plainTextLog
        };

        if (!navigator.sendBeacon(CONFIG.n8nWebhook, JSON.stringify(beaconData))) {
          fetch(CONFIG.n8nWebhook, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(beaconData), keepalive: true
          }).catch(console.error);
        }

        // Trigger EmailJS as best effort
        sendTranscriptEmail('browser_close');
      }
    };

    const handlePageHide = () => sendBeaconData();
    const handleBeforeUnload = () => sendBeaconData();

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, sendTranscriptEmail, CONFIG.n8nWebhook]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // ============================================================================
  // RENDER
  // ============================================================================
  const t = translations[currentLang];

  if (isHidden) return null;

  return (
    <>
      <div className="wa-widget">
        {/* Chat Window */}
        <div className={`wa-chat-window ${isOpen ? 'active' : ''}`}>
          <div className="wa-header">
            <div className="wa-profile">
              <div className="wa-avatar">
                <OptimizedImage
                  src="/Logo-trans.webp"
                  alt="Support"
                  width={40}
                  height={40}
                  className="wa-avatar-img"
                />
                <span className="wa-status-dot"></span>
              </div>
              <div className="wa-info">
                <span className="wa-name">{t.supportName}</span>
                <span className="wa-status-text">
                  {sessionTimeRemaining !== null && chatHistory.length === 0 ? (
                    <> {t.sessionActive}: {formatTime(sessionTimeRemaining)}</>
                  ) : chatTimeRemaining !== null && chatHistory.length > 0 ? (
                    <> {t.chatActive}: {formatTime(chatTimeRemaining)}</>
                  ) : (
                    t.statusText
                  )}
                </span>
              </div>
            </div>
            <div className="wa-header-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {chatMode === 'website' && chatHistory.length > 0}
              <button
                className="wa-close-btn"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Choice Mode */}
          {chatMode === 'choice' && (
            <div className="wa-choice-container">
              <div className="wa-choice-header">
                <h3>{t.choiceTitle}</h3>
                <p>{t.choiceSubtitle}</p>
              </div>

              <div className="wa-choice-options">
                <button
                  className="wa-choice-option"
                  onClick={() => {
                    window.open(`https://wa.me/${CONFIG.phoneNumber}`, '_blank');
                    setIsOpen(false);
                  }}
                >
                  <div className="wa-choice-icon whatsapp-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div className="wa-choice-content">
                    <span className="wa-choice-title">{t.whatsappOption}</span>
                    <span className="wa-choice-desc">{t.whatsappDesc}</span>
                  </div>
                  <div className="wa-choice-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>

                <button
                  className="wa-choice-option"
                  onClick={() => handleModeSelect('website')}
                >
                  <div className="wa-choice-icon website-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="wa-choice-content">
                    <span className="wa-choice-title">{t.websiteOption}</span>
                    <span className="wa-choice-desc">{t.websiteDesc}</span>
                  </div>
                  <div className="wa-choice-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Form Mode */}
          {chatMode === 'form' && (
            <div className="wa-form-container">
              <div className="wa-header-actions">
                <button
                  className="wa-back-btn"
                  onClick={handleBackToChoice}
                  aria-label="Back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="wa-form-header">
                <h3>{t.formTitle}</h3>
                <p>{t.formSubtitle}</p>
              </div>
              <form onSubmit={handleFormSubmit} className="wa-form">
                <div className="wa-form-group">
                  <label htmlFor="name" className="wa-form-label">{t.nameLabel}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`wa-form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder={t.namePlaceholder}
                    value={userData.name}
                    onChange={handleInputChangeForm}
                  />
                  {formErrors.name && <span className="wa-form-error">{formErrors.name}</span>}
                </div>

                <div className="wa-form-group">
                  <label htmlFor="email" className="wa-form-label">{t.emailLabel}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`wa-form-input ${formErrors.email ? 'error' : ''}`}
                    placeholder={t.emailPlaceholder}
                    value={userData.email}
                    onChange={handleInputChangeForm}
                  />
                  {formErrors.email && <span className="wa-form-error">{formErrors.email}</span>}
                </div>

                <div className="wa-form-group">
                  <label htmlFor="phone" className="wa-form-label">{t.phoneLabel}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="wa-form-input"
                    placeholder={t.phonePlaceholder}
                    value={userData.phone}
                    onChange={handleInputChangeForm}
                  />
                </div>

                <button type="submit" className="wa-form-submit-btn">
                  {t.startChat}
                </button>
              </form>
            </div>
          )}

          {/* Chat Mode (WhatsApp or Website) */}
          {(chatMode === 'whatsapp' || chatMode === 'website') && (
            <>
              <div className="wa-body" ref={chatBodyRef}>
                <div
                  className="wa-message-bubble support-message"
                  dangerouslySetInnerHTML={{ __html: t.greeting }}
                />
                <span className="wa-time">{t.justNow}</span>

                {chatMode === 'website' && chatHistory.map((chat, index) => (
                  <div key={index} className={`wa-message-wrapper ${chat.sender === 'user' ? 'user-wrapper' : 'support-wrapper'}`}>
                    <div
                      className={`wa-message-bubble ${chat.sender === 'user' ? 'user-message' : 'support-message'}`}
                      dangerouslySetInnerHTML={{ __html: chat.text }}
                    />
                    <span className={`wa-time ${chat.sender === 'user' ? 'user-time' : ''}`}>
                      {chat.time}
                    </span>
                  </div>
                ))}

                {isSending && (
                  <div className="wa-message-wrapper support-wrapper">
                    <div className="wa-message-bubble support-message">
                      {t.sendingMessage}
                    </div>
                  </div>
                )}
              </div>

              <div className="wa-footer">
                <button
                  className="wa-back-btn-footer"
                  onClick={handleBackToChoice}
                  aria-label="Back to choices"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <textarea
                  ref={inputRef}
                  className="wa-message-input"
                  placeholder={t.placeholder}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isSending}
                />
                <button
                  className={`wa-send-btn ${message.trim() ? 'has-text' : ''}`}
                  onClick={sendMessage}
                  aria-label="Send message"
                  disabled={isSending}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Floating Bubble Button */}
        <div className="wa-bubble-container">
          <div className="wa-hover-text">
            {t.hoverText}
          </div>
          <button
            className="wa-bubble-btn"
            onClick={toggleChat}
            aria-label="Open WhatsApp Chat"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {unreadCount > 0 && (
              <span className="wa-notification-badge">{unreadCount}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default WhatsAppBubbleChat;