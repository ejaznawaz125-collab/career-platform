import { NextRequest, NextResponse } from "next/server";

import { getCompanies } from "@/services/company.service";
import { normalizeCompanyIndustryFilter } from "@/lib/company-industries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const result = await getCompanies({
      search: searchParams.get("search") ?? undefined,
      industry: normalizeCompanyIndustryFilter(searchParams.get("industry") ?? undefined),
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "12"),
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
        message: "Failed to fetch companies.",
      },
      {
        status: 500,
      },
    );
  }
}
