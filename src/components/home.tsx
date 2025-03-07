import React, { useState, useEffect, useRef } from "react";
import { Volume2, Mic, Settings, Play, Pause, RefreshCw, FileText } from "lucide-react";
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
          
          // Process results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              // Translate the final text
              translateText(transcript);
            } else {
              interimTranscript += transcript;
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
  };

  const translateText = async (text: string) => {
    if (!text || text.trim() === '') return;
    
    if (!apiKey && selectedAIProvider === "google") {
      setTranslatedText("API key is required for translation. Please set your Google AI API key in the settings panel.");
      return;
    }
    
    try {
      setIsTranslating(true);
      
      // Use the translation service
      translationService.translate(
        {
          text: text,
          sourceLanguage: sourceLanguage.code,
          targetLanguage: targetLang.code
        },
        // Success callback
        (translatedText) => {
          setTranslatedText(prev => {
            // If previous text ends with "...", remove it to avoid duplication
            if (prev.endsWith('...')) {
              return translatedText;
            }
            return prev ? prev + ' ' + translatedText : translatedText;
          });
          
          // Speak the translated text if not recording
          if (!isRecording) {
            speakTranslatedText(translatedText);
          }
          
          setIsTranslating(false);
        },
        // Error callback
        (error) => {
          console.error("Error translating text:", error);
          setTranslatedText(prev => prev + "\nError translating text. Please check your API key and try again.");
          setIsTranslating(false);
        },
        // Pass the API key and selected provider
        apiKey,
        selectedAIProvider
      );
    } catch (error) {
      console.error("Error translating text:", error);
      setTranslatedText(prev => prev + "\nError translating text. Please check your API key and try again.");
      setIsTranslating(false);
    }
  };

  const speakTranslatedText = (text: string) => {
    // Stop any previous speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Create a new speech instance
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current = utterance;
    
    // Configure the language
    utterance.lang = targetLang.code;
    
    // Configure the voice (optional)
    const voices = speechSynthesis.getVoices();
    const targetVoice = voices.find(voice => voice.lang.includes(targetLang.code));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    // Events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };
    
    // Start speech
    speechSynthesis.speak(utterance);
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
                    className="w-16 h-16 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    <RefreshCw size={32} />
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("rounded-full", isSpeaking && "text-orange-500")}
                        onClick={() => speakTranslatedText(translatedText)}
                      >
                        <Volume2 size={18} />
                      </Button>
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
