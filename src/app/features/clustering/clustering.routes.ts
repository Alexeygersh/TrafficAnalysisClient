import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const CLUSTERING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./clustering-dashboard/clustering-dashboard')
        .then(m => m.ClusteringDashboard),
    canActivate: [authGuard]
  },
  {
    path: 'visualize',
    loadComponent: () =>
      import('./cluster-visualization/cluster-visualization')
        .then(m => m.ClusterVisualization),
    canActivate: [authGuard]
  }
];
