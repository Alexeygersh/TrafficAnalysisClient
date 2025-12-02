import {Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

// RxJS
import { firstValueFrom } from 'rxjs';

// Chart.js
import { Chart, registerables } from 'chart.js';

import { ReportService } from '../../../core/services/report';
import {
  TimeBasedSummary,
  ThreatsByProtocol,
  TopMaliciousIP
} from '../../../core/models/report.model';
import { MainLayout } from '../../../layout/main-layout/main-layout';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  private reportService = inject(ReportService);

  @ViewChild('threatTimelineCanvas') threatTimelineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('protocolPieCanvas') protocolPieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topIPsCanvas') topIPsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('threatDistCanvas') threatDistCanvas!: ElementRef<HTMLCanvasElement>;

  // Данные
  timeBasedSummary = signal<TimeBasedSummary | null>(null);
  threatsByProtocol = signal<ThreatsByProtocol[]>([]);
  topMaliciousIPs = signal<TopMaliciousIP[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  // Выбранный период
  selectedPeriod = signal(24); // часы
  periodOptions = [
    { label: 'Последний час', value: 1 },
    { label: 'Последние 6 часов', value: 6 },
    { label: 'Последние 24 часа', value: 24 },
    { label: 'Последние 7 дней', value: 168 },
    { label: 'Последние 30 дней', value: 720 },
    { label: 'Последние 240 дней', value: 5760 }
  ];

  // Графики
  private threatTimelineChart?: Chart;
  private protocolPieChart?: Chart;
  private topIPsChart?: Chart;
  private threatDistChart?: Chart;

  ngOnInit(): void {
    this.loadDashboardData().catch(error => {
      console.error('Error loading dashboard data:', error);
      this.errorMessage.set('Ошибка загрузки данных дашборда');
    });
  }

  ngAfterViewInit(): void {
    // Графики создаются после загрузки данных
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const [summary, protocols, ips] = await Promise.all([
        firstValueFrom(this.reportService.getTimeBasedSummary(this.selectedPeriod())),
        firstValueFrom(this.reportService.getThreatsByProtocol()),
        firstValueFrom(this.reportService.getTopMaliciousIPs(10))
      ]);

      // console.log('📊 Summary:', summary);
      // console.log('📊 Protocols:', protocols);
      // console.log('📊 IPs:', ips);

      this.timeBasedSummary.set(summary || null);
      this.threatsByProtocol.set(protocols || []);
      this.topMaliciousIPs.set(ips || []);

      this.isLoading.set(false);
      setTimeout(() => this.createCharts(), 100);
    } catch (error) {
      // console.error('❌ Dashboard error:', error);
      this.errorMessage.set(error instanceof Error ? error.message : 'Ошибка загрузки данных');
      this.isLoading.set(false);
    }
  }

  onPeriodChange(): void {
    this.destroyCharts();
    this.loadDashboardData().catch(error => {
      console.error('Error loading dashboard data on period change:', error);
      this.errorMessage.set('Ошибка загрузки данных при смене периода');
    });
  }

  createCharts(): void {
    this.createThreatTimelineChart();
    this.createProtocolPieChart();
    this.createTopIPsChart();
    this.createThreatDistributionChart();
  }

  threatDistributionData = computed(() => {
    const summary = this.timeBasedSummary();
    const levels = ['Critical', 'High', 'Medium', 'Low'];

    if (!summary) {
      return levels.map(level => ({ level, count: 0, percentage: 0 }));
    }

    return levels.map(level => {
      const threat = summary.threatDistribution.find(t => t.threatLevel === level);
      const count = threat?.count || 0;
      const percentage = summary.maliciousPackets > 0 ?
        (count / summary.maliciousPackets) * 100 : 0;

      return { level, count, percentage };
    });
  });

  // График 1: Временная шкала угроз
  createThreatTimelineChart(): void {
    const summary = this.timeBasedSummary();
    if (!summary || !this.threatTimelineCanvas) return;

    const ctx = this.threatTimelineCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.threatTimelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Start', 'End'], // Упрощенная версия
        datasets: [
          {
            label: 'Всего пакетов',
            data: [0, summary.totalPackets],
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4
          },
          {
            label: 'Вредоносных',
            data: [0, summary.maliciousPackets],
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: `Активность за ${summary.timeRange}`
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // График 2: Круговая диаграмма протоколов
  createProtocolPieChart(): void {
    const summary = this.timeBasedSummary();
    if (!summary || !this.protocolPieCanvas) return;

    const ctx = this.protocolPieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const protocols = summary.topProtocols;

    this.protocolPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: protocols.map(p => p.protocol),
        datasets: [{
          data: protocols.map(p => p.count),
          backgroundColor: [
            '#2196f3',
            '#4caf50',
            '#ff9800',
            '#f44336',
            '#9c27b0',
            '#00bcd4'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: true,
            text: 'Распределение по протоколам'
          }
        }
      }
    });
  }

  // График 3: Топ IP-адресов (горизонтальный bar chart)
  createTopIPsChart(): void {
    const ips = this.topMaliciousIPs();
    if (!ips.length || !this.topIPsCanvas) return;

    const ctx = this.topIPsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.topIPsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ips.map(ip => ip.sourceIP),
        datasets: [{
          label: 'Количество угроз',
          data: ips.map(ip => ip.threatCount),
          backgroundColor: ips.map(ip => {
            switch (ip.highestThreatLevel) {
              case 'Critical': return '#d32f2f';
              case 'High': return '#f57c00';
              case 'Medium': return '#fbc02d';
              default: return '#66bb6a';
            }
          })
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Топ 10 вредоносных IP-адресов'
          }
        },
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // График 4: Распределение угроз по уровням
  createThreatDistributionChart(): void {
    const summary = this.timeBasedSummary();
    if (!summary || !this.threatDistCanvas) return;

    const ctx = this.threatDistCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const distribution = summary.threatDistribution;

    this.threatDistChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: distribution.map(d => d.threatLevel),
        datasets: [{
          label: 'Количество',
          data: distribution.map(d => d.count),
          backgroundColor: distribution.map(d => {
            switch (d.threatLevel) {
              case 'Critical': return '#d32f2f';
              case 'High': return '#f57c00';
              case 'Medium': return '#fbc02d';
              case 'Low': return '#66bb6a';
              default: return '#9e9e9e';
            }
          })
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Распределение по уровням угроз'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  destroyCharts(): void {
    this.threatTimelineChart?.destroy();
    this.protocolPieChart?.destroy();
    this.topIPsChart?.destroy();
    this.threatDistChart?.destroy();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ru-RU');
  }

  getThreatClass(threatLevel: string): string {
    switch (threatLevel.toLowerCase()) {
      case 'critical': return 'threat-critical';
      case 'high': return 'threat-high';
      case 'medium': return 'threat-medium';
      case 'low': return 'threat-low';
      default: return 'threat-none';
    }
  }
}
