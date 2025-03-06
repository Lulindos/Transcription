import React, { useState, useEffect } from "react";
import Header from "./Header";
import TranscriptionPanel from "./TranscriptionPanel";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import DebugPanel from "./DebugPanel";
import speechRecognitionService from "../services/speechRecognition";
import translationService from "../services/translationService";
import audioProcessingService from "../services/audioProcessingService";
import storageService from "../services/storageService";
import exportService from "../services/exportService";

const Home = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [originalText, setOriginalText] = useState(
    "This is a sample transcription. Start speaking to see your words appear here in real-time.",
  );
  const [translatedText, setTranslatedText] = useState(
    "Esto es una transcripción de muestra. Comience a hablar para ver sus palabras aparecer aquí en tiempo real.",
  );
  const [originalLanguage, setOriginalLanguage] = useState("Portuguese");
  const [targetLanguage, setTargetLanguage] = useState("German");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(
    null,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState(75);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [saveInterval, setSaveInterval] = useState(5);
  const [currentTranscriptionId, setCurrentTranscriptionId] = useState<
    string | null
  >(null);
  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(false);

  // Debug event listener for test translation
  useEffect(() => {
    const handleTestTranslation = (event: CustomEvent) => {
      const testText = event.detail;
      console.log("Debug test translation:", testText);

      if (testText) {
        translationService.translate(
          {
            text: testText,
            sourceLanguage: "en",
            targetLanguage: targetLanguage.substring(0, 2).toLowerCase(),
          },
          (translatedText) => {
            console.log("Debug translation result:", translatedText);
            setOriginalText(testText);
            setTranslatedText(translatedText);
          },
          (error) => {
            console.error("Debug translation error:", error);
          },
          localStorage.getItem("apiKey") || "",
          localStorage.getItem("aiProvider") || "openai",
        );
      }
    };

    document.addEventListener(
      "debug-test-translation",
      handleTestTranslation as EventListener,
    );

    return () => {
      document.removeEventListener(
        "debug-test-translation",
        handleTestTranslation as EventListener,
      );
    };
  }, [targetLanguage]);

  // Load recent transcriptions and saved settings on mount
  useEffect(() => {
    const recentTranscriptions = storageService.getRecentTranscriptions();
    console.log("Loaded recent transcriptions:", recentTranscriptions);

    // Load saved API settings
    const savedApiKey = localStorage.getItem("apiKey");
    const savedProvider = localStorage.getItem("aiProvider");

    if (savedApiKey) {
      console.log("Loaded saved API key");
      translationService.setApiKey(savedApiKey);
    }

    if (savedProvider) {
      console.log("Loaded saved provider:", savedProvider);
    }

    // Set source and target language from localStorage if available
    const savedSourceLang = localStorage.getItem("sourceLanguage");
    if (savedSourceLang) {
      try {
        const langObj = JSON.parse(savedSourceLang);
        setOriginalLanguage(langObj.name);
      } catch (e) {
        console.error("Error parsing saved source language", e);
      }
    }

    const savedTargetLang = localStorage.getItem("targetLanguage");
    if (savedTargetLang) {
      try {
        const langObj = JSON.parse(savedTargetLang);
        setTargetLanguage(langObj.name);
      } catch (e) {
        console.error("Error parsing saved target language", e);
      }
    }
  }, []);

  // Timer for recording duration
  useEffect(() => {
    let interval: number | null = null;

    if (isRecording && recordingStartTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);
    } else if (!isRecording) {
      if (interval) window.clearInterval(interval);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRecording, recordingStartTime]);

  // Auto-save transcription at intervals
  useEffect(() => {
    let saveTimer: number | null = null;

    if (isRecording && autoSave && originalText.trim() !== "") {
      saveTimer = window.setInterval(
        () => {
          saveCurrentTranscription();
        },
        saveInterval * 60 * 1000,
      ); // Convert minutes to milliseconds
    }

    return () => {
      if (saveTimer) window.clearInterval(saveTimer);
    };
  }, [isRecording, autoSave, saveInterval, originalText]);

  // Apply audio processing settings
  useEffect(() => {
    audioProcessingService.setNoiseReduction(noiseReduction);
  }, [noiseReduction]);

  useEffect(() => {
    audioProcessingService.setMicSensitivity(micSensitivity);
  }, [micSensitivity]);

  const handleRecordingStart = () => {
    setIsRecording(true);
    setRecordingStartTime(Date.now());
    setOriginalText(""); // Clear existing text
    setTranslatedText("");
    setRecordingDuration(0);
    setCurrentTranscriptionId(null);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    console.log("Starting speech recognition...");
    console.log("Source language:", originalLanguage);
    console.log("Target language:", targetLanguage);

    // Set the correct language for speech recognition based on user selection
    const speechLangCode =
      originalLanguage === "English"
        ? "en-US"
        : originalLanguage === "Spanish"
          ? "es-ES"
          : originalLanguage === "Portuguese"
            ? "pt-BR"
            : originalLanguage === "French"
              ? "fr-FR"
              : originalLanguage === "German"
                ? "de-DE"
                : "en-US";

    console.log(`Setting speech recognition language to: ${speechLangCode}`);
    speechRecognitionService.setLanguage(speechLangCode);

    // Start the speech recognition service
    speechRecognitionService.start(
      (transcript, isFinal) => {
        console.log(
          "Speech recognition result:",
          transcript,
          "isFinal:",
          isFinal,
        );
        setOriginalText(transcript);

        // If auto-detect language is enabled, we would detect the language here
        if (autoDetectLanguage && isFinal) {
          // This would be an async call to detect language
          // For now, we'll assume English
          console.log("Auto-detecting language (mock): English");
        }

        // Translate the text only when the speech recognition indicates it's a final result
        if (transcript.trim() !== "" && isFinal) {
          console.log("Translating final transcript:", transcript);

          // Map language names to proper codes
          let sourceLangCode;
          let targetLangCode;

          if (originalLanguage === "English") sourceLangCode = "en";
          else if (originalLanguage === "Spanish") sourceLangCode = "es";
          else if (originalLanguage === "Portuguese") sourceLangCode = "pt";
          else if (originalLanguage === "French") sourceLangCode = "fr";
          else if (originalLanguage === "German") sourceLangCode = "de";
          else sourceLangCode = originalLanguage.substring(0, 2).toLowerCase();

          if (targetLanguage === "English") targetLangCode = "en";
          else if (targetLanguage === "Spanish") targetLangCode = "es";
          else if (targetLanguage === "Portuguese") targetLangCode = "pt";
          else if (targetLanguage === "French") targetLangCode = "fr";
          else if (targetLanguage === "German") targetLangCode = "de";
          else targetLangCode = targetLanguage.substring(0, 2).toLowerCase();

          console.log(
            `Translation request: ${sourceLangCode} -> ${targetLangCode}`,
          );

          translationService.translate(
            {
              text: transcript,
              sourceLanguage: sourceLangCode,
              targetLanguage: targetLangCode,
            },
            (translatedText) => {
              console.log("Translation received:", translatedText);
              setTranslatedText(translatedText);

              // Auto-speak the translated text
              if (translatedText && translatedText.trim() !== "") {
                try {
                  // Cancel any ongoing speech
                  window.speechSynthesis.cancel();

                  // Get the translated text without the prefix
                  let textToSpeak = translatedText;
                  const prefixes = [
                    "Traducido: ",
                    "Traduzido: ",
                    "Traduit: ",
                    "Übersetzt: ",
                    "Translated: ",
                  ];

                  for (const prefix of prefixes) {
                    if (textToSpeak.startsWith(prefix)) {
                      textToSpeak = textToSpeak.substring(prefix.length);
                      break;
                    }
                  }

                  // Split by sentence endings and get the last sentence
                  const sentences = textToSpeak.match(/[^.!?]+[.!?]+/g) || [
                    textToSpeak,
                  ];
                  const lastSentence = sentences[sentences.length - 1].trim();

                  console.log("Speaking translated text:", lastSentence);
                  console.log("Target language:", targetLanguage);

                  // Create speech utterance
                  const utterance = new SpeechSynthesisUtterance(lastSentence);

                  // Set the language code for speech synthesis
                  let langCode;
                  if (targetLanguage === "English") langCode = "en-US";
                  else if (targetLanguage === "Spanish") langCode = "es-ES";
                  else if (targetLanguage === "Portuguese") langCode = "pt-BR";
                  else if (targetLanguage === "French") langCode = "fr-FR";
                  else if (targetLanguage === "German") langCode = "de-DE";
                  else {
                    // Fallback to standard format if not a predefined language
                    const baseLangCode = targetLanguage
                      .substring(0, 2)
                      .toLowerCase();
                    langCode =
                      baseLangCode +
                      "-" +
                      (baseLangCode === "en"
                        ? "US"
                        : baseLangCode.toUpperCase());
                  }

                  utterance.lang = langCode;

                  console.log(
                    "Using language code for speech:",
                    utterance.lang,
                  );

                  // Speak the text
                  window.speechSynthesis.speak(utterance);
                } catch (error) {
                  console.error("Error in speech synthesis:", error);
                }
              }
            },
            (error) => {
              console.error("Translation error:", error);
            },
            localStorage.getItem("apiKey") || "",
            localStorage.getItem("aiProvider") || "openai",
          );
        }
      },
      (error) => {
        console.error("Speech recognition error:", error);
        setIsRecording(false);
      },
    );
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    speechRecognitionService.stop();

    // Save the final transcription
    saveCurrentTranscription();
  };

  const saveCurrentTranscription = () => {
    if (originalText.trim() === "") return;

    if (currentTranscriptionId) {
      // Update existing transcription
      storageService.updateTranscription(currentTranscriptionId, {
        originalText,
        translatedText,
        duration: recordingDuration,
      });
    } else {
      // Create new transcription
      const newTranscription = storageService.saveTranscription({
        title: `Transcription ${new Date().toLocaleString()}`,
        originalText,
        translatedText,
        originalLanguage,
        targetLanguage,
        duration: recordingDuration,
      });

      setCurrentTranscriptionId(newTranscription.id);
    }
  };

  const handleLanguageChange = (language: {
    code: string;
    name: string;
    flag: string;
  }) => {
    console.log("Target language changed to:", language);
    setTargetLanguage(language.name);

    // Re-translate the current text with the new target language
    if (originalText.trim() !== "") {
      // Map language names to proper codes
      let sourceLangCode;
      if (originalLanguage === "English") sourceLangCode = "en";
      else if (originalLanguage === "Spanish") sourceLangCode = "es";
      else if (originalLanguage === "Portuguese") sourceLangCode = "pt";
      else if (originalLanguage === "French") sourceLangCode = "fr";
      else if (originalLanguage === "German") sourceLangCode = "de";
      else sourceLangCode = originalLanguage.substring(0, 2).toLowerCase();

      console.log(
        `Re-translating with: source=${sourceLangCode}, target=${language.code}`,
      );

      translationService.translate(
        {
          text: originalText,
          sourceLanguage: sourceLangCode,
          targetLanguage: language.code,
        },
        (translatedText) => {
          setTranslatedText(translatedText);
        },
        (error) => {
          console.error("Translation error:", error);
        },
        localStorage.getItem("apiKey") || "",
        localStorage.getItem("aiProvider") || "openai",
      );
    }
  };

  const handleExport = (format: string) => {
    if (currentTranscriptionId) {
      const transcription = storageService.getTranscription(
        currentTranscriptionId,
      );
      if (transcription) {
        exportService.exportTranscription(transcription, {
          format: format as "pdf" | "txt" | "docx",
          includeTranslation: true,
          includeTimestamps: false,
        });
      }
    } else if (originalText.trim() !== "") {
      // Create a temporary transcription object for export
      const tempTranscription = {
        id: "temp",
        title: `Transcription ${new Date().toLocaleString()}`,
        originalText,
        translatedText,
        originalLanguage,
        targetLanguage,
        duration: recordingDuration,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      exportService.exportTranscription(tempTranscription, {
        format: format as "pdf" | "txt" | "docx",
        includeTranslation: true,
        includeTimestamps: false,
      });
    }
  };

  const handleShare = () => {
    // In a real app, this would open sharing options
    if (navigator.share && originalText.trim() !== "") {
      navigator
        .share({
          title: "Transcription",
          text: originalText,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
        });
    } else {
      console.log("Web Share API not supported or no text to share");
    }
  };

  const handleSettingsClick = () => {
    console.log("Opening settings");
    // In a real app, this would open settings dialog
  };

  const handleHelpClick = () => {
    console.log("Opening help");
    // In a real app, this would open help documentation
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        onSettingsClick={handleSettingsClick}
        onHelpClick={handleHelpClick}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onNoiseReductionChange={setNoiseReduction}
          onMicSensitivityChange={setMicSensitivity}
          onAutoDetectLanguageChange={setAutoDetectLanguage}
          onAutoSaveChange={setAutoSave}
          onSaveIntervalChange={setSaveInterval}
        />

        <main className="flex-grow p-4 md:p-6 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            <TranscriptionPanel
              isRecording={isRecording}
              originalText={originalText}
              translatedText={translatedText}
              originalLanguage={originalLanguage}
              targetLanguage={targetLanguage}
              recordingDuration={recordingDuration}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              onLanguageChange={handleLanguageChange}
              onExport={handleExport}
              onShare={handleShare}
            />
          </div>
        </main>
      </div>

      <Footer version="1.0.0" />

      <DebugPanel
        isVisible={isDebugPanelVisible}
        onToggleVisibility={() => setIsDebugPanelVisible(!isDebugPanelVisible)}
        originalText={originalText}
        translatedText={translatedText}
        originalLanguage={originalLanguage}
        targetLanguage={targetLanguage}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
      />
    </div>
  );
};

export default Home;
