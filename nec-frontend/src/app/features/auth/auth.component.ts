import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NecLogoComponent } from '../../shared/components/nec-logo/nec-logo.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, NecLogoComponent],
  template: `
    <div class="auth-screen">
      <!-- Full-page hero bg -->
      <div class="auth-hero-bg">
        <img src="nec_hero_bg.png" alt="" class="hero-img" onerror="this.style.display='none'"/>
        <div class="hero-overlay"></div>
      </div>

      <!-- Left panel (campus image + info) -->
      <div class="left-panel">
        <div class="campus-img-wrap">
          <img src="nec_campus.png" alt="NEC Campus" class="campus-img"
               onerror="this.style.display='none'"/>
          <div class="campus-overlay"></div>
        </div>
        <div class="left-content">
          <app-nec-logo size="lg"></app-nec-logo>
          <h2 class="panel-title">Narasaraopeta<br/>Engineering College</h2>
          <p class="panel-sub">Your 24/7 AI-powered admissions guide — ask anything about courses, fees, eligibility, and campus life.</p>
          <div class="panel-stats">
            <div class="stat">
              <span class="stat-num">2000+</span>
              <span class="stat-label">Students</span>
            </div>
            <div class="stat">
              <span class="stat-num">20+</span>
              <span class="stat-label">Programs</span>
            </div>
            <div class="stat">
              <span class="stat-num">NAAC A+</span>
              <span class="stat-label">Accredited</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="right-panel">
      <div class="auth-card" [class.shake]="shaking">
        <!-- Logo -->
        <div class="card-header">
          <app-nec-logo size="md"></app-nec-logo>
          <h1 class="card-title">Welcome Back</h1>
          <p class="card-sub">Sign in to manage the AI assistant</p>
        </div>

        <!-- Form -->
        <form class="auth-form" (ngSubmit)="onLogin()" #f="ngForm">
          <div class="form-group" [class.error]="emailErr">
            <label>Email Address</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input id="auth-email" type="email" [(ngModel)]="email" name="email"
                     placeholder="nrtec2k26@gmail.com"
                     (blur)="validateEmail()" autocomplete="email"/>
            </div>
            <span class="field-error" *ngIf="emailErr">{{ emailErr }}</span>
          </div>

          <div class="form-group" [class.error]="passErr">
            <label>Password</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="auth-password" [type]="showPass ? 'text' : 'password'"
                     [(ngModel)]="password" name="password"
                     placeholder="Enter your password"
                     autocomplete="current-password"/>
              <button type="button" class="eye-btn" (click)="showPass = !showPass" tabindex="-1">
                <svg *ngIf="!showPass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="showPass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <span class="field-error" *ngIf="passErr">{{ passErr }}</span>
          </div>

          <div class="error-banner" *ngIf="loginError">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="err-icon">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ loginError }}
          </div>

          <button id="auth-login-btn" class="btn-primary" type="submit" [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <button id="auth-guest-btn" class="btn-guest" (click)="onGuest()" [disabled]="loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Continue as Guest
        </button>

        <p class="guest-note">Guest mode gives read-only access to the assistant.</p>
      </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-screen {
      min-height: 100vh; height: 100vh;
      display: flex; overflow: hidden; position: relative;
    }
    /* Hero bg */
    .auth-hero-bg { position:fixed; inset:0; z-index:0; }
    .auth-hero-bg .hero-img { width:100%; height:100%; object-fit:cover; opacity:0.25; }
    .auth-hero-bg .hero-overlay {
      position:absolute; inset:0;
      background: radial-gradient(ellipse at 30% 50%, rgba(30,27,75,0.7) 0%, rgba(13,17,23,0.92) 70%);
    }
    /* Left panel */
    .left-panel {
      position: relative; z-index:1; width: 50%; display: flex;
      flex-direction: column; overflow: hidden;
    }
    .campus-img-wrap { position:absolute; inset:0; }
    .campus-img { width:100%; height:100%; object-fit:cover; }
    .campus-overlay {
      position:absolute; inset:0;
      background: linear-gradient(135deg, rgba(13,17,23,0.75) 0%, rgba(30,27,75,0.6) 50%, rgba(13,17,23,0.85) 100%);
    }
    .left-content {
      position:relative; z-index:2; padding:3rem 3rem;
      display:flex; flex-direction:column; justify-content:center; height:100%;
    }
    .panel-title {
      font-size: 2rem; font-weight: 900; color: white; line-height: 1.2;
      margin: 1.25rem 0 0.75rem; text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    }
    .panel-sub { font-size:0.9rem; color:#a5b4fc; line-height:1.7; max-width:340px; margin:0 0 2rem; }
    .panel-stats { display:flex; gap:2rem; }
    .stat { display:flex; flex-direction:column; gap:0.15rem; }
    .stat-num { font-size:1.5rem; font-weight:800; color:white; }
    .stat-label { font-size:0.7rem; color:#64748b; text-transform:uppercase; letter-spacing:0.1em; }
    /* Right panel — fills remaining half */
    .right-panel {
      position: relative; z-index: 10;
      width: 50%; display: flex;
      align-items: center; justify-content: center;
      padding: 2rem;
    }
    .auth-card {
      width: 100%; max-width: 420px;
      background: rgba(15,23,42,0.88);
      border: 1px solid rgba(99,102,241,0.22);
      border-radius: 1.5rem;
      padding: 2.5rem;
      backdrop-filter: blur(24px);
      box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1);
    }
    .auth-card.shake { animation: shake 0.5s ease; }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25%      { transform: translateX(-8px); }
      75%      { transform: translateX(8px); }
    }
    .card-header { text-align: center; margin-bottom: 2rem; }
    .card-header app-nec-logo { justify-content: center; margin-bottom: 1rem; }
    .card-title  { font-size: 1.5rem; font-weight: 800; color: white; margin: 0.5rem 0 0.25rem; }
    .card-sub    { font-size: 0.85rem; color: #64748b; margin: 0; }
    .auth-form   { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group  { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; letter-spacing: 0.04em; }
    .input-wrap  { position: relative; }
    .input-icon  { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; color: #4b5563; }
    .input-wrap input {
      width: 100%; padding: 0.75rem 0.9rem 0.75rem 2.5rem;
      background: rgba(30,27,75,0.5);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 0.75rem; color: white; font-size: 0.9rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .input-wrap input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .input-wrap input::placeholder { color: #374151; }
    .eye-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #4b5563; padding: 0; }
    .eye-btn svg { width: 1rem; height: 1rem; }
    .form-group.error .input-wrap input { border-color: #ef4444; }
    .field-error  { font-size: 0.75rem; color: #ef4444; }
    .error-banner {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 0.5rem; padding: 0.6rem 0.9rem;
      color: #f87171; font-size: 0.82rem;
    }
    .err-icon { width: 1rem; height: 1rem; flex-shrink: 0; }
    .btn-primary {
      width: 100%; padding: 0.85rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none; border-radius: 0.75rem;
      color: white; font-size: 0.95rem; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s, transform 0.15s;
      margin-top: 0.25rem;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .spinner {
      width: 1.2rem; height: 1.2rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; }
    .divider::before,.divider::after { content:''; flex:1; height:1px; background: rgba(99,102,241,0.15); }
    .divider span { color: #4b5563; font-size: 0.75rem; }
    .btn-guest {
      width: 100%; padding: 0.8rem;
      background: transparent;
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 0.75rem;
      color: #a5b4fc; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: background 0.2s, border-color 0.2s;
    }
    .btn-guest svg { width: 1rem; height: 1rem; }
    .btn-guest:hover:not(:disabled) { background: rgba(99,102,241,0.1); border-color: #6366f1; }
    .btn-guest:disabled { opacity: 0.5; cursor: not-allowed; }
    .guest-note { text-align: center; font-size: 0.72rem; color: #374151; margin: 0.75rem 0 0; }

    /* Responsiveness for smaller screens */
    @media (max-width: 768px) {
      .left-panel { display: none !important; }
      .right-panel { width: 100% !important; padding: 1rem; }
      .auth-card { padding: 2rem 1.5rem; margin: auto; }
    }
  `]
})
export class AuthComponent {
  email    = '';
  password = '';
  showPass = false;
  loading  = false;
  shaking  = false;
  loginError = '';
  emailErr   = '';
  passErr    = '';

  constructor(private auth: AuthService, private router: Router) {}

  validateEmail() {
    this.emailErr = this.email && !this.email.includes('@') ? 'Please enter a valid email.' : '';
  }

  onLogin() {
    this.loginError = '';
    if (!this.email || !this.password) {
      this.emailErr = !this.email ? 'Email is required.' : '';
      this.passErr  = !this.password ? 'Password is required.' : '';
      this.triggerShake();
      return;
    }
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/app/chat']); },
      error: () => {
        this.loading = false;
        this.loginError = 'Invalid email or password. Please try again.';
        this.triggerShake();
      }
    });
  }

  onGuest() {
    this.loading = true;
    this.auth.guestLogin().subscribe({
      next: () => { this.loading = false; this.router.navigate(['/app/chat']); },
      error: () => { this.loading = false; this.loginError = 'Failed to start guest session.'; }
    });
  }

  private triggerShake() {
    this.shaking = true;
    setTimeout(() => this.shaking = false, 500);
  }
}
