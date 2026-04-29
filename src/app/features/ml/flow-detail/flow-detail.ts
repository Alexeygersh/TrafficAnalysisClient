import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { FlowsService } from '../../../core/services/flows.service';
import { FlowDetail, FlowPacket } from '../../../core/models/flow.model';

@Component({
  selector: 'app-flow-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule,
    MatTableModule, MatTabsModule, MatTooltipModule,
    MatExpansionModule,
  ],
  templateUrl: './flow-detail.html',
  styleUrl: './flow-detail.css',
})
export class FlowDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private flowsService = inject(FlowsService);

  flowId = signal<number | null>(null);
  flow = signal<FlowDetail | null>(null);
  packets = signal<FlowPacket[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  packetColumns = ['id', 'time', 'src', 'dst', 'port', 'proto', 'size'];

  // Группированные блоки для отображения
  flowMetricBlocks = computed(() => {
    const f = this.flow();
    if (!f) return [];

    return [
      {
        title: 'Базовые характеристики',
        icon: 'info',
        items: [
          { label: 'Длительность (мкс)', value: this.formatDuration(f.flowDuration) },
          { label: 'Пакетов прямых', value: f.totalFwdPackets },
          { label: 'Пакетов обратных', value: f.totalBackwardPackets },
          { label: 'Байт прямых', value: this.formatBytes(f.totalLengthFwdPackets) },
          { label: 'Байт обратных', value: this.formatBytes(f.totalLengthBwdPackets) },
        ]
      },
      {
        title: 'Скорости',
        icon: 'speed',
        items: [
          { label: 'Байт/сек', value: this.formatNumber(f.flowBytesPerSec) },
          { label: 'Пакетов/сек', value: this.formatNumber(f.flowPacketsPerSec) },
          { label: 'Прямых пкт/с', value: this.formatNumber(f.fwdPacketsPerSec) },
          { label: 'Обратных пкт/с', value: this.formatNumber(f.bwdPacketsPerSec) },
        ]
      },
      {
        title: 'Длины пакетов',
        icon: 'straighten',
        items: [
          { label: 'Min', value: f.minPacketLength },
          { label: 'Max', value: f.maxPacketLength },
          { label: 'Mean', value: this.formatNumber(f.packetLengthMean) },
          { label: 'Std', value: this.formatNumber(f.packetLengthStd) },
          { label: 'Avg packet size', value: this.formatNumber(f.averagePacketSize) },
        ]
      },
      {
        title: 'Inter-Arrival Times (мкс)',
        icon: 'schedule',
        items: [
          { label: 'Flow IAT Mean', value: this.formatNumber(f.flowIATMean) },
          { label: 'Flow IAT Std', value: this.formatNumber(f.flowIATStd) },
          { label: 'Flow IAT Max', value: this.formatNumber(f.flowIATMax) },
          { label: 'Flow IAT Min', value: this.formatNumber(f.flowIATMin) },
          { label: 'Fwd IAT Total', value: this.formatNumber(f.fwdIATTotal) },
          { label: 'Bwd IAT Total', value: this.formatNumber(f.bwdIATTotal) },
        ]
      },
      {
        title: 'TCP флаги (счётчики)',
        icon: 'flag',
        items: [
          { label: 'FIN', value: f.finFlagCount },
          { label: 'SYN', value: f.synFlagCount },
          { label: 'RST', value: f.rstFlagCount },
          { label: 'PSH', value: f.pshFlagCount },
          { label: 'ACK', value: f.ackFlagCount },
          { label: 'URG', value: f.urgFlagCount },
          { label: 'CWE', value: f.cweFlagCount },
          { label: 'ECE', value: f.eceFlagCount },
        ]
      },
      {
        title: 'Активность / Idle (мкс)',
        icon: 'timeline',
        items: [
          { label: 'Active Mean', value: this.formatNumber(f.activeMean) },
          { label: 'Active Std', value: this.formatNumber(f.activeStd) },
          { label: 'Idle Mean', value: this.formatNumber(f.idleMean) },
          { label: 'Idle Max', value: this.formatNumber(f.idleMax) },
          { label: 'Idle Min', value: this.formatNumber(f.idleMin) },
        ]
      },
    ];
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.flowId.set(id);
        this.load(id);
      }
    });
  }

  load(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Параллельно: flow и packets
    this.flowsService.getFlow(id).subscribe({
      next: (f) => {
        this.flow.set(f);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || `Flow #${id} не найден`);
        this.isLoading.set(false);
      },
    });

    this.flowsService.getFlowPackets(id).subscribe({
      next: (p) => this.packets.set(p),
      error: () => this.packets.set([]),
    });
  }

  // === Helpers ===
  formatNumber(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    if (Math.abs(v) >= 1e6) return v.toExponential(2);
    return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  formatDuration(microsec: number): string {
    if (microsec < 1000) return `${microsec.toFixed(0)} мкс`;
    if (microsec < 1_000_000) return `${(microsec / 1000).toFixed(1)} мс`;
    return `${(microsec / 1_000_000).toFixed(2)} с`;
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('ru-RU');
  }

  threatChipClass(level?: string): string {
    return `threat-chip-${(level || 'low').toLowerCase()}`;
  }
}
