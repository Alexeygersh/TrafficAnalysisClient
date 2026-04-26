import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { PcapImportService } from '../../../core/services/pcap-import';
import { PcapImportResult } from '../../../core/models/pcap-import.model';

@Component({
  selector: 'app-pcap-import',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatChipsModule,
  ],
  templateUrl: './pcap-import.html',
  styleUrl: './pcap-import.css',
})
export class PcapImportComponent {
  private service = inject(PcapImportService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  result = signal<PcapImportResult | null>(null);
  errorMessage = signal('');
  dragActive = signal(false);

  fileSizeFormatted = computed(() => {
    const f = this.selectedFile();
    if (!f) return '';
    const mb = f.size / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(f.size / 1024).toFixed(1)} KB`;
  });

  protocolStatsSorted = computed(() => {
    const stats = this.result()?.protocolStats;
    if (!stats) return [];
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([proto, count]) => ({ proto, count }));
  });

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
    this.result.set(null);
    this.errorMessage.set('');
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.result.set(null);
    this.errorMessage.set('');
  }

  upload(): void {
    const f = this.selectedFile();
    if (!f) return;

    this.isUploading.set(true);
    this.errorMessage.set('');
    this.result.set(null);

    this.service.importPcap(f).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.result.set(res);
        this.snackBar.open(
          `Импорт: ${res.flowsSavedToDb} flows, ${res.packetsSavedToDb} пакетов (${res.elapsedMs} ms)`,
          'OK', { duration: 5000 }
        );
      },
      error: (err) => {
        this.isUploading.set(false);
        const msg = err.error?.message || err.message || 'Неизвестная ошибка';
        this.errorMessage.set(msg);
        this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', {
          duration: 6000, panelClass: ['error-snackbar']
        });
      },
    });
  }

  goToAnalysis(): void {
    const sid = this.result()?.sessionId;
    if (sid) {
      this.router.navigate(['/ml/flow-analyze'], {
        queryParams: { sessionId: sid }
      });
    }
  }
}
