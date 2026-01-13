import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../core/services/auth';
import { ThemeService } from '../../core/services/theme';
import {DomSanitizer} from '@angular/platform-browser';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTooltip
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.matIconRegistry.addSvgIcon(
      'diagram-logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/diagram_logo.svg')
    );
  }

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  sidenavOpened = signal(true);
  currentUser = this.authService.currentUser$;

  menuItems = [
    {
      icon: 'dashboard',
      label: 'Дашборд',
      route: '/reports',
      roles: ['Admin', 'Analyst']
    },
    {
      icon: 'scatter_plot',
      label: 'Кластеризация',
      route: '/clustering',
      roles: ['Admin', 'Analyst']
    },
    {
      icon: 'network_check',
      label: 'Пакеты',
      route: '/packets',
      roles: ['Admin', 'Analyst']
    },
    {
      icon: 'analytics',
      label: 'Анализ',
      route: '/analysis',
      roles: ['Admin', 'Analyst']
    },
    {
      icon: 'schedule',
      label: 'Сессии',
      route: '/sessions',
      roles: ['Admin', 'Analyst']
    },
    {
      icon: 'admin_panel_settings',
      label: 'Админ панель',
      route: '/admin/users',
      roles: ['Admin']
    },
    {
      icon: 'upload_file',
      label: 'Импорт CSV',
      route: '/import/csv',
      roles: ['Admin']
    }
  ];

  toggleSidenav(): void {
    this.sidenavOpened.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }

  hasAccess(roles: string[]): boolean {
    const user = this.authService.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  get userName(): string {
    return this.authService.getCurrentUser()?.username || 'User';
  }

  get userRole(): string {
    return this.authService.getCurrentUser()?.role || 'Guest';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
