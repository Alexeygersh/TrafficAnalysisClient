import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PacketService, PacketFilters } from '../../../core/services/packet.service';
import { NetworkPacket } from '../../../core/models/network-packet.model';
import { SessionService } from '../../../core/services/session.service';
import { TrafficSession } from '../../../core/models/traffic-session.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-packet-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatSelectModule,
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatChipsModule, MatTooltipModule,
    MatSlideToggleModule,
  ],
  templateUrl: './packet-list.html',
  styleUrl: './packet-list.css',
})
export class PacketList implements OnInit {
  private packetService = inject(PacketService);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Состояние
  allPackets = signal<NetworkPacket[]>([]);
  sessions = signal<TrafficSession[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  // Параметры фильтра
  selectedSessionId = signal<number | null>(null);
  filters = signal<PacketFilters>({
    searchTerm: '',
    protocol: undefined,
    onlyInFlow: false,
    flowId: undefined,
  });

  // Сортировка
  sortBy = signal<keyof NetworkPacket>('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Колонки таблицы
  displayedColumns = [
    'id', 'timestamp', 'sourceIP', 'destinationIP',
    'port', 'protocol', 'packetSize', 'flow', 'actions'
  ];

  // Уникальные протоколы из загруженных пакетов
  protocols = computed(() => {
    const set = new Set<string>();
    this.allPackets().forEach(p => p.protocol && set.add(p.protocol));
    return Array.from(set).sort();
  });

  // Отфильтрованные пакеты с применением сессии
  filteredPackets = computed(() => {
    let list = this.allPackets();
    const sid = this.selectedSessionId();
    if (sid !== null) list = list.filter(p => p.sessionId === sid);

    list = this.packetService.filterPackets(list, this.filters());
    list = this.packetService.sortPackets(list, this.sortBy(), this.sortDirection());
    return list;
  });

  isAdmin = computed(() => this.authService.isAdmin());

  ngOnInit(): void {
    this.loadSessions();

    // Из query param: ?flowId=N — фильтр сразу на конкретный flow
    this.route.queryParams.subscribe(params => {
      if (params['flowId']) {
        this.applyFilters({ flowId: Number(params['flowId']) });
      }
    });
  }

  // === Загрузка ===
  loadSessions(): void {
    this.sessionService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);

        // Автовыбор последней сессии (с max id)
        if (sessions.length > 0 && this.selectedSessionId() === null) {
          const latest = sessions.reduce((p, c) => c.id > p.id ? c : p);
          this.selectedSessionId.set(latest.id);
        }

        // Затем грузим пакеты
        this.loadPackets();
      },
      error: (err) => {
        this.errorMessage.set('Ошибка загрузки сессий: ' + (err.message || err));
      },
    });
  }

  loadPackets(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.packetService.getAllPackets().subscribe({
      next: (packets) => {
        this.allPackets.set(packets);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Ошибка загрузки пакетов: ' + (err.message || err));
        this.isLoading.set(false);
      },
    });
  }

  // === Фильтрация ===
  applyFilters(patch: Partial<PacketFilters>): void {
    this.filters.update(f => ({ ...f, ...patch }));
  }

  clearFilters(): void {
    this.filters.set({
      searchTerm: '',
      protocol: undefined,
      onlyInFlow: false,
      flowId: undefined,
    });
  }

  // === Сортировка ===
  changeSort(column: keyof NetworkPacket): void {
    if (this.sortBy() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('desc');
    }
  }

  // === Удаление ===
  deletePacket(id: number): void {
    if (!confirm('Удалить этот пакет?')) return;
    this.packetService.deletePacket(id).subscribe({
      next: () => {
        this.allPackets.update(list => list.filter(p => p.id !== id));
        this.snackBar.open('Пакет удалён', 'OK', { duration: 2000 });
      },
      error: (err) => {
        this.snackBar.open(`Ошибка удаления: ${err.message || err}`,
          'Закрыть', { duration: 4000, panelClass: ['error-snackbar'] });
      },
    });
  }

  // === Helpers ===
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ru-RU');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Очистить filter по конкретному flow и query param
  clearFlowFilter(): void {
    this.applyFilters({ flowId: undefined });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { flowId: null },
      queryParamsHandling: 'merge',
    });
  }
}
