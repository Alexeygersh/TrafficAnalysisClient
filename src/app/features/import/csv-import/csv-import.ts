import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ImportService } from '../../../core/services/import';
import { SessionService } from '../../../core/services/session';
import { ImportResult } from '../../../core/models/source-metrics.model';
import { TrafficSession } from '../../../core/models/traffic-session.model';

@Component({
  selector: 'app-csv-import',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  templateUrl: './csv-import.html',
  styleUrls: ['./csv-import.css']
})
export class CsvImportComponent {
  private importService = inject(ImportService);
  private sessionService = inject(SessionService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  selectedFile = signal<File | null>(null);
  selectedSessionId = signal<number | undefined>(undefined);
  sessions = signal<TrafficSession[]>([]);
  isUploading = signal(false);
  importResult = signal<ImportResult | null>(null);

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getAllSessions().subscribe({
      next: (sessions) => this.sessions.set(sessions),
      error: (err) => console.error('Error loading sessions:', err)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.name.endsWith('.csv')) {
        this.snackBar.open('Только CSV файлы поддерживаются', 'Закрыть', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.selectedFile.set(file);
    }
  }

  uploadFile() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);

    this.importService.importCsv(file, this.selectedSessionId()).subscribe({
      next: (result) => {
        this.importResult.set(result);
        this.isUploading.set(false);

        this.snackBar.open(
          `Импортировано ${result.importedPackets} пакетов!`,
          'OK',
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.isUploading.set(false);
        this.snackBar.open(
          `Ошибка импорта: ${err.error?.message || err.message}`,
          'Закрыть',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  viewSession() {
    const result = this.importResult();
    if (result) {
      this.router.navigate(['/sessions', result.sessionId]);
    }
  }

  viewClusters() {
    this.router.navigate(['/clustering']);
  }

  reset() {
    this.selectedFile.set(null);
    this.importResult.set(null);
    (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
  }
}
