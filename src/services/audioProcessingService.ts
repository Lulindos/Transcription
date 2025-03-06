// Audio processing service for noise reduction and audio enhancement

class AudioProcessingService {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private noiseReductionNode: any = null; // Would be a specific node type in a real implementation
  private gainNode: GainNode | null = null;
  private isNoiseReductionEnabled: boolean = true;
  private micSensitivity: number = 1.0; // Default gain

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.error("Web Audio API is not supported in this browser", error);
    }
  }

  public async setupAudioProcessing(stream: MediaStream): Promise<MediaStream> {
    if (!this.audioContext) {
      this.initAudioContext();
      if (!this.audioContext) {
        console.error("Could not initialize audio context");
        return stream; // Return original stream if we can't process
      }
    }

    // Create source node from input stream
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);

    // Create destination node
    this.destinationNode = this.audioContext.createMediaStreamDestination();

    // Create gain node for sensitivity control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.micSensitivity;

    // In a real implementation, you would create actual noise reduction nodes
    // For now, we'll just connect source -> gain -> destination
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.destinationNode);

    return this.destinationNode.stream;
  }

  public setNoiseReduction(enabled: boolean) {
    this.isNoiseReductionEnabled = enabled;
    // In a real implementation, you would enable/disable the noise reduction node
    console.log(`Noise reduction ${enabled ? "enabled" : "disabled"}`);
  }

  public setMicSensitivity(level: number) {
    // Convert percentage (0-100) to gain value (0-2)
    this.micSensitivity = level / 50;

    if (this.gainNode) {
      this.gainNode.gain.value = this.micSensitivity;
    }

    console.log(`Mic sensitivity set to ${level}%`);
  }

  public cleanup() {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default new AudioProcessingService();
