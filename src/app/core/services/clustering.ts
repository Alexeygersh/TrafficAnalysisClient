import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SourceMetrics, ClusterInfo, MLAnalyzeResult } from '../models/source-metrics.model';

export interface SessionFilter {
  id: number;
  sessionName: string;
  packetCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClusteringService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Clustering`;

  getSourceMetrics(): Observable<SourceMetrics[]> {
    return this.http.get<SourceMetrics[]>(`${this.apiUrl}/source-metrics`);
  }

  recalculateClusters(method: string = 'kmeans', clusters: number = 3): Observable<any> {
    const params = new HttpParams()
      .set('method', method)
      .set('clusters', clusters.toString());

    return this.http.post(`${this.apiUrl}/recalculate`, null, { params });
  }

  recalculateFromDatabase(
    sessionId: number | null = null,
    method: string = 'kmeans',
    clusters: number = 3
  ): Observable<any> {
    let params = new HttpParams()
      .set('method', method)
      .set('clusters', clusters.toString());

    if (sessionId !== null) {
      params = params.set('sessionId', sessionId.toString());
    }

    return this.http.post(`${this.apiUrl}/recalculate-from-database`, null, { params });
  }

  getSessions(): Observable<SessionFilter[]> {
    return this.http.get<SessionFilter[]>(`${this.apiUrl}/sessions`);
  }

  getClusterInfo(): Observable<ClusterInfo[]> {
    return this.http.get<ClusterInfo[]>(`${this.apiUrl}/cluster-info`);
  }

  getClusterSources(clusterId: number): Observable<SourceMetrics[]> {
    return this.http.get<SourceMetrics[]>(`${this.apiUrl}/cluster/${clusterId}/sources`);
  }

  // --- ML IDS ---

  /**
   * Запускает гибридную ML-модель (Random Forest + Isolation Forest)
   * для всех источников указанной сессии.
   * POST /api/clustering/ml-analyze?sessionId=X
   */
  runMLAnalysis(sessionId: number): Observable<MLAnalyzeResult> {
    const params = new HttpParams().set('sessionId', sessionId.toString());
    return this.http.post<MLAnalyzeResult>(`${this.apiUrl}/ml-analyze`, null, { params });
  }
}
