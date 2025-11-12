// src/app/api/printer-records/route.ts
import { NextResponse } from "next/server";
import clientPromise, { MONGO_DATABASE } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const client = await clientPromise;
    const db = client.db(MONGO_DATABASE);

    const matchStage: any = {};

    if (search) {
      matchStage.ip = { $regex: search, $options: "i" };
    }

    if (status === "online") {
      matchStage.status = true;
    } else if (status === "offline") {
      matchStage.status = false;
    }

    const sortStage: any = {};
    sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const totalCount = await db
      .collection("printer_ping_test")
      .countDocuments(matchStage);

    // Get records แยกตาม IP และเรียงตามเวลา
    const recordsByIP = await db
      .collection("printer_ping_test")
      .aggregate([
        { $match: matchStage },
        { $sort: { ip: 1, createdAt: -1 } },
        {
          $group: {
            _id: "$ip",
            records: { $push: "$$ROOT" },
          },
        },
      ])
      .toArray();

    let allRecords: any[] = [];

    // เตรียมข้อมูลสำหรับ client คำนวณเอง
    recordsByIP.forEach((group) => {
      const ipRecords = group.records;

      ipRecords.forEach((record: any, index: number) => {
        allRecords.push({
          ...record,
          isLatest: index === 0, // flag ว่าเป็น record ล่าสุดของ IP นี้หรือไม่
          previousRecordCreatedAt:
            index > 0 ? ipRecords[index - 1].createdAt : null, // เวลาของ record ก่อนหน้า
        });
      });
    });

    // Sort ตาม sortBy และ sortOrder
    allRecords.sort((a, b) => {
      let compareA, compareB;

      if (sortBy === "ip") {
        compareA = a.ip;
        compareB = b.ip;
      } else if (sortBy === "status") {
        compareA = a.status ? 1 : 0;
        compareB = b.status ? 1 : 0;
      } else {
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    // Pagination
    const paginatedRecords = allRecords.slice(skip, skip + limit);

    const totalPages = Math.ceil(allRecords.length / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      status: "success",
      data: paginatedRecords,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRecords: allRecords.length,
        recordsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
      filters: {
        search: search,
        status: status,
        sortBy: sortBy,
        sortOrder: sortOrder,
      },
      serverTime: new Date().toISOString(),
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
