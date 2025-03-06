// Export service for generating PDF, TXT, and DOCX files

import { TranscriptionRecord } from "./storageService";

interface ExportOptions {
  includeTranslation: boolean;
  includeTimestamps: boolean;
  format: "pdf" | "txt" | "docx";
}

class ExportService {
  // Export transcription to the specified format
  public exportTranscription(
    transcription: TranscriptionRecord,
    options: ExportOptions,
  ): void {
    switch (options.format) {
      case "pdf":
        this.exportToPdf(transcription, options);
        break;
      case "txt":
        this.exportToTxt(transcription, options);
        break;
      case "docx":
        this.exportToDocx(transcription, options);
        break;
      default:
        console.error("Unsupported export format");
    }
  }

  // Export to PDF
  private exportToPdf(
    transcription: TranscriptionRecord,
    options: ExportOptions,
  ): void {
    // In a real implementation, you would use a library like jsPDF
    // For demo purposes, we'll just create a text file with a .pdf extension
    const content = this.generateContent(transcription, options);
    this.downloadFile(
      `${transcription.title || "Transcription"}.pdf`,
      content,
      "text/plain",
    );

    console.log("PDF export would be implemented with a library like jsPDF");
  }

  // Export to TXT
  private exportToTxt(
    transcription: TranscriptionRecord,
    options: ExportOptions,
  ): void {
    const content = this.generateContent(transcription, options);
    this.downloadFile(
      `${transcription.title || "Transcription"}.txt`,
      content,
      "text/plain",
    );
  }

  // Export to DOCX
  private exportToDocx(
    transcription: TranscriptionRecord,
    options: ExportOptions,
  ): void {
    // In a real implementation, you would use a library like docx
    // For demo purposes, we'll just create a text file with a .docx extension
    const content = this.generateContent(transcription, options);
    this.downloadFile(
      `${transcription.title || "Transcription"}.docx`,
      content,
      "text/plain",
    );

    console.log("DOCX export would be implemented with a library like docx");
  }

  // Generate content for export
  private generateContent(
    transcription: TranscriptionRecord,
    options: ExportOptions,
  ): string {
    const { includeTranslation, includeTimestamps } = options;
    const lines: string[] = [];

    // Add title
    lines.push(`TRANSCRIPTION: ${transcription.title || "Untitled"}`);
    lines.push("=".repeat(50));
    lines.push("");

    // Add metadata
    lines.push(`Date: ${new Date(transcription.createdAt).toLocaleString()}`);
    lines.push(`Duration: ${this.formatDuration(transcription.duration)}`);
    lines.push(`Original Language: ${transcription.originalLanguage}`);
    if (transcription.targetLanguage) {
      lines.push(`Target Language: ${transcription.targetLanguage}`);
    }
    lines.push("");
    lines.push("=".repeat(50));
    lines.push("");

    // Add original text
    lines.push("ORIGINAL TEXT:");
    lines.push("");
    lines.push(transcription.originalText);
    lines.push("");

    // Add translated text if requested
    if (includeTranslation && transcription.translatedText) {
      lines.push("=".repeat(50));
      lines.push("");
      lines.push("TRANSLATED TEXT:");
      lines.push("");
      lines.push(transcription.translatedText);
    }

    return lines.join("\n");
  }

  // Format duration in MM:SS
  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  // Download file
  private downloadFile(
    filename: string,
    content: string,
    contentType: string,
  ): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}

export default new ExportService();
