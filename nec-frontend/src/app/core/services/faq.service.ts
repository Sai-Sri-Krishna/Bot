import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FaqEntry {
  id: number;
  question: string;
  answer: string;
  category: string;
  aliases: string[];
}

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly BASE = environment.fastApiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FaqEntry[]> {
    return this.http.get<FaqEntry[]>(`${this.BASE}/api/predefined`);
  }
}
