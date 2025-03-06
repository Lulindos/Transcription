import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface VoiceSynthesisProps {
  isEnabled?: boolean;
  selectedVoice?: string;
  isPlaying?: boolean;
  volume?: number;
  onToggle?: (enabled: boolean) => void;
  onVoiceChange?: (voice: string) => void;
  onPlayPause?: () => void;
  onVolumeChange?: (volume: number) => void;
}

const VoiceSynthesisPanel = ({
  isEnabled = false,
  selectedVoice = "system-default",
  isPlaying = false,
  volume = 75,
  onToggle = () => {},
  onVoiceChange = () => {},
  onPlayPause = () => {},
  onVolumeChange = () => {},
}: VoiceSynthesisProps) => {
  const [isPremium, setIsPremium] = useState(false);

  const premiumVoices = [
    { id: "elevenlabs-rachel", name: "Rachel (Premium)" },
    { id: "elevenlabs-thomas", name: "Thomas (Premium)" },
    { id: "elevenlabs-emily", name: "Emily (Premium)" },
    { id: "elevenlabs-james", name: "James (Premium)" },
  ];

  const systemVoices = [
    { id: "system-default", name: "System Default" },
    { id: "system-male", name: "Male Voice" },
    { id: "system-female", name: "Female Voice" },
  ];

  const voices = isPremium ? premiumVoices : systemVoices;

  const handlePremiumToggle = (checked: boolean) => {
    setIsPremium(checked);
    // Reset to default voice when switching between premium and system
    onVoiceChange(checked ? premiumVoices[0].id : systemVoices[0].id);
  };

  const handlePlayPause = () => {
    const newIsPlaying = !isPlaying;
    onPlayPause();

    if (newIsPlaying) {
      // Start speech synthesis
      const utterance = new SpeechSynthesisUtterance(
        "This is a test of the voice synthesis feature",
      );
      utterance.volume = volume / 100;

      // Set voice based on selection
      if (selectedVoice.includes("female")) {
        // Try to find a female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find((voice) =>
          voice.name.toLowerCase().includes("female"),
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      // Stop speech synthesis
      window.speechSynthesis.cancel();
    }
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-md border border-gray-100 rounded-3xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center justify-between">
          <span>Voice Synthesis</span>
          <Switch
            id="voice-toggle"
            checked={isEnabled}
            onCheckedChange={onToggle}
          />
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`${!isEnabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="premium-toggle"
              className="font-medium text-gray-700"
            >
              Premium ElevenLabs Voices
            </Label>
            <Switch
              id="premium-toggle"
              checked={isPremium}
              onCheckedChange={handlePremiumToggle}
            />
          </div>

          <Select value={selectedVoice} onValueChange={onVoiceChange}>
            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-100">
              {voices.map((voice) => (
                <SelectItem
                  key={voice.id}
                  value={voice.id}
                  className="text-gray-700 hover:text-[#ff6600] hover:bg-gray-100"
                >
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator className="my-2" />

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlayPause}
                    className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? "Pause" : "Play"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center space-x-2 flex-1">
              <Volume2 size={16} className="text-gray-500" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(vals) => onVolumeChange(vals[0])}
              />
            </div>
          </div>

          {isPremium && (
            <p className="text-xs text-gray-500 mt-2">
              Premium voices provide higher quality, more natural sounding
              speech synthesis.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceSynthesisPanel;
