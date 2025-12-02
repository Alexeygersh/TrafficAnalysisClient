import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { 
  TrafficAnalysis, 
  CreateAnalysisDto, 
  AnalysisReport 
} from '../models/traffic-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Analysis`;

  // Получить все анализы
  // getAllAnalyses(): Observable<TrafficAnalysis[]> {
  //   return this.http.get<TrafficAnalysis[]>(this.apiUrl);
  // }
  getAllAnalyses(): Observable<TrafficAnalysis[]> {
    return this.http.get<TrafficAnalysis[]>(this.apiUrl).pipe(
      map(analyses => {
        console.log('📊 Raw analyses from API:', analyses); // ✅ Логирование
        
        return analyses.map(a => ({
          ...a,
          detectedAt: new Date(a.detectedAt)
        }));
      })
    );
  }

  // Получить анализ по ID
  getAnalysisById(id: number): Observable<TrafficAnalysis> {
    return this.http.get<TrafficAnalysis>(`${this.apiUrl}/${id}`);
  }

  // Создать анализ
  createAnalysis(dto: CreateAnalysisDto): Observable<TrafficAnalysis> {
    return this.http.post<TrafficAnalysis>(this.apiUrl, dto);
  }

  // Обновить анализ
  updateAnalysis(id: number, dto: CreateAnalysisDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  // Удалить анализ
  deleteAnalysis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Получить отчет по анализу
  getAnalysisReport(id: number): Observable<AnalysisReport> {
    return this.http.get<AnalysisReport>(`${this.apiUrl}/report/${id}`);
  }

  // Обновить уверенность модели
  updateConfidence(id: number, newScore: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-confidence/${id}`, newScore);
  }

  // Фильтрация анализов (клиентская сторона)
  filterAnalyses(
    analyses: TrafficAnalysis[], 
    filters: AnalysisFilters
  ): TrafficAnalysis[] {
    let filtered = [...analyses];

    // Фильтр по уровню угрозы
    if (filters.threatLevel) {
      filtered = filtered.filter(a => a.threatLevel === filters.threatLevel);
    }

    // Фильтр по статусу (вредоносный/безопасный)
    if (filters.isMalicious !== undefined) {
      filtered = filtered.filter(a => a.isMalicious === filters.isMalicious);
    }

    // Фильтр по диапазону ML Score
    if (filters.minMLScore !== undefined) {
      filtered = filtered.filter(a => a.mlModelScore >= filters.minMLScore!);
    }

    if (filters.maxMLScore !== undefined) {
      filtered = filtered.filter(a => a.mlModelScore <= filters.maxMLScore!);
    }

    // Фильтр по дате
    if (filters.dateFrom) {
      filtered = filtered.filter(a => 
        new Date(a.detectedAt) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(a => 
        new Date(a.detectedAt) <= new Date(filters.dateTo!)
      );
    }

    return filtered;
  }

  // Сортировка
  sortAnalyses(
    analyses: TrafficAnalysis[], 
    sortBy: keyof TrafficAnalysis, 
    sortDirection: 'asc' | 'desc'
  ): TrafficAnalysis[] {
    return [...analyses].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = aValue > bValue ? 1 : -1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}

// Интерфейс для фильтров
export interface AnalysisFilters {
  threatLevel?: string;
  isMalicious?: boolean;
  minMLScore?: number;
  maxMLScore?: number;
  dateFrom?: string;
  dateTo?: string;
}