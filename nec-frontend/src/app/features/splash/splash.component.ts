import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NecLogoComponent } from '../../shared/components/nec-logo/nec-logo.component';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [NecLogoComponent],
  template: `
    <div class="splash-screen">
      <!-- Hero background image -->
      <div class="hero-bg">
        <img src="nec_hero_bg.png" alt="" class="hero-img"
             onerror="this.style.display='none'"/>
        <div class="hero-overlay"></div>
      </div>

      <!-- Animated orbs (fallback/layer) -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="splash-content" [class.visible]="animateIn">
        <!-- Logo -->
        <div class="logo-card">
          <div class="logo-glow"></div>
          <app-nec-logo size="lg"></app-nec-logo>
        </div>

        <!-- Tagline -->
        <p class="tagline">Your AI-Powered Admissions Guide</p>

        <!-- Progress -->
        <div class="progress-container">
          <div class="progress-bar" [style.width.%]="progress"></div>
        </div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>

      <!-- Campus image strip at bottom -->
      <div class="campus-strip" [class.visible]="animateIn">
        <img src="nec_campus.png" alt="NEC Campus"
             onerror="this.style.display='none'"/>
        <div class="strip-overlay"></div>
        <div class="badges">
          <span class="badge">AICTE Approved</span>
          <span class="sep">•</span>
          <span class="badge">NAAC A+</span>
          <span class="sep">•</span>
          <span class="badge">JNTUK Affiliated</span>
          <span class="sep">•</span>
          <span class="badge">Autonomous</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .splash-screen {
      position: fixed; inset: 0;
      background: #0d1117;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      overflow: hidden;
    }

    /* Hero background */
    .hero-bg {
      position: absolute; inset: 0;
    }
    .hero-img {
      width: 100%; height: 100%; object-fit: cover; opacity: 0.35;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(180deg,
        rgba(13,17,23,0.2) 0%,
        rgba(13,17,23,0.6) 60%,
        rgba(13,17,23,0.95) 100%);
    }

    /* Orbs */
    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(80px); pointer-events: none;
      animation: orb-drift 8s ease-in-out infinite alternate;
    }
    .orb-1 { width:500px; height:500px; background:rgba(99,102,241,0.2); top:-150px; right:-150px; }
    .orb-2 { width:350px; height:350px; background:rgba(139,92,246,0.15); bottom:-100px; left:-100px; animation-delay:-3s; }
    @keyframes orb-drift {
      from { transform:translate(0,0); }
      to   { transform:translate(25px,20px); }
    }

    /* Content */
    .splash-content {
      position: relative; z-index: 10;
      display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
      opacity: 0; transform: translateY(24px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .splash-content.visible { opacity: 1; transform: translateY(0); }

    /* Logo card */
    .logo-card {
      position: relative;
      background: rgba(15,23,42,0.7);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 1.5rem;
      padding: 1.75rem 2.5rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .logo-glow {
      position: absolute; inset: -2px;
      border-radius: 1.6rem;
      background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3));
      filter: blur(10px);
      z-index: -1;
    }

    .tagline {
      font-size: 1rem; color: #a5b4fc; letter-spacing: 0.04em;
      margin: 0; font-weight: 500;
    }

    /* Progress bar */
    .progress-container {
      width: 240px; height: 3px;
      background: rgba(99,102,241,0.15);
      border-radius: 2px; overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
      border-radius: 2px;
      transition: width 0.4s ease;
      box-shadow: 0 0 8px rgba(99,102,241,0.6);
    }
    .loading-text {
      font-size: 0.72rem; color: #475569; letter-spacing: 0.08em; margin: 0;
    }

    /* Campus strip */
    .campus-strip {
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 100px; overflow: hidden;
      opacity: 0; transform: translateY(20px);
      transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
    }
    .campus-strip.visible { opacity: 1; transform: translateY(0); }
    .campus-strip img {
      width: 100%; height: 100%; object-fit: cover; object-position: center 60%;
    }
    .strip-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.4) 50%, rgba(13,17,23,0.7) 100%);
    }
    .badges {
      position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 0.75rem; white-space: nowrap;
    }
    .badge {
      font-size: 0.65rem; font-weight: 700; color: #818cf8;
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    .sep { color: #2d3748; font-size: 0.5rem; }
  `]
})
export class SplashComponent implements OnInit, OnDestroy {
  animateIn   = false;
  progress    = 0;
  loadingText = 'Initializing...';
  private timer: any;

  private readonly steps = [
    { p: 20,  t: 'Loading knowledge base...' },
    { p: 50,  t: 'Connecting AI services...' },
    { p: 80,  t: 'Almost ready...' },
    { p: 100, t: 'Welcome to NEC!' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => (this.animateIn = true), 150);
    let i = 0;
    const advance = () => {
      if (i >= this.steps.length) {
        setTimeout(() => this.router.navigate(['/auth']), 500);
        return;
      }
      const step = this.steps[i++];
      this.progress    = step.p;
      this.loadingText = step.t;
      this.timer = setTimeout(advance, 650);
    };
    this.timer = setTimeout(advance, 500);
  }

  ngOnDestroy() { clearTimeout(this.timer); }
}
