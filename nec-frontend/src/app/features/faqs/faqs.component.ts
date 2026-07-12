import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqService, FaqEntry } from '../../core/services/faq.service';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="faqs-wrapper">
      <div class="faq-header">
        <h2>Suggested Questions</h2>
        <p>Browse frequently asked questions or click to ask the assistant</p>
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input id="faq-search" class="search-input" type="text"
                 [(ngModel)]="searchTerm" (ngModelChange)="filterFaqs()" placeholder="Search questions..."/>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="skeleton" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>

      <!-- Error -->
      <div class="error-state" *ngIf="error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
        <button (click)="load()">Retry</button>
      </div>

      <!-- Category groups -->
      <div *ngIf="!loading && !error">
        <div class="category-section" *ngFor="let cat of categories">
          <div class="category-header" (click)="toggleCategory(cat)">
            <span class="cat-name">{{ cat }}</span>
            <span class="cat-count">{{ getCatFaqs(cat).length }}</span>
            <svg class="chevron" [class.open]="openCategories.has(cat)"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          <div class="faq-list" [class.open]="openCategories.has(cat)">
            <div class="faq-item" *ngFor="let faq of getCatFaqs(cat)"
                 [class.expanded]="expandedId === faq.id"
                 (click)="toggleExpand(faq.id)">
              <div class="faq-question">
                <span>{{ faq.question }}</span>
                <div class="faq-actions" (click)="$event.stopPropagation()">
                  <button class="ask-btn" (click)="askQuestion(faq.question)" title="Ask assistant">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="faq-answer" [class.show]="expandedId === faq.id">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredFaqs.length === 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>No questions match "<strong>{{ searchTerm }}</strong>"</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .faqs-wrapper { height: 100%; overflow-y: auto; padding: 1rem; }
    .faqs-wrapper::-webkit-scrollbar { width: 4px; }
    .faqs-wrapper::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
    .faq-header { margin-bottom: 1.25rem; }
    .faq-header h2 { font-size: 1.1rem; font-weight: 800; color: white; margin: 0 0 0.25rem; }
    .faq-header p  { font-size: 0.8rem; color: #4b5563; margin: 0 0 0.75rem; }
    .search-wrap   { position: relative; }
    .search-icon   { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 0.9rem; height: 0.9rem; color: #4b5563; }
    .search-input  {
      width: 100%; padding: 0.6rem 0.75rem 0.6rem 2.25rem;
      background: rgba(30,27,75,0.5); border: 1px solid rgba(99,102,241,0.2);
      border-radius: 0.625rem; color: white; font-size: 0.82rem;
      transition: border-color 0.2s; box-sizing: border-box;
    }
    .search-input:focus { outline: none; border-color: #6366f1; }
    .search-input::placeholder { color: #374151; }
    /* Skeleton */
    .skeleton {
      height: 3rem; background: linear-gradient(90deg, rgba(99,102,241,0.08) 25%, rgba(99,102,241,0.15) 50%, rgba(99,102,241,0.08) 75%);
      background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 0.75rem; margin-bottom: 0.75rem;
    }
    @keyframes shimmer { 0%{background-position:200%} 100%{background-position:-200%} }
    /* Error */
    .error-state { text-align: center; padding: 2rem; color: #f87171; }
    .error-state svg { width: 2rem; height: 2rem; margin: 0 auto 0.5rem; display: block; }
    .error-state button { padding: 0.4rem 1rem; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 0.5rem; color: #f87171; cursor: pointer; font-size: 0.82rem; margin-top: 0.5rem; }
    /* Category */
    .category-section { margin-bottom: 0.75rem; }
    .category-header {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 0.75rem; cursor: pointer;
      border-radius: 0.625rem; transition: background 0.15s;
    }
    .category-header:hover { background: rgba(99,102,241,0.08); }
    .cat-name  { font-size: 0.8rem; font-weight: 700; color: #818cf8; flex: 1; }
    .cat-count { font-size: 0.7rem; color: #4b5563; background: rgba(99,102,241,0.1); padding: 0.1rem 0.4rem; border-radius: 99px; }
    .chevron   { width: 1rem; height: 1rem; color: #4b5563; transition: transform 0.25s; }
    .chevron.open { transform: rotate(180deg); }
    .faq-list  { overflow: hidden; max-height: 0; transition: max-height 0.3s ease; }
    .faq-list.open { max-height: 9999px; }
    .faq-item  {
      border: 1px solid rgba(99,102,241,0.12); border-radius: 0.75rem;
      margin-bottom: 0.4rem; overflow: hidden; cursor: pointer;
      transition: border-color 0.2s;
    }
    .faq-item:hover { border-color: rgba(99,102,241,0.3); }
    .faq-item.expanded { border-color: rgba(99,102,241,0.4); }
    .faq-question {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 0.75rem; font-size: 0.82rem; color: #e2e8f0; font-weight: 500;
    }
    .faq-question span { flex: 1; }
    .faq-actions { display: flex; }
    .ask-btn {
      width: 1.75rem; height: 1.75rem; border-radius: 0.4rem;
      background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
      color: #818cf8; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.2s;
    }
    .ask-btn:hover { background: rgba(99,102,241,0.25); }
    .ask-btn svg { width: 0.75rem; height: 0.75rem; }
    .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
    .faq-answer.show { max-height: 500px; }
    .faq-answer p {
      margin: 0; padding: 0 0.75rem 0.65rem; font-size: 0.8rem; line-height: 1.6;
      color: #94a3b8; border-top: 1px solid rgba(99,102,241,0.1);
      padding-top: 0.5rem;
    }
    /* Empty */
    .empty-state { text-align: center; padding: 2.5rem 1rem; color: #4b5563; }
    .empty-state svg { width: 2rem; height: 2rem; margin: 0 auto 0.75rem; display: block; opacity: 0.4; }
    .empty-state p { font-size: 0.85rem; }
  `]
})
export class FaqsComponent implements OnInit {
  @Output() questionSelected = new EventEmitter<string>();

  faqs: FaqEntry[]   = [];
  filteredFaqs: FaqEntry[] = [];
  loading = true;
  error   = '';
  searchTerm   = '';
  expandedId: number | null = null;
  openCategories = new Set<string>();

  get categories(): string[] {
    return [...new Set(this.filteredFaqs.map(f => f.category))];
  }

  constructor(private faqService: FaqService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.faqService.getAll().subscribe({
      next: (data) => {
        this.faqs = data;
        this.filteredFaqs = data;
        // Open first category by default
        if (data.length) this.openCategories.add(data[0].category);
        this.loading = false;
      },
      error: () => { this.error = 'Could not load FAQs. Check that the backend is running.'; this.loading = false; }
    });
  }

  getCatFaqs(cat: string): FaqEntry[] {
    return this.filteredFaqs.filter(f => f.category === cat);
  }

  toggleCategory(cat: string) {
    this.openCategories.has(cat) ? this.openCategories.delete(cat) : this.openCategories.add(cat);
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  askQuestion(question: string) {
    this.questionSelected.emit(question);
  }

  filterFaqs() {
    const term = this.searchTerm.toLowerCase();
    this.filteredFaqs = this.faqs.filter(f =>
      f.question.toLowerCase().includes(term) ||
      f.answer.toLowerCase().includes(term) ||
      f.aliases.some(a => a.toLowerCase().includes(term))
    );
    this.openCategories = new Set(this.categories);
  }
}
