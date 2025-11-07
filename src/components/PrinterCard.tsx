// src/components/PrinterCard.tsx
"use client";

import { useState } from "react";
import { PrinterPing } from "@/types/printer";
import { ChevronDown, ChevronUp } from "lucide-react";
import PrinterTimelineBar from "./PrinterTimelineBar";

export default function PrinterCard({ printer }: { printer: PrinterPing }) {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div
      className={`rounded-lg border ${
        printer.status ? "border-green-500" : "border-red-500"
      }`}
    >
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setShowTimeline(!showTimeline)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{printer.ip}</h3>
            <p className="text-sm text-gray-600">{printer.ping_display}</p>
            <p className="text-xs text-gray-400 mt-1">
              Last update: {new Date(printer.createdAt).toLocaleString("th-TH")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                printer.status ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            {showTimeline ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </div>

      {showTimeline && (
        <div className="border-t p-4 bg-gray-50">
          <PrinterTimelineBar ip={printer.ip} />
        </div>
      )}
    </div>
  );
}
