import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  NetworkPacket, ThreatScore
} from '../models/network-packet.model';

@Injectable({ providedIn: 'root' })
export class PacketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Packets`;

  // Получить все пакеты
  getAllPackets(): Observable<NetworkPacket[]> {
    return this.http.get<NetworkPacket[]>(this.apiUrl).pipe(
      map(packets => packets.map(p => ({
        ...p,
        timestamp: new Date(p.timestamp),
      })))
    );
  }

  // Получить пакет по ID
  getPacketById(id: number): Observable<NetworkPacket> {
    return this.http.get<NetworkPacket>(`${this.apiUrl}/${id}`).pipe(
      map(p => ({ ...p, timestamp: new Date(p.timestamp) }))
    );
  }

  // Удалить пакет
  deletePacket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Получить балл угрозы (правиловая, не ML)
  getThreatScore(id: number): Observable<ThreatScore> {
    return this.http.get<ThreatScore>(`${this.apiUrl}/threat-score/${id}`);
  }

  // === Клиентская фильтрация ===
  filterPackets(
    packets: NetworkPacket[],
    filters: PacketFilters
  ): NetworkPacket[] {
    let filtered = [...packets];

    // Поиск по IP / протоколу
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.sourceIP.toLowerCase().includes(search) ||
        p.destinationIP.toLowerCase().includes(search) ||
        p.protocol.toLowerCase().includes(search)
      );
    }

    // Фильтр по протоколу
    if (filters.protocol) {
      filtered = filtered.filter(p => p.protocol === filters.protocol);
    }

    // Фильтр по порту
    if (filters.port !== undefined && filters.port !== null) {
      filtered = filtered.filter(p => p.port === filters.port);
    }

    // Фильтр "только пакеты внутри flow"
    if (filters.onlyInFlow) {
      filtered = filtered.filter(p => p.flowId != null);
    }

    // Фильтр конкретный flow
    if (filters.flowId !== undefined && filters.flowId !== null) {
      filtered = filtered.filter(p => p.flowId === filters.flowId);
    }

    return filtered;
  }

  // Сортировка
  sortPackets(
    packets: NetworkPacket[],
    sortBy: keyof NetworkPacket,
    sortDirection: 'asc' | 'desc'
  ): NetworkPacket[] {
    return [...packets].sort((a, b) => {
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

export interface PacketFilters {
  searchTerm?: string;
  protocol?: string;
  port?: number;
  /** Показать только пакеты которые входят в какой-либо flow. */
  onlyInFlow?: boolean;
  /** Показать только пакеты конкретного flow. */
  flowId?: number;
}
