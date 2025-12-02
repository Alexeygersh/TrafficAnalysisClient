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
import { MatTableModule } from '@angular/material/table';

import { SessionService } from '../../../core/services/session';
import { AuthService } from '../../../core/services/auth';
import { TrafficSession, SessionStatistics } from '../../../core/models/traffic-session.model';
import { NetworkPacket } from '../../../core/models/network-packet.model';

@Component({
  selector: 'app-session-detail',
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
    MatTooltipModule,
    MatTableModule
  ],
  templateUrl: './session-detail.html',
  styleUrl: './session-detail.css'
})
export class SessionDetail implements OnInit {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  session = signal<TrafficSession | null>(null);
  statistics = signal<SessionStatistics | null>(null);
  anomalousPackets = signal<NetworkPacket[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  displayedColumns: string[] = ['id', 'sourceIP', 'destinationIP', 'port', 'protocol', 'timestamp'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSession(+id);
      this.loadStatistics(+id);
      this.loadAnomalousPackets(+id);
    }
  }

  loadSession(id: number): void {
    this.sessionService.getSessionById(id).subscribe({
      next: (session) => {
        this.session.set(session);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки сессии');
        this.isLoading.set(false);
      }
    });
  }

  loadStatistics(id: number): void {
    this.sessionService.getSessionStatistics(id).subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Ошибка загрузки статистики:', error);
      }
    });
  }

  loadAnomalousPackets(id: number): void {
    this.sessionService.getAnomalousPackets(id).subscribe({
      next: (packets) => {
        this.anomalousPackets.set(packets);
      },
      error: (error) => {
        console.error('Ошибка загрузки аномальных пакетов:', error);
      }
    });
  }

  closeSession(): void {
    const session = this.session();
    if (!session) return;

    if (!confirm(`Завершить сессию "${session.sessionName}"?`)) {
      return;
    }

    this.sessionService.closeSession(session.id).subscribe({
      next: () => {
        this.loadSession(session.id);
      },
      error: (error) => {
        alert(`Ошибка завершения сессии: ${error.message}`);
      }
    });
  }

  deleteSession(): void {
    const session = this.session();
    if (!session) return;

    if (!confirm(`Вы уверены, что хотите удалить сессию "${session.sessionName}"?`)) {
      return;
    }

    this.sessionService.deleteSession(session.id).subscribe({
      next: () => {
        this.router.navigate(['/sessions']);
      },
      error: (error) => {
        alert(`Ошибка удаления: ${error.message}`);
      }
    });
  }

  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('ru-RU');
  }

  getDuration(session: TrafficSession): string {
    const start = new Date(session.startTime).getTime();
    const end = session.endTime ? new Date(session.endTime).getTime() : Date.now();
    const durationMs = end - start;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
