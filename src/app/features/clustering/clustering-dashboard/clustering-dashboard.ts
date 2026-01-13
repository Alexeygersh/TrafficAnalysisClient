import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Material
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

import {ClusteringService, SessionFilter} from '../../../core/services/clustering';
import { SourceMetrics, ClusterInfo } from '../../../core/models/source-metrics.model';

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
    MatBadgeModule
  ],
  templateUrl: './clustering-dashboard.html',
  styleUrls: ['./clustering-dashboard.css']
})
export class ClusteringDashboard implements OnInit {
  private clusteringService = inject(ClusteringService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Данные
  sourceMetrics = signal<SourceMetrics[]>([]);
  clusterInfo = signal<ClusterInfo[]>([]);
  isLoading = signal(true);
  isRecalculating = signal(false);

  // Параметры кластеризации
  clusteringMethod = signal<string>('kmeans');
  numberOfClusters = signal<number>(3);

  // Фильтры
  selectedClusterId = signal<number | null>(null);
  showOnlyDangerous = signal<boolean>(false);

  // Отфильтрованные данные
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

  // Статистика
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

  // Колонки таблицы
  displayedColumns = [
    'sourceIP',
    'clusterId',
    'packetsPerSecond',
    'packetCount',
    'averagePacketSize',
    'uniquePorts',
    'dangerScore',
    'status'
  ];

  sessions = signal<SessionFilter[]>([]);
  selectedSessionId = signal<number | null>(null);

  ngOnInit() {
    this.loadData();
    this.loadSessions();
  }

  openVisualization(): void {
    const sessionId = this.selectedSessionId();
    if (sessionId) {
      this.router.navigate(['/clustering/visualize'], {
        queryParams: { sessionId }
      });
    }
  }

  loadSessions() {
    this.clusteringService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
      }
    });
  }

  loadData() {
    this.isLoading.set(true);

    // Загрузка метрик источников
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

    // Загрузка информации о кластерах
    this.clusteringService.getClusterInfo().subscribe({
      next: (info) => {
        this.clusterInfo.set(info);
      },
      error: (err) => {
        console.error('Error loading cluster info:', err);
      }
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
  // НОВЫЙ МЕТОД: Пересчёт из БД
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
          `Ошибка: ${err.error?.message || err.message}`,
          'Закрыть',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  selectSession(sessionId: number | null) {
    this.selectedSessionId.set(sessionId);
  }

  selectCluster(clusterId: number | null) {
    this.selectedClusterId.set(clusterId);
  }

  toggleDangerousFilter() {
    this.showOnlyDangerous.update(val => !val);
  }

  getDangerClass(dangerScore: number): string {
    if (dangerScore >= 0.8) return 'danger-critical';
    if (dangerScore >= 0.6) return 'danger-high';
    if (dangerScore >= 0.4) return 'danger-medium';
    return 'danger-low';
  }

  getClusterColor(clusterId: number): string {
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
    return colors[clusterId % colors.length];
  }

  formatSpeed(speed: number): string {
    if (speed > 1000) return `${(speed / 1000).toFixed(2)}k pkt/s`;
    return `${speed.toFixed(2)} pkt/s`;
  }

  formatBytes(bytes: number): string {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  }

  viewSourceDetails(sourceIP: string) {
    // Переход к детальному просмотру источника
    this.router.navigate(['/reports/source-history', sourceIP]);
  }
}
