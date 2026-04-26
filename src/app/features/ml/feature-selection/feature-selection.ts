import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FeatureSelectionService } from '../../../core/services/feature-selection';
import { FeatureSelectionResult, FeatureRank } from '../../../core/models/feature-selection.model';
import { SessionApiService } from '../../../core/services/session-api';
import { SessionFilter } from '../../../core/models/session-filter.model';

@Component({
  selector: 'app-feature-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './feature-selection.html',
  styleUrl: './feature-selection.css',
})
export class FeatureSelectionComponent implements OnInit {
  private service = inject(FeatureSelectionService);
  private sessionApi = inject(SessionApiService);
  private snackBar = inject(MatSnackBar);

  // Параметры
  sessions = signal<SessionFilter[]>([]);
  selectedSessionId = signal<number | null>(null);  // null = все сессии
  topK = signal<number>(10);

  // Состояние
  isLoading = signal(false);
  result = signal<FeatureSelectionResult | null>(null);
  errorMessage = signal('');

  // Computed: множество топ-K имён для быстрой проверки в таблице
  topSet = computed(() => new Set(this.result()?.top10 ?? []));

  displayedColumns: string[] = ['rank', 'feature', 'silhouette', 'note'];

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionApi.getSessions().subscribe({
      next: (sessions) => this.sessions.set(sessions),
      error: (err) => console.error('Error loading sessions:', err),
    });
  }

  runAnalysis(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.result.set(null);

    this.service.runFeatureSelection(this.selectedSessionId(), this.topK()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.result.set(res);
        this.snackBar.open(
          `Анализ завершён: ${res.validFeatures} из ${res.totalFeatures} признаков`,
          'OK',
          { duration: 4000 }
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Неизвестная ошибка';
        this.errorMessage.set(msg);
        this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', {
          duration: 6000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  // CSS-класс для строки (подсветка топ-K)
  rowClass(row: FeatureRank): string {
    if (this.topSet().has(row.feature)) return 'top-feature';
    if (row.silhouette === null) return 'constant-feature';
    return '';
  }

  // Цвет метки по значению силуэта
  silhouetteClass(value: number | null): string {
    if (value === null) return 'chip-na';
    if (value >= 0.6) return 'chip-excellent';
    if (value >= 0.4) return 'chip-good';
    if (value >= 0.2) return 'chip-medium';
    return 'chip-weak';
  }

  silhouetteLabel(value: number | null): string {
    if (value === null) return 'N/A';
    return value.toFixed(4);
  }
}
