import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private recognition: any = null;
  private recognitionSupported = false;
  private _voices: SpeechSynthesisVoice[] = [];

  constructor(private ngZone: NgZone) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognitionSupported = true;
      const rec = new SpeechRecognition();
      rec.continuous      = false;
      rec.interimResults  = false;
      rec.lang            = 'en-IN';
      rec.maxAlternatives = 1;
      this.recognition    = rec;
    }

    // Pre-load voices — Chrome loads them async
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        this._voices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  get isSupported(): boolean { return this.recognitionSupported; }

  /**
   * Start speech recognition.
   * All callbacks are run inside Angular's NgZone so that
   * change detection fires correctly after a browser API callback.
   */
  startListening(
    onResult: (transcript: string) => void,
    onStart:  () => void,
    onEnd:    () => void,
    onError:  (msg: string) => void
  ): void {
    if (!this.recognition) { onError('Speech recognition not supported.'); return; }

    this.recognition.onstart = () => {
      this.ngZone.run(() => onStart());
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => onEnd());
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        this.ngZone.run(() => onResult(transcript));
      } else {
        this.ngZone.run(() => onError('Could not understand. Please try again.'));
      }
    };

    this.recognition.onerror = (event: any) => {
      this.ngZone.run(() => {
        onEnd(); // always reset listening state
        switch (event.error) {
          case 'no-speech':
            onError('No speech detected. Tap the mic and speak clearly.');
            break;
          case 'not-allowed':
          case 'permission-denied':
            onError('Microphone blocked. Allow mic access in your browser and reload.');
            break;
          case 'network':
            onError('Network error. Speech recognition needs internet access.');
            break;
          case 'aborted':
            break; // user stopped — no error message needed
          default:
            onError(`Mic error: ${event.error}`);
        }
      });
    };

    try {
      this.recognition.abort(); // reset any lingering state
    } catch {}

    setTimeout(() => {
      try { this.recognition.start(); } catch (e) {
        this.ngZone.run(() => onError('Could not start mic. Try again.'));
      }
    }, 100);
  }

  stopListening(): void {
    try { this.recognition?.abort(); } catch {}
  }

  /**
   * Speak text using the best available female voice.
   * Waits for voices to be available if not yet loaded.
   */
  speak(text: string, muted: boolean, rate = 0.95): void {
    if (!('speechSynthesis' in window) || muted) return;
    window.speechSynthesis.cancel();

    const cleaned = this._cleanForTTS(text);
    const utterance = new SpeechSynthesisUtterance(cleaned);

    utterance.voice  = this._pickFemaleVoice();
    utterance.rate   = rate;
    utterance.pitch  = 1.1;
    utterance.volume = 1.0;

    // If voices still not loaded, retry once after load
    if (!utterance.voice) {
      window.speechSynthesis.onvoiceschanged = () => {
        this._voices = window.speechSynthesis.getVoices();
        utterance.voice = this._pickFemaleVoice();
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }

  cancelSpeech(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  onSpeakingChange(cb: (speaking: boolean) => void): void {
    const interval = setInterval(() => {
      const speaking = window.speechSynthesis.speaking;
      cb(speaking);
      if (!speaking) clearInterval(interval);
    }, 250);
  }

  private _pickFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = this._voices.length ? this._voices : window.speechSynthesis.getVoices();

    // Priority list of known good female voices (Windows + Chrome + macOS)
    const femalePreference = [
      'microsoft zira',        // Windows — very good
      'microsoft hazel',       // Windows UK
      'google uk english female',
      'google us english',     // often female default in Chrome
      'samantha',              // macOS
      'karen',                 // macOS Australian
      'moira',                 // macOS Irish
      'tessa',                 // macOS South African
      'veena',                 // macOS Indian English ← best for NEC context
      'fiona',
    ];

    for (const pref of femalePreference) {
      const match = voices.find(v => v.name.toLowerCase().includes(pref));
      if (match) return match;
    }

    // Fallback: any English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  }

  private _cleanForTTS(text: string): string {
    return text
      .replace(/admissions\.nrtec\.in/gi, 'admissions dot n r t e c dot in')
      .replace(/admissions@nrtec\.in/gi,  'admissions at n r t e c dot in')
      .replace(/nrtec\.in/gi,             'n r t e c dot in')
      .replace(/CSE-AI\b/gi,              'C S E Artificial Intelligence')
      .replace(/CSE-Cyber/gi,             'C S E Cyber Security')
      .replace(/CSE-DS/gi,                'C S E Data Science')
      .replace(/M\.Tech/gi,               'M Tech')
      .replace(/B\.Tech/gi,               'B Tech')
      .replace(/10\+2/g,                  'ten plus two')
      .replace(/(\d{3})(\d{3})(\d{4})/g, '$1, $2, $3') // add natural spacing to phone numbers (e.g., 9154686203 -> 915, 468, 6203)
      .replace(/AICTE/g,                  'A I C T E')
      .replace(/NAAC/g,                   'N A A C')
      .replace(/JNTUK/g,                  'J N T U K')
      .replace(/APSCHE/g,                 'A P S C H E')
      .replace(/EAPCET/g,                 'E A P C E T')
      .replace(/APICET/g,                 'A P I C E T')
      .replace(/PGECET/g,                 'P G E C E T');
  }
}
