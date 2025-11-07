// src/types/printer.ts
export interface PrinterPing {
  _id: string;
  type: string;
  ip: string;
  status: boolean;
  ping_latency_ms: number | null;
  ping_display: string;
  createdAt: string;
}

export interface TimelineData {
  time: string;
  latency: number;
  status: number;
}
