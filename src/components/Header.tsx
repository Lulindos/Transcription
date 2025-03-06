import React from "react";
import { Settings, HelpCircle, Mic } from "lucide-react";
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
  onHelpClick?: () => void;
}

const Header = ({
  title = "Audio Transcription & Translation",
  onSettingsClick = () => {},
  onHelpClick = () => {},
}: HeaderProps) => {
  return (
    <header className="w-full h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-12 h-12 rounded-full bg-[#ff6600] flex items-center justify-center shadow-[0_0_15px_rgba(255,102,0,0.5)] border border-[#ff9933]/30 backdrop-blur-sm">
          <Mic className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center space-x-2">
        <ThemeToggle />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsClick}
                className="text-gray-500 hover:text-[#ff6600] transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onHelpClick}
                className="text-gray-500 hover:text-[#ff6600] transition-colors"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default Header;
