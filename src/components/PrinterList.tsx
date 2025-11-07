// src/components/PrinterList.tsx
"use client";

import { useEffect, useState } from "react";
import PrinterCard from "./PrinterCard";
import { PrinterPing } from "@/types/printer";

export default function PrinterList() {
  const [printers, setPrinters] = useState<PrinterPing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrinters();
    const interval = setInterval(fetchPrinters, 5000); // Auto-refresh 5s
    return () => clearInterval(interval);
  }, []);

  const fetchPrinters = async () => {
    try {
      const res = await fetch("/api/printer-status");
      const data = await res.json();
      setPrinters(data.data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {printers.map((printer) => (
        <PrinterCard key={printer._id} printer={printer} />
      ))}
    </div>
  );
}
