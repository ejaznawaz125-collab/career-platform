import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { companyProfileSchema, nullable } from "@/lib/company-profile";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  if (session.user.role !== UserRole.EMPLOYER) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  const parsed = companyProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid company details." }, { status: 400 });

  const company = await prisma.company.findFirst({ where: { ownerId: session.user.id }, select: { id: true } });
  if (!company) return NextResponse.json({ message: "Company not found." }, { status: 404 });

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: {
      name: parsed.data.name,
      tagline: nullable(parsed.data.tagline),
      description: nullable(parsed.data.description),
      website: nullable(parsed.data.website),
      email: nullable(parsed.data.email),
      phone: nullable(parsed.data.phone),
      industry: nullable(parsed.data.industry),
      companySize: parsed.data.companySize,
      country: nullable(parsed.data.country),
      city: nullable(parsed.data.city),
      address: nullable(parsed.data.address),
    },
    select: { id: true, slug: true, updatedAt: true },
  });

  return NextResponse.json({ success: true, company: updated });
}
