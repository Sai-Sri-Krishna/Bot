import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechService } from '../../core/services/speech.service';
import { ChatService } from '../../core/services/chat.service';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

@Component({
  selector: 'app-voice-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="voice-dashboard-container">
      <!-- Info / Intro -->
      <div class="info-header">
        <h2>Voice-Only Assistant</h2>
        <p>Talk directly with the NEC AI Guide. Responses will be spoken back to you in voice only.</p>
      </div>

      <!-- Main Visualizer Area -->
      <div class="interactive-area">
        <!-- Ambient Background Glow -->
        <div class="glow-ring" [class]="state"></div>

        <!-- Waveform visualizer -->
        <div class="visualizer-bars" [class.active]="state === 'listening' || state === 'speaking'">
          <div class="bar" *ngFor="let b of bars; let i = index"
               [style.animation-delay]="(i * 0.06) + 's'"
               [class]="state"></div>
        </div>

        <!-- Big Mic Button -->
        <button class="voice-btn" 
                [class]="state" 
                [disabled]="!micSupported"
                (click)="onMicClick()"
                [title]="micSupported ? 'Tap to speak' : 'Microphone not supported'">
          <div class="voice-btn-inner">
            <!-- Mic icon -->
            <svg *ngIf="state === 'idle' || state === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8"  y1="23" x2="16" y2="23"/>
            </svg>
            <!-- Listening / Stop icon -->
            <svg *ngIf="state === 'listening'" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <!-- Thinking spinner -->
            <div *ngIf="state === 'thinking'" class="thinking-spinner"></div>
            <!-- Speaking waveform or speaker icon -->
            <svg *ngIf="state === 'speaking'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </div>
        </button>

        <!-- Status Label -->
        <div class="status-box">
          <span class="status-label" [class]="state">{{ statusText }}</span>
          <p class="transcript-box" *ngIf="transcript">
            <span class="bubble-speech">"{{ transcript }}"</span>
          </p>
          <p class="error-box" *ngIf="state === 'error' && errorMessage">
            ⚠️ {{ errorMessage }}
          </p>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="dashboard-controls">
        <button class="ctrl-btn mute-btn" [class.muted]="muted" (click)="toggleMute()">
          <span class="icon">{{ muted ? '🔇' : '🔊' }}</span>
          {{ muted ? 'Muted' : 'Voice Enabled' }}
        </button>

        <button class="ctrl-btn reset-btn" (click)="resetAll()" [disabled]="state === 'idle'">
          <span class="icon">🔄</span>
          Reset State
        </button>
      </div>
    </div>
  `,
  styles: [`
    .voice-dashboard-container {
      display: flex; flex-direction: column; align-items: center; justify-content: space-between;
      height: 100%; padding: 2rem; box-sizing: border-box;
      background: transparent; overflow: hidden;
    }

    .info-header { text-align: center; max-width: 460px; margin-bottom: 1rem; }
    .info-header h2 { font-size: 1.25rem; font-weight: 800; color: white; margin: 0 0 0.4rem; }
    .info-header p  { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin: 0; }

    /* Interactive visual area */
    .interactive-area {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      position: relative; width: 100%; max-width: 500px;
    }

    /* Glowing ambient ring behind the button */
    .glow-ring {
      position: absolute; width: 140px; height: 140px; border-radius: 50%;
      filter: blur(24px); opacity: 0.15; transition: all 0.5s ease;
      z-index: 0; pointer-events: none;
    }
    .glow-ring.idle      { background: #6366f1; }
    .glow-ring.listening { background: #ef4444; opacity: 0.35; width: 180px; height: 180px; }
    .glow-ring.thinking  { background: #a855f7; opacity: 0.25; }
    .glow-ring.speaking  { background: #10b981; opacity: 0.35; width: 170px; height: 170px; }
    .glow-ring.error     { background: #ef4444; }

    /* Main Voice Button */
    .voice-btn {
      position: relative; z-index: 10;
      width: 100px; height: 100px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      padding: 3px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15);
      margin-bottom: 2rem;
    }
    .voice-btn:hover:not(:disabled) {
      transform: scale(1.06);
      box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 0 2px rgba(99,102,241,0.3);
    }
    .voice-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .voice-btn-inner {
      width: 100%; height: 100%; border-radius: 50%;
      background: #0f172a; display: flex; align-items: center; justify-content: center;
      transition: background 0.3s;
    }
    .voice-btn-inner svg { width: 2rem; height: 2rem; color: #818cf8; transition: all 0.3s; }

    /* Active States */
    .voice-btn.listening {
      animation: button-pulse-listening 1.4s infinite alternate;
    }
    .voice-btn.listening .voice-btn-inner { background: #ef4444; }
    .voice-btn.listening svg { color: white; }

    .voice-btn.speaking {
      animation: button-pulse-speaking 1.4s infinite alternate;
    }
    .voice-btn.speaking .voice-btn-inner { background: #10b981; }
    .voice-btn.speaking svg { color: white; }

    @keyframes button-pulse-listening {
      0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
      100% { box-shadow: 0 0 0 16px rgba(239,68,68,0); }
    }
    @keyframes button-pulse-speaking {
      0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
      100% { box-shadow: 0 0 0 16px rgba(16,185,129,0); }
    }

    /* Thinking spinner */
    .thinking-spinner {
      width: 2.2rem; height: 2.2rem;
      border: 3px solid rgba(139,92,246,0.25);
      border-top-color: #a855f7; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Sound waveform visualizer */
    .visualizer-bars {
      display: flex; gap: 4px; height: 40px; align-items: center;
      position: absolute; top: 15%; pointer-events: none; opacity: 0;
      transition: opacity 0.3s ease;
    }
    .visualizer-bars.active { opacity: 1; }
    .bar {
      width: 4px; height: 6px; border-radius: 2px; background: rgba(99,102,241,0.2);
    }
    .visualizer-bars.active .bar.listening {
      background: #f87171;
      animation: wave-play 0.7s infinite alternate ease-in-out;
    }
    .visualizer-bars.active .bar.speaking {
      background: #34d399;
      animation: wave-play 0.7s infinite alternate ease-in-out;
    }
    @keyframes wave-play {
      from { height: 6px; }
      to   { height: 38px; }
    }
    .bar:nth-child(odd) { animation-delay: 0.1s !important; }
    .bar:nth-child(even) { animation-delay: 0.25s !important; }

    /* Status text boxes */
    .status-box { text-align: center; min-height: 90px; max-width: 320px; z-index: 10; }
    .status-label {
      font-size: 0.85rem; font-weight: 800; letter-spacing: 0.08em;
      text-transform: uppercase; color: #475569; transition: color 0.3s;
    }
    .status-label.listening { color: #f87171; }
    .status-label.thinking  { color: #a855f7; }
    .status-label.speaking  { color: #34d399; }
    .status-label.error     { color: #ef4444; }

    .transcript-box { margin-top: 0.6rem; animation: fade-in 0.3s ease; }
    .bubble-speech {
      font-size: 0.85rem; line-height: 1.5; color: #94a3b8;
      font-style: italic; display: inline-block; padding: 0 1rem;
    }
    @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .error-box { margin-top: 0.6rem; font-size: 0.78rem; color: #f87171; }

    /* Controls */
    .dashboard-controls {
      display: flex; gap: 0.75rem; width: 100%; justify-content: center;
      margin-top: 1rem;
    }
    .ctrl-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1.1rem; border-radius: 0.75rem; border: none;
      background: rgba(30,27,75,0.5); border: 1px solid rgba(99,102,241,0.15);
      color: #94a3b8; font-size: 0.8rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s;
    }
    .ctrl-btn:hover:not(:disabled) {
      background: rgba(99,102,241,0.12); color: white; border-color: rgba(99,102,241,0.3);
    }
    .ctrl-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .mute-btn.muted {
      color: #fbbf24; border-color: rgba(245,158,11,0.3);
      background: rgba(245,158,11,0.06);
    }
    .ctrl-btn .icon { font-size: 0.95rem; }
  `]
})
export class VoiceDashboardComponent implements OnDestroy {
  state: VoiceState = 'idle';
  transcript = '';
  errorMessage = '';
  muted = false;
  micSupported = false;
  bars = Array(15).fill(0);

  get statusText(): string {
    const map: Record<VoiceState, string> = {
      idle: 'Tap mic to speak',
      listening: 'Listening to you...',
      thinking: 'Analyzing query...',
      speaking: 'Assistant speaking',
      error: 'Speech error'
    };
    return map[this.state];
  }

  constructor(
    private speech: SpeechService,
    private chat: ChatService
  ) {
    this.micSupported = this.speech.isSupported;
  }

  ngOnDestroy() {
    this.speech.cancelSpeech();
    this.speech.stopListening();
  }

  onMicClick() {
    if (this.state === 'listening') {
      this.speech.stopListening();
      this.state = 'idle';
      return;
    }

    this.speech.cancelSpeech();
    this.errorMessage = '';
    this.transcript = '';
    this.state = 'listening';

    this.speech.startListening(
      // onResult
      (heardText) => {
        this.transcript = heardText;
        this.fetchAnswer(heardText);
      },
      // onStart
      () => {
        this.state = 'listening';
      },
      // onEnd
      () => {
        if (this.state === 'listening') {
          this.state = 'idle';
        }
      },
      // onError
      (err) => {
        this.state = 'error';
        this.errorMessage = err;
      }
    );
  }

  fetchAnswer(query: string) {
    this.state = 'thinking';

    // Simple single-query history (voice dashboard acts stateless, voice-only)
    this.chat.sendMessage(query, [{ role: 'user', content: query }]).subscribe({
      next: (res) => {
        this.state = 'speaking';
        this.speech.speak(res.answer, this.muted);
        this.speech.onSpeakingChange((speaking) => {
          if (!speaking && this.state === 'speaking') {
            this.state = 'idle';
          }
        });
      },
      error: () => {
        this.state = 'error';
        this.errorMessage = 'Could not fetch response. Verify API server is running.';
      }
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.speech.cancelSpeech();
      if (this.state === 'speaking') {
        this.state = 'idle';
      }
    }
  }

  resetAll() {
    this.speech.cancelSpeech();
    this.speech.stopListening();
    this.state = 'idle';
    this.transcript = '';
    this.errorMessage = '';
  }
}
