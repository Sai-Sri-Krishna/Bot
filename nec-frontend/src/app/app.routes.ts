import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () => import('./features/splash/splash.component').then(m => m.SplashComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'chat', pathMatch: 'full' },
      {
        path: 'chat',
        loadComponent: () => import('./features/main/main-layout.component').then(m => m.MainLayoutComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/splash' }
];
