// Storage service for saving and retrieving transcriptions

export interface TranscriptionRecord {
  id: string;
  title: string;
  originalText: string;
  translatedText?: string;
  originalLanguage: string;
  targetLanguage?: string;
  duration: number;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

class StorageService {
  private readonly STORAGE_KEY = "audio-transcriptions";

  // Save a new transcription
  public saveTranscription(
    transcription: Omit<TranscriptionRecord, "id" | "createdAt" | "updatedAt">,
  ): TranscriptionRecord {
    const transcriptions = this.getAllTranscriptions();

    const newRecord: TranscriptionRecord = {
      ...transcription,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    transcriptions.push(newRecord);
    this.saveAllTranscriptions(transcriptions);

    return newRecord;
  }

  // Update an existing transcription
  public updateTranscription(
    id: string,
    updates: Partial<TranscriptionRecord>,
  ): TranscriptionRecord | null {
    const transcriptions = this.getAllTranscriptions();
    const index = transcriptions.findIndex((t) => t.id === id);

    if (index === -1) return null;

    const updatedRecord = {
      ...transcriptions[index],
      ...updates,
      updatedAt: Date.now(),
    };

    transcriptions[index] = updatedRecord;
    this.saveAllTranscriptions(transcriptions);

    return updatedRecord;
  }

  // Get a transcription by ID
  public getTranscription(id: string): TranscriptionRecord | null {
    const transcriptions = this.getAllTranscriptions();
    return transcriptions.find((t) => t.id === id) || null;
  }

  // Get all transcriptions
  public getAllTranscriptions(): TranscriptionRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error retrieving transcriptions from storage", error);
      return [];
    }
  }

  // Delete a transcription
  public deleteTranscription(id: string): boolean {
    const transcriptions = this.getAllTranscriptions();
    const filteredTranscriptions = transcriptions.filter((t) => t.id !== id);

    if (filteredTranscriptions.length === transcriptions.length) {
      return false; // Nothing was deleted
    }

    this.saveAllTranscriptions(filteredTranscriptions);
    return true;
  }

  // Get recent transcriptions
  public getRecentTranscriptions(limit: number = 5): TranscriptionRecord[] {
    const transcriptions = this.getAllTranscriptions();
    return transcriptions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  // Helper to save all transcriptions to storage
  private saveAllTranscriptions(transcriptions: TranscriptionRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transcriptions));
    } catch (error) {
      console.error("Error saving transcriptions to storage", error);
    }
  }

  // Generate a simple ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  // Clear all transcriptions (for testing)
  public clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default new StorageService();
