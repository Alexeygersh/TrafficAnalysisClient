import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeatureSelectionResult } from '../models/feature-selection.model';

@Injectable({ providedIn: 'root' })
export class FeatureSelectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ML`;

  /**
   * POST /api/ml/feature-selection?sessionId=X&topK=10
   * sessionId = null → все сессии
   */
  runFeatureSelection(
    sessionId: number | null,
    topK: number = 10
  ): Observable<FeatureSelectionResult> {
    let params = new HttpParams().set('topK', topK.toString());
    if (sessionId !== null) {
      params = params.set('sessionId', sessionId.toString());
    }
    return this.http.post<FeatureSelectionResult>(
      `${this.apiUrl}/feature-selection`,
      null,
      { params }
    );
  }
}
