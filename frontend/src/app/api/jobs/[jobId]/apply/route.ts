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
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const candidate = await getAuthenticatedCandidateOwner();

    if (!candidate) {
      return NextResponse.json(
        {
          message: "Only candidate accounts can apply for jobs.",
        },
        {
          status: 403,
        },
      );
    }

    const { jobId } = await params;

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          message: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    if (job.status !== "PUBLISHED") {
      return NextResponse.json(
        {
          message: "This job is not accepting applications.",
        },
        {
          status: 409,
        },
      );
    }

    const alreadyApplied =
      await prisma.application.findUnique({
        where: {
          userId_jobId: {
            userId: candidate.userId,
            jobId,
          },
        },
      });

    if (alreadyApplied) {
      return NextResponse.json(
        {
          message: "You have already applied.",
        },
        {
          status: 409,
        }
      );
    }

    const application =
      await prisma.application.create({
        data: {
          userId: candidate.userId,
          jobId,
        },
      });

    return NextResponse.json(
      application,
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "You have already applied.",
        },
        {
          status: 409,
        },
      );
    }

    console.error("JOB_APPLICATION_CREATE_ERROR:", error);

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
