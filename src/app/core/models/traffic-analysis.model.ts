export interface TrafficAnalysis {
  id: number;
  packetId: number;
  threatLevel: string; // "Low" | "Medium" | "High" | "Critical"
  isMalicious: boolean;
  mlModelScore: number; // 0.0 - 1.0
  detectedAt: Date;
  description?: string;
}

export interface CreateAnalysisDto {
  packetId: number;
  mlModelScore?: number;
  description?: string;
}

export interface AnalysisReport {
  analysisId: number;
  packetId: number;
  sourceIP: string;
  destinationIP: string;
  port: number;
  threatLevel: string;
  mlModelScore: number;
  isMalicious: boolean;
  detectedAt: Date;
  reportText: string;
}