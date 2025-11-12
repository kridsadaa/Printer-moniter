// src/app/page.tsx
import PrinterList from "@/components/PrinterList";
import Link from "next/link";
import { Table as TableIcon, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Printer Status Monitor</h1>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/table"
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            <TableIcon className="w-4 h-4" />
            Table View
          </Link>
        </div>
      </div>

      <PrinterList />
    </main>
  );
}
