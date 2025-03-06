import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { FileDown, FileText, Share2 } from "lucide-react";

interface ExportPanelProps {
  transcriptionText?: string;
  translationText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  recordingDuration?: number;
  onExport?: (format: string) => void;
  onShare?: () => void;
}

const ExportPanel = ({
  transcriptionText = "This is a sample transcription text that would be exported.",
  translationText = "Esto es un texto de transcripción de muestra que se exportaría.",
  sourceLanguage = "English",
  targetLanguage = "Spanish",
  recordingDuration = 120,
  onExport = () => {},
  onShare = () => {},
}: ExportPanelProps) => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeTranslation, setIncludeTranslation] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = () => {
    onExport(exportFormat);
    setIsDialogOpen(false);
    // In a real implementation, this would trigger the PDF generation
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-4 w-full max-w-md border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Export Options</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full mb-4 bg-[#ff6600] hover:bg-[#e65c00] shadow-[0_0_10px_rgba(255,102,0,0.3)]"
            variant="default"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Transcription
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100 text-gray-900">
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format" className="text-right">
                Format
              </Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="col-span-3 bg-white border-gray-200 text-gray-800">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-100">
                  <SelectItem
                    value="pdf"
                    className="text-gray-700 hover:text-[#ff6600] hover:bg-gray-100"
                  >
                    PDF Document
                  </SelectItem>
                  <SelectItem
                    value="txt"
                    className="text-gray-700 hover:text-[#ff6600] hover:bg-gray-100"
                  >
                    Text File
                  </SelectItem>
                  <SelectItem
                    value="docx"
                    className="text-gray-700 hover:text-[#ff6600] hover:bg-gray-100"
                  >
                    Word Document
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="translation" className="text-right">
                Include Translation
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="translation"
                  checked={includeTranslation}
                  onCheckedChange={setIncludeTranslation}
                />
                <span className="text-sm text-gray-500">{targetLanguage}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timestamps" className="text-right">
                Include Timestamps
              </Label>
              <Switch
                id="timestamps"
                checked={includeTimestamps}
                onCheckedChange={setIncludeTimestamps}
                className="col-span-3"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md mb-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <FileText className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Preview</span>
            </div>
            <div className="text-xs text-gray-600">
              <p className="mb-1">• {sourceLanguage} transcription</p>
              {includeTranslation && (
                <p className="mb-1">• {targetLanguage} translation</p>
              )}
              <p className="mb-1">
                • Duration: {formatDuration(recordingDuration)}
              </p>
              {includeTimestamps && <p className="mb-1">• With timestamps</p>}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="bg-[#ff6600] hover:bg-[#e65c00] shadow-[0_0_10px_rgba(255,102,0,0.3)]"
            >
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-sm text-gray-600 mb-2">Quick Export</div>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("pdf")}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
        >
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("txt")}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
        >
          Text
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("docx")}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
        >
          Word
        </Button>
      </div>
    </div>
  );
};

export default ExportPanel;
