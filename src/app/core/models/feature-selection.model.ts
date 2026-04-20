export interface FeatureRank {
  feature: string;
  silhouette: number | null;  // null если константный признак
  rank: number;
  note: string;
}

export interface FeatureSelectionResult {
  totalSamples: number;
  totalFeatures: number;
  validFeatures: number;
  ranking: FeatureRank[];
  top10: string[];
  chart: string | null;       // data:image/png;base64,...
  error?: string;
}
