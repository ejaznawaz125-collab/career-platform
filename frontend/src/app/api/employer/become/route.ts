import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (user.role === "EMPLOYER") {
      return NextResponse.json({
        success: true,
        role: "EMPLOYER",
      });
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        role: "EMPLOYER",
      },
    });

    return NextResponse.json({
      success: true,
      role: "EMPLOYER",
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
