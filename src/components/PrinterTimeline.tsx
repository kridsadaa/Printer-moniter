// src/components/PrinterTimeline.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";
import { format } from "date-fns";

interface TimelineData {
  time: string;
  latency: number;
  status: number; // 1 = online, 0 = offline
}

interface PrinterTimelineProps {
  ip: string;
}

export default function PrinterTimeline({ ip }: PrinterTimelineProps) {
  const [data, setData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 10000); // Refresh ทุก 10 วินาที
    return () => clearInterval(interval);
  }, [ip]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/printer-timeline?ip=${ip}`);
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading timeline...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Timeline: {ip}</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => format(new Date(value), "HH:mm:ss")}
          />
          <YAxis
            yAxisId="left"
            label={{
              value: "Latency (ms)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={(value) => (value === 1 ? "Online" : "Offline")}
          />
          <Tooltip
            labelFormatter={(value) => format(new Date(value), "HH:mm:ss")}
            formatter={(value: any, name: string) => {
              if (name === "Status") return value === 1 ? "Online" : "Offline";
              return `${value} ms`;
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="latency"
            stroke="#3b82f6"
            name="Latency"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="stepAfter"
            dataKey="status"
            stroke="#22c55e"
            name="Status"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
