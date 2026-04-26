import {
  Component, OnInit, OnDestroy, inject, signal, computed,
  ViewChild, ElementRef, AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Chart, registerables } from 'chart.js';

import { FlowMLService } from '../../../core/services/flow-ml';
import {
  FlowMLAnalyzeResult, FlowMLPrediction, ModelType
} from '../../../core/models/flow-ml.model';
import { SessionApiService } from '../../../core/services/session-api';
import { SessionFilter } from '../../../core/models/session-filter.model';
import { DashboardStats } from '../../../core/models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule,
    MatSelectModule, MatFormFieldModule,
    MatButtonToggleModule, MatTooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private flowMl = inject(FlowMLService);
  private sessionApi = inject(SessionApiService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('threatDistCanvas') threatDistCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('protocolCanvas') protocolCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topAttackersCanvas') topAttackersCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('methodCanvas') methodCanvas!: ElementRef<HTMLCanvasElement>;

  // Состояние
  sessions = signal<SessionFilter[]>([]);
  selectedSessionId = signal<number | null>(null);
  selectedModel = signal<ModelType>('rf');
  isLoading = signal(false);
  result = signal<FlowMLAnalyzeResult | null>(null);
  errorMessage = signal('');

  // Graphs
  private threatDistChart?: Chart;
  private protocolChart?: Chart;
  private topAttackersChart?: Chart;
  private methodChart?: Chart;
  private viewInited = false;

  // Вычисляемые статистики для карточек и графиков
  stats = computed<DashboardStats | null>(() => {
    const r = this.result();
    if (!r) return null;
    return this.buildStats(r);
  });

  ngOnInit(): void {
    this.loadSessions();
  }

  ngAfterViewInit(): void {
    this.viewInited = true;
    // Если результат уже есть (загрузился пока view ждал) — рисуем
    if (this.result()) this.renderCharts();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadSessions(): void {
    this.sessionApi.getSessions().subscribe({
      next: (sess) => {
        this.sessions.set(sess);

        // Автовыбор свежей сессии (max id) с flowCount > 0
        const withFlows = sess.filter(s => s.flowCount > 0);
        if (withFlows.length > 0) {
          const latest = withFlows.reduce((p, c) => c.id > p.id ? c : p);
          this.selectedSessionId.set(latest.id);
          // Автозапуск
          this.runAnalysis();
        }
      },
      error: () => {
        this.errorMessage.set('Не удалось загрузить сессии');
      },
    });
  }

  runAnalysis(): void {
    const sid = this.selectedSessionId();
    if (!sid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.destroyCharts();

    this.flowMl.runFlowAnalysis(sid, this.selectedModel()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.result.set(res);
        // Даём Angular обновить DOM, потом рисуем графики
        setTimeout(() => this.renderCharts(), 0);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Неизвестная ошибка';
        this.errorMessage.set(msg);
        this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', {
          duration: 5000, panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onSessionChange(): void {
    this.runAnalysis();
  }

  onModelChange(): void {
    this.runAnalysis();
  }

  // ============================================================
  // Построение stats из result
  // ============================================================
  private buildStats(r: FlowMLAnalyzeResult): DashboardStats {
    const supervisedDetected = r.predictions.filter(
      p => p.method === 'supervised' || p.method === 'both'
    ).length;
    const unsupervisedDetected = r.predictions.filter(
      p => p.method === 'unsupervised' || p.method === 'both'
    ).length;

    // Агрегат: количество flows по протоколам
    const protoMap: { [k: string]: number } = {};
    r.predictions.forEach(p => {
      protoMap[p.protocol] = (protoMap[p.protocol] || 0) + 1;
    });

    // Топ-атакующих IP (только те что isAttack=true)
    const attackerMap = new Map<string, { attack: number; total: number }>();
    r.predictions.forEach(p => {
      const cur = attackerMap.get(p.sourceIP) || { attack: 0, total: 0 };
      cur.total += 1;
      if (p.isAttack) cur.attack += 1;
      attackerMap.set(p.sourceIP, cur);
    });
    const topAttackers = Array.from(attackerMap.entries())
      .filter(([_, v]) => v.attack > 0)
      .map(([ip, v]) => ({ sourceIP: ip, attackCount: v.attack, totalFlows: v.total }))
      .sort((a, b) => b.attackCount - a.attackCount)
      .slice(0, 5);

    // Топ-угрозы: 5 flows с самой высокой confidence среди isAttack
    const topThreats = r.predictions
      .filter(p => p.isAttack)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(p => ({
        flowId: p.flowId,
        sourceIP: p.sourceIP,
        destinationIP: p.destinationIP,
        destinationPort: p.destinationPort,
        protocol: p.protocol,
        confidence: p.confidence,
        threatLevel: p.threatLevel,
        method: p.method,
      }));

    return {
      totalFlows: r.totalFlows,
      attackFlows: r.attackFlows,
      normalFlows: r.totalFlows - r.attackFlows,
      anomalyFlows: r.anomalyFlows,
      supervisedDetected,
      unsupervisedDetected,
      threatLevelBreakdown: r.threatLevelBreakdown,
      protocolBreakdown: protoMap,
      topAttackers,
      topThreats,
    };
  }

  // ============================================================
  // Рендеринг графиков
  // ============================================================
  private renderCharts(): void {
    if (!this.viewInited) return;
    const s = this.stats();
    if (!s) return;

    this.renderThreatDist(s);
    this.renderProtocol(s);
    this.renderTopAttackers(s);
    this.renderMethod(s);
  }

  private destroyCharts(): void {
    this.threatDistChart?.destroy();
    this.protocolChart?.destroy();
    this.topAttackersChart?.destroy();
    this.methodChart?.destroy();
    this.threatDistChart = undefined;
    this.protocolChart = undefined;
    this.topAttackersChart = undefined;
    this.methodChart = undefined;
  }

  private renderThreatDist(s: DashboardStats): void {
    const ctx = this.threatDistCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const order = ['Critical', 'High', 'Medium', 'Low'];
    const colors = ['#d32f2f', '#f57c00', '#fbc02d', '#66bb6a'];
    const labels = order.filter(k => (s.threatLevelBreakdown[k] ?? 0) > 0);
    const values = labels.map(l => s.threatLevelBreakdown[l]);
    const bgColors = labels.map(l => colors[order.indexOf(l)]);

    this.threatDistChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  private renderProtocol(s: DashboardStats): void {
    const ctx = this.protocolCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const entries = Object.entries(s.protocolBreakdown)
      .sort((a, b) => b[1] - a[1]);
    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);

    this.protocolChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Flows',
          data: values,
          backgroundColor: '#667eea',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  }

  private renderTopAttackers(s: DashboardStats): void {
    const ctx = this.topAttackersCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const labels = s.topAttackers.map(a => a.sourceIP);
    const attacks = s.topAttackers.map(a => a.attackCount);
    const normals = s.topAttackers.map(a => a.totalFlows - a.attackCount);

    this.topAttackersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Атаки',
            data: attacks,
            backgroundColor: '#f44336',
            borderRadius: 4,
          },
          {
            label: 'Нормальные',
            data: normals,
            backgroundColor: '#66bb6a',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  }

  private renderMethod(s: DashboardStats): void {
    const ctx = this.methodCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.methodChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Supervised (модель)', 'Unsupervised (IF)', 'Нормальные'],
        datasets: [{
          data: [
            s.supervisedDetected,
            s.unsupervisedDetected - (s.attackFlows - s.supervisedDetected > 0 ? 0 : 0),
            s.normalFlows,
          ],
          backgroundColor: ['#7e57c2', '#26a69a', '#e0e0e0'],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  // ============================================================
  // Helpers
  // ============================================================
  threatChipClass(level: string): string {
    return `threat-chip-${level.toLowerCase()}`;
  }

  confidencePct(c: number): string {
    return `${(c * 100).toFixed(1)}%`;
  }

  methodLabel(method: string): string {
    switch (method) {
      case 'supervised':   return 'RF/CatBoost';
      case 'unsupervised': return 'Isolation Forest';
      case 'both':         return 'Оба';
      default:             return '—';
    }
  }

  selectedSessionName = computed(() => {
    const sid = this.selectedSessionId();
    const sess = this.sessions().find(s => s.id === sid);
    return sess ? sess.sessionName : '';
  });
}
