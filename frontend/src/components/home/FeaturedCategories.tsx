import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import CategoryCard from "./CategoryCard";

export default function FeaturedCategories() {

  const categories = [
    {
      title: "Warehouse",
      jobs: "2,450",
    },
    {
      title: "Logistics",
      jobs: "1,870",
    },
    {
      title: "Information Technology",
      jobs: "3,920",
    },
    {
      title: "Engineering",
      jobs: "2,180",
    },
    {
      title: "Healthcare",
      jobs: "1,640",
    },
    {
      title: "Finance",
      jobs: "980",
    },
    {
      title: "Manufacturing",
      jobs: "1,250",
    },
    {
      title: "Hospitality",
      jobs: "760",
    },
  ];

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
              key={category.title}
              title={category.title}
              jobs={category.jobs}
            />
          ))}

        </div>

      </Container>

    </section>
  );
}