import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CompanyAbout from "@/components/companies/CompanyAbout";
import CompanyHero from "@/components/companies/CompanyHero";
import CompanyOpenJobs from "@/components/companies/CompanyOpenJobs";
import CompanyOverview from "@/components/companies/CompanyOverview";
import CompanySidebar from "@/components/companies/CompanySidebar";
import CompanyStats from "@/components/companies/CompanyStats";
import Header from "@/components/layout/Header";

import {
  getCompanyBySlug,
  getCompanyJobs,
} from "@/services/company.service";

type CompanyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getCompanyDescription(
  name: string,
  tagline: string | null,
  description: string | null,
): string {
  const value = tagline?.trim() || description?.trim();

  if (value) {
    return value.slice(0, 160);
  }

  return `Explore ${name}, learn about the company, and discover its latest open jobs.`;
}

export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return {
      title: "Company not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = getCompanyDescription(
    company.name,
    company.tagline,
    company.description,
  );

  const title = `${company.name} — Company Profile & Jobs`;

  return {
    title,
    description,
    alternates: {
      canonical: `/companies/${company.slug}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/companies/${company.slug}`,
      siteName: "Career Platform",
      images: company.coverImage
        ? [
            {
              url: company.coverImage,
              alt:
                company.coverImageAlt?.trim() ||
                `${company.name} company profile`,
            },
          ]
        : company.logo
          ? [
              {
                url: company.logo,
                alt: `${company.name} logo`,
              },
            ]
          : undefined,
    },
    twitter: {
      card: company.coverImage
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images:
        company.coverImage || company.logo
          ? [company.coverImage || company.logo || ""]
          : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CompanyPage({
  params,
}: CompanyPageProps) {
  const { slug } = await params;

  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const companyJobs = await getCompanyJobs(company.id, {
    
    limit: 6,
  });

  const location = [company.city, company.country]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.website || undefined,
    logo: company.logo || undefined,
    image: company.coverImage || company.logo || undefined,
    description:
      company.description || company.tagline || undefined,
    email: company.email || undefined,
    telephone: company.phone || undefined,
    foundingDate:
      company.foundedYear !== null
        ? String(company.foundedYear)
        : undefined,
    numberOfEmployees:
      company.employeeCount !== null
        ? {
            "@type": "QuantitativeValue",
            value: company.employeeCount,
          }
        : undefined,
    address:
      company.address ||
      company.city ||
      company.country
        ? {
            "@type": "PostalAddress",
            streetAddress: company.address || undefined,
            addressLocality: company.city || undefined,
            addressCountry: company.country || undefined,
          }
        : undefined,
    sameAs: [
      company.linkedinUrl,
      company.facebookUrl,
      company.instagramUrl,
      company.twitterUrl,
    ].filter((value): value is string => Boolean(value)),
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <CompanyHero company={company} />

        <div className="mt-6">
          <CompanyStats company={company} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0 space-y-8">
            <CompanyOverview company={company} />

            <CompanyAbout company={company} />

            <CompanyOpenJobs
              company={company}
              jobs={companyJobs.jobs}
              total={companyJobs.total}
            />
          </div>

          <CompanySidebar company={company} />
        </div>

        <p className="sr-only">
          {company.name}
          {company.industry
            ? ` operates in the ${company.industry} industry.`
            : "."}
          {location ? ` Located in ${location}.` : ""}
          {` ${companyJobs.total} published ${
            companyJobs.total === 1 ? "job is" : "jobs are"
          } currently available.`}
        </p>
      </div>
    </main>
  );
}