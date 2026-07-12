import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NecLogoComponent } from '../../shared/components/nec-logo/nec-logo.component';
import { ChatComponent } from '../chat/chat.component';
import { FaqsComponent } from '../faqs/faqs.component';
import { VoiceDashboardComponent } from '../voice-dashboard/voice-dashboard.component';
import { ContactInfoComponent } from '../contact-info/contact-info.component';

type Tab = 'dashboard' | 'chat' | 'contact' | 'faqs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    NecLogoComponent, 
    ChatComponent, 
    FaqsComponent,
    VoiceDashboardComponent,
    ContactInfoComponent
  ],
  template: `
    <div class="app-shell">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-top">
          <div class="logo-area">
            <app-nec-logo [size]="sidebarCollapsed ? 'sm' : 'md'"></app-nec-logo>
          </div>
          <button class="collapse-btn" (click)="sidebarCollapsed = !sidebarCollapsed" title="Toggle sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <nav class="nav-items">
          <button id="nav-dashboard" class="nav-btn" [class.active]="activeTab === 'dashboard'" (click)="setTab('dashboard')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Voice Dashboard</span>
          </button>
          <button id="nav-chat" class="nav-btn" [class.active]="activeTab === 'chat'" (click)="setTab('chat')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Chat Transcript</span>
          </button>
          <button id="nav-contact" class="nav-btn" [class.active]="activeTab === 'contact'" (click)="setTab('contact')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Contact Info</span>
          </button>
          <button id="nav-faqs" class="nav-btn" [class.active]="activeTab === 'faqs'" (click)="setTab('faqs')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Suggested FAQs</span>
          </button>
          <button id="nav-admin" class="nav-btn" *ngIf="isAdmin" (click)="goAdmin()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Admin</span>
          </button>
        </nav>

        <div class="sidebar-bottom">
          <div class="user-pill" *ngIf="!sidebarCollapsed">
            <div class="user-avatar-sm">{{ userInitial }}</div>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ isGuest ? 'Guest' : 'Admin' }}</span>
            </div>
          </div>
          <button id="nav-logout" class="nav-btn logout-btn" (click)="logout()" title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main panel -->
      <main class="main-panel">
        <!-- Top bar -->
        <header class="top-bar">
          <div class="active-tab-title">
            <span class="tab-label">{{ activeTabLabel }}</span>
          </div>
          <div class="status-dot" title="Services connected"></div>
        </header>

        <!-- Content -->
        <div class="content-area">
          <app-voice-dashboard *ngIf="activeTab === 'dashboard'"></app-voice-dashboard>
          <app-chat *ngIf="activeTab === 'chat'" #chatRef></app-chat>
          <app-contact-info *ngIf="activeTab === 'contact'"></app-contact-info>
          <app-faqs *ngIf="activeTab === 'faqs'" (questionSelected)="onFaqSelected($event)"></app-faqs>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex; height: 100vh; overflow: hidden;
      background: radial-gradient(ellipse at 10% 80%, #1e1b4b 0%, #0f172a 50%, #0d1117 100%);
      position: relative;
    }
    .app-shell::before {
      content: '';
      position: absolute; inset: 0;
      background: url('/nec_hero_bg.png') center/cover no-repeat;
      opacity: 0.05;
      pointer-events: none;
      z-index: 0;
    }
    /* Sidebar */
    .sidebar {
      display: flex; flex-direction: column;
      background: rgba(15,23,42,0.9); border-right: 1px solid rgba(99,102,241,0.15);
      width: 220px; min-width: 220px; transition: width 0.3s, min-width 0.3s;
      backdrop-filter: blur(20px); position: relative; z-index: 1;
    }
    .sidebar.collapsed { width: 60px; min-width: 60px; }
    .sidebar-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 0.75rem; border-bottom: 1px solid rgba(99,102,241,0.1);
    }
    .sidebar.collapsed .logo-area { overflow: hidden; }
    .sidebar.collapsed .logo-text  { display: none; }
    .collapse-btn {
      background: none; border: none; color: #4b5563; cursor: pointer;
      width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center;
      border-radius: 0.375rem; transition: color 0.15s, background 0.15s; flex-shrink: 0;
    }
    .collapse-btn:hover { color: #818cf8; background: rgba(99,102,241,0.1); }
    .collapse-btn svg   { width: 1.1rem; height: 1.1rem; }
    .nav-items { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; padding: 1rem 0.5rem; }
    .nav-btn {
      width: 100%; display: flex; align-items: center; gap: 0.75rem;
      padding: 0.65rem 0.75rem; border-radius: 0.625rem; border: none;
      background: none; color: #64748b; font-size: 0.88rem; font-weight: 500;
      cursor: pointer; transition: color 0.15s, background 0.15s; text-align: left;
    }
    .nav-btn svg { width: 1.1rem; height: 1.1rem; flex-shrink: 0; }
    .nav-btn.active, .nav-btn:hover { background: rgba(99,102,241,0.12); color: #a5b4fc; }
    .nav-btn.active { color: #818cf8; font-weight: 700; }
    .sidebar-bottom { padding: 0.75rem 0.5rem 1rem; border-top: 1px solid rgba(99,102,241,0.1); display: flex; flex-direction: column; gap: 0.5rem; }
    .user-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.5rem; }
    .user-avatar-sm {
      width: 2rem; height: 2rem; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 800; color: white; flex-shrink: 0;
    }
    .user-name  { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; display: block; }
    .user-role  { font-size: 0.68rem; color: #4b5563; display: block; }
    .logout-btn { color: #ef4444 !important; }
    .logout-btn:hover { background: rgba(239,68,68,0.08) !important; }
    /* Main panel */
    .main-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; z-index: 1; }
    .top-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid rgba(99,102,241,0.1);
      background: rgba(15,23,42,0.6); backdrop-filter: blur(10px);
    }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .active-tab-title {
      font-size: 0.9rem; font-weight: 700; color: #a5b4fc;
      letter-spacing: 0.05em; text-transform: uppercase;
    }
    .content-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
    .content-area > * { flex: 1; min-height: 0; }

    /* Responsiveness for mobile and tablets */
    @media (max-width: 768px) {
      .sidebar {
        width: 60px !important;
        min-width: 60px !important;
      }
      .sidebar .logo-area { display: none; }
      .collapse-btn { display: none !important; }
      .sidebar-top { justify-content: center; padding: 1rem 0; }
      .nav-btn span { display: none !important; }
      .nav-btn { justify-content: center; padding: 0.75rem; }
      .user-pill { display: none !important; }
      .sidebar-bottom { align-items: center; }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('chatRef') chatRef?: ChatComponent;

  activeTab: Tab = 'dashboard';
  sidebarCollapsed = false;
  isAdmin = false;
  isGuest = false;
  userName    = '';
  userInitial = '?';

  get activeTabLabel(): string {
    const labels: Record<Tab, string> = {
      dashboard: 'Voice Dashboard',
      chat: 'Chat Transcript',
      contact: 'Contact Info',
      faqs: 'Suggested FAQs'
    };
    return labels[this.activeTab];
  }

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) { this.router.navigate(['/auth']); return; }
    this.isAdmin = user.role === 'ADMIN';
    this.isGuest = user.isGuest;
    this.userName    = user.name;
    this.userInitial = user.name?.charAt(0).toUpperCase() || '?';
  }

  setTab(tab: Tab) { this.activeTab = tab; }

  onFaqSelected(question: string) {
    this.activeTab = 'chat';
    setTimeout(() => this.chatRef?.sendFaq(question), 100);
  }

  goAdmin()  { this.router.navigate(['/app/admin']); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}
