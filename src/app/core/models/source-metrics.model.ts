export interface SourceMetrics {
  id: number;
  sourceIP: string;
  packetCount: number;
  packetsPerSecond: number;
  averagePacketSize: number;
  totalBytes: number;
  duration: number;
  clusterId: number;
  isDangerous: boolean;
  dangerScore: number;
  clusterName: string;
  uniquePorts: number;
  protocols: string;
  calculatedAt: Date;
}

export interface ClusterInfo {
  clusterId: number;
  clusterName: string;
  isDangerous: boolean;
  dangerScore: number;
  sourceCount: number;
  averageSpeed: number;
  maxSpeed: number;
}

export interface ImportResult {
  importedPackets: number;
  sessionId: number;
  sessionName: string;
  sourcesAnalyzed: number;
  dangerousSources: number;
  clusters: number;
}
