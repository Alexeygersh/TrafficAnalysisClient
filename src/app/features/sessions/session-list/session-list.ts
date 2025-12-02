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
import { MatBadgeModule } from '@angular/material/badge';

import { SessionService, SessionFilters } from '../../../core/services/session';
import { AuthService } from '../../../core/services/auth';
import { TrafficSession } from '../../../core/models/traffic-session.model';
import { MainLayout } from '../../../layout/main-layout/main-layout';

@Component({
  selector: 'app-session-list',
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
    MatBadgeModule,
  ],
  templateUrl: './session-list.html',
  styleUrl: './session-list.css'
})
export class SessionList implements OnInit {
  private sessionService = inject(SessionService);
  authService = inject(AuthService);

  // Данные
  allSessions = signal<TrafficSession[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  // Фильтры
  filters = signal<SessionFilters>({});

  // Сортировка
  sortBy = signal<keyof TrafficSession>('startTime');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Вычисляемый список отфильтрованных сессий
  filteredSessions = computed(() => {
    let sessions = this.allSessions();

    // Применяем фильтры
    sessions = this.sessionService.filterSessions(sessions, this.filters());

    // Применяем сортировку
    sessions = this.sessionService.sortSessions(
      sessions,
      this.sortBy(),
      this.sortDirection()
    );

    return sessions;
  });

  // Статистика
  statistics = computed(() => {
    const all = this.allSessions();
    const filtered = this.filteredSessions();

    return {
      total: all.length,
      filtered: filtered.length,
      active: filtered.filter(s => s.isActive).length,
      closed: filtered.filter(s => !s.isActive).length,
      totalPackets: filtered.reduce((sum, s) => sum + s.totalPackets, 0)
    };
  });

  // Колонки таблицы
  displayedColumns: string[] = [
    'id',
    'sessionName',
    'startTime',
    'endTime',
    'totalPackets',
    'status',
    'actions'
  ];

  // Опции для фильтров
  statusOptions = [
    { label: 'Все', value: undefined },
    { label: 'Активные', value: true },
    { label: 'Завершенные', value: false }
  ];

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.sessionService.getAllSessions().subscribe({
      next: (sessions) => {
        this.allSessions.set(sessions);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки сессий');
        this.isLoading.set(false);
      }
    });
  }

  // Применить фильтры
  applyFilters(filterUpdates: Partial<SessionFilters>): void {
    this.filters.update(current => ({ ...current, ...filterUpdates }));
  }

  // Сбросить фильтры
  clearFilters(): void {
    this.filters.set({});
  }

  // Изменить сортировку
  changeSort(column: keyof TrafficSession): void {
    if (this.sortBy() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('desc');
    }
  }

  // Завершить сессию
  closeSession(id: number): void {
    if (!confirm('Вы уверены, что хотите завершить эту сессию?')) {
      return;
    }

    this.sessionService.closeSession(id).subscribe({
      next: () => {
        this.loadSessions(); // Перезагрузить список
      },
      error: (error) => {
        alert(`Ошибка завершения сессии: ${error.message}`);
      }
    });
  }

  // Удаление сессии
  deleteSession(id: number): void {
    if (!confirm('Вы уверены, что хотите удалить эту сессию? Все связанные пакеты будут отвязаны.')) {
      return;
    }

    this.sessionService.deleteSession(id).subscribe({
      next: () => {
        this.allSessions.update(sessions => sessions.filter(s => s.id !== id));
      },
      error: (error) => {
        alert(`Ошибка удаления: ${error.message}`);
      }
    });
  }

  // Форматирование даты
  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('ru-RU');
  }

  // Вычисление длительности
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
