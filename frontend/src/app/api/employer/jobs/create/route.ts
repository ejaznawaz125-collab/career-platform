import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  // DEBUG 1
  console.log("POST API HIT");

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

    const body = await request.json();

    // DEBUG 2
    console.log("REQUEST BODY =", body);

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
    } = body;

    console.log("CATEGORY ID =", categoryId);

    if (
      !title ||
      !categoryId ||
      !country ||
      !city ||
      !description
    ) {
      return NextResponse.json(
        {
          message: "Please fill all required fields.",
        },
        {
          status: 400,
        }
      );
    }

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

        salaryMin: salaryMin
          ? Number(salaryMin)
          : null,

        salaryMax: salaryMax
          ? Number(salaryMax)
          : null,

        country,
        city,

        vacancies: Number(vacancies || 1),

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