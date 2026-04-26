import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionFilter } from '../models/session-filter.model';

@Injectable({ providedIn: 'root' })
export class SessionApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Clustering`;

  /** Лёгкий список сессий для dropdown (id, name, packetCount, flowCount). */
  getSessions(): Observable<SessionFilter[]> {
    return this.http.get<SessionFilter[]>(`${this.apiUrl}/sessions`);
  }
}
