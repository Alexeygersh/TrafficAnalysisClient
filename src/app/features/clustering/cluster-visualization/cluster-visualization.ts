import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { VisualizationDto } from '../../../core/models/visualization.model';

interface Session {
  id: number;
  sessionName: string;
  packetCount: number;
}

@Component({
  selector: 'app-cluster-visualization',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './cluster-visualization.html',
  styleUrl: './cluster-visualization.css'
})
export class ClusterVisualization implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  sessions = signal<Session[]>([]);
  selectedSessionId = signal<number | null>(null);
  scatterPlot = signal<VisualizationDto | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadSessions();

    const sessionId = this.route.snapshot.queryParamMap.get('sessionId');
    if (sessionId) {
      this.selectedSessionId.set(+sessionId);
      this.loadVisualization();
    }
  }

  loadSessions(): void {
    this.http.get<Session[]>(`${environment.apiUrl}/Clustering/sessions`)
      .subscribe({
        next: (sessions) => this.sessions.set(sessions),
        error: (err) => console.error('Error loading sessions:', err)
      });
  }

  async loadVisualization(): Promise<void> {
    const sessionId = this.selectedSessionId();
    if (!sessionId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Очищаем старое изображение перед загрузкой нового
    this.scatterPlot.set(null);

    try {
      const scatter = await firstValueFrom(
        this.http.get<VisualizationDto>(
          `${environment.apiUrl}/Clustering/visualize?sessionId=${sessionId}`
        )
      );

      this.scatterPlot.set(scatter);
      this.isLoading.set(false);
    } catch (err) {
      console.error('Error loading visualization:', err);
      this.errorMessage.set('Ошибка загрузки визуализации');
      this.isLoading.set(false);
    }
  }

  onSessionChange(): void {
    this.loadVisualization();
  }

  goBack(): void {
    this.router.navigate(['/clustering'], {
      queryParams: { sessionId: this.selectedSessionId() }
    });
  }
}
