import React, { useState, useEffect, useRef } from 'react';
import './styles/WhatsAppBubbleChat.css';
import emailjs from '@emailjs/browser';

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
    emailInvalid: 'Format email tidak valid'
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
    emailInvalid: 'Invalid email format'
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // EmailJS Refs
  const lastMessageTimeRef = useRef<number>(0);
  const lastEmailSentTimeRef = useRef<number>(0);
  const chatHistoryRef = useRef<Array<{ text: string, sender: 'user' | 'support', time: string }>>([]);
  const userDataRef = useRef<UserData>({ name: '', email: '', phone: '' });
  const currentLangRef = useRef<Language>(currentLang);

  // Keep refs updated
  useEffect(() => {
    chatHistoryRef.current = chatHistory;
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

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

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
  // Emails are now sent immediately after AI response.

  const sendTranscriptEmail = async () => {
    const user = userDataRef.current;
    const history = chatHistoryRef.current;
    const lang = currentLangRef.current;

    if (!user.email || history.length === 0) return;

    // Get greeting message
    const greetingHtml = `
      <div class="message-wrapper support">
        <div class="bubble support">
          <div class="sender-name">Lifeaid Smart Assistant</div>
          ${translations[lang].greeting}
          <span class="time">${translations[lang].justNow}</span>
        </div>
      </div>
    `;

    // Format chat transcript as HTML for the email template
    const historyHtml = history.map(msg => {
      const type = msg.sender === 'user' ? 'user' : 'support';
      const name = msg.sender === 'user' ? user.name : 'Lifeaid Smart Assistant';
      return `
        <div class="message-wrapper ${type}">
          <div class="bubble ${type}">
            <div class="sender-name">${name}</div>
            ${msg.text}
            <span class="time">${msg.time}</span>
          </div>
        </div>
      `;
    }).join('');

    const fullTranscript = greetingHtml + historyHtml;

    const templateParams = {
      user_name: user.name,
      user_email: user.email,
      user_phone: user.phone,
      chat_transcript: fullTranscript, // This will be injected into {{{chat_transcript}}}
      to_email: 'YOUR_EMAIL_HERE'
    };

    try {
      // Only attempt to send if credentials are not placeholders
      if (CONFIG.emailjs.serviceId !== 'YOUR_SERVICE_ID') {
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

  const sendInitialEmail = async (data: UserData) => {
    if (!data.email) return;

    const templateParams = {
      user_name: data.name,
      user_email: data.email,
      user_phone: data.phone,
      chat_transcript: "User has started a new chat session.",
      to_email: 'YOUR_EMAIL_HERE'
    };

    try {
      // Only attempt to send if credentials are not placeholders
      if (CONFIG.emailjs.serviceId !== 'YOUR_SERVICE_ID') {
        await emailjs.send(
          CONFIG.emailjs.serviceId,
          CONFIG.emailjs.templateId,
          templateParams,
          CONFIG.emailjs.publicKey
        );
        console.log('Initial user data sent to email');
      } else {
        console.log('EmailJS credentials missing, skipping initial email. Data:', templateParams);
      }
    } catch (error) {
      console.error('Failed to send initial user data:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setChatMode('website');
      // Initialize email timer reference
      lastEmailSentTimeRef.current = Date.now();
      // Send initial email
      sendInitialEmail(userData);
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

    // Convert markdown-style formatting to HTML
    formatted = formatted
      // Bold: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>');

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
        userData: userData
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

      // Update last message time
      lastMessageTimeRef.current = Date.now();

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

          // Update last message time for support response too
          lastMessageTimeRef.current = Date.now();

          setIsSending(false);

          // Send email transcript immediately after support response
          // This will now definitely include the supportMsg because we updated the ref above
          await sendTranscriptEmail();
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
                <img
                  src="./Logo-trans.webp"
                  alt="Support"
                />
                <span className="wa-status-dot"></span>
              </div>
              <div className="wa-info">
                <span className="wa-name">{t.supportName}</span>
                <span className="wa-status-text">{t.statusText}</span>
              </div>
            </div>
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
                  onClick={() => handleModeSelect('whatsapp')}
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
            <span className="wa-notification-badge">1</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default WhatsAppBubbleChat;