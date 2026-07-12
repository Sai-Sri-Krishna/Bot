import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nec-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nec-logo" [ngClass]="size">
      <div class="logo-icon" [ngClass]="iconClass">
        <img src="nec_logo.png" alt="NEC Logo" class="logo-img"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"/>
        <!-- Fallback SVG -->
        <svg style="display:none" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="14" width="17" height="28" rx="2" fill="currentColor" opacity="0.3"/>
          <rect x="31" y="14" width="17" height="28" rx="2" fill="currentColor" opacity="0.5"/>
          <rect x="27" y="12" width="6" height="32" rx="1" fill="#F5B800"/>
          <ellipse cx="30" cy="9" rx="4" ry="5" fill="url(#flame)"/>
          <defs>
            <linearGradient id="flame" x1="30" y1="4" x2="30" y2="14" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FDE68A"/>
              <stop offset="1" stop-color="#F5B800"/>
            </linearGradient>
          </defs>
          <circle cx="18" cy="10" r="1.5" fill="#F5B800" opacity="0.7"/>
          <circle cx="42" cy="10" r="1.5" fill="#F5B800" opacity="0.7"/>
          <rect x="10" y="46" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.2"/>
          <rect x="15" y="51" width="30" height="2" rx="1" fill="currentColor" opacity="0.15"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-title">NEC</span>
        <span class="logo-subtitle">Voice Assistant</span>
        <span class="logo-sub2">Narasaraopeta Engineering College</span>
      </div>
    </div>
  `,
  styles: [`
    .nec-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #818cf8;
    }
    .logo-icon svg { width: 100%; height: 100%; }
    .logo-title {
      font-size: 1.25rem;
      font-weight: 900;
      color: white;
      letter-spacing: -0.03em;
      display: block;
      line-height: 1.1;
    }
    .logo-subtitle {
      font-size: 0.65rem;
      font-weight: 700;
      color: #818cf8;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      display: block;
    }
    .logo-sub2 {
      font-size: 0.55rem;
      color: #64748b;
      display: block;
      letter-spacing: 0.05em;
    }
    /* Size variants */
    .nec-logo.sm .logo-icon { width: 2.5rem; height: 2.5rem; }
    .nec-logo.sm .logo-title { font-size: 1rem; }
    .nec-logo.md .logo-icon { width: 3.5rem; height: 3.5rem; }
    .nec-logo.md .logo-title { font-size: 1.1rem; }
    .nec-logo.lg .logo-icon { width: 5rem; height: 5rem; }
    .nec-logo.lg .logo-title { font-size: 1.5rem; }
    .nec-logo.lg .logo-subtitle { font-size: 0.7rem; }
  `]
})
export class NecLogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() iconClass = '';
}
