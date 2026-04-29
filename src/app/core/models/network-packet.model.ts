/**
 * Сетевой пакет — минимальная модель без устаревшего analysis.
 * Анализ теперь делается на flow-уровне через FlowMetrics.
 */
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

  /** ID потока к которому принадлежит пакет (если разобран в flow). */
  flowId?: number;
}

/** Балл угрозы (рассчитывается backend по правилам — не ML). */
export interface ThreatScore {
  packetId: number;
  threatScore: number;
  category: string;
  explanation: string;
}
