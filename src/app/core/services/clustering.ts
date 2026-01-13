import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SourceMetrics, ClusterInfo } from '../models/source-metrics.model';

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

  // НОВЫЙ МЕТОД: Пересчёт из существующих пакетов
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

  // НОВЫЙ МЕТОД: Получить список сессий
  getSessions(): Observable<SessionFilter[]> {
    return this.http.get<SessionFilter[]>(`${this.apiUrl}/sessions`);
  }

  getClusterInfo(): Observable<ClusterInfo[]> {
    return this.http.get<ClusterInfo[]>(`${this.apiUrl}/cluster-info`);
  }

  getClusterSources(clusterId: number): Observable<SourceMetrics[]> {
    return this.http.get<SourceMetrics[]>(`${this.apiUrl}/cluster/${clusterId}/sources`);
  }
}
