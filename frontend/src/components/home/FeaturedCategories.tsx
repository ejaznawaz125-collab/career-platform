import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import CategoryCard from "./CategoryCard";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function FeaturedCategories() {
  const categoriesWithPublishedJobCounts = await prisma.category.findMany({
    select: {
      name: true,
      slug: true,
      _count: { select: { jobs: { where: { status: JobStatus.PUBLISHED } } } },
    },
    orderBy: { name: "asc" },
  });

  const categories = categoriesWithPublishedJobCounts
    .sort((firstCategory, secondCategory) =>
      secondCategory._count.jobs - firstCategory._count.jobs
    )
    .slice(0, 8);

  return (
    <section className="py-24">

      <Container>

        <SectionTitle
          title="Featured Categories"
          subtitle="Explore opportunities across the world's fastest growing industries."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              title={category.name}
              slug={category.slug}
              jobs={String(category._count.jobs)}
            />
          ))}

        </div>

      </Container>

    </section>
  );
}
