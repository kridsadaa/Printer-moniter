// src/app/page.tsx
import PrinterList from "@/components/PrinterList";

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Printer Status Monitor</h1>
      <PrinterList />
    </main>
  );
}
