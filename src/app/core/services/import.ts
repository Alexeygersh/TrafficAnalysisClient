import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportResult } from '../models/source-metrics.model';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Import`;

  // Импорт CSV
  importCsv(file: File, sessionId?: number): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    if (sessionId) {
      formData.append('sessionId', sessionId.toString());
    }

    return this.http.post<ImportResult>(`${this.apiUrl}/csv`, formData);
  }
}
