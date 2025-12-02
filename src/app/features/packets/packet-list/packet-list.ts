import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

import { PacketService, PacketFilters } from '../../../core/services/packet';
import { AuthService } from '../../../core/services/auth';
import { NetworkPacket } from '../../../core/models/network-packet.model';
import { MainLayout } from '../../../layout/main-layout/main-layout';
import { PacketCard } from '../packet-card/packet-card';

@Component({
  selector: 'app-packet-list',
  standalone: true,
  imports: [
    CommonModule,
    //RouterOutlet,
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    PacketCard,
  ],
  templateUrl: './packet-list.html',
  styleUrl: './packet-list.css'
})
export class PacketList implements OnInit {
  private packetService = inject(PacketService);
  authService = inject(AuthService);

  // Данные
  allPackets = signal<NetworkPacket[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  // Фильтры
  filters = signal<PacketFilters>({});

  // Сортировка
  sortBy = signal<keyof NetworkPacket>('timestamp');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Режим отображения
  viewMode = signal<'table' | 'cards'>('table');

  // Вычисляемый список отфильтрованных пакетов
  filteredPackets = computed(() => {
    let packets = this.allPackets();

    // Применяем фильтры
    packets = this.packetService.filterPackets(packets, this.filters());

    // Применяем сортировку
    packets = this.packetService.sortPackets(
      packets,
      this.sortBy(),
      this.sortDirection()
    );

    return packets;
  });

  // Колонки таблицы
  displayedColumns: string[] = [
    'id',
    'sourceIP',
    'destinationIP',
    'port',
    'protocol',
    'packetSize',
    'timestamp',
    'threatLevel',
    'actions'
  ];

  // Опции для фильтров
  protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'];
  threatLevels = ['Low', 'Medium', 'High', 'Critical'];

  ngOnInit(): void {
    this.loadPackets();
  }

  loadPackets(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.packetService.getAllPackets().subscribe({
      next: (packets) => {
        this.allPackets.set(packets);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Ошибка загрузки пакетов');
        this.isLoading.set(false);
      }
    });
  }

  // Применить фильтры
  applyFilters(filterUpdates: Partial<PacketFilters>): void {
    this.filters.update(current => ({ ...current, ...filterUpdates }));
  }

  // Сбросить фильтры
  clearFilters(): void {
    this.filters.set({});
  }

  // Изменить сортировку
  changeSort(column: keyof NetworkPacket): void {
    if (this.sortBy() === column) {
      // Переключаем направление
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      // Новая колонка, сортировка по убыванию
      this.sortBy.set(column);
      this.sortDirection.set('desc');
    }
  }

  // Переключить режим отображения
  toggleViewMode(): void {
    this.viewMode.update(mode => mode === 'table' ? 'cards' : 'table');
  }

  // Удаление пакета
  deletePacket(id: number): void {
    if (!confirm('Вы уверены, что хотите удалить этот пакет?')) {
      return;
    }

    this.packetService.deletePacket(id).subscribe({
      next: () => {
        this.allPackets.update(packets => packets.filter(p => p.id !== id));
      },
      error: (error) => {
        alert(`Ошибка удаления: ${error.message}`);
      }
    });
  }

  // Получить CSS класс для уровня угрозы
  getThreatClass(threatLevel?: string): string {
    switch (threatLevel?.toLowerCase()) {
      case 'critical': return 'threat-critical';
      case 'high': return 'threat-high';
      case 'medium': return 'threat-medium';
      case 'low': return 'threat-low';
      default: return 'threat-none';
    }
  }

  // Форматирование даты
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ru-RU');
  }

  // Форматирование размера
  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

}

