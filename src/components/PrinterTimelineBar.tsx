// src/components/PrinterTimelineBar.tsx
"use client";

import { useEffect, useState } from "react";
import { format, differenceInMinutes, subHours } from "date-fns";
import { Clock, Wifi, WifiOff } from "lucide-react";

interface TimelineRecord {
  ip: string;
  status: boolean;
  createdAt: string;
  ping_latency_ms: number | null;
}

interface TimelineBarProps {
  ip: string;
}

export default function PrinterTimelineBar({ ip }: TimelineBarProps) {
  const [records, setRecords] = useState<TimelineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 5000);
    return () => clearInterval(interval);
  }, [ip]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/printer-timeline?ip=${ip}&hours=24`);
      const result = await res.json();
      setRecords(result.data);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  const now = new Date();
  const startTime = subHours(now, 24);
  const segments: Array<{
    status: boolean;
    startTime: Date;
    endTime: Date;
    duration: number;
    latency: number | null;
  }> = [];

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // ถ้าไม่มีข้อมูล แสดง "No Data"
  if (sortedRecords.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">24h Timeline: {ip}</h3>
        </div>
        <div className="text-center py-8 text-gray-500">No data available</div>
      </div>
    );
  }

  // สร้าง segments - ใช้สถานะล่าสุดจนถึงปัจจุบัน
  for (let i = 0; i < sortedRecords.length; i++) {
    const current = sortedRecords[i];
    const currentTime = new Date(current.createdAt);

    // ถ้าเป็น record สุดท้าย ให้ใช้สถานะนี้จนถึง now
    const isLastRecord = i === sortedRecords.length - 1;
    const nextTime = isLastRecord
      ? now
      : new Date(sortedRecords[i + 1].createdAt);

    segments.push({
      status: current.status,
      startTime: currentTime,
      endTime: nextTime,
      duration: differenceInMinutes(nextTime, currentTime),
      latency: current.ping_latency_ms,
    });
  }

  const totalDuration = differenceInMinutes(now, startTime);
  const segmentsWithPercent = segments.map((seg) => ({
    ...seg,
    percent: (seg.duration / totalDuration) * 100,
  }));

  // คำนวณสถิติ
  const totalOnlineMinutes = segments
    .filter((s) => s.status)
    .reduce((sum, s) => sum + s.duration, 0);
  const uptime = ((totalOnlineMinutes / totalDuration) * 100).toFixed(1);

  // สถานะปัจจุบัน
  const currentStatus = sortedRecords[sortedRecords.length - 1]?.status;
  const lastUpdate = sortedRecords[sortedRecords.length - 1]?.createdAt;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">24h Timeline: {ip}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-semibold">Current:</span>{" "}
            <span className={currentStatus ? "text-green-600" : "text-red-600"}>
              {currentStatus ? "Online" : "Offline"}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">Uptime:</span>{" "}
            <span className="text-green-600">{uptime}%</span>
          </div>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="mb-4">
        <div className="flex h-12 rounded overflow-hidden border border-gray-300">
          {segmentsWithPercent.map((segment, index) => {
            const isLastSegment = index === segmentsWithPercent.length - 1;
            return (
              <div
                key={index}
                className={`relative group ${
                  segment.status ? "bg-green-500" : "bg-red-500"
                } ${
                  isLastSegment ? "border-r-4 border-blue-600" : ""
                } hover:opacity-80 transition-opacity`}
                style={{ width: `${segment.percent}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 mb-1">
                      {segment.status ? (
                        <Wifi className="w-3 h-3" />
                      ) : (
                        <WifiOff className="w-3 h-3" />
                      )}
                      <span className="font-semibold">
                        {segment.status ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div>Start: {format(segment.startTime, "HH:mm:ss")}</div>
                    <div>End: {format(segment.endTime, "HH:mm:ss")}</div>
                    <div>Duration: {segment.duration}m</div>
                    {segment.status && segment.latency && (
                      <div>Latency: {segment.latency}ms</div>
                    )}
                    {isLastSegment && (
                      <div className="mt-1 pt-1 border-t border-gray-700 text-blue-300">
                        ← Current Status
                      </div>
                    )}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{format(startTime, "HH:mm")}</span>
          <span>{format(subHours(now, 18), "HH:mm")}</span>
          <span>{format(subHours(now, 12), "HH:mm")}</span>
          <span>{format(subHours(now, 6), "HH:mm")}</span>
          <span className="font-semibold text-blue-600">
            Now ({format(now, "HH:mm")})
          </span>
        </div>
      </div>

      {/* Stats & Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Offline</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last update: {format(new Date(lastUpdate), "HH:mm:ss")}
        </div>
      </div>
    </div>
  );
}
