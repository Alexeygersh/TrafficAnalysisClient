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
      // Редирект на packets
      {
        path: '',
        redirectTo: 'packets',
        pathMatch: 'full'
      },

      // Пакеты
      {
        path: 'packets',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/packets/packet-list/packet-list').then(m => m.PacketList)
          },
          {
            path: 'new',
            canActivate: [adminGuard],
            loadComponent: () => import('./features/packets/packet-form/packet-form').then(m => m.PacketForm)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/packets/packet-detail/packet-detail').then(m => m.PacketDetail)
          },
          {
            path: ':id/edit',
            canActivate: [adminGuard],
            loadComponent: () => import('./features/packets/packet-form/packet-form').then(m => m.PacketForm)
          }
        ]
      },

      // Анализ
      {
        path: 'analysis',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/analysis/analysis-list/analysis-list').then(m => m.AnalysisList)
          },
          {
            path: 'new',
            canActivate: [adminGuard],
            loadComponent: () => import('./features/analysis/analysis-form/analysis-form').then(m => m.AnalysisForm)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/analysis/analysis-detail/analysis-detail').then(m => m.AnalysisDetail)
          }
        ]
      },

      // Сессии
      {
        path: 'sessions',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/sessions/session-list/session-list').then(m => m.SessionList)
          },
          {
            path: 'new',
            canActivate: [adminGuard],
            loadComponent: () => import('./features/sessions/session-form/session-form').then(m => m.SessionForm)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/sessions/session-detail/session-detail').then(m => m.SessionDetail)
          },
          {
            path: ':id/edit',
            canActivate: [adminGuard],
            loadComponent: () => import('./features/sessions/session-form/session-form').then(m => m.SessionForm)
          }
        ]
      },

      // Отчеты
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/dashboard/dashboard').then(m => m.Dashboard)
      },

      // Администрирование
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'users',
            loadComponent: () => import('./features/admin/user-management/user-management').then(m => m.UserManagement)
          }
        ]
      },

      // Импорт
      {
        path: 'import',
        canActivate: [adminGuard],
        children: [
          {
            path: 'csv',
            loadComponent: () =>
              import('./features/import/csv-import/csv-import')
                .then(m => m.CsvImportComponent)
          }
        ]
      },

      // Кластеризация
      // {
      //   path: 'clustering',
      //   canActivate: [authGuard],
      //   loadComponent: () =>
      //     import('./features/clustering/clustering-dashboard/clustering-dashboard')
      //       .then(m => m.ClusteringDashboard)
      // },
      //
      // {
      //   path: 'clustering',
      //   canActivate: [authGuard],
      //   loadComponent: () => import('./features/clustering/cluster-visualization/cluster-visualization')
      //     .then(m => m.ClusterVisualization)
      // }
      {
        path: 'clustering',
        loadChildren: () =>
          import('./features/clustering/clustering.routes')
            .then(m => m.CLUSTERING_ROUTES)
      }

    ]
  },

  // 404
  {
    path: '**',
    redirectTo: '/packets'
  }
];
