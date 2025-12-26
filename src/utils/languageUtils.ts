export type Language = 'id' | 'en';

// Detect country based on timezone and IP
export const detectCountry = async (): Promise<Language> => {
    // First, check if user has saved preference
    const savedLang = localStorage.getItem('preferred-language') as Language;
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
        return savedLang;
    }

    // Check timezone - Indonesian timezones
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const indonesianTimezones = [
        'Asia/Jakarta',
        'Asia/Makassar',
        'Asia/Jayapura',
        'Asia/Pontianak'
    ];

    if (indonesianTimezones.includes(timezone)) {
        return 'id';
    }

    // Check browser language as fallback
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('id')) {
        return 'id';
    }

    // Try IP-based geolocation (optional, requires API)
    try {
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.country_code === 'ID') {
                return 'id';
            }
        }
    } catch {
        console.log('Geolocation detection failed, using default');
    }

    // Default to English
    return 'en';
};

// Detect language based on browser/location (Synchronous version for initial state)
export const detectLanguage = (): Language => {
    if (typeof window === 'undefined') return 'id';

    const savedLang = localStorage.getItem('preferred-language') as Language;
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
        return savedLang;
    }

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('id')) {
        return 'id';
    }

    return 'en';
};
