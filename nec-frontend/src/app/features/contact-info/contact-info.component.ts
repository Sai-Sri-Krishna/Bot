import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContactItem {
  icon: string; label: string; value: string; link?: string;
}

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-wrapper">
      <div class="contact-header">
        <h2>Contact NEC</h2>
        <p>Reach the admissions team directly</p>
      </div>

      <div class="contact-body">
        <!-- Hero campus image -->
        <div class="campus-hero logo-banner">
          <img src="nec_logo.png" alt="NEC Logo" class="campus-img banner-logo"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/>
          <div class="campus-fallback" style="display:none">
            <span>🏛️ NEC Campus</span>
          </div>
          <div class="campus-label">
            <span>Narasaraopeta Engineering College</span>
            <span class="accred">AICTE • NAAC A+ • Autonomous</span>
          </div>
        </div>

        <!-- Contact grid -->
        <div class="contact-grid">
          <a class="contact-card"
             *ngFor="let item of contacts"
             [href]="item.link || '#'"
             [target]="item.link ? '_blank' : '_self'"
             [class.no-link]="!item.link">
            <div class="contact-icon" [innerHTML]="item.icon"></div>
            <div class="contact-details">
              <span class="contact-label">{{ item.label }}</span>
              <span class="contact-value">{{ item.value }}</span>
            </div>
            <svg *ngIf="item.link" class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>

        <!-- Office Hours -->
        <div class="hours-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Admissions Office Hours
          </h3>
          <div class="hours-grid">
            <div class="hour-row" *ngFor="let h of officeHours" [class.today]="h.isToday">
              <span class="day">{{ h.day }}</span>
              <div class="dots"></div>
              <span class="time">{{ h.time }}</span>
            </div>
          </div>
        </div>

        <!-- Departments -->
        <div class="dept-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Departments
          </h3>
          <div class="dept-grid">
            <div class="dept-chip" *ngFor="let d of departments">{{ d }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-wrapper { height: 100%; overflow-y: auto; padding: 1.25rem; }
    .contact-wrapper::-webkit-scrollbar { width: 4px; }
    .contact-wrapper::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }

    .contact-header { margin-bottom: 1.1rem; }
    .contact-header h2 { font-size: 1.1rem; font-weight: 800; color: white; margin: 0 0 0.2rem; }
    .contact-header p  { font-size: 0.8rem; color: #4b5563; margin: 0; }

    .contact-body { display: flex; flex-direction: column; gap: 0.9rem; }

    /* Campus hero */
    .campus-hero {
      position: relative; height: 150px; border-radius: 1rem; overflow: hidden;
      border: 1px solid rgba(99,102,241,0.15); background: rgba(15,23,42,0.65);
      display: flex; align-items: center; justify-content: center;
    }
    .banner-logo {
      max-height: 80%; max-width: 80%; object-fit: contain !important;
      margin-bottom: 1.5rem; filter: drop-shadow(0 4px 12px rgba(99,102,241,0.2));
    }
    .campus-img { width: 100%; height: 100%; object-fit: cover; }
    .campus-fallback {
      width: 100%; height: 100%; background: rgba(30,27,75,0.7);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
    }
    .campus-label {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
      padding: 0.75rem 1rem;
      display: flex; flex-direction: column; gap: 0.15rem;
    }
    .campus-label span { font-size: 0.85rem; font-weight: 700; color: white; }
    .accred { font-size: 0.65rem !important; font-weight: 600 !important; color: #818cf8 !important; }

    /* Contact grid */
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .contact-card {
      display: flex; align-items: center; gap: 0.7rem;
      background: rgba(15,23,42,0.7); border: 1px solid rgba(99,102,241,0.15);
      border-radius: 0.875rem; padding: 0.8rem 0.9rem;
      text-decoration: none; cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .contact-card:hover:not(.no-link) { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.07); }
    .contact-card.no-link { cursor: default; }
    .contact-icon {
      width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; flex-shrink: 0;
      background: rgba(99,102,241,0.12); display: flex; align-items: center;
      justify-content: center; font-size: 1.1rem;
    }
    .contact-details { flex: 1; overflow: hidden; }
    .contact-label { display: block; font-size: 0.65rem; color: #4b5563; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
    .contact-value { display: block; font-size: 0.78rem; color: #e2e8f0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .arrow { width: 0.85rem; height: 0.85rem; color: #4b5563; flex-shrink: 0; }

    /* Hours */
    .hours-card, .dept-card {
      background: rgba(15,23,42,0.7); border: 1px solid rgba(99,102,241,0.15);
      border-radius: 1rem; padding: 1.1rem;
    }
    .hours-card h3, .dept-card h3 {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.85rem; font-weight: 700; color: white; margin: 0 0 0.8rem;
    }
    .hours-card h3 svg, .dept-card h3 svg { width: 1rem; height: 1rem; color: #818cf8; }
    .hours-grid { display: flex; flex-direction: column; gap: 0.45rem; }
    .hour-row {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.8rem;
    }
    .hour-row.today .day { color: #a5b4fc; font-weight: 700; }
    .hour-row.today .time { color: #a5b4fc; font-weight: 700; }
    .day  { width: 100px; color: #64748b; flex-shrink: 0; }
    .time { color: #94a3b8; white-space: nowrap; }
    .dots { flex: 1; border-bottom: 1px dotted rgba(99,102,241,0.12); }

    /* Dept */
    .dept-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; }
    .dept-chip {
      font-size: 0.7rem; font-weight: 600; color: #818cf8;
      background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
      border-radius: 99px; padding: 0.25rem 0.75rem;
    }

    /* Responsiveness for mobile screens */
    @media (max-width: 580px) {
      .contact-grid { grid-template-columns: 1fr !important; }
      .contact-card { padding: 0.7rem; }
      .campus-hero { height: 120px; }
    }
  `]
})
export class ContactInfoComponent {
  contacts: ContactItem[] = [
    {
      icon: '📞',
      label: 'Phone (Admissions)',
      value: '+91 915-468-6203',
      link: 'tel:+919154686203'
    },
    {
      icon: '📧',
      label: 'Email',
      value: 'admissions@nrtec.in',
      link: 'mailto:admissions@nrtec.in'
    },
    {
      icon: '🌐',
      label: 'Website',
      value: 'www.nrtec.in',
      link: 'https://www.nrtec.in'
    },
    {
      icon: '📍',
      label: 'Location',
      value: 'Narasaraopeta, AP',
      link: 'https://maps.google.com/?q=Narasaraopeta+Engineering+College'
    },
    {
      icon: '📘',
      label: 'Facebook',
      value: 'nrtenggcollege',
      link: 'https://www.facebook.com/nrtenggcollege/'
    },
    {
      icon: '📸',
      label: 'Instagram',
      value: 'nrtec',
      link: 'https://www.instagram.com/nrtec/'
    }
  ];

  officeHours = [
    { day: 'Monday – Friday', time: '9:00 AM – 5:00 PM', isToday: this.isWeekday() },
    { day: 'Saturday',        time: '9:00 AM – 1:00 PM', isToday: this.isSaturday() },
    { day: 'Sunday',          time: 'Closed',             isToday: this.isSunday() },
  ];

  departments = [
    'CSE', 'CSE – AI', 'CSE – AI & ML', 'CSE – Cyber Security',
    'CSE – Data Science', 'ECE', 'EEE', 'IT', 'Civil', 'Mechanical',
    'MBA', 'MCA', 'M.Tech'
  ];

  private isWeekday() { const d = new Date().getDay(); return d >= 1 && d <= 5; }
  private isSaturday() { return new Date().getDay() === 6; }
  private isSunday()   { return new Date().getDay() === 0; }
}
