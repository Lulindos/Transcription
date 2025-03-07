import React, { useState, useEffect, useRef } from "react";
import { Volume2, Mic, Settings, Play, Pause, RefreshCw, FileText, Radio } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import AIProviderSelector from "./AIProviderSelector";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import translationService from "../services/translationService";
import { generateBeautifulPDF } from "../utils/pdfExport";

// Declaration of types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechRecognitionInstance: any;
  }
}

// Interface for languages
interface Language {
  code: string;
  name: string;
}

const Home = () => {
  // Event state
  const [eventName] = useState(localStorage.getItem("currentEventName") || "New Recording");
  
  // Basic states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalText, setOriginalText] = useState(
    "This is a sample transcription. Start speaking to see your words appear here in real-time."
  );
  const [translatedText, setTranslatedText] = useState(
    "Esta es una transcripción de ejemplo. Comience a hablar para ver sus palabras aparecer aquí en tiempo real."
  );
  
  // Languages
  const [sourceLanguage, setSourceLanguage] = useState<Language>({
    name: "English",
    code: "en"
  });
  
  const [targetLang, setTargetLang] = useState<Language>({
    name: "Spanish",
    code: "es"
  });

  // AI API
  const [selectedAIProvider, setSelectedAIProvider] = useState(
    localStorage.getItem("aiProvider") || "google"
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [realTimeNarration, setRealTimeNarration] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio visualizer
  const [audioData, setAudioData] = useState<number[]>(Array(64).fill(5));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  // Streaming translation buffer and cache
  const [streamingBuffer, setStreamingBuffer] = useState<string[]>([]);
  const translationCacheRef = useRef<Map<string, string>>(new Map());
  const lastTranslationTimeRef = useRef<number>(0);
  const translationQueueRef = useRef<string[]>([]);
  const isTranslatingRef = useRef<boolean>(false);

  // Speech queue management
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef<boolean>(false);

  // Effect to animate the visualizer even when not recording
  useEffect(() => {
    // Only animate when not recording and not speaking
    if (!isRecording && !isSpeaking) {
      const interval = setInterval(() => {
        // Create an ultra-smooth wave animation
        const newData = audioData.map((value, index) => {
          // Combine multiple sine waves for a more organic effect
          const wave1 = Math.sin(Date.now() / 800 + index / 8) * 4;
          const wave2 = Math.sin(Date.now() / 1200 + index / 12) * 3;
          const wave3 = Math.sin(Date.now() / 600 + index / 5) * 2;
          const combinedWave = wave1 + wave2 + wave3 + 8;
          
          // Add a very subtle randomness
          const random = Math.random() * 1.5;
          return Math.max(2, combinedWave + random);
        });
        setAudioData(newData);
      }, 30); // More frequent updates for maximum fluidity
      
      return () => clearInterval(interval);
    }
  }, [isRecording, isSpeaking, audioData]);

  // Effect to draw the visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawVisualizer(ctx, canvas.width, canvas.height, audioData);
      }
    }
  }, [audioData]);

  // Function to draw the visualizer
  const drawVisualizer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: number[]
  ) => {
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up a subtle gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#FFFFFF");
    bgGradient.addColorStop(1, "#F8F9FA");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Set up a vibrant orange gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255, 149, 0, 0.7)");  // Light orange
    gradient.addColorStop(0.5, "rgba(255, 94, 58, 0.8)"); // Medium orange
    gradient.addColorStop(1, "rgba(255, 45, 85, 0.9)");  // Dark orange/pink
    
    // Set up a shadow for a soft glow effect
    ctx.shadowColor = "rgba(255, 149, 0, 0.4)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Calculate points for a smooth Bezier curve
    const points = [];
    const centerY = height / 2;
    const maxAmplitude = height / 3; // Limit the amplitude to avoid extreme values
    
    // Generate points for the curve
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * width;
      const normalizedValue = Math.min(1, data[i] / 30); // Normalize between 0 and 1
      const y = centerY + (normalizedValue * maxAmplitude);
      points.push({ x, y });
    }
    
    // Draw the main wave with Bezier curves
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    // Add control points to smooth the curve
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for Bezier curve
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
    
    // Complete the path to form a filled area
    ctx.lineTo(width, centerY);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw the wave line with a thicker stroke
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
    
    // Set up the line style
    ctx.strokeStyle = "rgba(255, 94, 58, 0.9)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    
    // Draw the mirrored wave (more subtle)
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Mirror the Y points around the center
      const mirrorCurrentY = centerY - (current.y - centerY) * 0.5;
      const mirrorNextY = centerY - (next.y - centerY) * 0.5;
      
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = mirrorCurrentY;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = mirrorNextY;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, mirrorNextY);
    }
    
    // Set up the mirrored line style (more subtle)
    ctx.strokeStyle = "rgba(255, 94, 58, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add animated highlight points at the peaks
    const time = Date.now() / 1000;
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      
      // Detect local peaks
      if (current.y > prev.y && current.y > next.y) {
        const pulseSize = 2 + Math.sin(time * 2 + i / 3) * 1;
        
        // Draw a circle with glow
        ctx.beginPath();
        ctx.arc(current.x, current.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        
        // Add a halo
        ctx.beginPath();
        ctx.arc(current.x, current.y, pulseSize + 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    
    // Add a subtle center line
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Handlers
  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      startRecording();
      startVisualization();
      setRecordingStartTime(Date.now());
      setOriginalText(""); // Clear text when starting a new recording
      setTranslatedText("");
    } else {
      // Stop recording
      stopRecording();
      stopVisualization();
      setRecordingStartTime(null);
    }
  };

  const startRecording = async () => {
    try {
      // Request microphone access with specific constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Configure speech recognition for real-time transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sourceLanguage.code;
        
        let finalTranscript = '';
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let currentInterimChunk = '';
          
          // Process results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              // Translate the final text
              translateText(transcript);
              
              // Reset the current interim chunk tracking
              currentInterimChunkRef.current = '';
              
              // Clear the streaming buffer for this segment
              setStreamingBuffer([]);
            } else {
              interimTranscript += transcript;
              currentInterimChunk = transcript;
              
              // If real-time narration is enabled, handle streaming translation
              if (realTimeNarration && currentInterimChunk.trim().length > 0) {
                // Process the current chunk for streaming translation
                processStreamingTranslation(currentInterimChunk);
              }
            }
          }
          
          // Update the original text with the final and interim text
          setOriginalText(finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setOriginalText(prev => prev + " Error: " + event.error);
        };
        
        recognition.onend = () => {
          // If still recording, restart recognition
          if (isRecording) {
            recognition.start();
          }
        };
        
        // Start recognition
        recognition.start();
        
        // Store the instance to stop later
        window.speechRecognitionInstance = recognition;
      } else {
        console.error('Speech recognition not supported');
        setOriginalText("Speech recognition not supported in this browser. Please try Chrome.");
      }
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop speech recognition when recording stops
        if (window.speechRecognitionInstance) {
          window.speechRecognitionInstance.stop();
        }
        
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start(5000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setOriginalText("Error accessing microphone. Please check your browser permissions and try again.");
      setIsRecording(false);
    }
  };
  
  const stopRecording = () => {
    // Stop speech recognition
    if (window.speechRecognitionInstance) {
      window.speechRecognitionInstance.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Clear speech queue when stopping recording
    clearSpeechQueue();
  };

  const processStreamingTranslation = (text: string) => {
    if (!text || text.trim().length === 0) return;
    
    // Divide the text into logical segments
    const segments = segmentText(text);
    
    // For each segment, check if we already have it in the cache or if it needs translation
    segments.forEach(segment => {
      if (segment.trim().length < 3) return; // Ignore very short segments
      
      // Check if we already have this translation in the cache
      if (translationCacheRef.current.has(segment)) {
        const cachedTranslation = translationCacheRef.current.get(segment);
        if (cachedTranslation) {
          // Use the cached translation immediately
          updateStreamingTranslation(cachedTranslation, true);
          return;
        }
      }
      
      // Check if it's a common phrase that we can translate locally
      const quickTranslation = getQuickTranslation(segment, sourceLanguage.code, targetLang.code);
      if (quickTranslation) {
        // Use local quick translation
        translationCacheRef.current.set(segment, quickTranslation);
        updateStreamingTranslation(quickTranslation, true);
        return;
      }
      
      // Add to the translation queue
      if (!translationQueueRef.current.includes(segment)) {
        translationQueueRef.current.push(segment);
        
        // Process the queue if we're not translating at the moment
        if (!isTranslatingRef.current) {
          processTranslationQueue();
        }
      }
    });
  };

  const processTranslationQueue = async () => {
    if (translationQueueRef.current.length === 0 || isTranslatingRef.current) return;
    
    isTranslatingRef.current = true;
    const segment = translationQueueRef.current.shift();
    
    if (segment) {
      // Translate this segment
      await translateText(segment, true);
    }
    
    isTranslatingRef.current = false;
    
    // Continue processing the queue if there are still items
    if (translationQueueRef.current.length > 0) {
      processTranslationQueue();
    }
  };

  const updateStreamingTranslation = (translation: string, speak: boolean = false) => {
    setTranslatedText(prev => {
      // If the previous text ends with ellipsis, replace it
      if (prev.endsWith('...')) {
        return prev.substring(0, prev.length - 3) + translation;
      }
      // Otherwise, append with a space
      return prev ? prev + ' ' + translation : translation;
    });
    
    // Speak the translated text if necessary
    if (speak && realTimeNarration) {
      speakTranslatedText(translation, true);
    }
  };

  const segmentText = (text: string): string[] => {
    // First try to divide by punctuation
    const punctuationSegments = text.split(/([.!?;,])/);
    
    // If we have significant segments by punctuation, use them
    if (punctuationSegments.length > 1) {
      // Recombine punctuation with the previous text
      const result: string[] = [];
      for (let i = 0; i < punctuationSegments.length; i += 2) {
        const segment = punctuationSegments[i];
        const punctuation = punctuationSegments[i + 1] || '';
        result.push(segment + punctuation);
      }
      return result.filter(s => s.trim().length > 0);
    }
    
    // Otherwise, divide by words (groups of 5-7 words)
    const words = text.trim().split(/\s+/);
    if (words.length <= 7) return [text]; // If it's short enough, return the full text
    
    const result: string[] = [];
    for (let i = 0; i < words.length; i += 5) {
      const segment = words.slice(i, i + 5).join(' ');
      if (segment.trim().length > 0) {
        result.push(segment);
      }
    }
    return result;
  };

  const getQuickTranslation = (text: string, sourceCode: string, targetCode: string): string | null => {
    // Dictionary of common phrases for quick translation
    const commonPhrases: Record<string, Record<string, Record<string, string>>> = {
      'en': {
        'es': {
          'hello': 'hola',
          'thank you': 'gracias',
          'good morning': 'buenos días',
          'good afternoon': 'buenas tardes',
          'good evening': 'buenas noches',
          'how are you': 'cómo estás',
          'my name is': 'me llamo',
          'please': 'por favor',
          'sorry': 'lo siento',
          'excuse me': 'disculpe',
          'yes': 'sí',
          'no': 'no',
          'maybe': 'quizás',
          'i understand': 'entiendo',
          'i don\'t understand': 'no entiendo'
        },
        'pt': {
          'hello': 'olá',
          'thank you': 'obrigado',
          'good morning': 'bom dia',
          'good afternoon': 'boa tarde',
          'good evening': 'boa noite',
          'how are you': 'como vai você',
          'my name is': 'meu nome é',
          'please': 'por favor',
          'sorry': 'desculpe',
          'excuse me': 'com licença',
          'yes': 'sim',
          'no': 'não',
          'maybe': 'talvez',
          'i understand': 'eu entendo',
          'i don\'t understand': 'eu não entendo'
        }
      }
    };
    
    // Check if we have a quick translation for this language combination
    if (commonPhrases[sourceCode]?.[targetCode]) {
      const lowerText = text.toLowerCase().trim();
      
      // Check for an exact match
      if (commonPhrases[sourceCode][targetCode][lowerText]) {
        return commonPhrases[sourceCode][targetCode][lowerText];
      }
      
      // Check if the text contains a common phrase
      for (const [phrase, translation] of Object.entries(commonPhrases[sourceCode][targetCode])) {
        if (lowerText.includes(phrase)) {
          // Replace the common phrase with the translation
          const regex = new RegExp(phrase, 'i');
          return text.replace(regex, translation);
        }
      }
    }
    
    return null;
  };

  const translateText = async (text: string, isInterim = false) => {
    if (!text || text.trim() === '') return;
    
    // Record the time of this translation
    lastTranslationTimeRef.current = Date.now();
    
    if (!apiKey && selectedAIProvider === "google") {
      setTranslatedText("API key is required for translation. Please set your Google AI API key in the settings panel.");
      return;
    }
    
    try {
      setIsTranslating(true);
      
      // For interim results, show a visual indicator
      if (isInterim) {
        setTranslatedText(prev => {
          if (prev.endsWith('...')) {
            return prev;
          }
          return prev ? prev + '...' : '...';
        });
      }
      
      // Use the translation service
      translationService.translate(
        {
          text: text,
          sourceLanguage: sourceLanguage.code,
          targetLanguage: targetLang.code
        },
        // Success callback
        (translatedText) => {
          // Add to the translation cache
          translationCacheRef.current.set(text, translatedText);
          
          setTranslatedText(prev => {
            // If this is an interim result and we're getting a new final result, replace the interim indicator
            if (isInterim && prev.endsWith('...')) {
              const lastSentenceBreak = prev.lastIndexOf('. ');
              if (lastSentenceBreak !== -1 && lastSentenceBreak > prev.length / 2) {
                return prev.substring(0, lastSentenceBreak + 2) + translatedText;
              }
              return translatedText;
            }
            
            // For final results, append normally
            return prev ? prev + ' ' + translatedText : translatedText;
          });
          
          // Speak the translated text if in real-time mode or if not recording
          if (realTimeNarration) {
            speakTranslatedText(translatedText, true);
          } else if (!isRecording) {
            speakTranslatedText(translatedText);
          }
          
          setIsTranslating(false);
        },
        // Error callback
        (error) => {
          console.error("Error translating text:", error);
          if (!isInterim) {
            setTranslatedText(prev => prev + "\nError translating text. Please check your API key and try again.");
          }
          setIsTranslating(false);
        },
        // Pass the API key and selected provider
        apiKey,
        selectedAIProvider
      );
    } catch (error) {
      console.error("Error translating text:", error);
      if (!isInterim) {
        setTranslatedText(prev => prev + "\nError translating text. Please check your API key and try again.");
      }
      setIsTranslating(false);
    }
  };

  const speakTranslatedText = (text: string, isRealTime = false) => {
    if (!text || text.trim() === '') return;
    
    // Add the text to the speech queue
    speechQueueRef.current.push(text);
    
    // If not speaking, start the speech queue
    if (!isSpeakingRef.current) {
      processSpeechQueue();
    }
  };
  
  // Function to process the speech queue
  const processSpeechQueue = () => {
    // If the queue is empty or already speaking, exit
    if (speechQueueRef.current.length === 0 || isSpeakingRef.current) return;
    
    // Mark as speaking
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    
    // Get the next text from the queue
    const textToSpeak = speechQueueRef.current.shift() || '';
    
    // Create a new speech instance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.startTime = Date.now();
    speechSynthesisRef.current = utterance;
    
    // Configure the language
    utterance.lang = targetLang.code;
    
    // Configure the voice (optional)
    const voices = speechSynthesis.getVoices();
    const targetVoice = voices.find(voice => voice.lang.includes(targetLang.code));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    // Configure settings for real-time narration
    if (realTimeNarration) {
      // Faster rate to keep up with the speaker
      utterance.rate = 1.5;
      // Slightly lower volume to not compete with the original speaker
      utterance.volume = 0.7;
      // Pitch adjustment to differentiate from the original voice
      utterance.pitch = 1.1;
    }
    
    // Events
    utterance.onend = () => {
      // Mark as not speaking
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      
      // Check if there are more items in the queue
      if (speechQueueRef.current.length > 0) {
        // Small delay to avoid overlap
        setTimeout(() => {
          processSpeechQueue();
        }, 100);
      }
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      
      // Continue with the next item in the queue even in case of error
      if (speechQueueRef.current.length > 0) {
        setTimeout(() => {
          processSpeechQueue();
        }, 100);
      }
    };
    
    // Start speech
    speechSynthesis.speak(utterance);
  };
  
  // Function to clear the speech queue (used when the user stops recording)
  const clearSpeechQueue = () => {
    speechQueueRef.current = [];
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  };

  const toggleRealTimeNarration = () => {
    setRealTimeNarration(!realTimeNarration);
    
    // If enabling real-time narration and already recording,
    // speak the current translated text to provide immediate feedback
    if (!realTimeNarration && isRecording && translatedText) {
      speakTranslatedText(translatedText, true);
    }
  };

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
    
    // If playing, stop
    if (isPlaying) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }
    
    // If not playing, start
    if (translatedText) {
      speakTranslatedText(translatedText);
    }
  };

  const handleOriginalTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOriginalText(e.target.value);
  };

  const handleTranslatedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranslatedText(e.target.value);
  };

  const handleSourceLanguageChange = (language: any) => {
    setSourceLanguage(language);
    localStorage.setItem("sourceLanguage", JSON.stringify(language));
  };

  const handleTargetLanguageChange = (language: any) => {
    setTargetLang(language);
    localStorage.setItem("targetLanguage", JSON.stringify(language));
  };

  const handleAIProviderChange = (provider: string) => {
    setSelectedAIProvider(provider);
    localStorage.setItem("aiProvider", provider);
  };

  const handleAPIKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("apiKey", key);
  };

  // Format the elapsed time
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      // Format the current date
      const currentDate = new Date().toLocaleDateString();
      
      // Create the translation data object
      const translationData = {
        eventName: eventName,
        date: currentDate,
        originalText: originalText,
        translatedText: translatedText,
        sourceLanguage: sourceLanguage.name,
        targetLanguage: targetLang.name,
        duration: elapsedTime
      };
      
      // Generate the PDF
      await generateBeautifulPDF(translationData);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Update the elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && recordingStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        setElapsedTime(formatTime(elapsed));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingStartTime]);

  // Start visualization
  const startVisualization = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Use the existing stream from startRecording if available
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      }

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512; // Increase for higher precision
      analyser.smoothingTimeConstant = 0.8; // Smooth the transitions
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(streamRef.current);
      source.connect(analyser);
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Transform the frequency data into visual data with better distribution
        const newAudioData = Array.from({ length: 64 }, (_, i) => {
          // Use a logarithmic distribution to highlight low and medium frequencies
          const index = Math.floor(Math.pow(i / 64, 1.5) * dataArrayRef.current!.length);
          // Apply a more natural response curve
          return Math.pow(dataArrayRef.current![index] / 255, 1.2) * 30;
        });
        
        setAudioData(newAudioData);
      };
      
      draw();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop visualization
  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      // Close audio context to free up resources
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => console.error("Error closing audio context:", err));
      }
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  return (
    <div className="w-full h-full bg-white">
      <main className="h-full w-full overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="elevenlabs-card p-6">
            <h1 className="text-2xl font-bold mb-4">{eventName}</h1>
            
            {/* Main audio visualizer at the top */}
            <div className="relative w-full h-48 bg-gray-50 rounded-xl overflow-hidden mb-6">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                width={1200}
                height={240}
              />
              
              {!isRecording && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
                  <p className="text-gray-600 font-medium">Click the microphone button to start recording</p>
                </div>
              )}
              
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full">
                {elapsedTime}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-3/4 space-y-6">
                {/* Centralized control buttons */}
                <div className="flex justify-center space-x-6 mb-8">
                  <Button 
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleToggleRecording}
                  >
                    {isRecording ? <Pause size={32} /> : <Mic size={32} />}
                  </Button>
                  <Button 
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handlePlayAudio}
                  >
                    <Play size={32} />
                  </Button>
                  <Button 
                    className={`w-16 h-16 rounded-full ${realTimeNarration 
                      ? "bg-gradient-to-r from-green-400 to-teal-500 text-white hover:from-green-500 hover:to-teal-600" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    onClick={toggleRealTimeNarration}
                    title={realTimeNarration ? "Real-time narration enabled" : "Enable real-time narration"}
                  >
                    <Radio size={32} />
                  </Button>
                </div>
                
                {/* Text areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Original ({sourceLanguage.name})</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full"
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(originalText);
                          utterance.lang = sourceLanguage.code;
                          speechSynthesis.speak(utterance);
                        }}
                      >
                        <Volume2 size={18} />
                      </Button>
                    </div>
                    <Textarea
                      value={originalText}
                      onChange={handleOriginalTextChange}
                      disabled={isRecording}
                      className="min-h-[250px] resize-none focus:ring-1 focus:ring-orange-400 border-gray-200"
                      placeholder="Text will appear here..."
                    />
                    {isTranscribing && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-orange-500"></div>
                        Transcribing...
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Translation ({targetLang.name})</h3>
                      <div className="flex items-center">
                        {realTimeNarration && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2 flex items-center">
                            <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-500 animate-pulse" : "bg-green-300"} mr-1`}></span>
                            Real-time
                          </span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("rounded-full", isSpeaking && "text-orange-500")}
                          onClick={() => speakTranslatedText(translatedText)}
                        >
                          <Volume2 size={18} />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={translatedText}
                      onChange={handleTranslatedTextChange}
                      disabled={isRecording}
                      className="min-h-[250px] resize-none focus:ring-1 focus:ring-orange-400 border-gray-200"
                      placeholder="Translation will appear here..."
                    />
                    {isTranslating && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-orange-500"></div>
                        Translating...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Settings on the side */}
              <div className="w-full md:w-1/4 space-y-6">
                <div className="elevenlabs-card p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-medium mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Input Language
                      </label>
                      <LanguageSelector
                        selectedLanguage={sourceLanguage.name}
                        onLanguageChange={handleSourceLanguageChange}
                        disabled={isRecording}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Output Language
                      </label>
                      <LanguageSelector
                        selectedLanguage={targetLang.name}
                        onLanguageChange={handleTargetLanguageChange}
                        disabled={isRecording}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        AI Provider
                      </label>
                      <AIProviderSelector
                        selectedProvider={selectedAIProvider}
                        apiKey={apiKey}
                        onProviderChange={handleAIProviderChange}
                        onApiKeyChange={handleAPIKeyChange}
                      />
                    </div>
                    
                    <div>
                      <Button 
                        className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
                        onClick={handleExportPDF}
                      >
                        <FileText size={16} />
                        <span>Export to PDF</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

declare global {
  interface SpeechSynthesisUtterance {
    startTime?: number;
  }
}
