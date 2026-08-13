import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { jobInputSchema, optionalNumber } from "@/lib/job-management";

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

    const parsed = jobInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid job details." }, { status: 400 });
    const { title, categoryId, country, city, jobType, workMode, experienceLevel, vacancies, description, requirements, responsibilities, benefits, status } = parsed.data;
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

        salaryMin: optionalNumber(parsed.data.salaryMin),
        salaryMax: optionalNumber(parsed.data.salaryMax),
        vacancies,

        description,
        requirements,
        responsibilities,
        benefits,

        status,
        ...(status === "PUBLISHED" && !job.publishedAt ? { publishedAt: new Date() } : {}),
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

    const job = await prisma.job.findFirst({
      where: {
        id,
        companyId: company.id,
      },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    await prisma.job.delete({ where: { id: job.id } });

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
