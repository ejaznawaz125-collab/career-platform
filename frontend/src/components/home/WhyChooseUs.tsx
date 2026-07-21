import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import FeatureCard from "./FeatureCard";

export default function WhyChooseUs() {
  const features = [
    {
      title: "AI Powered Search",
      description:
        "Find the most relevant jobs using intelligent search technology.",
    },
    {
      title: "Verified Companies",
      description:
        "Apply confidently to trusted employers from around the world.",
    },
    {
      title: "Career Growth",
      description:
        "Learn new skills and prepare for interviews with expert resources.",
    },
    {
      title: "Global Opportunities",
      description:
        "Explore career opportunities across Asia, the Middle East and beyond.",
    },
  ];

  return (
    <section className="bg-slate-50 py-24">

      <Container>

        <SectionTitle
          title="Why Choose Us"
          subtitle="Everything you need to build a successful career in one place."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {features.map((item) => (
            <FeatureCard
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