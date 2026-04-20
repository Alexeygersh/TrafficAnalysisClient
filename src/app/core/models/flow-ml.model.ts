/** Предсказание модели для одного flow. */
export interface FlowMLPrediction {
  flowId: number;
  sourceIP: string;
  destinationIP: string;
  destinationPort: number;
  protocol: string;

  isAttack: boolean;
  confidence: number;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  /** supervised | unsupervised | both | none */
  method: string;
  rfPrediction: number;
  isAnomaly: boolean;
}

/** Результат POST /api/ml/flow-analyze?sessionId=X&model=rf|catboost */
export interface FlowMLAnalyzeResult {
  sessionId: number;
  totalFlows: number;
  attackFlows: number;
  anomalyFlows: number;
  threatLevelBreakdown: { [level: string]: number };
  methodBreakdown: { [method: string]: number };
  usedFeatures: string[];
  elapsedMs: number;
  predictions: FlowMLPrediction[];
}

/** Результат GET /api/ml/model-meta?model= */
export interface ModelMeta {
  featureNames: string[];
  modelVersion: string;
  modelFile: string;
  trainedOn: string;
  featuresByBlock?: { [block: string]: string[] };
  selectionMethod?: string;
}

export type ModelType = 'rf' | 'catboost';
