import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'local' | 'gemini' | 'fallback' | 'welcome';
  matchedQuestion?: string;
}

export interface ChatResponse {
  answer: string;
  source: string;
  matched_question?: string;
}

export interface HistoryItem {
  role: 'user' | 'model';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly BASE = environment.fastApiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, history: HistoryItem[]): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.BASE}/api/chat`, { message, history });
  }

  saveHistory(isGuest: boolean, messages: Partial<Message>[], userId?: number): Observable<any> {
    return this.http.post(`${this.BASE}/api/chat/history`, {
      is_guest: isGuest,
      user_id: userId ?? null,
      messages: messages.map(m => ({
        sender: m.sender === 'user' ? 'USER' : 'ASSISTANT',
        text: m.text,
        source: (m.source ?? '').toUpperCase() || null
      }))
    });
  }

  makeWelcomeMessage(): Message {
    return {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hello! Welcome to Narasaraopeta Engineering College (NEC) AI Voice Assistant. I can assist you with anything related to admissions, branch choices, fee structures, eligibilities, or quota options. Tap the mic to speak or look through our Suggested FAQs!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'welcome'
    };
  }
}
