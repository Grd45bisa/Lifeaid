import React, { useState, useEffect, useRef } from 'react';
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

// Translations
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
    typeMessage: 'Type a message...'
  }
};

// Detect language
const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'id';

  const savedLang = localStorage.getItem('preferred-language') as Language;
  if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
    return savedLang;
  }

  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('id') ? 'id' : 'en';
};

const WhatsAppBubbleChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('choice');
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [chatHistory, setChatHistory] = useState<Array<{ text: string, sender: 'user' | 'support', time: string }>>([]);
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Helper to generate UUID-like string
  const generateSessionId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Restore session from localStorage
  useEffect(() => {
    const savedSessionId = sessionStorage.getItem('lifeaid_chat_session_id');
    const savedUserData = sessionStorage.getItem('lifeaid_chat_user_data');
    const savedHistory = sessionStorage.getItem('lifeaid_chat_history');
    const savedMode = sessionStorage.getItem('lifeaid_chat_mode');

    if (savedSessionId && savedUserData && savedMode === 'website') {
      setSessionId(savedSessionId);
      setUserData(JSON.parse(savedUserData));
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
      setChatMode('website');
      console.log('Restored chat session from sessionStorage:', savedSessionId);
    }
  }, []);

  // Save session to sessionStorage
  useEffect(() => {
    if (chatMode === 'website' && sessionId) {
      sessionStorage.setItem('lifeaid_chat_session_id', sessionId);
      sessionStorage.setItem('lifeaid_chat_user_data', JSON.stringify(userData));
      sessionStorage.setItem('lifeaid_chat_history', JSON.stringify(chatHistory));
      sessionStorage.setItem('lifeaid_chat_mode', chatMode);
    }
  }, [sessionId, userData, chatHistory, chatMode]);

  // EmailJS Refs
  const lastMessageTimeRef = useRef<number>(0);
  const lastEmailSentTimeRef = useRef<number>(0);
  const chatHistoryRef = useRef<Array<{ text: string, sender: 'user' | 'support', time: string }>>([]);
  const userDataRef = useRef<UserData>({ name: '', email: '', phone: '' });
  const currentLangRef = useRef<Language>(currentLang);

  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leadCaptureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpenRef = useRef(isOpen);

  // Keep refs updated
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
    // Don't auto-scroll if user is reading (scrolled up) could be added here, 
    // but for now keeping it simple.
  }, [chatHistory]);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    currentLangRef.current = currentLang;
  }, [currentLang]);

  // Configuration
  const CONFIG = {
    phoneNumber: '6281219751605',
    n8nWebhook: 'https://n8n.kitapunya.web.id/webhook/387dbe3f-1bc1-4346-90c8-1235f20d2fae/chat',
    emailjs: {
      serviceId: 'service_ovo0bkw',
      templateId: 'template_du5kp9t',
      publicKey: '-k0Z6rJV5VsKb-VXV'
    }
  };

  // Listen for language changes
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

  // Auto scroll to bottom when new message or when opening chat
  useEffect(() => {
    if (isOpen && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  // Handle unread count clearing
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Close chat on Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  // Listen for navbar menu toggle
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

  // Removed 3-minute interval check as per user request.
  // Emails are now sent on 'End Chat' or after 7 minutes of inactivity.

  // Page Unload Handling (Send Transcript on Close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Check if we have active session data (Email is required at minimum)
      if (
        userDataRef.current.email &&
        CONFIG.emailjs.serviceId // Simply check if serviceId exists
      ) {
        const user = userDataRef.current;
        const lang = currentLangRef.current;
        const history = chatHistoryRef.current;

        let fullTranscript = '';

        if (history.length > 0) {
          // Generate HTML for Chat Bubbles
          fullTranscript = history
            .map(msg => {
              const isUser = msg.sender === 'user';
              const align = isUser ? 'right' : 'left';
              const bgColor = isUser ? '#224570' : '#f0f2f5';
              const textColor = isUser ? '#ffffff' : '#111b21';
              const radius = isUser ? '8px 8px 0 8px' : '0 8px 8px 8px';
              const senderName = isUser ? user.name || 'User' : translations[lang].supportName;

              return `
                <div style="width: 100%; overflow: hidden; margin-bottom: 12px; font-family: 'Segoe UI', sans-serif;">
                  <div style="float: ${align}; max-width: 80%; background-color: ${bgColor}; color: ${textColor}; padding: 12px 14px; border-radius: ${radius}; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; opacity: 0.9;">${senderName}</div>
                    <div style="font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${msg.text}</div>
                    <div style="font-size: 10px; margin-top: 6px; text-align: right; opacity: 0.8;">${msg.time}</div>
                  </div>
                  <div style="clear: both;"></div>
                </div>
              `;
            })
            .join('');
        } else {
          // Drop-off case: Form filled but no messages
          fullTranscript = `
              <div style="width: 100%; text-align: center; margin: 20px 0; font-family: 'Segoe UI', sans-serif;">
                <p style="color: #666; font-size: 14px; font-style: italic;">[System]: User submitted details but did not send any message (Drop-off Lead caused by Page Close).</p>
              </div>
            `;
        }

        // Add footer
        fullTranscript += `
            <div style="width: 100%; text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #e0e0e0;">
              <span style="background-color: #f5f5f5; padding: 4px 10px; border-radius: 12px; font-size: 11px; color: #888;">
                System: Chat session ended (Page Closed) at ${new Date().toLocaleTimeString()}
              </span>
            </div>
          `;

        const data = {
          service_id: CONFIG.emailjs.serviceId,
          template_id: CONFIG.emailjs.templateId,
          user_id: CONFIG.emailjs.publicKey,
          template_params: {
            user_name: user.name,
            user_email: user.email,
            user_phone: user.phone,
            chat_transcript: fullTranscript,
            to_email: 'fahmi.lifeaid@gmail.com'
          }
        };

        // Use fetch with keepalive: true to ensure request completes after unload
        fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          keepalive: true,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const sendTranscriptEmail = async (data?: UserData) => {
    const user = data || userData;
    if (!user.email) return;

    // Calculate full transcript
    // Generate HTML for Chat Bubbles
    let fullTranscript = chatHistoryRef.current
      .map(msg => {
        const isUser = msg.sender === 'user';
        const align = isUser ? 'right' : 'left';
        const bgColor = isUser ? '#224570' : '#f0f2f5';
        const textColor = isUser ? '#ffffff' : '#111b21';
        const radius = isUser ? '8px 8px 0 8px' : '0 8px 8px 8px';
        const senderName = isUser ? user.name || 'User' : translations[currentLang].supportName;

        return `
          <div style="width: 100%; overflow: hidden; margin-bottom: 12px; font-family: 'Segoe UI', sans-serif;">
            <div style="float: ${align}; max-width: 80%; background-color: ${bgColor}; color: ${textColor}; padding: 12px 14px; border-radius: ${radius}; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; opacity: 0.9;">${senderName}</div>
              <div style="font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${msg.text}</div>
              <div style="font-size: 10px; margin-top: 6px; text-align: right; opacity: 0.8;">${msg.time}</div>
            </div>
            <div style="clear: both;"></div>
          </div>
        `;
      })
      .join('');

    // Add final message
    fullTranscript += `
      <div style="width: 100%; text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #e0e0e0;">
        <span style="background-color: #f5f5f5; padding: 4px 10px; border-radius: 12px; font-size: 11px; color: #888;">
          System: Chat session ended at ${getCurrentTime()}
        </span>
      </div>
    `;

    // --- PLAIN TEXT LOG GENERATION ---
    // Generate a simple text version for backup/copy-paste
    const plainTextLog = chatHistoryRef.current
      .map(msg => `[${msg.time}] ${msg.sender === 'user' ? (user.name || 'User') : 'Support'}: ${msg.text}`)
      .join('\n');

    fullTranscript += `
      <!-- PLAIN TEXT LOG SECTION -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
        <h3 style="font-size: 14px; color: #444; margin-bottom: 10px; font-family: monospace;">📋 Raw Text Log (For Backup)</h3>
        <pre style="background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 6px; font-size: 12px; font-family: 'Consolas', 'Courier New', monospace; white-space: pre-wrap; color: #333; line-height: 1.5;">${plainTextLog}</pre>
      </div>
    `;

    const templateParams = {
      user_name: user.name,
      user_email: user.email,
      user_phone: user.phone,
      chat_transcript: fullTranscript, // This HTML will be injected
      to_email: 'fahmi.lifeaid@gmail.com'
    };

    try {
      // Only attempt to send if credentials are not placeholders
      if (CONFIG.emailjs.serviceId) {
        await emailjs.send(
          CONFIG.emailjs.serviceId,
          CONFIG.emailjs.templateId,
          templateParams,
          CONFIG.emailjs.publicKey
        );
        console.log('Chat transcript sent to email');
      } else {
        console.log('EmailJS credentials missing, skipping email send. Data:', templateParams);
      }
    } catch (error) {
      console.error('Failed to send chat transcript:', error);
    }

  };

  const sendLeadCaptureEmail = async (data: UserData, isDropOff: boolean = false) => {
    if (!data.email) return;

    const messageContent = isDropOff
      ? `[System]: User submitted details but did not send a message within 3 minutes (Drop-off Lead).`
      : `[System]: New Chat Session Started. User has filled the form and entered the chat room.`;

    const titleContent = isDropOff ? 'Drop-off Lead Alert' : 'New Chat Notification';

    const templateParams = {
      user_name: data.name,
      user_email: data.email,
      user_phone: data.phone,
      chat_transcript: `
        <div style="width: 100%; text-align: center; margin: 20px 0; font-family: 'Segoe UI', sans-serif;">
            <p style="color: #666; font-size: 14px; font-style: italic;">${messageContent}</p>
        </div>
        <div style="width: 100%; text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #e0e0e0;">
            <span style="background-color: #f5f5f5; padding: 4px 10px; border-radius: 12px; font-size: 11px; color: #888;">
              System: ${titleContent} triggered at ${new Date().toLocaleTimeString()}
            </span>
        </div>
      `,
      to_email: 'fahmi.lifeaid@gmail.com'
    };

    try {
      if (CONFIG.emailjs.serviceId) {
        await emailjs.send(
          CONFIG.emailjs.serviceId,
          CONFIG.emailjs.templateId,
          templateParams,
          CONFIG.emailjs.publicKey
        );
        console.log(`Lead capture email sent (${isDropOff ? 'Drop-off' : 'Immediate'})`);
      }
    } catch (error) {
      console.error('Failed to send lead capture email:', error);
    }
  };

  // sendInitialEmail removed

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Logic changed: Only reset to choice if NO active session and opening
    // If we have sessionId, we want to Resume what they were doing
    if (!isOpen && !sessionId) {
      setChatMode('choice');
    }
  };

  const handleModeSelect = (mode: 'whatsapp' | 'website') => {
    if (mode === 'website') {
      setChatMode('form');
    } else {
      setChatMode(mode);
    }
  };

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
    if (validateForm()) {
      setChatMode('website');

      // Generate new session ID
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);

      // Initialize email timer reference & last message time
      lastEmailSentTimeRef.current = Date.now();
      lastMessageTimeRef.current = Date.now();

      // SAVE INITIAL ENTRY TO SUPABASE (so it appears in Admin Chat History)
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
        if (error) console.error('Supabase initial save error:', error);
        else console.log('Initial form entry saved to Supabase');
      } catch (err) {
        console.error('Failed to save initial entry:', err);
      }

      // SEND IMMEDIATE EMAIL (New Chat Notification)
      console.log('Sending immediate new chat notification...');
      sendLeadCaptureEmail(userData, false); // false = immediate notification

      // Start Lead Capture Timer (3 minutes) as backup for "Drop-off"
      if (leadCaptureTimeoutRef.current) clearTimeout(leadCaptureTimeoutRef.current);
      leadCaptureTimeoutRef.current = setTimeout(() => {
        // Only send drop-off email if NO messages have been sent yet (history empty)
        if (chatHistoryRef.current.length === 0) {
          console.log('No activity for 3 mins, sending drop-off alert...');
          sendLeadCaptureEmail(userData, true); // true = isDropOff
        }
      }, 3 * 60 * 1000);
    }
  };

  const handleInputChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBackToChoice = () => {
    if (chatMode === 'form') {
      setChatMode('choice');
    } else if (chatMode === 'website') {
      setChatMode('choice');
      setMessage('');
      setChatHistory([]);
    } else {
      setChatMode('choice');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const getCurrentTime = () => {
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

  // Format response text from n8n for display
  const formatResponseText = (text: string): string => {
    if (!text) return '';

    // Remove excessive newlines
    let formatted = text.replace(/\n{3,}/g, '\n\n');

    // Store replaced links to avoid double-linking
    const links: string[] = [];
    // Use hyphens to avoid conflict with italic regex (underscores)
    const placeholder = (index: number) => `{{{LINK-REF-${index}}}}`;

    // 0. Handle Markdown links [label](url) first
    formatted = formatted.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      (_, label, url) => {
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">${label}</a>`;
        links.push(linkHtml);
        return placeholder(links.length - 1);
      }
    );

    // 1. Convert markdown-style formatting to HTML (Bold, Italic)
    formatted = formatted
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>');

    // 2. Auto-link bare URLs (http/https/www)
    // Exclude quotes from the url match to be safe
    formatted = formatted.replace(
      /((https?:\/\/|www\.)[^\s<"']+)/g,
      (match) => {
        // Strip trailing punctuation
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

    // 3. Restore placeholders
    links.forEach((link, index) => {
      formatted = formatted.replace(placeholder(index), link);
    });

    // 4. Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted.trim();
  };

  // Send message to n8n webhook
  const sendToN8n = async (messageText: string) => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localTime = new Date(now.getTime() - offset);

      const payload = {
        chatInput: messageText,
        message: messageText,
        timestamp: localTime.toISOString().slice(0, -1),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: currentLang,
        source: 'website-chat',
        userAgent: navigator.userAgent,
        url: window.location.href,
        userData: userData,
        sessionId: sessionId // Send the session ID to n8n
      };

      console.log('Sending to n8n:', payload);

      const response = await fetch(CONFIG.n8nWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('n8n response status:', response.status);

      const responseText = await response.text();
      console.log('n8n response body:', responseText);

      if (!response.ok) {
        throw new Error(`n8n returned ${response.status}: ${responseText}`);
      }

      try {
        return JSON.parse(responseText);
      } catch {
        return { success: true, message: responseText };
      }
    } catch (error) {
      console.error('Error sending to n8n:', error);
      throw error;
    }
  };

  // Save message to Supabase for Admin Dashboard
  const saveMessageToSupabase = async (
    role: 'user' | 'assistant',
    content: string
  ) => {
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
        console.error('Supabase save error:', error);
      } else {
        console.log(`Message saved to Supabase: ${role}`);
      }
    } catch (err) {
      console.error('Failed to save message to Supabase:', err);
    }
  };

  // Handle Inactivity Timer (using Interval + Ref for robustness)
  // Check every 1 minute
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    // Only run if website chat is active and has messages (started)
    if (chatMode === 'website' && chatHistory.length > 0) {
      // Set interval to check every 30 seconds
      interval = setInterval(() => {
        const now = Date.now();
        // Check for inactivity based on last message/activity time
        // Or better: use a dedicated lastActivityTimeRef.
        // Let's rely on lastMessageTimeRef which we update on msg. But wait, lastMessageTimeRef logic might need update.
        // Actually earlier code used lastEmailSentTimeRef as "start time" for timer? 
        // No, let's use a specific ref for this logic.

        // We need to track LAST ACTIVITY time (user or support message)
        const lastActivity = lastMessageTimeRef.current || Date.now();
        const diff = now - lastActivity;

        // 5 Minutes Warning (300000 ms)
        // Check if we haven't warned yet AND time is between 5 and 7 mins
        if (diff >= 5 * 60 * 1000 && diff < 7 * 60 * 1000) {
          // We need a ref to track if warning was sent to avoid dups
          if (!warningTimeoutRef.current) { // using this ref as a boolean flag essentially
            const warningMsg = {
              text: translations[currentLang].chatClosingWarning,
              sender: 'support' as const,
              time: getCurrentTime()
            };
            setChatHistory(prev => [...prev, warningMsg]);
            if (!isOpenRef.current) {
              setUnreadCount(prev => prev + 1);
            }
            // Mark warned
            warningTimeoutRef.current = setTimeout(() => { }, 0); // just setting it to not-null
          }
        }

        // 7 Minutes End (420000 ms)
        if (diff >= 7 * 60 * 1000) {
          console.log('Inactivity timeout reached (7 mins). Ending session...');
          clearInterval(interval);

          sendTranscriptEmail(userData);

          const timeoutMsg = {
            text: currentLang === 'id' ? 'Sesi berakhir karena tidak ada aktivitas.' : 'Session ended due to inactivity.',
            sender: 'support' as const,
            time: getCurrentTime()
          };
          setChatHistory(prev => [...prev, timeoutMsg]);

          // Clear session
          sessionStorage.removeItem('lifeaid_chat_session_id');
          sessionStorage.removeItem('lifeaid_chat_user_data');
          sessionStorage.removeItem('lifeaid_chat_history');
          sessionStorage.removeItem('lifeaid_chat_mode');

          setTimeout(() => {
            setChatMode('choice');
            setSessionId('');
            setChatHistory([]);
          }, 3000);
        }
      }, 30000); // Check every 30s
    }

    return () => {
      if (interval) clearInterval(interval);
      // Note: we DON'T clear warning flag here because re-renders shouldn't reset our "warned" state unless chat ended
      // But chatMode/chatHistory changes might reset this effect.
      // If user sends message, chatHistory changes -> effect re-runs.
      // We WANT to reset warning flag if user sends message.
    };
  }, [chatHistory, chatMode, currentLang]);

  // NOTE: We need to reset warningTimeoutRef (flag) when user sends message.
  // We can do this in sendMessage.

  const handleEndChat = () => {
    if (window.confirm(translations[currentLang].confirmEndChat)) {
      sendTranscriptEmail();
      // Clear interval logic handling handled by unmount/state change

      const endMsg = {
        text: translations[currentLang].chatEnded,
        sender: 'support' as const,
        time: getCurrentTime()
      };
      setChatHistory(prev => [...prev, endMsg]);

      // Clear session data
      sessionStorage.removeItem('lifeaid_chat_session_id');
      sessionStorage.removeItem('lifeaid_chat_user_data');
      sessionStorage.removeItem('lifeaid_chat_history');
      sessionStorage.removeItem('lifeaid_chat_mode');

      setTimeout(() => {
        setChatMode('choice');
        setSessionId('');
        setChatHistory([]); // Clear visual history after a moment
        setIsOpen(false);
      }, 2000);
    }
  };



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
    } else if (chatMode === 'website') {
      // Add user message to chat history
      const userMsg = {
        text: msg,
        sender: 'user' as const,
        time: getCurrentTime()
      };

      // Update ref immediately to ensure it's up to date
      const updatedHistoryWithUser = [...chatHistoryRef.current, userMsg];
      chatHistoryRef.current = updatedHistoryWithUser;
      setChatHistory(updatedHistoryWithUser);

      // Save user message to Supabase for Admin Dashboard
      saveMessageToSupabase('user', msg);

      // Update last message time
      lastMessageTimeRef.current = Date.now();
      warningTimeoutRef.current = null; // Reset warning flag on user activity

      // Clear lead capture timer if exists (user is active)
      if (leadCaptureTimeoutRef.current) {
        clearTimeout(leadCaptureTimeoutRef.current);
        leadCaptureTimeoutRef.current = null;
      }

      setMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }

      // Send to n8n
      setIsSending(true);
      try {
        const result = await sendToN8n(msg);
        console.log('Message sent successfully:', result);

        // Add response from n8n (with slight delay for natural feel)
        setTimeout(async () => {
          // Extract the message from n8n response
          let responseText = '';

          if (result && typeof result === 'object') {
            responseText = result.output || result.message || result.reply || result.text || '';
          } else if (typeof result === 'string') {
            responseText = result;
          }

          // Fallback to default message if no response from n8n
          if (!responseText || responseText.trim() === '') {
            responseText = currentLang === 'id'
              ? 'Terima kasih! Pesan Anda telah kami terima. Tim kami akan segera merespons.'
              : 'Thank you! Your message has been received. Our team will respond shortly.';
          }

          // Format the response text
          const formattedText = formatResponseText(responseText);

          const supportMsg = {
            text: formattedText,
            sender: 'support' as const,
            time: getCurrentTime()
          };

          // Update ref immediately to ensure email has the AI response
          const updatedHistoryWithSupport = [...chatHistoryRef.current, supportMsg];
          chatHistoryRef.current = updatedHistoryWithSupport;
          setChatHistory(updatedHistoryWithSupport);

          // Save AI response to Supabase for Admin Dashboard
          saveMessageToSupabase('assistant', responseText);

          // Increment unread count if chat is closed
          if (!isOpenRef.current) {
            setUnreadCount(prev => prev + 1);
          }

          // Update last message time for support response too
          lastMessageTimeRef.current = Date.now();

          setIsSending(false);

          // Timer will naturally reset due to chatHistory change in useEffect
        }, 800);
      } catch (error) {
        console.error('Failed to send message:', error);

        const errorMsg = {
          text: currentLang === 'id'
            ? 'Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi atau hubungi kami via WhatsApp.'
            : 'Sorry, there was an error sending your message. Please try again or contact us via WhatsApp.',
          sender: 'support' as const,
          time: getCurrentTime()
        };

        const updatedHistoryWithError = [...chatHistoryRef.current, errorMsg];
        chatHistoryRef.current = updatedHistoryWithError;
        setChatHistory(updatedHistoryWithError);

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
                <span className="wa-status-text">{t.statusText}</span>
              </div>
            </div>
            <div className="wa-header-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {chatMode === 'website' && (
                <button
                  className="wa-end-chat-btn"
                  onClick={handleEndChat}
                  title={t.endChat}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle' }}>
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                  </svg>
                </button>
              )}
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

                {/* Website chat history */}
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

                {/* Sending indicator */}
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