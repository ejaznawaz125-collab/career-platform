import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        candidateProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      profile: user.candidateProfile,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const data = profileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const profile = await prisma.candidateProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        headline: data.headline,
        summary: data.summary,
        currentJobTitle: data.currentJobTitle,
        expectedSalary: data.expectedSalary,
        salaryCurrency: data.salaryCurrency,
        availableForWork: data.availableForWork,
      },
      create: {
        userId: user.id,
        headline: data.headline,
        summary: data.summary,
        currentJobTitle: data.currentJobTitle,
        expectedSalary: data.expectedSalary,
        salaryCurrency: data.salaryCurrency,
        availableForWork: data.availableForWork ?? true,
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        country: data.country,
        city: data.city,
        address: data.address,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Profile update failed.",
      },
      { status: 500 }
    );
  }
}