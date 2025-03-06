import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Bug, RefreshCw } from "lucide-react";

interface DebugPanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  isRecording: boolean;
  recordingDuration: number;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  isVisible,
  onToggleVisibility,
  originalText,
  translatedText,
  originalLanguage,
  targetLanguage,
  isRecording,
  recordingDuration,
}) => {
  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 bg-gray-800 text-white hover:bg-gray-700 z-50"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  const refreshPage = () => {
    window.location.reload();
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    alert("Local storage cleared. The page will now reload.");
    window.location.reload();
  };

  const testSpeechSynthesis = () => {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        "This is a test of the speech synthesis feature.",
      );
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);

      console.log("Speech synthesis test started");
    } catch (error) {
      console.error("Speech synthesis test failed:", error);
      alert(`Speech synthesis test failed: ${error}`);
    }
  };

  const testTranslation = () => {
    const testText =
      "Hello, how are you today? This is a test of the translation feature.";
    document.dispatchEvent(
      new CustomEvent("debug-test-translation", { detail: testText }),
    );
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 bg-gray-800 text-white border-gray-700 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Bug className="h-5 w-5 mr-2" />
            Debug Panel
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPage}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              ×
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <h3 className="text-gray-400 font-medium">App State</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-700 p-2 rounded">
              <span className="text-gray-400">Recording:</span>{" "}
              <span className={isRecording ? "text-green-400" : "text-red-400"}>
                {isRecording ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <span className="text-gray-400">Duration:</span>{" "}
              <span className="text-white">{recordingDuration}s</span>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <span className="text-gray-400">Source Lang:</span>{" "}
              <span className="text-white">{originalLanguage}</span>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <span className="text-gray-400">Target Lang:</span>{" "}
              <span className="text-white">{targetLanguage}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-gray-400 font-medium">Original Text</h3>
          <div className="bg-gray-700 p-2 rounded max-h-20 overflow-auto">
            <pre className="text-white text-xs whitespace-pre-wrap">
              {originalText || "(empty)"}
            </pre>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-gray-400 font-medium">Translated Text</h3>
          <div className="bg-gray-700 p-2 rounded max-h-20 overflow-auto">
            <pre className="text-white text-xs whitespace-pre-wrap">
              {translatedText || "(empty)"}
            </pre>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-gray-400 font-medium">Debug Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testSpeechSynthesis}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Test Speech
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testTranslation}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Test Translation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.clear()}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Clear Console
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLocalStorage}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Clear Storage
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Check browser console for detailed logs.
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
