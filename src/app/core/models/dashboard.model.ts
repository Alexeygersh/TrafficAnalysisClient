export interface DashboardStats {
  totalFlows: number;
  attackFlows: number;
  normalFlows: number;
  anomalyFlows: number;
  supervisedDetected: number;
  unsupervisedDetected: number;

  threatLevelBreakdown: { [level: string]: number };
  protocolBreakdown: { [proto: string]: number };

  topAttackers: Array<{
    sourceIP: string;
    attackCount: number;
    totalFlows: number;
  }>;

  /** Топ-N flows по confidence (самые подозрительные) */
  topThreats: Array<{
    flowId: number;
    sourceIP: string;
    destinationIP: string;
    destinationPort: number;
    protocol: string;
    confidence: number;
    threatLevel: string;
    method: string;
  }>;
}
