import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface FaqEntry {
  id: number; question: string; answer: string; category: string; aliases: string[];
}
interface FaqRequest { question: string; answer: string; category: string; aliases: string[]; }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-shell">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <button class="back-btn" (click)="goBack()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Chat
          </button>
          <h1 class="admin-title">Admin Panel</h1>
        </div>
        <span class="admin-badge">FAQ Management</span>
      </header>

      <div class="admin-body">
        <!-- Left: Form -->
        <aside class="form-panel">
          <h2>{{ editingId ? 'Edit FAQ' : 'Add New FAQ' }}</h2>

          <div class="form-group">
            <label>Question *</label>
            <textarea id="admin-question" [(ngModel)]="form.question" rows="3" placeholder="Enter the question..."></textarea>
          </div>

          <div class="form-group">
            <label>Answer *</label>
            <textarea id="admin-answer" [(ngModel)]="form.answer" rows="5" placeholder="Enter the answer..."></textarea>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select id="admin-category" [(ngModel)]="form.category">
              <option *ngFor="let c of categories">{{ c }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Aliases (one per line)</label>
            <textarea id="admin-aliases" [(ngModel)]="aliasesText" rows="4" placeholder="Enter alternative questions, one per line..."></textarea>
          </div>

          <div class="form-error" *ngIf="formError">{{ formError }}</div>
          <div class="form-success" *ngIf="formSuccess">{{ formSuccess }}</div>

          <div class="form-actions">
            <button class="btn-save" (click)="save()" [disabled]="saving">
              {{ saving ? 'Saving...' : (editingId ? 'Update FAQ' : 'Add FAQ') }}
            </button>
            <button class="btn-cancel" *ngIf="editingId" (click)="cancelEdit()">Cancel</button>
          </div>
        </aside>

        <!-- Right: Table -->
        <section class="table-panel">
          <div class="table-toolbar">
            <input id="admin-search" class="search-input" [(ngModel)]="searchTerm"
                   (ngModelChange)="filterFaqs()" placeholder="Search FAQs..."/>
            <span class="count">{{ filteredFaqs.length }} entries</span>
          </div>

          <div class="loading-state" *ngIf="loading">
            <div class="skeleton" *ngFor="let i of [1,2,3,4]"></div>
          </div>

          <div class="table-scroll" *ngIf="!loading">
            <table class="faq-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Aliases</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let faq of filteredFaqs" [class.editing]="editingId === faq.id">
                  <td class="q-cell">
                    <span>{{ faq.question }}</span>
                    <p class="answer-preview">{{ faq.answer | slice:0:80 }}{{ faq.answer.length > 80 ? '...' : '' }}</p>
                  </td>
                  <td><span class="cat-badge">{{ faq.category }}</span></td>
                  <td class="alias-count">{{ faq.aliases.length }}</td>
                  <td class="actions-cell">
                    <button class="edit-btn" (click)="editFaq(faq)" title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="del-btn" (click)="confirmDelete(faq)" title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="empty" *ngIf="filteredFaqs.length === 0">No entries found.</div>
          </div>
        </section>
      </div>

      <!-- Delete confirm dialog -->
      <div class="modal-overlay" *ngIf="deleteTarget" (click)="cancelDelete()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>Delete FAQ?</h3>
          <p>"{{ deleteTarget?.question }}"</p>
          <div class="modal-actions">
            <button class="btn-danger" (click)="doDelete()">Delete</button>
            <button class="btn-cancel-sm" (click)="cancelDelete()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex; flex-direction: column; height: 100vh; overflow: hidden;
      background: radial-gradient(ellipse at 20% 30%, #1e1b4b 0%, #0f172a 60%, #0d1117 100%);
    }
    .admin-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.5rem; background: rgba(15,23,42,0.9); border-bottom: 1px solid rgba(99,102,241,0.15);
      backdrop-filter: blur(10px);
    }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .back-btn {
      display: flex; align-items: center; gap: 0.4rem;
      background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
      border-radius: 0.5rem; color: #818cf8; padding: 0.4rem 0.8rem; font-size: 0.82rem;
      cursor: pointer; transition: background 0.2s;
    }
    .back-btn svg { width: 0.9rem; height: 0.9rem; }
    .back-btn:hover { background: rgba(99,102,241,0.2); }
    .admin-title { font-size: 1.1rem; font-weight: 800; color: white; margin: 0; }
    .admin-badge { font-size: 0.7rem; font-weight: 700; color: #818cf8; background: rgba(99,102,241,0.12); padding: 0.3rem 0.75rem; border-radius: 99px; border: 1px solid rgba(99,102,241,0.25); }
    .admin-body { display: flex; flex: 1; overflow: hidden; gap: 0; }
    /* Form panel */
    .form-panel {
      width: 320px; min-width: 320px; overflow-y: auto;
      padding: 1.5rem; border-right: 1px solid rgba(99,102,241,0.12);
      background: rgba(15,23,42,0.5);
    }
    .form-panel::-webkit-scrollbar { width: 4px; }
    .form-panel::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
    .form-panel h2 { font-size: 0.95rem; font-weight: 800; color: white; margin: 0 0 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
    .form-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; letter-spacing: 0.04em; }
    .form-group textarea, .form-group select {
      background: rgba(30,27,75,0.5); border: 1px solid rgba(99,102,241,0.2);
      border-radius: 0.625rem; color: white; font-size: 0.82rem; padding: 0.6rem 0.75rem;
      resize: vertical; font-family: inherit;
    }
    .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #6366f1; }
    .form-group select { cursor: pointer; }
    .form-error   { font-size: 0.78rem; color: #f87171; margin-bottom: 0.75rem; }
    .form-success { font-size: 0.78rem; color: #34d399; margin-bottom: 0.75rem; }
    .form-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-save {
      flex: 1; padding: 0.7rem; background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none; border-radius: 0.625rem; color: white; font-size: 0.85rem; font-weight: 700; cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { padding: 0.7rem 1rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 0.625rem; color: #f87171; font-size: 0.85rem; cursor: pointer; }
    /* Table panel */
    .table-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 1.25rem; }
    .table-toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .search-input {
      flex: 1; padding: 0.6rem 0.9rem;
      background: rgba(30,27,75,0.5); border: 1px solid rgba(99,102,241,0.2);
      border-radius: 0.625rem; color: white; font-size: 0.82rem;
    }
    .search-input:focus { outline: none; border-color: #6366f1; }
    .search-input::placeholder { color: #374151; }
    .count { font-size: 0.75rem; color: #4b5563; white-space: nowrap; }
    .skeleton { height: 2.75rem; background: linear-gradient(90deg, rgba(99,102,241,0.07) 25%, rgba(99,102,241,0.14) 50%, rgba(99,102,241,0.07) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 0.5rem; margin-bottom: 0.5rem; }
    @keyframes shimmer { 0%{background-position:200%} 100%{background-position:-200%} }
    .table-scroll { overflow-y: auto; flex: 1; border-radius: 0.75rem; border: 1px solid rgba(99,102,241,0.12); }
    .table-scroll::-webkit-scrollbar { width: 4px; }
    .table-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
    .faq-table { width: 100%; border-collapse: collapse; }
    .faq-table thead { background: rgba(30,27,75,0.8); position: sticky; top: 0; }
    .faq-table th { padding: 0.65rem 0.85rem; font-size: 0.73rem; font-weight: 700; color: #64748b; text-align: left; border-bottom: 1px solid rgba(99,102,241,0.12); letter-spacing: 0.05em; text-transform: uppercase; }
    .faq-table td { padding: 0.65rem 0.85rem; border-bottom: 1px solid rgba(99,102,241,0.07); vertical-align: top; }
    .faq-table tr:hover td { background: rgba(99,102,241,0.04); }
    .faq-table tr.editing td { background: rgba(99,102,241,0.08); }
    .q-cell span { font-size: 0.83rem; color: #e2e8f0; font-weight: 500; display: block; }
    .answer-preview { font-size: 0.73rem; color: #4b5563; margin: 0.15rem 0 0; }
    .cat-badge { font-size: 0.68rem; font-weight: 700; color: #818cf8; background: rgba(99,102,241,0.12); padding: 0.15rem 0.5rem; border-radius: 99px; white-space: nowrap; }
    .alias-count { font-size: 0.8rem; color: #64748b; text-align: center; }
    .actions-cell { white-space: nowrap; }
    .edit-btn, .del-btn {
      width: 1.75rem; height: 1.75rem; border-radius: 0.4rem; border: none;
      display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s;
    }
    .edit-btn svg, .del-btn svg { width: 0.85rem; height: 0.85rem; }
    .edit-btn { background: rgba(99,102,241,0.12); color: #818cf8; margin-right: 0.3rem; }
    .edit-btn:hover { background: rgba(99,102,241,0.25); }
    .del-btn { background: rgba(239,68,68,0.1); color: #f87171; }
    .del-btn:hover { background: rgba(239,68,68,0.2); }
    .empty { padding: 2rem; text-align: center; color: #374151; font-size: 0.85rem; }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal-box { background: #0f172a; border: 1px solid rgba(99,102,241,0.3); border-radius: 1rem; padding: 2rem; max-width: 400px; width: 90%; }
    .modal-box h3 { font-size: 1.1rem; color: white; margin: 0 0 0.5rem; }
    .modal-box p  { font-size: 0.88rem; color: #94a3b8; margin: 0 0 1.5rem; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
    .btn-danger   { padding: 0.6rem 1.2rem; background: #ef4444; border: none; border-radius: 0.5rem; color: white; font-weight: 700; cursor: pointer; }
    .btn-cancel-sm{ padding: 0.6rem 1.2rem; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 0.5rem; color: #a5b4fc; cursor: pointer; }
  `]
})
export class AdminComponent implements OnInit {
  faqs: FaqEntry[] = [];
  filteredFaqs: FaqEntry[] = [];
  loading  = true;
  saving   = false;
  searchTerm  = '';
  editingId: number | null = null;
  deleteTarget: FaqEntry | null = null;
  formError   = '';
  formSuccess = '';
  aliasesText = '';

  categories = ['Admissions', 'Courses', 'Quota & Fees', 'Campus & Support'];
  form: FaqRequest = { question: '', answer: '', category: 'Admissions', aliases: [] };

  private readonly BASE = environment.springBootUrl;

  constructor(private auth: AuthService, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (!this.auth.currentUser || this.auth.currentUser.role !== 'ADMIN') {
      this.router.navigate(['/app/chat']);
      return;
    }
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<FaqEntry[]>(`${this.BASE}/api/faqs`).subscribe({
      next: (data) => { this.faqs = data; this.filteredFaqs = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterFaqs() {
    const s = this.searchTerm.toLowerCase();
    this.filteredFaqs = this.faqs.filter(f =>
      f.question.toLowerCase().includes(s) || f.category.toLowerCase().includes(s));
  }

  editFaq(faq: FaqEntry) {
    this.editingId = faq.id;
    this.form = { question: faq.question, answer: faq.answer, category: faq.category, aliases: faq.aliases };
    this.aliasesText = faq.aliases.join('\n');
    this.formError = ''; this.formSuccess = '';
  }

  cancelEdit() {
    this.editingId = null;
    this.form = { question: '', answer: '', category: 'Admissions', aliases: [] };
    this.aliasesText = '';
    this.formError = ''; this.formSuccess = '';
  }

  save() {
    this.formError = ''; this.formSuccess = '';
    if (!this.form.question.trim() || !this.form.answer.trim()) {
      this.formError = 'Question and Answer are required.'; return;
    }
    this.form.aliases = this.aliasesText.split('\n').map(a => a.trim()).filter(Boolean);
    this.saving = true;

    const req = this.editingId
      ? this.http.put<FaqEntry>(`${this.BASE}/api/faqs/${this.editingId}`, this.form)
      : this.http.post<FaqEntry>(`${this.BASE}/api/faqs`, this.form);

    req.subscribe({
      next: (saved) => {
        this.saving = false;
        if (this.editingId) {
          const idx = this.faqs.findIndex(f => f.id === this.editingId);
          if (idx >= 0) this.faqs[idx] = saved;
        } else {
          this.faqs.unshift(saved);
        }
        this.filteredFaqs = [...this.faqs];
        this.formSuccess = this.editingId ? 'FAQ updated!' : 'FAQ added!';
        this.cancelEdit();
      },
      error: () => { this.saving = false; this.formError = 'Save failed. Check backend connection.'; }
    });
  }

  confirmDelete(faq: FaqEntry) { this.deleteTarget = faq; }
  cancelDelete()               { this.deleteTarget = null; }

  doDelete() {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.http.delete(`${this.BASE}/api/faqs/${id}`).subscribe({
      next: () => {
        this.faqs = this.faqs.filter(f => f.id !== id);
        this.filteredFaqs = this.filteredFaqs.filter(f => f.id !== id);
        this.deleteTarget = null;
      },
      error: () => { this.deleteTarget = null; }
    });
  }

  goBack() { this.router.navigate(['/app/chat']); }
}
