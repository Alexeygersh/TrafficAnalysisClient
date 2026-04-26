import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PcapImportResult } from '../models/pcap-import.model';

@Injectable({ providedIn: 'root' })
export class PcapImportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Import`;

  /**
   * POST /api/import/pcap
   * multipart form-data: file + опционально sessionId
   */
  importPcap(file: File, sessionId?: number): Observable<PcapImportResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (sessionId !== undefined && sessionId !== null) {
      formData.append('sessionId', sessionId.toString());
    }
    return this.http.post<PcapImportResult>(`${this.apiUrl}/pcap`, formData);
  }
}
