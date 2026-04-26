/** Результат POST /api/import/pcap */
export interface PcapImportResult {
  sessionId: number;
  sessionName: string;

  // Статистика парсинга
  rawPacketsParsed: number;
  flowsBuilt: number;
  flowsSavedToDb: number;

  // Статистика пакетов в БД
  packetsSavedToDb: number;
  packetsLinkedToFlows: number;

  // Разбивка по протоколам
  protocolStats?: { [proto: string]: number };

  elapsedMs: number;
}
