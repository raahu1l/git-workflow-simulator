import ScenarioCard from "@/src/components/ScenarioCard";

type Scenario = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  estimatedTime: string;
  category?: string;
};

const categories = [
  {
    slug: "foundations",
    name: "Git Foundations",
    description: "Learn the fundamentals of everyday Git.",
    icon: "⌘",
  },
  {
    slug: "branching",
    name: "Branching & Collaboration",
    description: "Practice branches, merges, and collaboration.",
    icon: "⑂",
  },
  {
    slug: "history",
    name: "History & Recovery",
    description: "Understand history and recover from mistakes.",
    icon: "↶",
  },
  {
    slug: "advanced",
    name: "Advanced Workflows",
    description: "Master powerful Git workflows.",
    icon: "◆",
  },
];

export default async function Home() {
  const response = await fetch("http://localhost:5000/api/scenarios", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load scenarios");
  }

  const scenarios: Scenario[] = await response.json();

  const featured = scenarios.slice(0, 3);
  const recentlyAdded = scenarios.slice(-3).reverse();

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-[#30363d]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

          <a
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#238636] text-sm font-bold">
              G
            </div>

            <span className="text-sm font-semibold sm:text-base">
              Git Workflow Simulator
            </span>
          </a>

          {/* Desktop / Tablet */}
          <a
            href="/browse"
            className="hidden rounded-md px-3 py-2 text-sm text-[#8b949e] transition hover:bg-[#161b22] hover:text-white sm:block"
          >
            Browse All
          </a>

          {/* Mobile */}
          <a
            href="/browse"
            aria-label="Browse all scenarios"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#30363d] text-[#8b949e] transition hover:bg-[#161b22] hover:text-white sm:hidden"
          >
            ☰
          </a>

        </div>
      </nav>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-28">

          {/* Mobile */}
          <div className="block sm:hidden">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#58a6ff]">
              Interactive Git Practice
            </p>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight">
              Learn Git by doing.
            </h1>

            <p className="mt-5 text-sm leading-6 text-[#8b949e]">
              Practice real Git workflows inside isolated terminal
              environments.
            </p>
          </div>


          {/* Tablet */}
          <div className="hidden max-w-3xl sm:block lg:hidden">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#58a6ff]">
              Interactive Git Practice
            </p>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight">
              Learn Git by actually using it.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#8b949e]">
              Practice real Git workflows in isolated terminal
              environments. Experiment, make mistakes, and learn by doing.
            </p>
          </div>


          {/* Desktop */}
          <div className="hidden max-w-4xl lg:block">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#58a6ff]">
              Interactive Git Practice
            </p>

            <h1 className="text-6xl font-bold leading-[1.05] tracking-tight">
              Learn Git by actually using it.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#8b949e]">
              Practice real Git workflows inside isolated terminal
              environments. Experiment, make mistakes, and build confidence
              through hands-on practice.
            </p>
          </div>

        </div>
      </section>


      {/* =====================================================
          MOBILE HOME
      ====================================================== */}

      <div className="block sm:hidden">

        {/* Featured */}
        {featured.length > 0 && (
          <section className="border-b border-[#30363d] py-10">

            <div className="px-5">
              <SectionHeading
                title="Featured"
                description="A good place to start."
              />
            </div>

            <div className="flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featured.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  compact
                />
              ))}
            </div>

          </section>
        )}


        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <section className="border-b border-[#30363d] py-10">

            <div className="px-5">
              <SectionHeading
                title="Recently Added"
                description="New scenarios to try."
              />
            </div>

            <div className="flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentlyAdded.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  compact
                />
              ))}
            </div>

          </section>
        )}


        {/* Explore Git */}
        <section className="px-5 py-10">

          <SectionHeading
            title="Explore Git"
            description="Choose a topic to start practicing."
          />

          <div className="overflow-hidden rounded-xl border border-[#30363d]">

            {categories.map((category, index) => (
              <a
                key={category.slug}
                href={`/browse/${category.slug}`}
                className={`flex items-center gap-4 bg-[#161b22] px-4 py-4 transition hover:bg-[#21262d] ${
                  index !== categories.length - 1
                    ? "border-b border-[#30363d]"
                    : ""
                }`}
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#30363d] bg-[#0d1117] text-sm text-[#58a6ff]">
                  {category.icon}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold">
                    {category.name}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#8b949e]">
                    {category.description}
                  </p>

                </div>

                <span className="text-[#8b949e]">
                  →
                </span>

              </a>
            ))}

          </div>

        </section>


        {/* Mobile Footer */}
        <footer className="border-t border-[#30363d] px-5 py-8 text-center text-xs text-[#8b949e]">
          Git Workflow Simulator · Open Source Git Practice
        </footer>

      </div>


      {/* =====================================================
          TABLET HOME
      ====================================================== */}

      <div className="hidden sm:block lg:hidden">

        {/* Featured */}
        <section className="mx-auto max-w-5xl px-8 py-12">

          <SectionHeading
            title="Featured"
            description="Start with these recommended scenarios."
          />

          <div className="grid grid-cols-2 gap-5">
            {featured.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
              />
            ))}
          </div>

        </section>


        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <section className="border-t border-[#30363d]">

            <div className="mx-auto max-w-5xl px-8 py-12">

              <SectionHeading
                title="Recently Added"
                description="The latest scenarios added to the library."
              />

              <div className="grid grid-cols-2 gap-5">
                {recentlyAdded.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                  />
                ))}
              </div>

            </div>

          </section>
        )}


        {/* Categories */}
        <section className="border-t border-[#30363d]">

          <div className="mx-auto max-w-5xl px-8 py-12">

            <SectionHeading
              title="Explore Git"
              description="Choose an area and start practicing."
            />

            <div className="grid grid-cols-2 gap-5">

              {categories.map((category) => (
                <a
                  key={category.slug}
                  href={`/browse/${category.slug}`}
                  className="group rounded-xl border border-[#30363d] bg-[#161b22] p-5 transition hover:border-[#58a6ff]"
                >

                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#30363d] bg-[#0d1117] text-[#58a6ff]">
                    {category.icon}
                  </div>

                  <h3 className="text-base font-semibold">
                    {category.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#8b949e]">
                    {category.description}
                  </p>

                  <span className="mt-5 inline-block text-sm text-[#8b949e] transition group-hover:translate-x-1 group-hover:text-white">
                    Explore →
                  </span>

                </a>
              ))}

            </div>

          </div>

        </section>


        <footer className="border-t border-[#30363d] px-8 py-8 text-center text-xs text-[#8b949e]">
          Git Workflow Simulator · Open Source Git Practice
        </footer>

      </div>


      {/* =====================================================
          DESKTOP HOME
      ====================================================== */}

      <div className="hidden lg:block">

        {/* Featured */}
        <section className="mx-auto max-w-7xl px-8 py-16">

          <SectionHeading
            title="Featured"
            description="Start with these recommended scenarios."
          />

          <div className="grid grid-cols-3 gap-6">
            {featured.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
              />
            ))}
          </div>

        </section>


        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <section className="border-t border-[#30363d]">

            <div className="mx-auto max-w-7xl px-8 py-16">

              <SectionHeading
                title="Recently Added"
                description="The latest scenarios added to the library."
              />

              <div className="grid grid-cols-3 gap-6">
                {recentlyAdded.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                  />
                ))}
              </div>

            </div>

          </section>
        )}


        {/* Categories */}
        <section className="border-t border-[#30363d]">

          <div className="mx-auto max-w-7xl px-8 py-16">

            <SectionHeading
              title="Explore Git"
              description="Choose an area and start practicing."
            />

            <div className="grid grid-cols-2 gap-6">

              {categories.map((category) => (
                <a
                  key={category.slug}
                  href={`/browse/${category.slug}`}
                  className="group rounded-2xl border border-[#30363d] bg-[#161b22] p-7 transition hover:border-[#58a6ff] hover:bg-[#1c2128]"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#30363d] bg-[#0d1117] text-[#58a6ff]">
                      {category.icon}
                    </div>

                    <span className="text-lg text-[#8b949e] transition group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>

                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {category.name}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#8b949e]">
                    {category.description}
                  </p>

                </a>
              ))}

            </div>

          </div>

        </section>


        {/* Desktop Footer */}
        <footer className="border-t border-[#30363d]">

          <div className="mx-auto max-w-7xl px-8 py-10 text-center text-sm text-[#8b949e]">
            Git Workflow Simulator · Open Source Git Practice
          </div>

        </footer>

      </div>

    </main>
  );
}


function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">

      <h2 className="text-xl font-bold sm:text-2xl">
        {title}
      </h2>

      <p className="mt-1 text-sm text-[#8b949e]">
        {description}
      </p>

    </div>
  );
}