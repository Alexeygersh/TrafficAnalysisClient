export type SimilarityMode = 'find' | 'knn';

export interface SimilarityWeights {
  w1: number;
  w2: number;
  w3: number;
}

export interface SimilarityBlocks {
  A: string[];
  B: string[];
  C: string[];
}

export interface SimilarityTargetFlow {
  flowId: number;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  isAttack: boolean;
  threatLevel: string;
}

export interface SimilarityResult {
  flowId: number;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  isAttack: boolean;
  threatLevel: string;
  simA: number;
  simB: number;
  simC: number;
  sim: number;
}

export interface FindSimilarResponse {
  targetFlow: SimilarityTargetFlow;
  weights: SimilarityWeights;
  blocks: SimilarityBlocks;
  totalCandidates: number;
  k: number;
  results: SimilarityResult[];
  sessionId: number;
  elapsedMs: number;
}

export interface KnnNeighbor {
  flowId: number;
  sim: number;
  isAttack: boolean;
}

export interface KnnPrediction {
  flowId: number;
  sourceIP: string;
  destinationIP: string;
  destinationPort: number;
  protocol: string;
  knnIsAttack: boolean;
  knnConfidence: number;
  neighbors: KnnNeighbor[];
  originalLabel: boolean;
}

export interface KnnClassifyResponse {
  totalFlows: number;
  knnAttackFlows: number;
  originalAttackFlows: number;
  agreementWithOriginal: number;
  weights: SimilarityWeights;
  k: number;
  blocks: SimilarityBlocks;
  predictions: KnnPrediction[];
  sessionId: number;
  modelUsedAsGroundTruth: string;
  elapsedMs: number;
}
