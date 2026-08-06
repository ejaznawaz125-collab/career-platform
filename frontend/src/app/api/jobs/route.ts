import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/services/job.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const result = await getJobs({
      search: searchParams.get("search") || undefined,
      companyId: searchParams.get("companyId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      country: searchParams.get("country") || undefined,
      city: searchParams.get("city") || undefined,
      featured:
        searchParams.get("featured") === null
          ? undefined
          : searchParams.get("featured") === "true",
      urgent:
        searchParams.get("urgent") === null
          ? undefined
          : searchParams.get("urgent") === "true",
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 12),
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch jobs.",
      },
      {
        status: 500,
      }
    );
  }
}