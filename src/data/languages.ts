// Language options for the application
// Each language has a code (for API calls) and a display name

export interface Language {
  code: string;
  name: string;
}

export const languages: Language[] = [
  { code: "en-US", name: "English" },
  { code: "es-ES", name: "Spanish" },
  { code: "pt-BR", name: "Portuguese" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "it-IT", name: "Italian" },
  { code: "nl-NL", name: "Dutch" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "ru-RU", name: "Russian" },
  { code: "ar-SA", name: "Arabic" },
  { code: "hi-IN", name: "Hindi" },
  { code: "tr-TR", name: "Turkish" },
  { code: "pl-PL", name: "Polish" },
  { code: "sv-SE", name: "Swedish" },
  { code: "da-DK", name: "Danish" },
  { code: "fi-FI", name: "Finnish" },
  { code: "no-NO", name: "Norwegian" },
  { code: "cs-CZ", name: "Czech" },
  { code: "hu-HU", name: "Hungarian" },
  { code: "el-GR", name: "Greek" },
  { code: "he-IL", name: "Hebrew" },
  { code: "th-TH", name: "Thai" },
  { code: "vi-VN", name: "Vietnamese" }
];

// Default languages based on user preference
export const defaultSourceLanguage = languages.find(lang => lang.code === "en-US") || languages[0];
export const defaultTargetLanguage = languages.find(lang => lang.code === "es-ES") || languages[1];
