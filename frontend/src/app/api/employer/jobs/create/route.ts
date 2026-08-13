import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { jobInputSchema, optionalNumber } from "@/lib/job-management";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const parsed = jobInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid job details." },
        {
          status: 400,
        }
      );
    }
    const { title, categoryId, country, city, jobType, workMode, experienceLevel, vacancies, description, requirements, responsibilities, benefits } = parsed.data;

    let slug = generateSlug(title);

    while (
      await prisma.job.findUnique({
        where: {
          slug,
        },
      })
    ) {
      slug = `${generateSlug(title)}-${Date.now()}`;
    }

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        categoryId,

        title,
        slug,

        description,
        requirements,
        responsibilities,
        benefits,

        experienceLevel,
        jobType,
        workMode,

        salaryMin: optionalNumber(parsed.data.salaryMin),
        salaryMax: optionalNumber(parsed.data.salaryMax),

        country,
        city,

        vacancies,

        status: JobStatus.DRAFT,
      },
    });

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("CREATE JOB ERROR:", error);

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
