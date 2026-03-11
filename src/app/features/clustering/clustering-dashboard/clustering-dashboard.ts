// import { Component, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
//
// // Material
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatTableModule } from '@angular/material/table';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatBadgeModule } from '@angular/material/badge';
//
// import {ClusteringService, SessionFilter} from '../../../core/services/clustering';
// import { SourceMetrics, ClusterInfo } from '../../../core/models/source-metrics.model';
//
// @Component({
//   selector: 'app-clustering-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MatCardModule,
//     MatButtonModule,
//     MatIconModule,
//     MatTableModule,
//     MatChipsModule,
//     MatProgressSpinnerModule,
//     MatSelectModule,
//     MatFormFieldModule,
//     MatSnackBarModule,
//     MatTabsModule,
//     MatTooltipModule,
//     MatBadgeModule
//   ],
//   templateUrl: './clustering-dashboard.html',
//   styleUrls: ['./clustering-dashboard.css']
// })
// export class ClusteringDashboard implements OnInit {
//   private clusteringService = inject(ClusteringService);
//   private snackBar = inject(MatSnackBar);
//   private router = inject(Router);
//
//   // Данные
//   sourceMetrics = signal<SourceMetrics[]>([]);
//   clusterInfo = signal<ClusterInfo[]>([]);
//   isLoading = signal(true);
//   isRecalculating = signal(false);
//
//   // Параметры кластеризации
//   clusteringMethod = signal<string>('kmeans');
//   numberOfClusters = signal<number>(3);
//
//   // Фильтры
//   selectedClusterId = signal<number | null>(null);
//   showOnlyDangerous = signal<boolean>(false);
//
//   // Отфильтрованные данные
//   filteredSources = computed(() => {
//     let sources = this.sourceMetrics();
//
//     if (this.selectedClusterId() !== null) {
//       sources = sources.filter(s => s.clusterId === this.selectedClusterId());
//     }
//
//     if (this.showOnlyDangerous()) {
//       sources = sources.filter(s => s.isDangerous);
//     }
//
//     return sources.sort((a, b) => b.dangerScore - a.dangerScore);
//   });
//
//   // Статистика
//   statistics = computed(() => {
//     const sources = this.sourceMetrics();
//     const dangerousSources = sources.filter(s => s.isDangerous);
//
//     return {
//       totalSources: sources.length,
//       dangerousSources: dangerousSources.length,
//       totalClusters: this.clusterInfo().length,
//       avgSpeed: sources.length > 0
//         ? sources.reduce((sum, s) => sum + s.packetsPerSecond, 0) / sources.length
//         : 0,
//       maxSpeed: sources.length > 0
//         ? Math.max(...sources.map(s => s.packetsPerSecond))
//         : 0,
//       totalPackets: sources.reduce((sum, s) => sum + s.packetCount, 0)
//     };
//   });
//
//   // Колонки таблицы
//   displayedColumns = [
//     'sourceIP',
//     'clusterId',
//     'packetsPerSecond',
//     'packetCount',
//     'averagePacketSize',
//     'uniquePorts',
//     'dangerScore',
//     'status'
//   ];
//
//   sessions = signal<SessionFilter[]>([]);
//   selectedSessionId = signal<number | null>(null);
//
//   ngOnInit() {
//     this.loadData();
//     this.loadSessions();
//   }
//
//   openVisualization(): void {
//     const sessionId = this.selectedSessionId();
//     if (sessionId) {
//       this.router.navigate(['/clustering/visualize'], {
//         queryParams: { sessionId }
//       });
//     }
//   }
//
//   loadSessions() {
//     this.clusteringService.getSessions().subscribe({
//       next: (sessions) => {
//         this.sessions.set(sessions);
//       },
//       error: (err) => {
//         console.error('Error loading sessions:', err);
//       }
//     });
//   }
//
//   loadData() {
//     this.isLoading.set(true);
//
//     // Загрузка метрик источников
//     this.clusteringService.getSourceMetrics().subscribe({
//       next: (metrics) => {
//         this.sourceMetrics.set(metrics);
//         this.isLoading.set(false);
//       },
//       error: (err) => {
//         console.error('Error loading source metrics:', err);
//         this.isLoading.set(false);
//         this.snackBar.open('Ошибка загрузки данных', 'Закрыть', {
//           duration: 3000,
//           panelClass: ['error-snackbar']
//         });
//       }
//     });
//
//     // Загрузка информации о кластерах
//     this.clusteringService.getClusterInfo().subscribe({
//       next: (info) => {
//         this.clusterInfo.set(info);
//       },
//       error: (err) => {
//         console.error('Error loading cluster info:', err);
//       }
//     });
//   }
//
//   recalculateClusters() {
//     this.isRecalculating.set(true);
//
//     this.clusteringService.recalculateClusters(
//       this.clusteringMethod(),
//       this.numberOfClusters()
//     ).subscribe({
//       next: () => {
//         this.isRecalculating.set(false);
//         this.snackBar.open('Кластеры пересчитаны!', 'OK', { duration: 3000 });
//         this.loadData();
//       },
//       error: (err) => {
//         this.isRecalculating.set(false);
//         this.snackBar.open(
//           `Ошибка перерасчёта: ${err.error?.message || err.message}`,
//           'Закрыть',
//           { duration: 5000, panelClass: ['error-snackbar'] }
//         );
//       }
//     });
//   }
//   // НОВЫЙ МЕТОД: Пересчёт из БД
//   recalculateFromDatabase() {
//     this.isRecalculating.set(true);
//
//     this.clusteringService.recalculateFromDatabase(
//       this.selectedSessionId(),
//       this.clusteringMethod(),
//       this.numberOfClusters()
//     ).subscribe({
//       next: () => {
//         this.isRecalculating.set(false);
//         this.snackBar.open(
//           'Кластеры пересчитаны на основе существующих пакетов!',
//           'OK',
//           { duration: 3000 }
//         );
//         this.loadData();
//       },
//       error: (err) => {
//         this.isRecalculating.set(false);
//         this.snackBar.open(
//           `Ошибка: ${err.error?.message || err.message}`,
//           'Закрыть',
//           { duration: 5000, panelClass: ['error-snackbar'] }
//         );
//       }
//     });
//   }
//
//   selectSession(sessionId: number | null) {
//     this.selectedSessionId.set(sessionId);
//   }
//
//   selectCluster(clusterId: number | null) {
//     this.selectedClusterId.set(clusterId);
//   }
//
//   toggleDangerousFilter() {
//     this.showOnlyDangerous.update(val => !val);
//   }
//
//   getDangerClass(dangerScore: number): string {
//     if (dangerScore >= 0.8) return 'danger-critical';
//     if (dangerScore >= 0.6) return 'danger-high';
//     if (dangerScore >= 0.4) return 'danger-medium';
//     return 'danger-low';
//   }
//
//   getClusterColor(clusterId: number): string {
//     const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
//     return colors[clusterId % colors.length];
//   }
//
//   formatSpeed(speed: number): string {
//     if (speed > 1000) return `${(speed / 1000).toFixed(2)}k pkt/s`;
//     return `${speed.toFixed(2)} pkt/s`;
//   }
//
//   formatBytes(bytes: number): string {
//     if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//     if (bytes > 1024) return `${(bytes / 1024).toFixed(2)} KB`;
//     return `${bytes} B`;
//   }
//
//   viewSourceDetails(sourceIP: string) {
//     // Переход к детальному просмотру источника
//     this.router.navigate(['/reports/source-history', sourceIP]);
//   }
// }
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { ClusteringService, SessionFilter } from '../../../core/services/clustering';
import {
  SourceMetrics,
  ClusterInfo,
  SourceMLPrediction,
  MLAnalyzeResult
} from '../../../core/models/source-metrics.model';

