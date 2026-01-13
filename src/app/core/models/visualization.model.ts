export interface VisualizationDto {
  image: string; // Base64 encoded image
  explainedVariance?: number[];
  totalVarianceExplained?: number;
  error?: string;
}
