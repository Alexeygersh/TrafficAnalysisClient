import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';

import { AnalysisService, AnalysisFilters } from '../../../core/services/analysis';
import { AuthService } from '../../../core/services/auth';
import { TrafficAnalysis } from '../../../core/models/traffic-analysis.model';
import { MainLayout } from '../../../layout/main-layout/main-layout';

@Component({
  selector: 'app-analysis-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSliderModule,
  ],
  templateUrl: './analysis-list.html',
  styleUrl: './analysis-list.css'
})
export class AnalysisList implements OnInit {
  private analysisService = inject(AnalysisService);
  authService = inject(AuthService);

  // Данные
  allAnalyses = signal<TrafficAnalysis[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  // Фильтры
  filters = signal<AnalysisFilters>({});

  // Сортировка
  sortBy = signal<keyof TrafficAnalysis>('detectedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Вычисляемый список отфильтрованных анализов
  filteredAnalyses = computed(() => {
    let analyses = this.allAnalyses();

    // Применяем фильтры
    analyses = this.analysisService.filterAnalyses(analyses, this.filters());

    // Применяем сортировку
    analyses = this.analysisService.sortAnalyses(
      analyses,
      this.sortBy(),
      this.sortDirection()
    );

    return analyses;
  });

  // Статистика
  statistics = computed(() => {
    const all = this.allAnalyses();
    const filtered = this.filteredAnalyses();

    return {
      total: all.length,
      filtered: filtered.length,
      malicious: filtered.filter(a => a.isMalicious).length,
      critical: filtered.filter(a => a.threatLevel === 'Critical').length,
      high: filtered.filter(a => a.threatLevel === 'High').length,
      medium: filtered.filter(a => a.threatLevel === 'Medium').length,
      low: filtered.filter(a => a.threatLevel === 'Low').length
    };
  });

  // Колонки таблицы
  displayedColumns: string[] = [
    'id',
    'packetId',
    'threatLevel',
    'isMalicious',
    'mlModelScore',
    'detectedAt',
    'actions'
  ];

  // Опции для фильтров
  threatLevels = ['Low', 'Medium', 'High', 'Critical'];
  maliciousOptions = [
    { label: 'Все', value: undefined },
    { label: 'Вредоносные', value: true },
    { label: 'Безопасные', value: false }
  ];

  ngOnInit(): void {
    this.loadAnalyses();
  }

  loadAnalyses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.analysisService.getAllAnalyses().subscribe({
      next: (analyses) => {
        this.allAnalyses.set(analyses);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки анализов');
        this.isLoading.set(false);
      }
    });
  }

  // Применить фильтры
  applyFilters(filterUpdates: Partial<AnalysisFilters>): void {
    this.filters.update(current => ({ ...current, ...filterUpdates }));
  }

  // Сбросить фильтры
  clearFilters(): void {
    this.filters.set({});
  }

  // Изменить сортировку
  changeSort(column: keyof TrafficAnalysis): void {
    if (this.sortBy() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('desc');
    }
  }

  // Удаление анализа
  deleteAnalysis(id: number): void {
    if (!confirm('Вы уверены, что хотите удалить этот анализ?')) {
      return;
    }

    this.analysisService.deleteAnalysis(id).subscribe({
      next: () => {
        this.allAnalyses.update(analyses => analyses.filter(a => a.id !== id));
      },
      error: (error) => {
        alert(`Ошибка удаления: ${error.message}`);
      }
    });
  }

  // Получить CSS класс для уровня угрозы
  getThreatClass(threatLevel: string): string {
    switch (threatLevel.toLowerCase()) {
      case 'critical': return 'threat-critical';
      case 'high': return 'threat-high';
      case 'medium': return 'threat-medium';
      case 'low': return 'threat-low';
      default: return 'threat-none';
    }
  }

  // Форматирование даты
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ru-RU');
  }

  formatMLScore(value: number): string {
    return `${(value * 100).toFixed(0)}%`;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
