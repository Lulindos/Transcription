import React from "react";
import { Github, Twitter, Heart } from "lucide-react";
import { Separator } from "./ui/separator";

interface FooterProps {
  version?: string;
  showSocial?: boolean;
}

const Footer = ({ version = "1.0.0", showSocial = true }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 bg-white border-t border-gray-100">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500 mb-2 md:mb-0">
          <span>© {currentYear} Audio Transcription App</span>
          <span className="mx-2">•</span>
          <span>Version {version}</span>
        </div>

        {showSocial && (
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-gray-500 flex items-center">
              Made with <Heart size={12} className="mx-1 text-red-400" /> by
              Transcription Team
            </span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