@Component({
  selector: 'app-clustering-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  templateUrl: './clustering-dashboard.html',
  styleUrls: ['./clustering-dashboard.css']
})
export class ClusteringDashboard implements OnInit {
  private clusteringService = inject(ClusteringService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // --- Данные ---
  sourceMetrics = signal<SourceMetrics[]>([]);
  clusterInfo = signal<ClusterInfo[]>([]);
  isLoading = signal(true);
  isRecalculating = signal(false);

  // --- Параметры кластеризации ---
  clusteringMethod = signal<string>('kmeans');
  numberOfClusters = signal<number>(3);

  // --- Фильтры ---
  selectedClusterId = signal<number | null>(null);
  showOnlyDangerous = signal<boolean>(false);

  // --- ML IDS ---
  isMLAnalyzing = signal(false);
  mlResult = signal<MLAnalyzeResult | null>(null);
  /** Словарь: sourceIP → предсказание, для быстрого поиска в таблице */
  mlPredictionsMap = signal<Map<string, SourceMLPrediction>>(new Map());

  // --- Сессии ---
  sessions = signal<SessionFilter[]>([]);
  selectedSessionId = signal<number | null>(null);

  // --- Отфильтрованные данные ---
  filteredSources = computed(() => {
    let sources = this.sourceMetrics();

    if (this.selectedClusterId() !== null) {
      sources = sources.filter(s => s.clusterId === this.selectedClusterId());
    }
    if (this.showOnlyDangerous()) {
      sources = sources.filter(s => s.isDangerous);
    }

    return sources.sort((a, b) => b.dangerScore - a.dangerScore);
  });

  // --- Статистика ---
  statistics = computed(() => {
    const sources = this.sourceMetrics();
    const dangerousSources = sources.filter(s => s.isDangerous);

    return {
      totalSources: sources.length,
      dangerousSources: dangerousSources.length,
      totalClusters: this.clusterInfo().length,
      avgSpeed: sources.length > 0
        ? sources.reduce((sum, s) => sum + s.packetsPerSecond, 0) / sources.length
        : 0,
      maxSpeed: sources.length > 0
        ? Math.max(...sources.map(s => s.packetsPerSecond))
        : 0,
      totalPackets: sources.reduce((sum, s) => sum + s.packetCount, 0)
    };
  });

  // --- Колонки таблицы (mlThreat добавляется динамически) ---
  displayedColumns = [
    'sourceIP',
    'clusterId',
    'packetsPerSecond',
    'packetCount',
    'averagePacketSize',
    'uniquePorts',
    'dangerScore',
    'status',
    'mlThreat',   // колонка ML — пустая пока ML-анализ не запущен
  ];

  ngOnInit() {
    this.loadData();
    this.loadSessions();
  }

  openVisualization(): void {
    const sessionId = this.selectedSessionId();
    if (sessionId) {
      this.router.navigate(['/clustering/visualize'], { queryParams: { sessionId } });
    }
  }

  loadSessions() {
    this.clusteringService.getSessions().subscribe({
      next: (sessions) => this.sessions.set(sessions),
      error: (err) => console.error('Error loading sessions:', err)
    });
  }

  loadData() {
    this.isLoading.set(true);

    this.clusteringService.getSourceMetrics().subscribe({
      next: (metrics) => {
        this.sourceMetrics.set(metrics);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading source metrics:', err);
        this.isLoading.set(false);
        this.snackBar.open('Ошибка загрузки данных', 'Закрыть', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });

    this.clusteringService.getClusterInfo().subscribe({
      next: (info) => this.clusterInfo.set(info),
      error: (err) => console.error('Error loading cluster info:', err)
    });
  }

  recalculateClusters() {
    this.isRecalculating.set(true);
    this.clusteringService.recalculateClusters(
      this.clusteringMethod(),
      this.numberOfClusters()
    ).subscribe({
      next: () => {
        this.isRecalculating.set(false);
        this.snackBar.open('Кластеры пересчитаны!', 'OK', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        this.isRecalculating.set(false);
        this.snackBar.open(
          `Ошибка перерасчёта: ${err.error?.message || err.message}`,
          'Закрыть',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  recalculateFromDatabase() {
    this.isRecalculating.set(true);
    this.clusteringService.recalculateFromDatabase(
      this.selectedSessionId(),
      this.clusteringMethod(),
      this.numberOfClusters()
    ).subscribe({
      next: () => {
        this.isRecalculating.set(false);
        this.snackBar.open(
          'Кластеры пересчитаны на основе существующих пакетов!',
          'OK',
          { duration: 3000 }
        );
        this.loadData();
      },
      error: (err) => {
        this.isRecalculating.set(false);
        this.snackBar.open(
          `Ошибка перерасчёта: ${err.error?.message || err.message}`,
          'Закрыть',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  // --- ML IDS ---

  runMLAnalysis() {
    const sessionId = this.selectedSessionId();
    if (!sessionId) {
      this.snackBar.open('Выберите сессию для ML-анализа', 'Закрыть', { duration: 3000 });
      return;
    }

    this.isMLAnalyzing.set(true);
    this.mlResult.set(null);
    this.mlPredictionsMap.set(new Map());

    this.clusteringService.runMLAnalysis(sessionId).subscribe({
      next: (result) => {
        this.isMLAnalyzing.set(false);
        this.mlResult.set(result);

        // Строим словарь для быстрого доступа из таблицы
        const map = new Map<string, SourceMLPrediction>();
        result.predictions.forEach(p => map.set(p.sourceIP, p));
        this.mlPredictionsMap.set(map);

        this.snackBar.open(
          `ML-анализ завершён: ${result.attackSources} из ${result.totalSources} источников — атаки`,
          'OK',
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.isMLAnalyzing.set(false);
        this.snackBar.open(
          `Ошибка ML-анализа: ${err.error?.message || err.message}`,
          'Закрыть',
          { duration: 6000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  getMLPrediction(sourceIP: string): SourceMLPrediction | undefined {
    return this.mlPredictionsMap().get(sourceIP);
  }

  // --- Вспомогательные методы ---

  selectCluster(id: number | null) {
    this.selectedClusterId.set(id);
  }

  toggleDangerousFilter() {
    this.showOnlyDangerous.set(!this.showOnlyDangerous());
  }

  getClusterColor(clusterId: number): string {
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];
    return colors[clusterId % colors.length];
  }

  getDangerClass(score: number): string {
    if (score >= 0.75) return 'danger-critical';
    if (score >= 0.5)  return 'danger-high';
    if (score >= 0.25) return 'danger-medium';
    return 'danger-low';
  }

  getThreatLevelClass(level: string): string {
    return `ml-threat-${level.toLowerCase()}`;
  }

  getMethodLabel(method: string): string {
    switch (method) {
      case 'supervised':   return 'RF';
      case 'unsupervised': return 'Zero-day';
      case 'both':         return 'RF+IF';
      default:             return '—';
    }
  }

  formatSpeed(speed: number): string {
    if (speed >= 1000) return `${(speed / 1000).toFixed(1)}K pps`;
    return `${speed.toFixed(1)} pps`;
  }

  formatBytes(bytes: number): string {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes.toFixed(0)} B`;
  }
}
