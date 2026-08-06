import { NextResponse } from "next/server";
import { auth } from "@/auth";
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

    const alreadyApplied =
      await prisma.application.findUnique({
        where: {
          userId_jobId: {
            userId: session.user.id,
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
          userId: session.user.id,
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