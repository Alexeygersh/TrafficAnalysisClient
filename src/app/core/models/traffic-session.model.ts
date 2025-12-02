export interface TrafficSession {
  id: number;
  sessionName: string;
  startTime: Date;
  endTime?: Date;
  description?: string;
  totalPackets: number;
  isActive: boolean;
}

export interface CreateSessionDto {
  sessionName: string;
  description?: string;
}

export interface SessionStatistics {
  sessionId: number;
  sessionName: string;
  totalPackets: number;
  uniqueSourceIPs: number;
  uniqueDestinationIPs: number;
  averagePacketSize: number;
  mostUsedProtocol: string;
  anomalousPacketsCount: number;
  durationMinutes: number;
}