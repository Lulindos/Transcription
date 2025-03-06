import React, { useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
  Settings,
  Home,
  Mic,
  Volume2,
  Languages,
  Clock,
  Save,
  Trash2,
  Download,
  MessageSquare,
  FileText,
  Headphones,
  Music,
  Film,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  User,
  Code,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNoiseReductionChange?: (enabled: boolean) => void;
  onMicSensitivityChange?: (level: number) => void;
  onAutoDetectLanguageChange?: (enabled: boolean) => void;
  onAutoSaveChange?: (enabled: boolean) => void;
  onSaveIntervalChange?: (minutes: number) => void;
}

const Sidebar = ({
  collapsed = false,
  onToggleCollapse = () => {},
  onNoiseReductionChange = () => {},
  onMicSensitivityChange = () => {},
  onAutoDetectLanguageChange = () => {},
  onAutoSaveChange = () => {},
  onSaveIntervalChange = () => {},
}: SidebarProps) => {
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState(75);
  const [saveInterval, setSaveInterval] = useState(5);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [expandedSections, setExpandedSections] = useState({
    settings: true,
    voices: true,
    apis: true,
  });

  const handleNoiseReductionChange = (checked: boolean) => {
    setNoiseReduction(checked);
    onNoiseReductionChange(checked);
  };

  const handleMicSensitivityChange = (value: number) => {
    setMicSensitivity(value);
    onMicSensitivityChange(value);
  };

  const handleAutoDetectLanguageChange = (checked: boolean) => {
    setAutoDetectLanguage(checked);
    onAutoDetectLanguageChange(checked);
  };

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    onAutoSaveChange(checked);
  };

  const handleSaveIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSaveInterval(value);
    onSaveIntervalChange(value);
  };

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const menuItems = [
    {
      type: "item",
      id: "home",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
    },
    {
      type: "section",
      id: "voices",
      label: "Voices",
      icon: <Mic className="h-5 w-5" />,
      items: [
        {
          id: "my-voices",
          label: "My Voices",
          icon: <Headphones className="h-5 w-5" />,
        },
        {
          id: "voice-library",
          label: "Voice Library",
          icon: <Music className="h-5 w-5" />,
        },
        {
          id: "voice-settings",
          label: "Voice Settings",
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    },
    {
      type: "section",
      id: "apis",
      label: "APIs",
      icon: <Code className="h-5 w-5" />,
      items: [
        {
          id: "api-keys",
          label: "API Keys",
          icon: <Key className="h-5 w-5" />,
        },
        {
          id: "api-usage",
          label: "API Usage",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          id: "api-documentation",
          label: "Documentation",
          icon: <MessageSquare className="h-5 w-5" />,
        },
      ],
    },
    {
      type: "section",
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          id: "audio-settings",
          label: "Audio Settings",
          icon: <Volume2 className="h-5 w-5" />,
        },
        {
          id: "language-settings",
          label: "Language",
          icon: <Languages className="h-5 w-5" />,
        },
        {
          id: "save-settings",
          label: "Auto Save",
          icon: <Save className="h-5 w-5" />,
        },
      ],
    },
    {
      type: "item",
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      isBottom: true,
    },
    {
      type: "item",
      id: "profile",
      label: "My Profile",
      subLabel: "Account Settings",
      icon: (
        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
          <User className="h-4 w-4" />
        </div>
      ),
      isBottom: true,
    },
  ];

  const renderMenuItem = (item: any, index: number) => {
    if (item.type === "section" && !collapsed) {
      return (
        <div key={item.id} className={cn(item.isBottom ? "mt-auto" : "")}>
          {item.label && (
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center">
                {item.icon && <span className="mr-2 text-gray-500">{item.icon}</span>}
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
              </div>
              {item.items && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                  onClick={() => toggleSection(item.id)}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedSections[item.id] ? "transform rotate-180" : ""
                    }`}
                  />
                </Button>
              )}
            </div>
          )}
          {expandedSections[item.id] &&
            item.items &&
            item.items.map((subItem: any, subIndex: number) => (
              <Button
                key={subItem.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start px-8 py-2 h-10 rounded-none transition-colors duration-200",
                  activeTab === subItem.id
                    ? "bg-gray-100 text-black font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                )}
                onClick={() => setActiveTab(subItem.id)}
              >
                <div className="flex items-center w-full">
                  {subItem.icon && <span className="text-gray-500">{subItem.icon}</span>}
                  <span className="ml-3 text-sm">{subItem.label}</span>
                  {subItem.hasArrow && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                  {subItem.hasPlus && (
                    <Plus className="ml-auto h-4 w-4 text-gray-400" />
                  )}
                </div>
              </Button>
            ))}
          {index < menuItems.length - 1 && !item.isBottom && (
            <div className="mx-4 my-2 border-t border-gray-100"></div>
          )}
        </div>
      );
    } else if (item.type === "item") {
      return (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            collapsed
              ? "w-full justify-center p-2 h-12 rounded-none transition-colors duration-200"
              : "w-full justify-start px-4 py-3 h-12 rounded-none transition-colors duration-200",
            activeTab === item.id
              ? "bg-gray-100 text-black font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-black",
            item.isBottom ? "mt-auto" : ""
          )}
          onClick={() => setActiveTab(item.id)}
        >
          <div
            className={cn(
              "flex items-center",
              collapsed ? "w-auto" : "w-full"
            )}
          >
            {item.icon}
            {!collapsed && (
              <>
                <div className="ml-3 flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.subLabel && (
                    <span className="text-xs text-gray-500">
                      {item.subLabel}
                    </span>
                  )}
                </div>
                {item.hasPlus && (
                  <Plus className="ml-auto h-4 w-4 text-gray-400" />
                )}
                {item.hasArrow && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </>
            )}
          </div>
        </Button>
      );
    } else if (item.type === "section" && collapsed) {
      // Render just the icon for sections when collapsed
      return (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "w-full justify-center p-2 h-12 rounded-none transition-colors duration-200",
            activeTab === item.id
              ? "bg-gray-100 text-black font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-black",
            item.isBottom ? "mt-auto" : ""
          )}
          onClick={() => setActiveTab(item.id)}
        >
          {item.icon}
        </Button>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "h-full bg-white border-r border-gray-100 transition-all duration-300 flex flex-col shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        {!collapsed && (
          <div className="font-bold text-xl tracking-tight">Transcription</div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "ml-auto border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-200",
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col h-full overflow-y-auto py-2">
        {menuItems.map(renderMenuItem)}
      </div>
    </div>
  );
};

export default Sidebar;
