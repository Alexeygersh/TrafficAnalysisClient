import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FlowMLService } from '../../../core/services/flow-ml.service';
import {
  FlowMLAnalyzeResult, FlowMLPrediction, ModelType
} from '../../../core/models/flow-ml.model';
import { SessionApiService } from '../../../core/services/session-api.service';
import { SessionFilter } from '../../../core/models/session-filter.model';
import {RouterLink, Router} from '@angular/router';

@Component({
  selector: 'app-flow-analyze',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatButtonToggleModule,
    MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
    MatTableModule, MatChipsModule, MatTooltipModule, RouterLink,
  ],
  templateUrl: './flow-analyze.html',
  styleUrl: './flow-analyze.css',
})
export class FlowAnalyzeComponent implements OnInit {
  private service = inject(FlowMLService);
  private sessionApi = inject(SessionApiService);
  private snackBar = inject(MatSnackBar);
  constructor(private router: Router) {}

  // Параметры
  sessions = signal<SessionFilter[]>([]);
  selectedSessionId = signal<number | null>(null);
  selectedModel = signal<ModelType>('rf');

  // Состояние
  isLoading = signal(false);
  result = signal<FlowMLAnalyzeResult | null>(null);

  // Фильтр таблицы (Все / Только атаки / По уровню угрозы)
  tableFilter = signal<'all' | 'attacks' | 'Low' | 'Medium' | 'High' | 'Critical'>('all');

  displayedColumns = [
    'flowId', 'source', 'destination', 'port', 'protocol',
    'isAttack', 'confidence', 'threatLevel', 'method', //'actions',
  ];

  filteredPredictions = computed<FlowMLPrediction[]>(() => {
    const r = this.result();
    if (!r) return [];
    const filter = this.tableFilter();
    let items = r.predictions;
    if (filter === 'attacks') items = items.filter(p => p.isAttack);
    else if (filter === 'Low' || filter === 'Medium'
          || filter === 'High' || filter === 'Critical') {
      items = items.filter(p => p.threatLevel === filter);
    }
    return items;
  });

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionApi.getSessions().subscribe({
      next: (s) => this.sessions.set(s),
      error: (err) => console.error('Error loading sessions:', err),
    });
  }

  runAnalysis(): void {
    const sid = this.selectedSessionId();
    if (!sid) {
      this.snackBar.open('Выберите сессию', 'Закрыть', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);
    this.result.set(null);
    this.tableFilter.set('all');

    this.service.runFlowAnalysis(sid, this.selectedModel()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.result.set(res);
        this.snackBar.open(
          `Анализ завершён: ${res.attackFlows} атак из ${res.totalFlows} flows`,
          'OK',
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Неизвестная ошибка';
        this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', {
          duration: 6000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }


  navigateToFlow(flowId: number) {
    this.router.navigate(['/flows', flowId]);
  }

  // CSS-класс для цветовой подсветки строки
  threatRowClass(threat: string): string {
    return `threat-row-${threat.toLowerCase()}`;
  }

  // CSS-класс чипа threat level
  threatChipClass(threat: string): string {
    return `threat-chip-${threat.toLowerCase()}`;
  }

  // Человекочитаемая метка метода
  methodLabel(method: string): string {
    switch (method) {
      case 'supervised':   return 'RF/CatBoost';
      case 'unsupervised': return 'IF (Zero-day)';
      case 'both':         return 'Оба';
      default:             return '—';
    }
  }

  // Процент confidence
  confidencePct(c: number): string {
    return `${(c * 100).toFixed(1)}%`;
  }

  // Сколько flows было помечено атаками (для кнопки фильтра)
  attackCount = computed(() => this.result()?.attackFlows ?? 0);

  // Разбивка по уровням — для чипов
  breakdownItems = computed(() => {
    const r = this.result();
    if (!r) return [];
    const order = ['Critical', 'High', 'Medium', 'Low'];
    return order
      .filter(k => (r.threatLevelBreakdown[k] ?? 0) > 0)
      .map(k => ({ level: k, count: r.threatLevelBreakdown[k] }));
  });
}
