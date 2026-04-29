import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FlowDetail, FlowPacket, FlowSummary } from '../models/flow.model';

@Injectable({ providedIn: 'root' })
export class FlowsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Flows`;

  /** GET /api/flows/:id */
  getFlow(id: number): Observable<FlowDetail> {
    return this.http.get<FlowDetail>(`${this.apiUrl}/${id}`);
  }

  /** GET /api/flows/:id/packets */
  getFlowPackets(id: number): Observable<FlowPacket[]> {
    return this.http.get<FlowPacket[]>(`${this.apiUrl}/${id}/packets`);
  }

  /** GET /api/flows/by-session/:sessionId */
  getFlowsBySession(sessionId: number): Observable<FlowSummary[]> {
    return this.http.get<FlowSummary[]>(`${this.apiUrl}/by-session/${sessionId}`);
  }
}
