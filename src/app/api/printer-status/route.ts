// src/app/api/printer-status/route.ts
import { NextResponse } from "next/server";
import clientPromise, { MONGO_DATABASE } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(MONGO_DATABASE);

    const printers = await db
      .collection("printer_ping_test")
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$ip",
            latestDoc: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$latestDoc" } },
        { $sort: { ip: 1 } },
      ])
      .toArray();

    return NextResponse.json({
      status: "success",
      data: printers,
      count: printers.length,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        data: [],
      },
      { status: 500 }
    );
  }
}
