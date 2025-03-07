import React, { useState, useRef } from "react";
import { Upload, FileAudio, Languages, FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { languages } from "../data/languages";
import translationService from "../services/translationService";
import { generateBeautifulPDF } from "../utils/pdfExport";

interface AudioUploaderProps {
  onClose?: () => void;
}

const AudioUploader = ({ onClose }: AudioUploaderProps) => {
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState({ code: "en-US", name: "English" });
  const [targetLanguage, setTargetLanguage] = useState({ code: "es-ES", name: "Spanish" });
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventName, setEventName] = useState("Audio Translation");
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setEventName(selectedFile.name.split('.')[0] || "Audio Translation");
      setError(null);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Process the audio file
  const processAudio = async () => {
    if (!file) {
      setError("Please select an audio file first");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("language", sourceLanguage.code);
      
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate transcription with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a transcription result based on the filename
      const simulatedText = `This is a simulated transcription of the audio file "${file.name}". 
In a real implementation, this would be the actual transcription of the audio content.
The transcription would be in ${sourceLanguage.name} as selected by the user.`;
      
      setOriginalText(simulatedText);
      setProcessingTime(Date.now() - startTime);
      
      // Now translate the text
      await translateText(simulatedText);
      
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Failed to process audio file. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingComplete(true);
    }
  };
  
  // Translate the transcribed text
  const translateText = async (text: string) => {
    if (!text) return;
    
    setIsTranslating(true);
    try {
      // Use the translation service
      const result = await translationService.translateText(
        text,
        sourceLanguage,
        targetLanguage
      );
      
      setTranslatedText(result);
    } catch (err) {
      console.error("Translation error:", err);
      setError("Failed to translate text. Please try again.");
      // Fallback translation for demo purposes
      setTranslatedText(`[Translated version of the text would appear here in ${targetLanguage.name}]`);
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      // Format the current date
      const currentDate = new Date().toLocaleDateString();
      
      // Create the translation data object
      const translationData = {
        eventName: eventName,
        date: currentDate,
        originalText: originalText,
        translatedText: translatedText,
        sourceLanguage: sourceLanguage.name,
        targetLanguage: targetLanguage.name,
        duration: `${Math.floor(processingTime / 1000)} seconds`
      };
      
      // Generate the PDF
      await generateBeautifulPDF(translationData);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileAudio className="mr-2 h-6 w-6 text-orange-500" />
            Audio File Translation
          </CardTitle>
          <CardDescription>
            Upload an audio file, select languages, and get a translation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter a name for this translation"
            />
          </div>
          
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Audio File</Label>
            <div 
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
              
              {file ? (
                <>
                  <FileAudio className="h-10 w-10 text-green-500 mb-2" />
                  <p className="font-medium text-green-600">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Change File
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="font-medium">Click to upload audio file</p>
                  <p className="text-sm text-gray-500 mt-1">
                    MP3, WAV, M4A files supported
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-language">Source Language</Label>
              <Select 
                value={sourceLanguage.code} 
                onValueChange={(value) => {
                  const lang = languages.find(l => l.code === value);
                  if (lang) setSourceLanguage(lang);
                }}
              >
                <SelectTrigger id="source-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-language">Target Language</Label>
              <Select 
                value={targetLanguage.code} 
                onValueChange={(value) => {
                  const lang = languages.find(l => l.code === value);
                  if (lang) setTargetLanguage(lang);
                }}
              >
                <SelectTrigger id="target-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Process Button */}
          <Button 
            onClick={processAudio} 
            disabled={!file || isProcessing || isTranslating}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {isProcessing || isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isProcessing ? "Processing Audio..." : "Translating..."}
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                Process and Translate
              </>
            )}
          </Button>
          
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Results Section */}
          {processingComplete && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Text */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    Original Text ({sourceLanguage.name})
                  </Label>
                  <Textarea 
                    value={originalText} 
                    readOnly 
                    className="min-h-[200px] bg-gray-50"
                  />
                </div>
                
                {/* Translated Text */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Translated Text ({targetLanguage.name})
                  </Label>
                  <Textarea 
                    value={translatedText} 
                    readOnly 
                    className="min-h-[200px] bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Processing time: {(processingTime / 1000).toFixed(2)} seconds
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          {processingComplete && (
            <Button 
              onClick={handleExportPDF}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          )}
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AudioUploader;
