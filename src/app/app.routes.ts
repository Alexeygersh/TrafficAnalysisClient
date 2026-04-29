import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  // Страница входа (БЕЗ layout)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      // Редирект на dashboard
      {
        path: '',
        redirectTo: 'reports',
        pathMatch: 'full'
      },

      // Пакеты
      {
        path: 'packets',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/packets/packet-list/packet-list')
                .then(m => m.PacketList)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/packets/packet-detail/packet-detail')
                .then(m => m.PacketDetail)
          },
        ]
      },

      // Сессии
      // {
      //   path: 'sessions',
      //   children: [
      //     {
      //       path: '',
      //       loadComponent: () =>
      //         import('./features/sessions/session-list/session-list')
      //           .then(m => m.SessionList)
      //     },
      //     {
      //       path: 'new',
      //       canActivate: [adminGuard],
      //       loadComponent: () =>
      //         import('./features/sessions/session-form/session-form')
      //           .then(m => m.SessionForm)
      //     },
      //     {
      //       path: ':id',
      //       loadComponent: () =>
      //         import('./features/sessions/session-detail/session-detail')
      //           .then(m => m.SessionDetail)
      //     },
      //     {
      //       path: ':id/edit',
      //       canActivate: [adminGuard],
      //       loadComponent: () =>
      //         import('./features/sessions/session-form/session-form')
      //           .then(m => m.SessionForm)
      //     }
      //   ]
      // },

      // Файлы PCAP (объединённый импорт + список)
      {
        path: 'pcap-files',
        loadComponent: () =>
          import('./features/pcap-files/pcap-files')
            .then(m => m.PcapFilesComponent)
      },

      // Детали файла (старый session-detail) — оставляем по тому же пути
      {
        path: 'sessions/:id',
        loadComponent: () =>
          import('./features/sessions/session-detail/session-detail')
            .then(m => m.SessionDetail)
      },

      // Dashboard / Отчёты
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/dashboard/dashboard')
            .then(m => m.Dashboard)
      },

      // Администрирование
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/user-management/user-management')
                .then(m => m.UserManagement)
          }
        ]
      },

      // ML-аналитика
      {
        path: 'ml/feature-selection',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/ml/feature-selection/feature-selection')
            .then(m => m.FeatureSelectionComponent)
      },
      {
        path: 'ml/flow-analyze',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/ml/flow-analyze/flow-analyze')
            .then(m => m.FlowAnalyzeComponent)
      },

      {
        path: 'flows/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/ml/flow-detail/flow-detail')
            .then(m => m.FlowDetailComponent)
      },

      {
        path: 'ml/similarity',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/ml/similarity/similarity')
            .then(m => m.SimilarityComponent)
      },

    ]
  },

  // 404
  {
    path: '**',
    redirectTo: '/reports'
  }
];
