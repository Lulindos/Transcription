import React, { useState } from "react";
import AudioVisualizer from "./AudioVisualizer";
import LanguageSelector from "./LanguageSelector";
import TextDisplayArea from "./TextDisplayArea";
import VoiceSynthesisPanel from "./VoiceSynthesisPanel";
import ExportPanel from "./ExportPanel";
import AIProviderSelector from "./AIProviderSelector";

interface TranscriptionPanelProps {
  isRecording?: boolean;
  originalText?: string;
  translatedText?: string;
  originalLanguage?: string;
  targetLanguage?: string;
  recordingDuration?: number;
  onRecordingStart?: () => void;
  onRecordingStop?: (audioBlob?: Blob) => void;
  onLanguageChange?: (language: {
    code: string;
    name: string;
    flag: string;
  }) => void;
  onExport?: (format: string) => void;
  onShare?: () => void;
}

const TranscriptionPanel = ({
  isRecording = false,
  originalText = "This is a sample transcription. Start speaking to see your words appear here in real-time.",
  translatedText = "Esto es una transcripción de muestra. Comience a hablar para ver sus palabras aparecer aquí en tiempo real.",
  originalLanguage = "English",
  targetLanguage = "Spanish",
  recordingDuration = 0,
  onRecordingStart = () => {},
  onRecordingStop = () => {},
  onLanguageChange = () => {},
  onExport = () => {},
  onShare = () => {},
}: TranscriptionPanelProps) => {
  const [voiceSynthesisEnabled, setVoiceSynthesisEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("system-default");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [selectedAIProvider, setSelectedAIProvider] = useState(
    localStorage.getItem("aiProvider") || "openai",
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  // Initialize source language based on originalLanguage prop
  const [sourceLanguage, setSourceLanguage] = useState(() => {
    if (originalLanguage === "English")
      return { code: "en", name: "English", flag: "🇺🇸" };
    if (originalLanguage === "Spanish")
      return { code: "es", name: "Spanish", flag: "🇪🇸" };
    if (originalLanguage === "Portuguese")
      return { code: "pt", name: "Portuguese", flag: "🇵🇹" };
    if (originalLanguage === "French")
      return { code: "fr", name: "French", flag: "🇫🇷" };
    if (originalLanguage === "German")
      return { code: "de", name: "German", flag: "🇩🇪" };
    return { code: "en", name: originalLanguage, flag: "🇺🇸" };
  });

  // Initialize target language based on targetLanguage prop
  const [targetLang, setTargetLang] = useState(() => {
    if (targetLanguage === "English")
      return { code: "en", name: "English", flag: "🇺🇸" };
    if (targetLanguage === "Spanish")
      return { code: "es", name: "Spanish", flag: "🇪🇸" };
    if (targetLanguage === "Portuguese")
      return { code: "pt", name: "Portuguese", flag: "🇵🇹" };
    if (targetLanguage === "French")
      return { code: "fr", name: "French", flag: "🇫🇷" };
    if (targetLanguage === "German")
      return { code: "de", name: "German", flag: "🇩🇪" };
    return { code: "es", name: targetLanguage, flag: "🇪🇸" };
  });

  const handlePlayOriginal = () => {
    setIsPlaying(!isPlaying);
    // Use the Web Speech API to read the original text
    const utterance = new SpeechSynthesisUtterance(originalText);
    utterance.lang =
      sourceLanguage.code +
      "-" +
      (sourceLanguage.code === "en" ? "US" : sourceLanguage.code.toUpperCase());
    utterance.volume = volume / 100;
    window.speechSynthesis.speak(utterance);
    console.log("Playing original audio");
  };

  const handlePlayTranslated = () => {
    setIsPlaying(!isPlaying);
    // Use the Web Speech API to read the translated text
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang =
      targetLang.code +
      "-" +
      (targetLang.code === "en" ? "US" : targetLang.code.toUpperCase());
    utterance.volume = volume / 100;
    window.speechSynthesis.speak(utterance);
    console.log("Playing translated audio");
  };

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalText);
    console.log("Original text copied to clipboard");
  };

  const handleCopyTranslated = () => {
    navigator.clipboard.writeText(translatedText);
    console.log("Translated text copied to clipboard");
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceSynthesisEnabled(enabled);
    console.log(`Voice synthesis ${enabled ? "enabled" : "disabled"}`);
  };

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    console.log(`Voice changed to ${voice}`);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log(`${isPlaying ? "Paused" : "Playing"} voice synthesis`);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    console.log(`Volume changed to ${newVolume}`);
  };

  return (
    <div className="w-full h-full bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col gap-6">
      <div className="flex flex-col items-center w-full">
        <AudioVisualizer
          isRecording={isRecording}
          onRecordingStart={onRecordingStart}
          onRecordingStop={onRecordingStop}
          className="w-full max-w-5xl shadow-lg"
          translatedText={translatedText}
          showTranslationWave={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="md:col-span-2">
          <TextDisplayArea
            originalText={originalText}
            translatedText={translatedText}
            originalLanguage={sourceLanguage.name}
            targetLanguage={targetLang.name}
            onPlayOriginal={handlePlayOriginal}
            onPlayTranslated={handlePlayTranslated}
            onCopyOriginal={handleCopyOriginal}
            onCopyTranslated={handleCopyTranslated}
          />
        </div>

        <div className="flex flex-col gap-6">
          <AIProviderSelector
            selectedProvider={selectedAIProvider}
            apiKey={apiKey}
            onProviderChange={setSelectedAIProvider}
            onApiKeyChange={setApiKey}
            className="mb-4"
          />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">
                Idioma Original
              </h3>
              <LanguageSelector
                onLanguageChange={(lang) => {
                  setSourceLanguage(lang);
                  localStorage.setItem("sourceLanguage", JSON.stringify(lang));
                }}
                selectedLanguage={sourceLanguage}
                className="w-full mb-4"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">
                Idioma de Tradução
              </h3>
              <LanguageSelector
                onLanguageChange={(lang) => {
                  setTargetLang(lang);
                  onLanguageChange(lang);
                  localStorage.setItem("targetLanguage", JSON.stringify(lang));
                }}
                selectedLanguage={targetLang}
                className="w-full"
              />
            </div>
          </div>

          <VoiceSynthesisPanel
            isEnabled={voiceSynthesisEnabled}
            selectedVoice={selectedVoice}
            isPlaying={isPlaying}
            volume={volume}
            onToggle={handleVoiceToggle}
            onVoiceChange={handleVoiceChange}
            onPlayPause={handlePlayPause}
            onVolumeChange={handleVolumeChange}
          />

          <ExportPanel
            transcriptionText={originalText}
            translationText={translatedText}
            sourceLanguage={originalLanguage}
            targetLanguage={targetLanguage}
            recordingDuration={recordingDuration}
            onExport={onExport}
            onShare={onShare}
          />
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPanel;
