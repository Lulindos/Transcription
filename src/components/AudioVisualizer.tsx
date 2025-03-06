import React, { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";

interface AudioVisualizerProps {
  isRecording?: boolean;
  onToggleRecording?: () => void;
  recordingDuration?: number;
  className?: string;
}

const AudioVisualizer = ({
  isRecording = false,
  onToggleRecording = () => {},
  recordingDuration = 0,
  className = "",
}: AudioVisualizerProps) => {
  const [audioData, setAudioData] = useState<number[]>(Array(50).fill(5));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

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

  // Iniciar ou parar a visualização baseado no estado de gravação
  useEffect(() => {
    if (isRecording) {
      startVisualization();
      setRecordingStartTime(Date.now());
    } else {
      stopVisualization();
      setRecordingStartTime(null);
    }

    return () => {
      stopVisualization();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  // Iniciar visualização
  const startVisualization = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
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
        
        // Transformar os dados de frequência em dados visuais
        const newAudioData = Array.from({ length: 50 }, (_, i) => {
          const index = Math.floor(i * dataArrayRef.current!.length / 50);
          return dataArrayRef.current![index] / 10; // Escala para valores menores
        });
        
        setAudioData(newAudioData);
        
        // Desenhar no canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = canvas.width / 50;
            const barSpacing = 2;
            const maxBarHeight = canvas.height * 0.8;
            
            ctx.fillStyle = "#000";
            
            newAudioData.forEach((value, i) => {
              const barHeight = Math.max(2, value * (maxBarHeight / 25));
              const x = i * (barWidth + barSpacing);
              const y = (canvas.height - barHeight) / 2;
              ctx.fillRect(x, y, barWidth, barHeight);
            });
          }
        }
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
    
    setAudioData(Array(50).fill(5));
    setElapsedTime("00:00");
  };

  return (
    <div className={cn("w-full flex flex-col items-center", className)}>
      <div className="relative w-full h-24 bg-gray-50 rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={300}
          height={100}
        />
        
        {!isRecording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Clique no botão de microfone para começar a gravar</p>
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
          {elapsedTime}
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
