import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function POST(
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

    const candidate = await getAuthenticatedCandidateOwner();
    if (!candidate) {
      return NextResponse.json(
        { message: "Only candidate accounts can save jobs." },
        { status: 403 },
      );
    }

    const { jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { status: true },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found." }, { status: 404 });
    }

    if (job.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "This job is not available to save." },
        { status: 409 },
      );
    }

    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: candidate.userId,
          jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Job already saved.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.savedJob.create({
      data: {
        userId: candidate.userId,
        jobId,
      },
    });

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ message: "Job already saved." }, { status: 409 });
    }

    console.error("SAVED_JOB_CREATE_ERROR:", error);

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

    const candidate = await getAuthenticatedCandidateOwner();
    if (!candidate) {
      return NextResponse.json(
        { message: "Only candidate accounts can manage saved jobs." },
        { status: 403 },
      );
    }

    const { jobId } = await params;

    await prisma.savedJob.deleteMany({
      where: {
        userId: candidate.userId,
        jobId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("SAVED_JOB_DELETE_ERROR:", error);

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
