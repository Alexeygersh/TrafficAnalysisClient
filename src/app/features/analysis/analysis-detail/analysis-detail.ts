import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AnalysisService } from '../../../core/services/analysis';
import { AuthService } from '../../../core/services/auth';
import { TrafficAnalysis, AnalysisReport } from '../../../core/models/traffic-analysis.model';

@Component({
  selector: 'app-analysis-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './analysis-detail.html',
  styleUrl: './analysis-detail.css'
})
export class AnalysisDetail implements OnInit {
  private analysisService = inject(AnalysisService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  analysis = signal<TrafficAnalysis | null>(null);
  report = signal<AnalysisReport | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAnalysis(+id);
      this.loadReport(+id);
    }
  }

  loadAnalysis(id: number): void {
    this.analysisService.getAnalysisById(id).subscribe({
      next: (analysis) => {
        this.analysis.set(analysis);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки анализа');
        this.isLoading.set(false);
      }
    });
  }

  loadReport(id: number): void {
    this.analysisService.getAnalysisReport(id).subscribe({
      next: (report) => {
        this.report.set(report);
      },
      error: (error) => {
        console.error('Ошибка загрузки отчета:', error);
      }
    });
  }

  deleteAnalysis(): void {
    const analysis = this.analysis();
    if (!analysis) return;

    if (!confirm(`Вы уверены, что хотите удалить анализ #${analysis.id}?`)) {
      return;
    }

    this.analysisService.deleteAnalysis(analysis.id).subscribe({
      next: () => {
        this.router.navigate(['/analysis']);
      },
      error: (error) => {
        alert(`Ошибка удаления: ${error.message}`);
      }
    });
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ru-RU');
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
