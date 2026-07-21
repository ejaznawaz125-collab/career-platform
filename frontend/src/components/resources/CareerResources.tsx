import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import ResourceCard from "./ResourceCard";

export default function CareerResources() {

  const resources = [
    {
      title: "CV Writing Guide",
      description:
        "Learn how to build an ATS-friendly CV that gets noticed by recruiters.",
    },
    {
      title: "Interview Preparation",
      description:
        "Practice common interview questions and improve your confidence.",
    },
    {
      title: "Career Growth",
      description:
        "Discover strategies to grow your career and increase your salary.",
    },
  ];

  return (
    <section className="py-24">

      <Container>

        <SectionTitle
          title="Career Resources"
          subtitle="Learn new skills and improve your chances of getting hired."
        />

        <div className="grid gap-8 md:grid-cols-3">

          {resources.map((item) => (
            <ResourceCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}

        </div>

      </Container>

    </section>
  );
}