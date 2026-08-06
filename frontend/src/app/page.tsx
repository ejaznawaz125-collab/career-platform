import FeaturedCategories from "@/components/home/FeaturedCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import StatsSection from "@/components/stats/StatsSection";
import Footer from "@/components/footer/Footer";
import TopCompanies from "@/components/company/TopCompanies";
import CareerResources from "@/components/resources/CareerResources";
import FeaturedJobs from "@/components/home/FeaturedJobs";
import JobSearch from "@/components/home/JobSearch";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
export const dynamic = "force-dynamic";
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <JobSearch />
      <FeaturedJobs />
      <StatsSection />
      <WhyChooseUs />
      <FeaturedCategories />
      <TopCompanies />
      <CareerResources />
      <Footer />
    </main>
  );
}