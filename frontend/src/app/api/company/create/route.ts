import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanySize } from "@prisma/client";

function generateSlug(name: string) {
  return name
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
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
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

    if (user.role !== "EMPLOYER") {
      return NextResponse.json(
        {
          message: "Only employers can create a company.",
        },
        {
          status: 403,
        }
      );
    }

    const existingCompany = await prisma.company.findFirst({
      where: {
        ownerId: user.id,
      },
    });

    if (existingCompany) {
      return NextResponse.json(
        {
          message: "You already have a company.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const {
      name,
      website,
      industry,
      country,
      city,
      description,
      companySize,
    } = body;

    if (!name || !companySize) {
      return NextResponse.json(
        {
          message: "Company name and company size are required.",
        },
        {
          status: 400,
        }
      );
    }

    let slug = generateSlug(name);

    while (
      await prisma.company.findUnique({
        where: {
          slug,
        },
      })
    ) {
      slug = `${generateSlug(name)}-${Math.floor(
        Math.random() * 100000
      )}`;
    }

    const company = await prisma.company.create({
      data: {
        ownerId: user.id,
        name,
        slug,
        website: website || null,
        industry: industry || null,
        country: country || null,
        city: city || null,
        description: description || null,
        companySize: companySize as CompanySize,
      },
    });

    return NextResponse.json({
      success: true,
      company,
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