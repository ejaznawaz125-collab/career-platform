import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { slug } = await params;
    const normalizedSlug = slug.trim().toLowerCase();

    if (!normalizedSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    const candidate =
      await prisma.candidateProfile.findFirst({
        where: {
          slug: {
            equals: normalizedSlug,
            mode: "insensitive",
          },
          isPublic: true,
          user: {
            is: {
              status: "ACTIVE",
            },
          },
        },
        select: {
          id: true,
          slug: true,
          headline: true,
          summary: true,
          currentJobTitle: true,
          experienceLevel: true,
          totalExperience: true,
          highestEducation: true,
          preferredJobType: true,
          preferredWorkMode: true,
          preferredCountry: true,
          preferredCity: true,
          availableForWork: true,
          availableImmediately: true,
          openToRemote: true,
          profileViews: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              image: true,
              country: true,
              city: true,
              linkedinUrl: true,
              githubUrl: true,
              portfolioUrl: true,
            },
          },

          skills: {
            orderBy: [
              {
                featured: "desc",
              },
              {
                name: "asc",
              },
            ],
          },

          educations: {
            orderBy: [
              {
                currentlyStudying: "desc",
              },
              {
                endYear: "desc",
              },
              {
                startYear: "desc",
              },
            ],
          },

          experiences: {
            orderBy: [
              {
                currentlyWorking: "desc",
              },
              {
                startDate: "desc",
              },
            ],
          },

          languages: {
            orderBy: [
              {
                isNative: "desc",
              },
              {
                language: "asc",
              },
            ],
          },

          portfolioProjects: {
            orderBy: [
              {
                featured: "desc",
              },
              {
                createdAt: "desc",
              },
            ],
          },

          resumes: {
            where: {
              isPublic: true,
            },
            orderBy: [
              {
                isDefault: "desc",
              },
              {
                createdAt: "desc",
              },
            ],
            select: {
              id: true,
              title: true,
              fileUrl: true,
              originalName: true,
              mimeType: true,
              fileSize: true,
              version: true,
              atsScore: true,
              isDefault: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate profile not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.candidateProfile.update({
      where: {
        id: candidate.id,
      },
      data: {
        profileViews: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      candidate: {
        ...candidate,
        profileViews: candidate.profileViews + 1,
      },
    });
  } catch (error) {
    console.error(
      "PUBLIC_CANDIDATE_API_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load candidate profile.",
      },
      {
        status: 500,
      },
    );
  }
}