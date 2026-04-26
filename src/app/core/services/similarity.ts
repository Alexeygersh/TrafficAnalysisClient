import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FindSimilarResponse, KnnClassifyResponse
} from '../models/similarity.model';

@Injectable({ providedIn: 'root' })
export class SimilarityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Similarity`;

  findSimilar(
    targetFlowId: number,
    w1: number, w2: number, w3: number,
    k: number = 10,
    sessionId?: number
  ): Observable<FindSimilarResponse> {
    let params = new HttpParams()
      .set('targetFlowId', targetFlowId.toString())
      .set('w1', w1.toString())
      .set('w2', w2.toString())
      .set('w3', w3.toString())
      .set('k', k.toString());
    if (sessionId !== undefined) {
      params = params.set('sessionId', sessionId.toString());
    }
    return this.http.post<FindSimilarResponse>(
      `${this.apiUrl}/find`, null, { params });
  }

  knnClassify(
    sessionId: number,
    w1: number, w2: number, w3: number,
    k: number = 5,
    model: 'rf' | 'catboost' = 'rf'
  ): Observable<KnnClassifyResponse> {
    const params = new HttpParams()
      .set('sessionId', sessionId.toString())
      .set('w1', w1.toString())
      .set('w2', w2.toString())
      .set('w3', w3.toString())
      .set('k', k.toString())
      .set('model', model);
    return this.http.post<KnnClassifyResponse>(
      `${this.apiUrl}/knn-classify`, null, { params });
  }
}
