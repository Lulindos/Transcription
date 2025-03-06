import React from "react";

interface FooterProps {
  version?: string;
  showSocial?: boolean;
}

const Footer = ({ version = "1.0 demo", showSocial = false }: FooterProps) => {
  return (
    <footer className="w-full py-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Version {version}
          </span>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            by Cortex
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
