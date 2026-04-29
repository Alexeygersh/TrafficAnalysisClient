/** Полная сущность Flow с признаками (получаем из GET /api/flows/:id) */
export interface FlowDetail {
  id: number;
  sessionId: number;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  flowStartTime: string;
  flowEndTime: string;
  flowDuration: number;

  // Базовые
  totalFwdPackets: number;
  totalBackwardPackets: number;
  totalLengthFwdPackets: number;
  totalLengthBwdPackets: number;

  // Длины пакетов
  fwdPacketLengthMax: number;
  fwdPacketLengthMin: number;
  fwdPacketLengthMean: number;
  fwdPacketLengthStd: number;
  bwdPacketLengthMax: number;
  bwdPacketLengthMin: number;
  bwdPacketLengthMean: number;
  bwdPacketLengthStd: number;
  minPacketLength: number;
  maxPacketLength: number;
  packetLengthMean: number;
  packetLengthStd: number;
  packetLengthVariance: number;
  averagePacketSize: number;

  // Скорости
  flowBytesPerSec: number;
  flowPacketsPerSec: number;
  fwdPacketsPerSec: number;
  bwdPacketsPerSec: number;

  // IAT
  flowIATMean: number;
  flowIATStd: number;
  flowIATMax: number;
  flowIATMin: number;
  fwdIATTotal: number;
  fwdIATMean: number;
  fwdIATStd: number;
  fwdIATMax: number;
  fwdIATMin: number;
  bwdIATTotal: number;
  bwdIATMean: number;
  bwdIATStd: number;
  bwdIATMax: number;
  bwdIATMin: number;

  // Флаги TCP
  fwdPSHFlags: number;
  bwdPSHFlags: number;
  fwdURGFlags: number;
  bwdURGFlags: number;
  finFlagCount: number;
  synFlagCount: number;
  rstFlagCount: number;
  pshFlagCount: number;
  ackFlagCount: number;
  urgFlagCount: number;
  cweFlagCount: number;
  eceFlagCount: number;

  // Headers
  fwdHeaderLength: number;
  bwdHeaderLength: number;
  minSegSizeForward: number;

  // Активность
  activeMean: number;
  activeStd: number;
  activeMax: number;
  activeMin: number;
  idleMean: number;
  idleStd: number;
  idleMax: number;
  idleMin: number;

  // ML результаты
  threatScore?: number;
  threatLevel?: string;
  predictedBy?: string;

  [key: string]: any;
}

/** Пакет внутри flow */
export interface FlowPacket {
  id: number;
  sourceIP: string;
  destinationIP: string;
  port: number;
  protocol: string;
  packetSize: number;
  timestamp: string;
  sessionId?: number;
  flowId?: number;
}

/** Краткое представление flow для табличного отображения */
export interface FlowSummary {
  id: number;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  flowDuration: number;
  totalPackets: number;
  threatScore?: number;
  threatLevel?: string;
  predictedBy?: string;
}
