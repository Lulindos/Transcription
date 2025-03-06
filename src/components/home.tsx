import React, { useState, useEffect, useRef } from "react";
import { Volume2, Mic, Settings, Play, Pause, RefreshCw, FileText } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import AIProviderSelector from "./AIProviderSelector";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

// Declaração de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechRecognitionInstance: any;
  }
}

// Interface para idiomas
interface Language {
  code: string;
  name: string;
}

const Home = () => {
  // Estado do evento
  const [eventName] = useState(localStorage.getItem("currentEventName") || "New Recording");
  
  // Estados básicos
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalText, setOriginalText] = useState(
    "This is a sample transcription. Start speaking to see your words appear here in real-time."
  );
  const [translatedText, setTranslatedText] = useState(
    "Esta é uma transcrição de exemplo. Comece a falar para ver suas palavras aparecerem aqui em tempo real."
  );
  
  // Idiomas
  const [sourceLanguage, setSourceLanguage] = useState<Language>({
    name: "English",
    code: "en"
  });
  
  const [targetLang, setTargetLang] = useState<Language>({
    name: "Portuguese",
    code: "pt"
  });

  // API de IA
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

  // Visualizador de áudio
  const [audioData, setAudioData] = useState<number[]>(Array(64).fill(5));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  // Efeito para animar o visualizador mesmo quando não está gravando
  useEffect(() => {
    if (!isRecording) {
      const interval = setInterval(() => {
        // Criar uma animação ultra suave com movimento de onda
        const newData = audioData.map((value, index) => {
          // Combinar múltiplas ondas senoidais para um efeito mais orgânico
          const wave1 = Math.sin(Date.now() / 800 + index / 8) * 4;
          const wave2 = Math.sin(Date.now() / 1200 + index / 12) * 3;
          const wave3 = Math.sin(Date.now() / 600 + index / 5) * 2;
          const combinedWave = wave1 + wave2 + wave3 + 8;
          
          // Adicionar um pouco de aleatoriedade muito sutil
          const random = Math.random() * 1.5;
          return Math.max(2, combinedWave + random);
        });
        setAudioData(newData);
      }, 30); // Atualização ainda mais frequente para máxima fluidez
      
      return () => clearInterval(interval);
    }
  }, [isRecording, audioData]);

  // Efeito para desenhar o visualizador
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawVisualizer(ctx, canvas.width, canvas.height, audioData);
      }
    }
  }, [audioData]);

  // Função para desenhar o visualizador
  const drawVisualizer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: number[]
  ) => {
    // Limpar o canvas
    ctx.clearRect(0, 0, width, height);
    
    // Configurar fundo com gradiente sutil
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#FFFFFF");
    bgGradient.addColorStop(1, "#F8F9FA");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Configurar gradiente laranja mais vibrante e suave
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255, 149, 0, 0.7)");  // Laranja claro
    gradient.addColorStop(0.5, "rgba(255, 94, 58, 0.8)"); // Laranja médio
    gradient.addColorStop(1, "rgba(255, 45, 85, 0.9)");  // Laranja escuro/rosa
    
    // Configurar sombra para efeito de brilho suave
    ctx.shadowColor = "rgba(255, 149, 0, 0.4)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Calcular pontos para curva Bezier suave
    const points = [];
    const centerY = height / 2;
    const maxAmplitude = height / 3; // Limitar a amplitude para não ficar muito extremo
    
    // Gerar pontos para a curva
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * width;
      const normalizedValue = Math.min(1, data[i] / 30); // Normalizar entre 0 e 1
      const y = centerY + (normalizedValue * maxAmplitude);
      points.push({ x, y });
    }
    
    // Desenhar a onda principal com curvas Bezier
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    // Adicionar pontos de controle para suavizar a curva
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calcular pontos de controle para curva Bezier
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
    
    // Completar o caminho para formar uma área preenchida
    ctx.lineTo(width, centerY);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    // Preencher com gradiente
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Desenhar a linha da onda com um traço mais grosso
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
    
    // Configurar estilo da linha
    ctx.strokeStyle = "rgba(255, 94, 58, 0.9)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    
    // Desenhar a onda espelhada (mais sutil)
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Espelhar os pontos Y em relação ao centro
      const mirrorCurrentY = centerY - (current.y - centerY) * 0.5;
      const mirrorNextY = centerY - (next.y - centerY) * 0.5;
      
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = mirrorCurrentY;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = mirrorNextY;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, mirrorNextY);
    }
    
    // Configurar estilo da linha espelhada (mais sutil)
    ctx.strokeStyle = "rgba(255, 94, 58, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Adicionar pontos de destaque animados nos picos
    const time = Date.now() / 1000;
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      
      // Detectar picos locais
      if (current.y > prev.y && current.y > next.y) {
        const pulseSize = 2 + Math.sin(time * 2 + i / 3) * 1;
        
        // Desenhar círculo com brilho
        ctx.beginPath();
        ctx.arc(current.x, current.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        
        // Adicionar halo
        ctx.beginPath();
        ctx.arc(current.x, current.y, pulseSize + 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    
    // Adicionar linha central sutil
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
      // Iniciar gravação
      startRecording();
      startVisualization();
      setRecordingStartTime(Date.now());
      setOriginalText(""); // Limpar o texto ao iniciar nova gravação
      setTranslatedText("");
    } else {
      // Parar gravação
      stopRecording();
      stopVisualization();
      setRecordingStartTime(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Configurar reconhecimento de fala para transcrição em tempo real
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sourceLanguage.code;
        
        let finalTranscript = '';
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          
          // Processar os resultados
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              // Traduzir o texto final
              translateText(transcript);
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Atualizar o texto original com texto final e intermediário
          setOriginalText(finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setOriginalText(prev => prev + " Error: " + event.error);
        };
        
        recognition.onend = () => {
          // Se ainda estiver gravando, reiniciar o reconhecimento
          if (isRecording) {
            recognition.start();
          }
        };
        
        // Iniciar reconhecimento
        recognition.start();
        
        // Armazenar a instância para poder parar depois
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
        // Parar o reconhecimento de fala quando a gravação parar
        if (window.speechRecognitionInstance) {
          window.speechRecognitionInstance.stop();
        }
      };
      
      // Iniciar gravação
      mediaRecorder.start(5000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  const stopRecording = () => {
    // Parar o reconhecimento de fala
    if (window.speechRecognitionInstance) {
      window.speechRecognitionInstance.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
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
      
      // Simular tradução para fins de demonstração
      setTimeout(() => {
        // Simular resposta da API
        let translatedText = '';
        
        // Tradução simulada baseada em frases comuns
        if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
          translatedText = 'Olá';
        } else if (text.toLowerCase().includes('good morning')) {
          translatedText = 'Bom dia';
        } else if (text.toLowerCase().includes('good afternoon')) {
          translatedText = 'Boa tarde';
        } else if (text.toLowerCase().includes('good evening') || text.toLowerCase().includes('good night')) {
          translatedText = 'Boa noite';
        } else if (text.toLowerCase().includes('how are you')) {
          translatedText = 'Como você está?';
        } else if (text.toLowerCase().includes('thank you') || text.toLowerCase().includes('thanks')) {
          translatedText = 'Obrigado';
        } else if (text.toLowerCase().includes('what is your name')) {
          translatedText = 'Qual é o seu nome?';
        } else if (text.toLowerCase().includes('my name is')) {
          translatedText = 'Meu nome é' + text.substring(text.toLowerCase().indexOf('is') + 2);
        } else {
          // Tradução genérica para outros textos
          translatedText = `Tradução de: "${text}"`;
        }
        
        // Atualizar o texto traduzido (substituir em vez de anexar)
        setTranslatedText(prev => {
          // Se o texto anterior terminar com "...", remover para evitar duplicação
          if (prev.endsWith('...')) {
            return translatedText;
          }
          return prev + ' ' + translatedText;
        });
        
        // Falar o texto traduzido se não estiver gravando
        if (!isRecording) {
          speakTranslatedText(translatedText);
        }
        
        setIsTranslating(false);
      }, 500); // Reduzir o tempo para uma resposta mais rápida
      
      // Código real para API do Google (comentado)
      /*
      const response = await fetch('https://api.gemini.ai/v1/translate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          source_language: sourceLanguage.code,
          target_language: targetLang.code
        })
      });
      
      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }
      
      const data = await response.json();
      setTranslatedText(data.translatedText);
      
      // Se não estiver gravando mais, falar o texto traduzido
      if (!isRecording) {
        speakTranslatedText(data.translatedText);
      }
      */
    } catch (error) {
      console.error("Error translating text:", error);
      setTranslatedText("Error translating text. Please check your API key and try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const speakTranslatedText = (text: string) => {
    // Parar qualquer fala anterior
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Criar nova instância de fala
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current = utterance;
    
    // Configurar idioma
    utterance.lang = targetLang.code;
    
    // Configurar voz (opcional)
    const voices = speechSynthesis.getVoices();
    const targetVoice = voices.find(voice => voice.lang.includes(targetLang.code));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    // Eventos
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };
    
    // Iniciar fala
    speechSynthesis.speak(utterance);
  };

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
    
    // Se estiver tocando, parar
    if (isPlaying) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }
    
    // Se não estiver tocando, iniciar
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

  // Formatar o tempo decorrido
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Atualizar o tempo decorrido
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

  // Iniciar visualização
  const startVisualization = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512; // Aumentar para maior precisão
      analyser.smoothingTimeConstant = 0.8; // Suavizar as transições
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      const draw = () => {
        if (!isRecording) return;
        
        animationRef.current = requestAnimationFrame(draw);
        
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Transformar os dados de frequência em dados visuais com melhor distribuição
        const newAudioData = Array.from({ length: 64 }, (_, i) => {
          // Usar uma distribuição logarítmica para destacar frequências baixas e médias
          const index = Math.floor(Math.pow(i / 64, 1.5) * dataArrayRef.current!.length);
          // Aplicar uma curva de resposta mais natural
          return Math.pow(dataArrayRef.current![index] / 255, 1.2) * 30;
        });
        
        setAudioData(newAudioData);
      };
      
      draw();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Parar visualização
  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    dataArrayRef.current = null;
  };

  return (
    <div className="w-full h-full bg-white">
      <main className="h-full w-full overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="elevenlabs-card p-6">
            <h1 className="text-2xl font-bold mb-4">{eventName}</h1>
            
            {/* Visualizador de áudio principal no topo */}
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
                {/* Botões de controle centralizados */}
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
                
                {/* Áreas de texto */}
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
              
              {/* Configurações ao lado */}
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
