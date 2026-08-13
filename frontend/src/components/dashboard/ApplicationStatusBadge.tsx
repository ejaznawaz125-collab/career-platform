import type { ApplicationStatus } from "@prisma/client";

type Props = {
  status: ApplicationStatus;
};

const statusStyles: Record<
  ApplicationStatus,
  {
    label: string;
    className: string;
  }
> = {
  APPLIED: {
    label: "Applied",
    className:
      "bg-blue-100 text-blue-700",
  },

  REVIEWING: {
    label: "Under Review",
    className:
      "bg-yellow-100 text-yellow-700",
  },

  SHORTLISTED: {
    label: "Shortlisted",
    className:
      "bg-green-100 text-green-700",
  },

  INTERVIEW: {
    label: "Interview",
    className:
      "bg-purple-100 text-purple-700",
  },

  OFFERED: {
    label: "Offered",
    className: "bg-cyan-100 text-cyan-700",
  },

  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-700",
  },

  HIRED: {
    label: "Hired",
    className:
      "bg-emerald-100 text-emerald-700",
  },

  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-slate-100 text-slate-700",
  },
};

export default function ApplicationStatusBadge({
  status,
}: Props) {
  const current = statusStyles[status];

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}
