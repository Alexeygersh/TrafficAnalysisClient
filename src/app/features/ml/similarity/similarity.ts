import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SimilarityService } from '../../../core/services/similarity';
import {
  SimilarityMode, FindSimilarResponse, KnnClassifyResponse, KnnPrediction
} from '../../../core/models/similarity.model';
import { SessionApiService } from '../../../core/services/session-api';
import { SessionFilter } from '../../../core/models/session-filter.model';
import { FlowMLService } from '../../../core/services/flow-ml';
import { FlowMLPrediction } from '../../../core/models/flow-ml.model';

@Component({
  selector: 'app-similarity',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule, MatButtonToggleModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatSliderModule, MatTableModule, MatChipsModule,
    MatTooltipModule, MatExpansionModule,
  ],
  templateUrl: './similarity.html',
  styleUrl: './similarity.css',
})
export class SimilarityComponent implements OnInit {
  private service = inject(SimilarityService);
  private sessionApi = inject(SessionApiService);
  private flowMl = inject(FlowMLService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  mode = signal<SimilarityMode>('find');
  sessions = signal<SessionFilter[]>([]);
  selectedSessionId = signal<number | null>(null);

  w1Raw = signal(10);
  w2Raw = signal(60);
  w3Raw = signal(30);

  k = signal(10);

  flows = signal<FlowMLPrediction[]>([]);
  selectedTargetFlowId = signal<number | null>(null);
  isLoadingFlows = signal(false);

  knnModel = signal<'rf' | 'catboost'>('rf');

  isLoading = signal(false);
  findResult = signal<FindSimilarResponse | null>(null);
  knnResult = signal<KnnClassifyResponse | null>(null);
  errorMessage = signal('');

  weights = computed(() => {
    const total = this.w1Raw() + this.w2Raw() + this.w3Raw();
    if (total === 0) return { w1: 0.333, w2: 0.333, w3: 0.334 };
    return {
      w1: this.w1Raw() / total,
      w2: this.w2Raw() / total,
      w3: this.w3Raw() / total,
    };
  });

  weightsPct = computed(() => {
    const w = this.weights();
    return {
      w1: Math.round(w.w1 * 100),
      w2: Math.round(w.w2 * 100),
      w3: Math.round(w.w3 * 100),
    };
  });

  findColumns = ['rank', 'flowId', 'source', 'destination', 'protocol',
    'simA', 'simB', 'simC', 'sim', 'label'];

  knnColumns = ['flowId', 'source', 'destination', 'protocol',
    'originalLabel', 'knnLabel', 'knnConfidence', 'agree'];

  showOnlyDisagreements = signal(false);

  filteredKnnPredictions = computed(() => {
    const r = this.knnResult();
    if (!r) return [];
    if (!this.showOnlyDisagreements()) return r.predictions;
    return r.predictions.filter(p => p.knnIsAttack !== p.originalLabel);
  });

  ngOnInit(): void {
    this.loadSessions();

    this.route.queryParams.subscribe(params => {
      if (params['targetFlowId']) {
        const id = parseInt(params['targetFlowId'], 10);
        if (!isNaN(id)) {
          this.selectedTargetFlowId.set(id);
          this.mode.set('find');
        }
      }
      if (params['sessionId']) {
        const sid = parseInt(params['sessionId'], 10);
        if (!isNaN(sid)) {
          this.selectedSessionId.set(sid);
          this.loadFlowsForSession(sid);
        }
      }
    });
  }

  loadSessions(): void {
    this.sessionApi.getSessions().subscribe({
      next: (sess) => {
        this.sessions.set(sess);
        if (this.selectedSessionId() === null) {
          const withFlows = sess.filter(s => s.flowCount > 0);
          if (withFlows.length > 0) {
            const latest = withFlows.reduce((p, c) => c.id > p.id ? c : p);
            this.selectedSessionId.set(latest.id);
            this.loadFlowsForSession(latest.id);
          }
        }
      },
      error: () => this.errorMessage.set('Не удалось загрузить сессии'),
    });
  }

  loadFlowsForSession(sessionId: number): void {
    this.isLoadingFlows.set(true);
    this.flows.set([]);
    this.flowMl.runFlowAnalysis(sessionId, 'rf').subscribe({
      next: (res) => {
        this.isLoadingFlows.set(false);
        this.flows.set(res.predictions);
      },
      error: (err) => {
        this.isLoadingFlows.set(false);
        const msg = err.error?.message || err.message || 'Ошибка загрузки flows';
        this.errorMessage.set(msg);
      },
    });
  }

  onSessionChange(): void {
    const sid = this.selectedSessionId();
    this.selectedTargetFlowId.set(null);
    this.findResult.set(null);
    this.knnResult.set(null);
    if (sid) this.loadFlowsForSession(sid);
  }

  run(): void {
    const sid = this.selectedSessionId();
    if (!sid) {
      this.snackBar.open('Выберите сессию', 'Закрыть', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.findResult.set(null);
    this.knnResult.set(null);

    const w = this.weights();

    if (this.mode() === 'find') {
      const target = this.selectedTargetFlowId();
      if (!target) {
        this.isLoading.set(false);
        this.snackBar.open('Выберите целевой поток', 'Закрыть', { duration: 3000 });
        return;
      }

      this.service.findSimilar(target, w.w1, w.w2, w.w3, this.k(), sid)
        .subscribe({
          next: (res) => {
            this.isLoading.set(false);
            this.findResult.set(res);
          },
          error: (err) => this.handleError(err),
        });
    } else {
      this.service.knnClassify(sid, w.w1, w.w2, w.w3, this.k(), this.knnModel())
        .subscribe({
          next: (res) => {
            this.isLoading.set(false);
            this.knnResult.set(res);
          },
          error: (err) => this.handleError(err),
        });
    }
  }

  private handleError(err: any): void {
    this.isLoading.set(false);
    const msg = err.error?.message || err.message || 'Неизвестная ошибка';
    this.errorMessage.set(msg);
    this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', {
      duration: 5000, panelClass: ['error-snackbar'],
    });
  }

  presetByTz(): void {
    this.w1Raw.set(10); this.w2Raw.set(60); this.w3Raw.set(30);
  }
  presetOnlyA(): void { this.w1Raw.set(100); this.w2Raw.set(0); this.w3Raw.set(0); }
  presetOnlyB(): void { this.w1Raw.set(0); this.w2Raw.set(100); this.w3Raw.set(0); }
  presetOnlyC(): void { this.w1Raw.set(0); this.w2Raw.set(0); this.w3Raw.set(100); }
  presetEqual(): void { this.w1Raw.set(33); this.w2Raw.set(33); this.w3Raw.set(34); }

  threatChipClass(level: string): string {
    return `threat-chip-${level.toLowerCase()}`;
  }

  pct(v: number): string {
    return `${(v * 100).toFixed(1)}%`;
  }

  simBarClass(sim: number): string {
    if (sim >= 0.7) return 'sim-high';
    if (sim >= 0.4) return 'sim-mid';
    return 'sim-low';
  }

  agreeIcon(p: KnnPrediction): string {
    return p.knnIsAttack === p.originalLabel ? 'check_circle' : 'error';
  }
  agreeClass(p: KnnPrediction): string {
    return p.knnIsAttack === p.originalLabel ? 'agree-yes' : 'agree-no';
  }
}
