// Utility functions for language handling

// Convert language name to language code
export function languageNameToCode(name: string): string {
  const languageMap: Record<string, string> = {
    English: "en",
    Spanish: "es",
    Portuguese: "pt",
    French: "fr",
    German: "de",
    Italian: "it",
    Russian: "ru",
    Chinese: "zh",
    Japanese: "ja",
    Korean: "ko",
  };

  return languageMap[name] || name.substring(0, 2).toLowerCase();
}

// Convert language name to speech recognition language code
export function languageNameToSpeechCode(name: string): string {
  const speechCodeMap: Record<string, string> = {
    English: "en-US",
    Spanish: "es-ES",
    Portuguese: "pt-BR",
    French: "fr-FR",
    German: "de-DE",
    Italian: "it-IT",
    Russian: "ru-RU",
    Chinese: "zh-CN",
    Japanese: "ja-JP",
    Korean: "ko-KR",
  };

  return (
    speechCodeMap[name] ||
    languageNameToCode(name) + "-" + languageNameToCode(name).toUpperCase()
  );
}

// Convert language code to language name
export function languageCodeToName(code: string): string {
  const languageMap: Record<string, string> = {
    en: "English",
    es: "Spanish",
    pt: "Portuguese",
    fr: "French",
    de: "German",
    it: "Italian",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
  };

  return languageMap[code] || code;
}

// Get speech synthesis language code
export function getSpeechSynthesisLanguageCode(languageName: string): string {
  const code = languageNameToCode(languageName);
  return code + "-" + (code === "en" ? "US" : code.toUpperCase());
}

// Extract the last sentence from text
export function extractLastSentence(text: string): string {
  if (!text || text.trim() === "") return "";

  // Split by common sentence endings
  const sentences = text.match(/[^.!?]+[.!?]+/g);

  if (sentences && sentences.length > 0) {
    return sentences[sentences.length - 1].trim();
  }

  // If no sentence endings found, return the whole text
  return text.trim();
}
