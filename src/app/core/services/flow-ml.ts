import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FlowMLAnalyzeResult, ModelMeta, ModelType } from '../models/flow-ml.model';

@Injectable({ providedIn: 'root' })
export class FlowMLService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ML`;

  /**
   * POST /api/ml/flow-analyze?sessionId=X&model=rf|catboost
   */
  runFlowAnalysis(sessionId: number, model: ModelType = 'rf'):
    Observable<FlowMLAnalyzeResult> {
    const params = new HttpParams()
      .set('sessionId', sessionId.toString())
      .set('model', model);
    return this.http.post<FlowMLAnalyzeResult>(
      `${this.apiUrl}/flow-analyze`, null, { params });
  }

  /**
   * GET /api/ml/model-meta?model=rf|catboost
   */
  getModelMeta(model: ModelType = 'rf'): Observable<ModelMeta> {
    const params = new HttpParams().set('model', model);
    return this.http.get<ModelMeta>(`${this.apiUrl}/model-meta`, { params });
  }
}
