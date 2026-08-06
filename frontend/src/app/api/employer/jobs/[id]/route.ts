import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const company = await prisma.company.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found." },
        { status: 404 }
      );
    }

    const job = await prisma.job.findFirst({
      where: {
        id,
        companyId: company.id,
      },
    });

    if (!job) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      title,
      categoryId,
      country,
      city,
      jobType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
      vacancies,
      description,
      requirements,
      responsibilities,
      benefits,
      status,
    } = body;
        await prisma.job.update({
      where: {
        id,
      },
      data: {
        title,
        categoryId,

        country,
        city,

        jobType,
        workMode,
        experienceLevel,

        salaryMin: salaryMin
          ? Number(salaryMin)
          : null,

        salaryMax: salaryMax
          ? Number(salaryMax)
          : null,

        vacancies: Number(vacancies),

        description,
        requirements,
        responsibilities,
        benefits,

        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job updated successfully.",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const company = await prisma.company.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found." },
        { status: 404 }
      );
    }

    await prisma.job.delete({
      where: {
        id,
        companyId: company.id,
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }
}