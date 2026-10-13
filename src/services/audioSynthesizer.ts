/**
 * Optional Web Speech Audio Preview Synthesizer
 * 
 * NOTE: The physical SignoVox glove handles audio playback INDEPENDENTLY
 * through its on-board DFPlayer Mini and speaker module connected to Arduino Nano.
 * 
 * This Web Audio synthesizer is provided as a dashboard preview & accessibility feature.
 */
class AudioSynthesizer {
  private enabled: boolean = true;
  private volume: number = 0.9;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer clear English voices (Natural, Google, or standard EN)
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    this.selectedVoice = naturalVoice || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  public speak(sentence: string): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.volume = this.volume;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Generates a sleek futuristic cyber chime sound effect using Web Audio API
   */
  public playAcknowledgeChime(): void {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

export const audioSynthesizer = new AudioSynthesizer();
