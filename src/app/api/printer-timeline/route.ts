// src/app/api/printer-timeline/route.ts
import { NextResponse } from "next/server";
import clientPromise, { MONGO_DATABASE } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");
    const hours = parseInt(searchParams.get("hours") || "24");

    if (!ip) {
      return NextResponse.json(
        { status: "error", message: "IP parameter is required", data: [] },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(MONGO_DATABASE);

    // คำนวณเวลาย้อนหลัง
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);

    // Get records ในช่วงเวลาที่กำหนด
    const records = await db
      .collection("printer_ping_test")
      .find({
        ip: ip,
        createdAt: { $gte: hoursAgo },
      })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      status: "success",
      data: records,
      count: records.length,
    });
  } catch (error: any) {
    console.error("Timeline API Error:", error);
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
