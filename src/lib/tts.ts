/**
 * Simple Text-to-Speech utility using the browser's native Web Speech API.
 * No external dependencies or API keys required.
 */

// Queue to prevent overlapping speech
const speechQueue: string[] = [];
let isSpeaking = false;

export const tts = {
    /**
     * Speak a message using the default system voice
     */
    speak: (text: string, volume: number = 1.0) => {
        if (!window.speechSynthesis) {
            console.warn("TTS not supported in this browser");
            return;
        }

        // Add to queue
        speechQueue.push(text);
        processQueue(volume);
    },

    /**
     * Cancel all currently speaking and queued messages
     */
    cancel: () => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        speechQueue.length = 0;
        isSpeaking = false;
    }
};

function processQueue(volume: number) {
    if (isSpeaking || speechQueue.length === 0) return;

    isSpeaking = true;
    const text = speechQueue.shift();

    if (!text) {
        isSpeaking = false;
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to select a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) ||
        voices.find(v => v.name.includes("Microsoft Zira")) ||
        voices.find(v => v.lang.startsWith("en"));

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
        isSpeaking = false;
        // Small delay between messages
        setTimeout(() => processQueue(volume), 200);
    };

    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        isSpeaking = false;
        processQueue(volume);
    };

    window.speechSynthesis.speak(utterance);
}

// Initialize voices (sometimes needed for Chrome)
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
}
