import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PcapImportService } from '../../core/services/pcap-import.service';
import { PcapImportResult } from '../../core/models/pcap-import.model';
import { SessionService } from '../../core/services/session.service';
import { TrafficSession } from '../../core/models/traffic-session.model';
import { AuthService } from '../../core/services/auth.service';
import { EditPcapFileDialog } from './edit-pcap-file.dialog';

@Component({
  selector: 'app-pcap-files',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatTableModule, MatChipsModule, MatTooltipModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './pcap-files.html',
  styleUrl: './pcap-files.css',
})
export class PcapFilesComponent implements OnInit {
  private importService = inject(PcapImportService);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // === Импорт ===
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  importResult = signal<PcapImportResult | null>(null);
  importError = signal('');
  dragActive = signal(false);

  // === Список ===
  files = signal<TrafficSession[]>([]);
  isLoading = signal(false);
  loadError = signal('');

  isAdmin = computed(() => this.authService.isAdmin());

  // Колонки таблицы
  displayedColumns = [
    'id', 'name', 'startTime', 'totalPackets', 'totalFlows', 'actions'
  ];

  // Если нет файлов — drop-zone большой; если есть — компактный
  hasFiles = computed(() => this.files().length > 0);

  fileSizeFormatted = computed(() => {
    const f = this.selectedFile();
    if (!f) return '';
    const mb = f.size / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(f.size / 1024).toFixed(1)} KB`;
  });

  ngOnInit(): void {
    this.loadFiles();
  }

  // === Загрузка списка ===
  loadFiles(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.sessionService.getAllSessions().subscribe({
      next: (list) => {
        // Сортировка по убыванию ID — свежие наверху
        const sorted = [...list].sort((a, b) => b.id - a.id);
        this.files.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(err.message || 'Ошибка загрузки списка файлов');
        this.isLoading.set(false);
      },
    });
  }

  // === Drag-n-drop ===
  onDragOver(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragActive.set(true);
  }
  onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragActive.set(false);
  }
  onDrop(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragActive.set(false);
    const file = evt.dataTransfer?.files?.[0];
    if (file) this.setFile(file);
  }

  onFileInputChange(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File): void {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pcap') && !name.endsWith('.pcapng')) {
      this.snackBar.open(
        'Ожидается файл .pcap или .pcapng', 'Закрыть',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
      return;
    }
    this.selectedFile.set(file);
    this.importResult.set(null);
    this.importError.set('');
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.importResult.set(null);
    this.importError.set('');
  }

  // === Импорт ===
  upload(): void {
    const f = this.selectedFile();
    if (!f) return;

    this.isUploading.set(true);
    this.importError.set('');
    this.importResult.set(null);

    this.importService.importPcap(f).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.importResult.set(res);
        this.snackBar.open(
          `Импорт: ${res.flowsSavedToDb} flows, ${res.packetsSavedToDb} пакетов (${res.elapsedMs} ms)`,
          'OK', { duration: 5000 }
        );
        // Обновить список — там появится новый файл
        this.loadFiles();
        // И сбросить drag-n-drop форму
        this.selectedFile.set(null);
      },
      error: (err) => {
        this.isUploading.set(false);
        const msg = err.error?.message || err.message || 'Неизвестная ошибка';
        this.importError.set(msg);
        this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', {
          duration: 6000, panelClass: ['error-snackbar'],
        });
      },
    });
  }

  goToAnalysis(sessionId: number): void {
    this.router.navigate(['/ml/flow-analyze'], {
      queryParams: { sessionId },
    });
  }

  // === Удаление ===
  deleteFile(file: TrafficSession): void {
    if (!confirm(
      `Удалить файл "${file.sessionName}" и все связанные данные ` +
      `(flows и пакеты)?`
    )) return;

    this.sessionService.deleteSession(file.id).subscribe({
      next: () => {
        this.files.update(list => list.filter(f => f.id !== file.id));
        this.snackBar.open('Файл удалён', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(
          `Ошибка удаления: ${err.message || err}`,
          'Закрыть',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
      },
    });
  }

  // === Редактирование ===
  editFile(file: TrafficSession): void {
    const ref = this.dialog.open(EditPcapFileDialog, {
      width: '500px',
      data: { name: file.sessionName, description: file.description || '' },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.sessionService.updateSession(file.id, {
        sessionName: result.name,
        description: result.description,
      }).subscribe({
        next: () => {
          this.snackBar.open('Сохранено', 'OK', { duration: 2000 });
          this.loadFiles();
        },
        error: (err) => {
          this.snackBar.open(
            `Ошибка: ${err.message || err}`,
            'Закрыть',
            { duration: 4000, panelClass: ['error-snackbar'] }
          );
        },
      });
    });
  }

  // === Helpers ===
  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('ru-RU');
  }
}
