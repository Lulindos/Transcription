import React, { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
  selectedLanguage?: Language;
  className?: string;
}

const LanguageSelector = ({
  onLanguageChange = () => {},
  selectedLanguage,
  className = "",
}: LanguageSelectorProps) => {
  const languages: Language[] = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  ];

  const [selected, setSelected] = useState<Language>(
    selectedLanguage || languages[0],
  );

  const handleSelectLanguage = (language: Language) => {
    setSelected(language);
    onLanguageChange(language);
  };

  return (
    <div
      className={cn(
        "w-full max-w-[300px] bg-white rounded-3xl shadow-md border border-gray-100",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-gray-200 bg-white text-gray-800 hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="mr-1">{selected.flag}</span>
              <span>{selected.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[300px] overflow-y-auto max-h-[300px] bg-white border border-gray-100"
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className={cn(
                "flex cursor-pointer items-center justify-between py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                selected.code === language.code &&
                  "bg-[#ff6600]/10 text-[#ff6600]",
              )}
              onClick={() => handleSelectLanguage(language)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </div>
              {selected.code === language.code && (
                <Check className="h-4 w-4 text-[#ff6600]" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
