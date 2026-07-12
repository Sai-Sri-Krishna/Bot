import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message, HistoryItem } from '../../core/services/chat.service';
import { SpeechService } from '../../core/services/speech.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-wrapper">
      <!-- Messages area -->
      <div class="messages-area" #messagesArea>
        <div *ngFor="let msg of messages; trackBy: trackMsg"
             class="msg-row"
             [class.user-row]="msg.sender === 'user'"
             [class.ai-row]="msg.sender === 'assistant'">

          <!-- AI Avatar -->
          <div class="avatar ai-avatar" *ngIf="msg.sender === 'assistant'">
            <img src="nec_ai_avatar.png" alt="NEC AI" class="avatar-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/>
            <div class="avatar-fallback" style="display:none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
              </svg>
            </div>
          </div>

          <div class="bubble-group">
            <div class="bubble"
                 [class.user-bubble]="msg.sender === 'user'"
                 [class.ai-bubble]="msg.sender === 'assistant'"
                 [class.speaking]="speakingMsgId === msg.id">
              <p>{{ msg.text }}</p>
              <div class="source-tag" *ngIf="msg.source && msg.source !== 'welcome'">
                <span [class]="'tag tag-' + msg.source">{{ sourceLabel(msg.source) }}</span>
              </div>
            </div>
            <span class="timestamp">{{ msg.timestamp }}</span>
          </div>

          <!-- User Avatar -->
          <div class="avatar user-avatar-icon" *ngIf="msg.sender === 'user'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>

        <!-- Typing indicator -->
        <div class="msg-row ai-row" *ngIf="isLoading">
          <div class="avatar ai-avatar">
            <img src="nec_ai_avatar.png" alt="NEC AI" class="avatar-img"
                 onerror="this.style.display='none'"/>
          </div>
          <div class="bubble ai-bubble typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="input-section">
        <!-- Listening banner -->
        <div class="listening-banner" *ngIf="isListening">
          <div class="sound-bars">
            <div class="bar"></div><div class="bar"></div>
            <div class="bar"></div><div class="bar"></div>
            <div class="bar"></div>
          </div>
          <span>Listening... speak now</span>
          <button class="stop-btn" (click)="toggleMic()">Stop</button>
        </div>

        <div class="error-pill" *ngIf="speechError" (click)="speechError = ''">
          ⚠ {{ speechError }} &nbsp;✕
        </div>

        <div class="input-bar">
          <!-- Mic button -->
          <button id="chat-mic-btn"
                  class="icon-btn mic-btn"
                  [class.active]="isListening"
                  [class.unsupported]="!speechSupported"
                  (click)="toggleMic()"
                  [title]="speechSupported ? (isListening ? 'Stop listening' : 'Tap to speak') : 'Speech not supported in this browser'">
            <!-- Mic icon -->
            <svg *ngIf="!isListening" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8"  y1="23" x2="16" y2="23"/>
            </svg>
            <!-- Stop icon when listening -->
            <svg *ngIf="isListening" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>

          <!-- Text input -->
          <input id="chat-text-input"
                 class="text-input"
                 type="text"
                 [(ngModel)]="textInput"
                 (keyup.enter)="sendText()"
                 placeholder="Ask about admissions, courses, fees..."
                 [disabled]="isLoading || isListening"/>

          <!-- Send button -->
          <button id="chat-send-btn"
                  class="icon-btn send-btn"
                  (click)="sendText()"
                  [disabled]="!textInput.trim() || isLoading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>

          <!-- Mute TTS -->
          <button id="chat-mute-btn"
                  class="icon-btn mute-btn"
                  [class.muted]="muted"
                  (click)="toggleMute()"
                  title="Toggle voice output">
            <svg *ngIf="!muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            <svg *ngIf="muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9"  x2="17" y2="15"/>
              <line x1="17" y1="9"  x2="23" y2="15"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-wrapper {
      display: flex; flex-direction: column; height: 100%;
      background: transparent; position: relative;
    }

    /* Messages */
    .messages-area {
      flex: 1; overflow-y: auto; padding: 1.25rem 1rem;
      display: flex; flex-direction: column; gap: 1.1rem;
      scroll-behavior: smooth;
    }
    .messages-area::-webkit-scrollbar { width: 4px; }
    .messages-area::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 2px; }

    .msg-row {
      display: flex; gap: 0.6rem; align-items: flex-end;
    }
    .user-row { flex-direction: row-reverse; }

    /* Avatars */
    .avatar {
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
    }
    .ai-avatar {
      background: linear-gradient(135deg, #312e81, #4c1d95);
      border: 2px solid rgba(99,102,241,0.4);
      box-shadow: 0 0 12px rgba(99,102,241,0.3);
    }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .avatar-fallback svg { width: 1.1rem; height: 1.1rem; color: #818cf8; }
    .user-avatar-icon {
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      border: 2px solid rgba(99,102,241,0.3);
    }
    .user-avatar-icon svg { width: 1rem; height: 1rem; color: white; }

    /* Bubbles */
    .bubble-group {
      display: flex; flex-direction: column; max-width: 72%; gap: 0.2rem;
    }
    .user-row .bubble-group { align-items: flex-end; }

    .bubble {
      padding: 0.75rem 1rem; border-radius: 1.1rem; position: relative;
      animation: bubble-in 0.2s ease;
    }
    @keyframes bubble-in {
      from { opacity: 0; transform: translateY(6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .bubble p { margin: 0; font-size: 0.88rem; line-height: 1.65; color: white; white-space: pre-wrap; }
    .ai-bubble {
      background: rgba(30,27,75,0.85);
      border: 1px solid rgba(99,102,241,0.2);
      border-bottom-left-radius: 0.3rem;
      backdrop-filter: blur(8px);
    }
    .user-bubble {
      background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
      border-bottom-right-radius: 0.3rem;
      box-shadow: 0 4px 15px rgba(99,102,241,0.3);
    }
    .bubble.speaking {
      box-shadow: 0 0 0 2px #818cf8, 0 0 20px rgba(99,102,241,0.4);
    }

    /* Source tags */
    .source-tag { margin-top: 0.4rem; }
    .tag {
      font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em;
      padding: 0.15rem 0.55rem; border-radius: 99px; text-transform: uppercase;
    }
    .tag-local    { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .tag-gemini   { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
    .tag-fallback { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
    .tag-welcome  { display: none; }

    .timestamp { font-size: 0.62rem; color: #374151; padding: 0 0.25rem; }

    /* Typing dots */
    .typing { display: flex; gap: 5px; align-items: center; padding: 0.9rem 1.1rem; min-width: 56px; }
    .typing span {
      width: 7px; height: 7px; background: #6366f1; border-radius: 50%;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%,80%,100% { transform:scale(0.65); opacity:0.4; }
      40%          { transform:scale(1);    opacity:1; }
    }

    /* Input section */
    .input-section {
      padding: 0.6rem 1rem 0.9rem;
      border-top: 1px solid rgba(99,102,241,0.1);
      background: rgba(10,15,30,0.7);
      backdrop-filter: blur(12px);
    }

    /* Listening banner */
    .listening-banner {
      display: flex; align-items: center; gap: 0.75rem;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 0.75rem; padding: 0.5rem 0.9rem; margin-bottom: 0.6rem;
    }
    .sound-bars {
      display: flex; align-items: flex-end; gap: 3px; height: 18px;
    }
    .bar {
      width: 3px; background: #ef4444; border-radius: 2px;
      animation: sound-wave 0.8s infinite ease-in-out;
    }
    .bar:nth-child(1) { height:6px;  animation-delay:0s; }
    .bar:nth-child(2) { height:12px; animation-delay:0.1s; }
    .bar:nth-child(3) { height:18px; animation-delay:0.2s; }
    .bar:nth-child(4) { height:10px; animation-delay:0.3s; }
    .bar:nth-child(5) { height:6px;  animation-delay:0.4s; }
    @keyframes sound-wave {
      0%,100% { transform: scaleY(0.5); opacity:0.5; }
      50%      { transform: scaleY(1);   opacity:1; }
    }
    .listening-banner span { flex:1; font-size:0.82rem; color:#f87171; font-weight:600; }
    .stop-btn {
      font-size: 0.72rem; font-weight: 700; color: #f87171;
      background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 0.4rem; padding: 0.2rem 0.6rem; cursor: pointer;
    }

    .error-pill {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      color: #f87171; font-size: 0.75rem; border-radius: 99px;
      padding: 0.3rem 0.9rem; text-align: center; margin-bottom: 0.5rem;
      cursor: pointer; transition: opacity 0.2s;
    }

    /* Input bar */
    .input-bar { display: flex; gap: 0.5rem; align-items: center; }
    .text-input {
      flex: 1; padding: 0.7rem 1rem;
      background: rgba(30,27,75,0.6);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 0.875rem; color: white; font-size: 0.88rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .text-input:focus {
      outline: none; border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }
    .text-input::placeholder { color: #374151; }
    .text-input:disabled { opacity: 0.5; cursor: not-allowed; }

    .icon-btn {
      width: 2.6rem; height: 2.6rem; border-radius: 0.75rem; border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.18s; flex-shrink: 0;
    }
    .icon-btn svg { width: 1.1rem; height: 1.1rem; }

    .mic-btn {
      background: rgba(99,102,241,0.12);
      color: #818cf8;
      border: 1px solid rgba(99,102,241,0.25);
    }
    .mic-btn:hover:not(.unsupported) {
      background: rgba(99,102,241,0.22); transform: scale(1.05);
    }
    .mic-btn.active {
      background: #ef4444; color: white; border-color: #ef4444;
      animation: mic-pulse 1.2s infinite;
    }
    .mic-btn.unsupported { opacity: 0.35; cursor: not-allowed; }
    @keyframes mic-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
      50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
    }

    .send-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }
    .send-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.05); }
    .send-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

    .mute-btn {
      background: rgba(30,27,75,0.5);
      color: #4b5563;
      border: 1px solid rgba(99,102,241,0.12);
    }
    .mute-btn:hover { color: #818cf8; background: rgba(99,102,241,0.1); }
    .mute-btn.muted { color: #f59e0b; border-color: rgba(245,158,11,0.3); }

    /* Responsiveness for mobile and tablet views */
    @media (max-width: 768px) {
      .bubble-group { max-width: 88% !important; }
      .messages-area { padding: 0.8rem 0.6rem !important; gap: 0.85rem !important; }
      .avatar { width: 1.9rem !important; height: 1.9rem !important; }
      .input-section { padding: 0.5rem 0.6rem 0.7rem !important; }
      .icon-btn { width: 2.3rem !important; height: 2.3rem !important; }
      .text-input { padding: 0.6rem 0.8rem !important; font-size: 0.82rem !important; }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesArea') messagesArea!: ElementRef;

  messages:    Message[] = [];
  textInput    = '';
  isLoading    = false;
  isListening  = false;
  muted        = false;
  speechSupported = false;
  speechError  = '';
  speakingMsgId = '';

  private chatHistory: HistoryItem[] = [];
  private shouldScroll = false;
  private welcomeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private chatService: ChatService,
    private speechService: SpeechService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.speechSupported = this.speechService.isSupported;
    const welcome = this.chatService.makeWelcomeMessage();
    this.messages   = [welcome];
    this.shouldScroll = true;
    // Delay so voice loads; store ref so sendFaq() can cancel it
    this.welcomeTimer = setTimeout(() => {
      this.welcomeTimer = null;
      this.speakMsg(welcome);
    }, 800);
  }

  ngOnDestroy() {
    this.speechService.cancelSpeech();
    this.speechService.stopListening();
    if (this.welcomeTimer) clearTimeout(this.welcomeTimer);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollBottom();
      this.shouldScroll = false;
    }
  }

  trackMsg(_: number, msg: Message) { return msg.id; }

  toggleMic() {
    if (!this.speechSupported) return;

    if (this.isListening) {
      this.speechService.stopListening();
      this.isListening = false;
      return;
    }

    this.speechError = '';
    this.isListening = true; // set immediately for instant UI feedback

    this.speechService.startListening(
      // ✅ onResult — NgZone handled in service
      (transcript) => {
        this.isListening  = false;
        this.textInput    = transcript;
        this.shouldScroll = true;
        this.sendText();
      },
      // onStart
      () => { this.isListening = true; },
      // onEnd
      () => { this.isListening = false; },
      // onError
      (err) => {
        this.isListening = false;
        this.speechError = err;
      }
    );
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.speechService.cancelSpeech();
  }

  sendText() {
    const text = this.textInput.trim();
    if (!text || this.isLoading) return;

    this.textInput    = '';
    this.isLoading    = true;
    this.shouldScroll = true;

    this.addMessage('user', text);
    this.chatHistory.push({ role: 'user', content: text });

    this.chatService.sendMessage(text, this.chatHistory).subscribe({
      next: (res) => {
        this.isLoading    = false;
        this.shouldScroll = true;
        const msg = this.addMessage('assistant', res.answer, res.source as any, res.matched_question);
        this.chatHistory.push({ role: 'model', content: res.answer });
        this.speakMsg(msg);
      },
      error: () => {
        this.isLoading    = false;
        this.shouldScroll = true;
        const msg = this.addMessage('assistant',
          "I'm having trouble connecting right now. Please check the backend is running and try again.",
          'fallback');
        this.speakMsg(msg);
      }
    });
  }

  /** Called from MainLayout when user clicks a FAQ question */
  sendFaq(question: string) {
    // Cancel the pending welcome speech so only the FAQ answer plays
    if (this.welcomeTimer) {
      clearTimeout(this.welcomeTimer);
      this.welcomeTimer = null;
    }
    this.speechService.cancelSpeech();
    this.textInput = question;
    this.sendText();
  }

  sourceLabel(source?: string): string {
    const map: Record<string, string> = {
      local:    '✓ FAQ',
      gemini:   '✦ AI',
      fallback: '⚡ Offline'
    };
    return map[source ?? ''] ?? '';
  }

  private addMessage(
    sender: 'user' | 'assistant',
    text: string,
    source?: Message['source'],
    matchedQuestion?: string
  ): Message {
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender, text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source, matchedQuestion
    };
    this.messages = [...this.messages, msg]; // trigger change detection
    return msg;
  }

  private speakMsg(msg: Message) {
    if (this.muted) return;
    this.speakingMsgId = msg.id;
    this.speechService.speak(msg.text, this.muted);
    this.speechService.onSpeakingChange(speaking => {
      if (!speaking) this.speakingMsgId = '';
    });
  }

  private scrollBottom() {
    try {
      const el = this.messagesArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
