import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import {
  TrafficSession,
  CreateSessionDto,
  SessionStatistics
} from '../models/traffic-session.model';
import { NetworkPacket } from '../models/network-packet.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Sessions`;

  // Получить все сессии
  // getAllSessions(): Observable<TrafficSession[]> {
  //   return this.http.get<TrafficSession[]>(this.apiUrl);
  // }
  getAllSessions(): Observable<TrafficSession[]> {
    return this.http.get<TrafficSession[]>(this.apiUrl).pipe(
      map(sessions => {
        console.log('📅 Raw sessions from API:', sessions); // Логирование

        return sessions.map(s => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
      })
    );
  }

  // Получить сессию по ID
  getSessionById(id: number): Observable<TrafficSession> {
    return this.http.get<TrafficSession>(`${this.apiUrl}/${id}`);
  }

  // Создать сессию
  createSession(dto: CreateSessionDto): Observable<TrafficSession> {
    return this.http.post<TrafficSession>(this.apiUrl, dto);
  }

  // Обновить сессию
  updateSession(id: number, dto: CreateSessionDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  // Удалить сессию
  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Получить статистику сессии
  getSessionStatistics(id: number): Observable<SessionStatistics> {
    return this.http.get<SessionStatistics>(`${this.apiUrl}/statistics/${id}`);
  }

  // Получить аномальные пакеты сессии
  getAnomalousPackets(id: number): Observable<NetworkPacket[]> {
    return this.http.get<NetworkPacket[]>(`${this.apiUrl}/anomalous-packets/${id}`);
  }

  // Завершить сессию
  closeSession(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/close/${id}`, {});
  }

  // Фильтрация сессий (клиентская сторона)
  filterSessions(
    sessions: TrafficSession[],
    filters: SessionFilters
  ): TrafficSession[] {
    let filtered = [...sessions];

    // Поиск по названию
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.sessionName.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      );
    }

    // Фильтр по статусу (активная/завершенная)
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(s => s.isActive === filters.isActive);
    }

    // Фильтр по количеству пакетов
    if (filters.minPackets !== undefined) {
      filtered = filtered.filter(s => s.totalPackets >= filters.minPackets!);
    }

    // Фильтр по дате
    if (filters.dateFrom) {
      filtered = filtered.filter(s =>
        new Date(s.startTime) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(s =>
        new Date(s.startTime) <= new Date(filters.dateTo!)
      );
    }

    return filtered;
  }

  // Сортировка
  sortSessions(
    sessions: TrafficSession[],
    sortBy: keyof TrafficSession,
    sortDirection: 'asc' | 'desc'
  ): TrafficSession[] {
    return [...sessions].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = aValue > bValue ? 1 : -1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}

// Интерфейс для фильтров
export interface SessionFilters {
  searchTerm?: string;
  isActive?: boolean;
  minPackets?: number;
  dateFrom?: string;
  dateTo?: string;
}
