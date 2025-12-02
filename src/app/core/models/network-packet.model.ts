export interface NetworkPacket {
  id: number;
  sourceIP: string;
  destinationIP: string;
  port: number;
  protocol: string;
  packetSize: number;
  timestamp: Date;
  sessionId?: number;
  sessionName?: string;
  analysis?: TrafficAnalysis;
}

export interface CreatePacketDto {
  sourceIP: string;
  destinationIP: string;
  port: number;
  protocol: string;
  packetSize: number;
  sessionId?: number;
}

export interface UpdatePacketDto {
  sourceIP: string;
  destinationIP: string;
  port: number;
  protocol: string;
  packetSize: number;
  sessionId?: number;
}

export interface ThreatScore {
  packetId: number;
  threatScore: number;
  category: string;
  explanation: string;
}

// Импорт для избежания циклических зависимостей
interface TrafficAnalysis {
  id: number;
  packetId: number;
  threatLevel: string;
  isMalicious: boolean;
  mlModelScore: number;
  detectedAt: Date;
  description?: string;
}