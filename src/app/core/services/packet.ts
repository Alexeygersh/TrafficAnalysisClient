import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import {
  NetworkPacket,
  CreatePacketDto,
  UpdatePacketDto,
  ThreatScore
} from '../models/network-packet.model';

@Injectable({
  providedIn: 'root'
})
export class PacketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Packets`;

  // Получить все пакеты
  getAllPackets(): Observable<NetworkPacket[]> {
    return this.http.get<NetworkPacket[]>(this.apiUrl).pipe(
      map(packets => {
        console.log('Raw packets from API:', packets); // Логирование

        // Преобразуем строки дат в Date объекты
        return packets.map(p => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }));
      })
    );
  }

  // Получить пакет по ID
  getPacketById(id: number): Observable<NetworkPacket> {
    return this.http.get<NetworkPacket>(`${this.apiUrl}/${id}`);
  }

  // Создать пакет
  createPacket(dto: CreatePacketDto): Observable<NetworkPacket> {
    return this.http.post<NetworkPacket>(this.apiUrl, dto);
  }

  // Обновить пакет
  updatePacket(id: number, dto: UpdatePacketDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  // Удалить пакет
  deletePacket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Получить балл угрозы
  getThreatScore(id: number): Observable<ThreatScore> {
    return this.http.get<ThreatScore>(`${this.apiUrl}/threat-score/${id}`);
  }

  // Поиск/фильтрация пакетов (клиентская сторона)
  filterPackets(
    packets: NetworkPacket[],
    filters: PacketFilters
  ): NetworkPacket[] {
    let filtered = [...packets];

    // Поиск по IP
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
    if (filters.port) {
      filtered = filtered.filter(p => p.port === filters.port);
    }

    // Фильтр по уровню угрозы
    if (filters.threatLevel) {
      filtered = filtered.filter(p =>
        p.analysis?.threatLevel === filters.threatLevel
      );
    }

    // Фильтр по дате
    if (filters.dateFrom) {
      filtered = filtered.filter(p =>
        new Date(p.timestamp) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(p =>
        new Date(p.timestamp) <= new Date(filters.dateTo!)
      );
    }

    return filtered;
  }

  // Сортировка пакетов
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

// Интерфейс для фильтров
export interface PacketFilters {
  searchTerm?: string;
  protocol?: string;
  port?: number;
  threatLevel?: string;
  dateFrom?: string;
  dateTo?: string;
}
