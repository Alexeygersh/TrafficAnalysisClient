import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import {
  SuspiciousPacket,
  ThreatsByProtocol,
  TopMaliciousIP,
  SourceHistory,
  TimeBasedSummary
} from '../models/report.model';
import { SessionStatistics } from '../models/traffic-session.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Reports`;

  // 1. Все подозрительные пакеты с результатами анализа
  getSuspiciousPackets(): Observable<SuspiciousPacket[]> {
    return this.http.get<SuspiciousPacket[]>(`${this.apiUrl}/suspicious-packets`);
  }

  // 2. Статистика угроз по протоколам
  getThreatsByProtocol(): Observable<ThreatsByProtocol[]> {
    return this.http.get<ThreatsByProtocol[]>(`${this.apiUrl}/threats-by-protocol`);
  }

  // 3. Топ вредоносных IP-адресов
  // getTopMaliciousIPs(top: number = 10): Observable<TopMaliciousIP[]> {
  //   const params = new HttpParams().set('top', top.toString());
  //   return this.http.get<TopMaliciousIP[]>(`${this.apiUrl}/top-malicious-ips`, { params });
  // }
  getTopMaliciousIPs(top: number = 10): Observable<TopMaliciousIP[]> {
    const params = new HttpParams().set('top', top.toString());
    return this.http.get<TopMaliciousIP[]>(`${this.apiUrl}/top-malicious-ips`, { params }).pipe(
      map(ips => {
        console.log('🚨 Raw IPs from API:', ips); // Логирование

        return ips.map(ip => ({
          ...ip,
          lastDetected: new Date(ip.lastDetected)
        }));
      })
    );
  }

  // 4. История анализа для конкретного источника
  getSourceHistory(sourceIP: string): Observable<SourceHistory> {
    return this.http.get<SourceHistory>(`${this.apiUrl}/source-history/${sourceIP}`);
  }

  // 5. Сводный отчет по временным интервалам
  // getTimeBasedSummary(hours: number = 24): Observable<TimeBasedSummary> {
  //   const params = new HttpParams().set('hours', hours.toString());
  //   return this.http.get<TimeBasedSummary>(`${this.apiUrl}/time-based-summary`, { params });
  // }
  getTimeBasedSummary(hours: number = 24): Observable<TimeBasedSummary> {
    const params = new HttpParams().set('hours', hours.toString());
    return this.http.get<TimeBasedSummary>(`${this.apiUrl}/time-based-summary`, { params }).pipe(
      map(summary => {
        console.log('📈 Raw summary from API:', summary); // Логирование

        return {
          ...summary,
          startTime: new Date(summary.startTime),
          endTime: new Date(summary.endTime)
        };
      })
    );
  }

  // 6. Детальный отчет по сессии
  getSessionDetailedReport(sessionId: number): Observable<SessionStatistics> {
    return this.http.get<SessionStatistics>(`${this.apiUrl}/session-detailed/${sessionId}`);
  }
}
