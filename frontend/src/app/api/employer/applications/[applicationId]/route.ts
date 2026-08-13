import { ApplicationStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (session.user.role !== UserRole.EMPLOYER) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = updateStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Select a valid application status." },
      { status: 400 },
    );
  }

  const { applicationId } = await params;
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: { company: { ownerId: session.user.id } },
    },
    select: { id: true },
  });

  if (!application) {
    return NextResponse.json({ message: "Application not found." }, { status: 404 });
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { status: parsed.data.status },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ success: true, application: updated });
}
