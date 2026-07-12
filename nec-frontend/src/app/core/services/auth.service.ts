import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  token: string;
  role: string;
  name: string;
  email: string;
  isGuest: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = environment.springBootUrl;
  private readonly TOKEN_KEY = 'nec_jwt';
  private readonly USER_KEY  = 'nec_user';

  private _user$ = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this._user$.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): AuthUser | null { return this._user$.value; }
  get isLoggedIn(): boolean          { return !!this._user$.value; }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.BASE}/api/auth/login`, { email, password }).pipe(
      tap(res => this.setSession(res, false))
    );
  }

  guestLogin(): Observable<any> {
    return this.http.post<any>(`${this.BASE}/api/auth/guest`, {}).pipe(
      tap(res => this.setSession(res, true))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(res: any, isGuest: boolean): void {
    const user: AuthUser = { ...res, isGuest };
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
