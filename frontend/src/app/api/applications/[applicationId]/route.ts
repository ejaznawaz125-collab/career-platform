import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    applicationId: string;
  }>;
};

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

    const { applicationId } = await params;

    const application =
      await prisma.application.findUnique({
        where: {
          id: applicationId,
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          message: "Application not found",
        },
        {
          status: 404,
        }
      );
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    await prisma.application.delete({
      where: {
        id: applicationId,
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