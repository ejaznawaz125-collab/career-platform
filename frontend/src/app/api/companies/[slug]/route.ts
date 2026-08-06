import { JobStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const company = await prisma.company.findUnique({
      where: {
        slug,
      },
      include: {
        jobs: {
          where: {
            status: JobStatus.PUBLISHED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch company.",
      },
      {
        status: 500,
      },
    );
  }
}