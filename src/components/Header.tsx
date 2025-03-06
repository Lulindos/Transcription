import React from "react";
import { Settings, Mic, Waveform } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  title?: string;
  onSettingsClick?: () => void;
}

const Header = ({
  title = "Audio Transcription",
  onSettingsClick = () => {},
}: HeaderProps) => {
  return (
    <header className="w-full h-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 px-6 flex items-center justify-between relative">
      <div className="flex items-center space-x-3">
        <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center">
          <Mic className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-black dark:text-white">{title}</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">Powered by advanced AI speech recognition</p>
        </div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-2">
        <div className="h-1 w-1 rounded-full bg-black dark:bg-white opacity-70"></div>
        <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white opacity-80"></div>
        <div className="h-2 w-2 rounded-full bg-black dark:bg-white opacity-90"></div>
        <div className="h-2.5 w-2.5 rounded-full bg-black dark:bg-white"></div>
        <div className="h-2 w-2 rounded-full bg-black dark:bg-white opacity-90"></div>
        <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white opacity-80"></div>
        <div className="h-1 w-1 rounded-full bg-black dark:bg-white opacity-70"></div>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onSettingsClick}
                className="border-black text-black dark:text-white dark:border-gray-700"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default Header;
