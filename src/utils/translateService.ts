/**
 * Translation Service using Google Translate (GTX) & MyMemory API
 * Improved for CORS compatibility and stability
 */

const GOOGLE_API = 'https://translate.googleapis.com/translate_a/single';
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

interface TranslateResponse {
    translatedText: string;
}

/**
 * Translate using Google (Unofficial GTX Client)
 */
const translateWithGoogle = async (text: string, from: string, to: string): Promise<string> => {
    // Determine source language (auto if not specified)
    const sl = from === 'id' ? 'id' : 'en';
    const tl = to === 'id' ? 'id' : 'en';

    const url = `${GOOGLE_API}?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Google Translate failed');

    const data = await response.json();
    // Google returns nested arrays: [[["Translated text", "Source text", ...], ...], ...]
    if (data && data[0]) {
        return data[0].map((item: any) => item[0]).join('');
    }
    throw new Error('Invalid Google response');
};

/**
 * Translate using MyMemory
 */
const translateWithMyMemory = async (text: string, from: string, to: string): Promise<string> => {
    const langPair = `${from}|${to}`;
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('MyMemory failed');

    const data = await response.json();
    if (data && data.responseData) {
        return data.responseData.translatedText;
    }
    throw new Error('Invalid MyMemory response');
};


/**
 * Translate a single text with fallback strategy
 */
export const translateText = async (
    text: string,
    from: 'id' | 'en',
    to: 'id' | 'en'
): Promise<string> => {
    if (!text.trim()) return '';
    if (from === to) return text;

    // Try Google first (Fastest & Best Quality)
    try {
        return await translateWithGoogle(text, from, to);
    } catch (err) {
        console.warn('Google Translate failed, trying MyMemory...', err);
    }

    // Fallback to MyMemory
    try {
        return await translateWithMyMemory(text, from, to);
    } catch (err) {
        console.error('All translation services failed', err);
        throw err;
    }
};

/**
 * Translate multiple texts at once
 */
export const translateMultiple = async (
    texts: Record<string, string>,
    from: 'id' | 'en',
    to: 'id' | 'en'
): Promise<Record<string, string>> => {
    const results: Record<string, string> = {};
    const entries = Object.entries(texts);

    // Sequential processing to avoid rate limiting
    // Google GTX is quite robust but let's be polite
    for (const [key, value] of entries) {
        if (!value) {
            results[key] = value; // Keep empty/null values
            continue;
        }

        try {
            results[key] = await translateText(value, from, to);
            // Tiny delay to be polite to the server
            await new Promise(resolve => setTimeout(resolve, 50));
        } catch {
            results[key] = value; // Fallback to original text
        }
    }

    return results;
};

/**
 * Check availability
 */
export const checkTranslationAvailable = async (): Promise<boolean> => {
    try {
        await translateText('test', 'en', 'id');
        return true;
    } catch {
        return false;
    }
};
