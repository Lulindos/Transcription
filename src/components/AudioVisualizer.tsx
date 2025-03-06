import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Play, Square, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface AudioVisualizerProps {
  onRecordingStart?: () => void;
  onRecordingStop?: (audioBlob?: Blob) => void;
  isRecording?: boolean;
  className?: string;
  translatedText?: string;
  showTranslationWave?: boolean;
}

const AudioVisualizer = ({
  onRecordingStart = () => {},
  onRecordingStop = () => {},
  isRecording = false,
  className = "",
  translatedText = "",
  showTranslationWave = true,
}: AudioVisualizerProps) => {
  const [recording, setRecording] = useState(isRecording);
  const [audioData, setAudioData] = useState<number[]>(Array(50).fill(5));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(
    null,
  );

  // Initialize audio visualization
  useEffect(() => {
    if (recording) {
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
  }, [recording]);

  // Update elapsed time
  useEffect(() => {
    let interval: number | null = null;

    if (recording && recordingStartTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [recording, recordingStartTime]);

  // Draw visualization
  useEffect(() => {
    if (canvasRef.current && audioData.length > 0) {
      drawVisualization();
    }
  }, [audioData]);

  const startVisualization = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context and analyzer
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512; // Higher for more detailed visualization
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Start animation loop
      animateVisualization();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecording(false);
    }
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Reset refs
    audioContextRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    sourceRef.current = null;
    mediaRecorderRef.current = null;
    streamRef.current = null;

    // Generate some random data for the stopped state
    setAudioData(
      Array(50)
        .fill(5)
        .map(() => Math.random() * 10 + 5),
    );
  };

  const animateVisualization = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Process the data with ElevenLabs-style smoothing
    const rawData = Array.from(dataArrayRef.current).slice(0, 100);

    // Apply smoothing algorithm similar to ElevenLabs
    const newData = [];
    const smoothingFactor = 0.3;

    for (let i = 0; i < 50; i++) {
      const index = Math.floor(i * (rawData.length / 50));
      let value = rawData[index] / 4; // Scale down the values

      // Add some randomness for more natural movement
      const randomFactor = recording ? Math.random() * 3 : Math.random() * 1;
      value = value * (1 - smoothingFactor) + randomFactor * smoothingFactor;

      newData.push(value);
    }

    setAudioData(newData);
    animationRef.current = requestAnimationFrame(animateVisualization);
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine if we should show the translation wave
    const hasTranslation =
      showTranslationWave && translatedText.trim().length > 0;

    // Set background with crypto wallet style dark gradient
    const isDarkMode = document.documentElement.classList.contains("dark");

    // Create an ElevenLabs-style dark background with subtle gradient
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = hasTranslation
      ? canvas.height / 3
      : canvas.height / 2;

    // Use a linear gradient for ElevenLabs style
    const bgGradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    // Pure white background for minimalist look
    bgGradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // White
    bgGradient.addColorStop(0.5, "rgba(252, 252, 252, 1)"); // Very slight off-white
    bgGradient.addColorStop(1, "rgba(255, 255, 255, 1)"); // White

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle ElevenLabs-style grid lines
    const centerY = hasTranslation ? canvas.height / 3 : canvas.height / 2;

    // Draw subtle horizontal grid lines
    const gridLineCount = 4;
    for (let i = 0; i <= gridLineCount; i++) {
      const y = (canvas.height / gridLineCount) * i;
      const opacity = i === Math.floor(gridLineCount / 2) ? 0.15 : 0.05; // Center line more visible

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.strokeStyle = `rgba(255, 102, 0, ${opacity})`; // Orange
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Add subtle noise texture for depth
    const noiseOpacity = 0.03;
    for (let i = 0; i < canvas.width; i += 4) {
      for (let j = 0; j < canvas.height; j += 4) {
        if (Math.random() > 0.996) {
          const size = Math.random() * 1 + 0.2;
          ctx.fillStyle = `rgba(255, 102, 0, ${noiseOpacity})`; // Orange
          ctx.beginPath();
          ctx.arc(i, j, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw a modern, ElevenLabs-style waveform with multiple bars
    const barCount = 120;
    const barSpacing = 1.5;
    const maxBarHeight = canvas.height * 0.45;
    const barWidth = (canvas.width - (barCount - 1) * barSpacing) / barCount;

    // Create a more dynamic audio data array with more points
    const enhancedAudioData = [];
    for (let i = 0; i < barCount; i++) {
      // Sample from original data or interpolate
      const dataIndex = Math.floor(i * (audioData.length / barCount));
      let value = audioData[dataIndex] || 5;

      // Add dynamic variation based on recording state
      if (recording) {
        // More dynamic when recording
        const time = Date.now() / 1000;
        const position = i / barCount;

        // Create wave-like patterns with multiple frequencies
        const wave1 = Math.sin(time * 4 + position * 10) * 10;
        const wave2 = Math.sin(time * 2.5 + position * 5) * 8;
        const wave3 = Math.sin(time * 8 + position * 20) * 5;

        // Combine waves with original value for a complex pattern
        value = Math.max(5, value + wave1 + wave2 + wave3);
      } else {
        // Subtle movement when not recording
        const time = Date.now() / 2000;
        const position = i / barCount;
        value += Math.sin(time + position * 5) * 3;
      }

      // Ensure minimum height and cap maximum
      value = Math.max(3, Math.min(value, maxBarHeight));
      enhancedAudioData.push(value);
    }

    // Draw the bars with ElevenLabs-style glow
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barSpacing);
      const height = enhancedAudioData[i];

      // Calculate position for symmetric bars (top and bottom)
      const topY = centerY - height;
      const bottomY = centerY + height;

      // Create gradient for each bar
      const barGradient = ctx.createLinearGradient(x, topY, x, bottomY);

      if (recording) {
        // Orange gradient when recording
        barGradient.addColorStop(0, "rgba(255, 102, 0, 0.95)"); // Top - orange
        barGradient.addColorStop(0.5, "rgba(255, 153, 51, 0.8)"); // Middle - lighter orange
        barGradient.addColorStop(1, "rgba(255, 102, 0, 0.95)"); // Bottom - orange
      } else {
        // More subtle gradient when not recording
        barGradient.addColorStop(0, "rgba(255, 102, 0, 0.8)"); // Top - orange
        barGradient.addColorStop(0.5, "rgba(255, 153, 51, 0.6)"); // Middle - lighter orange
        barGradient.addColorStop(1, "rgba(255, 102, 0, 0.8)"); // Bottom - orange
      }

      // Draw the bar with rounded corners
      ctx.beginPath();
      const radius = barWidth / 2;

      // Top bar with rounded corners
      ctx.moveTo(x, centerY - 1);
      ctx.lineTo(x, topY + radius);
      ctx.quadraticCurveTo(x, topY, x + radius, topY);
      ctx.lineTo(x + barWidth - radius, topY);
      ctx.quadraticCurveTo(x + barWidth, topY, x + barWidth, topY + radius);
      ctx.lineTo(x + barWidth, centerY - 1);

      // Bottom bar with rounded corners
      ctx.moveTo(x, centerY + 1);
      ctx.lineTo(x, bottomY - radius);
      ctx.quadraticCurveTo(x, bottomY, x + radius, bottomY);
      ctx.lineTo(x + barWidth - radius, bottomY);
      ctx.quadraticCurveTo(
        x + barWidth,
        bottomY,
        x + barWidth,
        bottomY - radius,
      );
      ctx.lineTo(x + barWidth, centerY + 1);

      ctx.fillStyle = barGradient;
      ctx.fill();

      // Add glow effect to each bar
      if (recording) {
        ctx.shadowColor = "rgba(255, 102, 0, 0.8)";
        ctx.shadowBlur = 8;
        ctx.strokeStyle = "rgba(255, 153, 51, 0.9)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Reset shadow for other drawings
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Add ElevenLabs-style horizontal line in the center
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = "rgba(255, 102, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Add subtle edge highlight with ElevenLabs purple
    ctx.strokeStyle = "rgba(255, 102, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    // Add ElevenLabs-style glow effect to the canvas edges
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = recording
      ? "rgba(255, 102, 0, 0.6)"
      : "rgba(255, 102, 0, 0.4)";
    ctx.lineWidth = 2;
    ctx.shadowColor = recording
      ? "rgba(255, 102, 0, 0.9)"
      : "rgba(255, 102, 0, 0.6)";
    ctx.shadowBlur = recording ? 20 : 12;
    ctx.stroke();

    // Add subtle glass effect overlay
    const overlayGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    overlayGradient.addColorStop(0, "rgba(255, 255, 255, 0.05)");
    overlayGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.01)");
    overlayGradient.addColorStop(1, "rgba(255, 255, 255, 0.03)");

    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset shadow for other drawings
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Draw translation waveform if we have translated text
    if (hasTranslation) {
      // Create a second waveform for translation
      const translationCenterY = (canvas.height * 2) / 3;

      // Add horizontal line for translation section
      ctx.beginPath();
      ctx.moveTo(0, translationCenterY);
      ctx.lineTo(canvas.width, translationCenterY);
      ctx.strokeStyle = "rgba(0, 102, 255, 0.3)"; // Blue for translation
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw translation bars with blue gradient
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + barSpacing);
        // Create slightly different pattern for translation wave
        const translationHeight =
          enhancedAudioData[(i + 5) % enhancedAudioData.length] * 0.8;

        // Calculate position for symmetric bars (top and bottom)
        const topY = translationCenterY - translationHeight;
        const bottomY = translationCenterY + translationHeight;

        // Create blue gradient for translation bars
        const translationGradient = ctx.createLinearGradient(
          x,
          topY,
          x,
          bottomY,
        );

        // Blue gradient for translation
        translationGradient.addColorStop(0, "rgba(0, 102, 255, 0.8)"); // Top - blue
        translationGradient.addColorStop(0.5, "rgba(51, 153, 255, 0.6)"); // Middle - lighter blue
        translationGradient.addColorStop(1, "rgba(0, 102, 255, 0.8)"); // Bottom - blue

        // Draw the bar with rounded corners
        ctx.beginPath();
        const radius = barWidth / 2;

        // Top bar with rounded corners
        ctx.moveTo(x, translationCenterY - 1);
        ctx.lineTo(x, topY + radius);
        ctx.quadraticCurveTo(x, topY, x + radius, topY);
        ctx.lineTo(x + barWidth - radius, topY);
        ctx.quadraticCurveTo(x + barWidth, topY, x + barWidth, topY + radius);
        ctx.lineTo(x + barWidth, translationCenterY - 1);

        // Bottom bar with rounded corners
        ctx.moveTo(x, translationCenterY + 1);
        ctx.lineTo(x, bottomY - radius);
        ctx.quadraticCurveTo(x, bottomY, x + radius, bottomY);
        ctx.lineTo(x + barWidth - radius, bottomY);
        ctx.quadraticCurveTo(
          x + barWidth,
          bottomY,
          x + barWidth,
          bottomY - radius,
        );
        ctx.lineTo(x + barWidth, translationCenterY + 1);

        ctx.fillStyle = translationGradient;
        ctx.fill();

        // Add glow effect to each bar
        ctx.shadowColor = "rgba(0, 102, 255, 0.6)";
        ctx.shadowBlur = 6;
        ctx.strokeStyle = "rgba(51, 153, 255, 0.7)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Add label for translation
      ctx.font = "600 12px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(0, 102, 255, 0.8)";
      ctx.textAlign = "left";
      ctx.fillText("Tradução", 20, translationCenterY - 15);

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // Add time indicator
    // ElevenLabs-style time indicator with custom font styling
    ctx.font = "600 14px Inter, system-ui, sans-serif";
    ctx.fillStyle = recording ? "#ff6600" : "#9c9ca4";
    ctx.textAlign = "right";
    ctx.fillText(elapsedTime, canvas.width - 20, 30);

    // Add subtle glow to the time text when recording
    if (recording) {
      ctx.shadowColor = "rgba(255, 153, 51, 0.8)";
      ctx.shadowBlur = 8;
      ctx.fillText(elapsedTime, canvas.width - 20, 30);
      ctx.shadowBlur = 0;
    }

    // Add premium crypto-style recording indicator
    if (recording) {
      const time = Date.now();
      const baseSize = 8;
      const pulseSize = baseSize + Math.sin(time / 300) * 3; // Primary pulse

      // ElevenLabs-style recording indicator with pulsing rings
      const ringCount = 3; // ElevenLabs uses fewer, more defined rings
      for (let i = 0; i < ringCount; i++) {
        const ringPhase = (time / 1000 + i / ringCount) % 1; // Phase offset for each ring
        const ringSize = pulseSize * (1 + ringPhase * 3); // Growing size based on phase
        const opacity = 0.7 * (1 - ringPhase); // Fade out as it grows

        ctx.beginPath();
        ctx.arc(30, 30, ringSize, 0, Math.PI * 2);

        // ElevenLabs purple gradient for rings
        const ringGradient = ctx.createRadialGradient(
          30,
          30,
          0,
          30,
          30,
          ringSize,
        );

        // Use orange gradient
        ringGradient.addColorStop(0, `rgba(255, 102, 0, ${opacity * 0.4})`);
        ringGradient.addColorStop(0.5, `rgba(255, 153, 51, ${opacity * 0.3})`);
        ringGradient.addColorStop(1, `rgba(255, 102, 0, 0)`);

        ctx.fillStyle = ringGradient;
        ctx.fill();
      }

      // Main recording indicator with ElevenLabs design
      ctx.beginPath();
      ctx.arc(30, 30, pulseSize, 0, Math.PI * 2);

      // ElevenLabs purple gradient for main indicator
      const dotGradient = ctx.createRadialGradient(
        30,
        30,
        0,
        30,
        30,
        pulseSize,
      );

      // Use orange gradient
      dotGradient.addColorStop(0, "rgba(255, 153, 51, 1)"); // Lighter orange center
      dotGradient.addColorStop(0.5, "rgba(255, 102, 0, 0.9)"); // Orange mid
      dotGradient.addColorStop(1, "rgba(255, 102, 0, 0.8)"); // Orange edge

      ctx.fillStyle = dotGradient;
      ctx.fill();

      // Add ElevenLabs-style glow effect
      ctx.shadowColor = "rgba(255, 102, 0, 0.9)";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "rgba(255, 153, 51, 0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Add small white dot in center for extra detail
      ctx.beginPath();
      ctx.arc(30, 30, pulseSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();
    }
  };

  const toggleRecording = () => {
    const newRecordingState = !recording;
    setRecording(newRecordingState);

    if (newRecordingState) {
      onRecordingStart();
      setElapsedTime("00:00");
    } else {
      onRecordingStop();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-md border border-gray-100",
        className,
      )}
    >
      <div className="relative w-full max-w-3xl aspect-[4/1] mb-6">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-3xl shadow-md border border-gray-100 bg-white"
          width={800}
          height={200}
        />
      </div>

      <div className="flex items-center gap-6">
        <Button
          onClick={toggleRecording}
          variant={recording ? "destructive" : "default"}
          size="lg"
          className={`rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all duration-300 ${recording ? "bg-[#ff6600]" : "bg-[#ff6600]"} border border-[#ff9933]/30 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,102,0,0.5)] hover:border-[#ff9933]/50 backdrop-blur-sm ${recording ? "animate-pulse" : ""}`}
        >
          {recording ? (
            <Square className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <div className="flex flex-col">
          <div className="text-base font-medium text-gray-800">
            {recording
              ? "Gravando... Clique para parar"
              : "Clique para iniciar gravação"}
          </div>
          {recording && (
            <div className="flex items-center text-sm text-indigo-400">
              <Clock className="h-4 w-4 mr-1 animate-pulse" />
              <span>{elapsedTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
