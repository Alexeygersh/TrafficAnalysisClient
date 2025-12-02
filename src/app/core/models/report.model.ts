export interface SuspiciousPacket {
  packetId: number;
  sourceIP: string;
  destinationIP: string;
  port: number;
  protocol: string;
  timestamp: Date;
  threatLevel: string;
  mlScore: number;
  sessionName?: string;
}

export interface ThreatsByProtocol {
  protocol: string;
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  averageMLScore: number;
}

export interface TopMaliciousIP {
  sourceIP: string;
  threatCount: number;
  highestThreatLevel: string;
  averageMLScore: number;
  lastDetected: Date;
  protocols: string[];
}

export interface SourceHistory {
  sourceIP: string;
  totalPackets: number;
  maliciousPackets: number;
  firstSeen: Date;
  lastSeen: Date;
  protocols: string[];
  sessions: SessionSummary[];
  recentAnalyses: RecentAnalysis[];
}

export interface SessionSummary {
  sessionId: number;
  sessionName: string;
}

export interface RecentAnalysis {
  packetId: number;
  timestamp: Date;
  threatLevel: string;
  mlScore: number;
}

export interface TimeBasedSummary {
  timeRange: string;
  startTime: Date;
  endTime: Date;
  totalPackets: number;
  analyzedPackets: number;
  maliciousPackets: number;
  threatDistribution: ThreatDistribution[];
  topProtocols: ProtocolCount[];
  sessionsSummary: SessionSummaryStats[];
}

export interface ThreatDistribution {
  threatLevel: string;
  count: number;
}

export interface ProtocolCount {
  protocol: string;
  count: number;
}

export interface SessionSummaryStats {
  sessionName: string;
  packetCount: number;
  maliciousCount: number;
}