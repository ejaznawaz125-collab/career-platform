import HeroSearch from "./HeroSearch";
import Button from "@/components/common/Button";
import Container from "@/components/common/Container";

export default function Hero() {
  return (
    <section className="bg-slate-50 py-24">

      <Container>

        <div className="mx-auto max-w-4xl text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            World's Smartest AI Career Platform
          </p>

          <h1 className="mb-6 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Find Better Jobs.
            <br />
            Build A Better Career.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-slate-600">
            Discover verified jobs, trusted companies and AI-powered career
            tools designed to help you grow faster.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">

            <Button text="Explore Jobs" />

            <button className="rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-100">
              Upload Resume
            </button>
            <HeroSearch />

          </div>

        </div>

      </Container>

    </section>
  );
}