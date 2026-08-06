import Link from "next/link";

import PremiumCard from "@/components/ui/PremiumCard";
import SectionTitle from "@/components/ui/SectionTitle";

import type { PublicCompany } from "@/services/company.service";

type CompanySidebarProps = {
  company: PublicCompany;
};

type CompanyLink = {
  label: string;
  href: string;
};

function normalizeExternalUrl(value: string): string {
  const url = value.trim();

  if (
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }

  return `https://${url}`;
}

function getCompanyLinks(
  company: PublicCompany,
): CompanyLink[] {
  const links: Array<CompanyLink | null> = [
    company.website
      ? {
          label: "Company website",
          href: normalizeExternalUrl(company.website),
        }
      : null,
    company.linkedinUrl
      ? {
          label: "LinkedIn",
          href: normalizeExternalUrl(company.linkedinUrl),
        }
      : null,
    company.facebookUrl
      ? {
          label: "Facebook",
          href: normalizeExternalUrl(company.facebookUrl),
        }
      : null,
    company.instagramUrl
      ? {
          label: "Instagram",
          href: normalizeExternalUrl(company.instagramUrl),
        }
      : null,
    company.twitterUrl
      ? {
          label: "X / Twitter",
          href: normalizeExternalUrl(company.twitterUrl),
        }
      : null,
  ];

  return links.filter(
    (link): link is CompanyLink => link !== null,
  );
}

export default function CompanySidebar({
  company,
}: CompanySidebarProps) {
  const companyLinks = getCompanyLinks(company);

  return (
    <aside className="space-y-6">
      {company.website ? (
        <a
          href={normalizeExternalUrl(company.website)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Visit company website
        </a>
      ) : null}

      <PremiumCard>
        <SectionTitle title="Contact information" />

        <div className="my-5 h-px bg-slate-200" />

        <dl className="space-y-5">
          {company.email ? (
            <div>
              <dt className="text-sm font-medium text-slate-500">
                Email
              </dt>

              <dd className="mt-1 break-all text-sm font-semibold text-slate-900">
                <Link
                  href={`mailto:${company.email}`}
                  className="transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  {company.email}
                </Link>
              </dd>
            </div>
          ) : null}

          {company.phone ? (
            <div>
              <dt className="text-sm font-medium text-slate-500">
                Phone
              </dt>

              <dd className="mt-1 text-sm font-semibold text-slate-900">
                <Link
                  href={`tel:${company.phone}`}
                  className="transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  {company.phone}
                </Link>
              </dd>
            </div>
          ) : null}

          {company.address ? (
            <div>
              <dt className="text-sm font-medium text-slate-500">
                Address
              </dt>

              <dd className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-slate-900">
                {company.address}
              </dd>
            </div>
          ) : null}

          {!company.email &&
          !company.phone &&
          !company.address ? (
            <p className="text-sm leading-6 text-slate-600">
              Contact information is not publicly available.
            </p>
          ) : null}
        </dl>
      </PremiumCard>

      {companyLinks.length > 0 ? (
        <PremiumCard>
          <SectionTitle title="Company links" />

          <div className="my-5 h-px bg-slate-200" />

          <ul className="space-y-3">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </PremiumCard>
      ) : null}
    </aside>
  );
}