import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { auth } from "@/auth";
import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

const applySchema = z.object({
  resumeId: z.string().trim().min(1).optional(),
}).strict();

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

    const requestText = await request.text();
    const data = applySchema.parse(requestText ? JSON.parse(requestText) : {});

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

    const selectedResume = data.resumeId
      ? await prisma.resume.findFirst({
          where: {
            id: data.resumeId,
            profileId: candidate.profileId,
            uploadStatus: "READY",
            storagePath: { not: null },
            contentHash: { not: null },
            originalName: { not: null },
            mimeType: { not: null },
          },
          select: { id: true },
        })
      : null;

    if (data.resumeId && !selectedResume) {
      return NextResponse.json(
        { message: "The selected resume is unavailable." },
        { status: 400 },
      );
    }

    const application =
      await prisma.application.create({
        data: {
          userId: candidate.userId,
          jobId,
          resumeId: selectedResume?.id ?? null,
        },
      });

    return NextResponse.json(
      application,
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "The application request is invalid." },
        { status: 400 },
      );
    }

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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { message: "The job or selected resume is no longer available." },
        { status: 409 },
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
