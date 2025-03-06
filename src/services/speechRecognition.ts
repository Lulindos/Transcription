// Speech recognition service using Web Speech API

type RecognitionCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private language: string = "en-US";
  private continuous: boolean = true;
  private interimResults: boolean = true;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.error("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    if (this.recognition) {
      this.recognition.continuous = this.continuous;
      this.recognition.interimResults = this.interimResults;
      this.recognition.lang = this.language;
    }
  }

  public setLanguage(language: string) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  public start(onResult: RecognitionCallback, onError: ErrorCallback) {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        onError("Speech recognition not supported");
        return false;
      }
    }

    try {
      this.recognition.onresult = (event) => {
        console.log("Speech recognition event:", event);

        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        const isFinal = event.results[event.results.length - 1].isFinal;
        console.log(
          `Speech recognition result: "${transcript}", isFinal: ${isFinal}`,
        );
        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event);
        onError(`Error occurred in recognition: ${event.error}`);
      };

      this.recognition.onend = () => {
        console.log("Speech recognition ended, isListening:", this.isListening);
        // Auto restart if we're still supposed to be listening
        if (this.isListening) {
          console.log("Restarting speech recognition...");
          setTimeout(() => {
            try {
              this.recognition?.start();
            } catch (error) {
              console.error("Error restarting speech recognition:", error);
            }
          }, 100);
        }
      };

      console.log("Starting speech recognition...");
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      onError(`Failed to start speech recognition: ${error}`);
      return false;
    }
  }

  public stop() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  public isSupported(): boolean {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  }
}

export default new SpeechRecognitionService();
