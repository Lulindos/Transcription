import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Copy, Volume2, ArrowLeftRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface TextDisplayAreaProps {
  originalText?: string;
  translatedText?: string;
  originalLanguage?: string;
  targetLanguage?: string;
  onPlayOriginal?: () => void;
  onPlayTranslated?: () => void;
  onCopyOriginal?: () => void;
  onCopyTranslated?: () => void;
}

const TextDisplayArea = ({
  originalText = "This is a sample transcription. Start speaking to see your words appear here in real-time. The system will automatically detect pauses and punctuate your speech accordingly. You can speak for as long as you need, and the text will continue to update as you speak.",
  translatedText = "Esto es una transcripción de muestra. Comience a hablar para ver sus palabras aparecer aquí en tiempo real. El sistema detectará automáticamente las pausas y puntuará su discurso en consecuencia. Puede hablar todo el tiempo que necesite, y el texto se actualizará a medida que hable.",
  originalLanguage = "English",
  targetLanguage = "Spanish",
  onPlayOriginal = () => console.log("Play original"),
  onPlayTranslated = () => console.log("Play translated"),
  onCopyOriginal = () => console.log("Copy original"),
  onCopyTranslated = () => console.log("Copy translated"),
}: TextDisplayAreaProps) => {
  const [viewMode, setViewMode] = useState<"split" | "tabbed">("split");

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Transcription & Translation
        </h2>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "split" ? "default" : "outline"}
            className={
              viewMode === "split"
                ? "elevenlabs-button"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
            }
            size="sm"
            onClick={() => setViewMode("split")}
          >
            Split View
          </Button>
          <Button
            variant={viewMode === "tabbed" ? "default" : "outline"}
            className={
              viewMode === "tabbed"
                ? "elevenlabs-button"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
            }
            size="sm"
            onClick={() => setViewMode("tabbed")}
          >
            Tabbed View
          </Button>
        </div>
      </div>

      {viewMode === "split" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-3rem)]">
          <div className="relative">
            <TextPanel
              title={`Original (${originalLanguage})`}
              text={originalText}
              onPlay={onPlayOriginal}
              onCopy={onCopyOriginal}
            />
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 hidden md:block">
              <div className="elevenlabs-icon-bg">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
            </div>
          </div>
          <TextPanel
            title={`Translation (${targetLanguage})`}
            text={translatedText}
            onPlay={onPlayTranslated}
            onCopy={onCopyTranslated}
          />
        </div>
      ) : (
        <Tabs defaultValue="original" className="h-[calc(100%-3rem)]">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <TabsTrigger
              value="original"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-l-lg"
            >{`Original (${originalLanguage})`}</TabsTrigger>
            <TabsTrigger
              value="translated"
              className="data-[state=active]:bg-secondary data-[state=active]:text-white rounded-r-lg"
            >{`Translation (${targetLanguage})`}</TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="h-full">
            <TextPanel
              title={`Original (${originalLanguage})`}
              text={originalText}
              onPlay={onPlayOriginal}
              onCopy={onCopyOriginal}
              showTitle={false}
            />
          </TabsContent>
          <TabsContent value="translated" className="h-full">
            <TextPanel
              title={`Translation (${targetLanguage})`}
              text={translatedText}
              onPlay={onPlayTranslated}
              onCopy={onCopyTranslated}
              showTitle={false}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

interface TextPanelProps {
  title: string;
  text: string;
  onPlay: () => void;
  onCopy: () => void;
  showTitle?: boolean;
}

const TextPanel = ({
  title,
  text,
  onPlay,
  onCopy,
  showTitle = true,
}: TextPanelProps) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm">
      {showTitle && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
        </div>
      )}
      <div className="relative flex-grow overflow-auto">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl h-full overflow-y-auto shadow-inner border border-gray-100 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{text}</p>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onPlay}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:text-gray-300 border-gray-200 dark:border-gray-700 transition-all duration-300"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Play audio</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onCopy}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:text-gray-300 border-gray-200 dark:border-gray-700 transition-all duration-300"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy text</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TextDisplayArea;
