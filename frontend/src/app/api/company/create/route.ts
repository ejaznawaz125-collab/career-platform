import { NextResponse } from "next/server";
import { CompanyStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { companyProfileSchema, nullable } from "@/lib/company-profile";

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

    const parsed = companyProfileSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid company details.",
        },
        {
          status: 400,
        }
      );
    }

    const { name, companySize } = parsed.data;

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
        website: nullable(parsed.data.website),
        industry: nullable(parsed.data.industry),
        country: nullable(parsed.data.country),
        city: nullable(parsed.data.city),
        description: nullable(parsed.data.description),
        tagline: nullable(parsed.data.tagline),
        email: nullable(parsed.data.email),
        phone: nullable(parsed.data.phone),
        address: nullable(parsed.data.address),
        companySize,
        status: CompanyStatus.ACTIVE,
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
