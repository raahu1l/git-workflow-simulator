import ScenarioCard from "@/src/components/ScenarioCard";

type Scenario = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  estimatedTime: string;
  category: string;
  createdAt: string;
};

const categories = [
  {
    slug: "git-foundations",
    name: "Git Foundations",
    description: "Learn the fundamentals of everyday Git.",
    icon: "⌘",
  },
  {
    slug: "branching-collaboration",
    name: "Branching & Collaboration",
    description: "Practice branches, merges, and collaboration.",
    icon: "⑂",
  },
  {
    slug: "history-recovery",
    name: "History & Recovery",
    description: "Understand Git history and recover from mistakes.",
    icon: "↶",
  },
  {
    slug: "advanced-workflows",
    name: "Advanced Git Workflows",
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
  const recentlyAdded = [...scenarios]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )
  .slice(0, 2);

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-[#30363d]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <a
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#238636] text-xs font-bold">
              G
            </div>

            <span className="text-xs font-semibold sm:text-sm">
              Git Workflow Simulator
            </span>
          </a>

          {/* Desktop / Tablet */}
          <a
            href="/browse"
            className="hidden rounded-md px-3 py-2 text-xs font-medium text-[#8b949e] transition hover:bg-[#161b22] hover:text-white sm:block"
          >
            Browse All
          </a>

          {/* Mobile */}
          <a
            href="/browse"
            aria-label="Browse all scenarios"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#30363d] text-sm text-[#8b949e] transition hover:bg-[#161b22] hover:text-white sm:hidden"
          >
            ☰
          </a>

        </div>
      </nav>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-5 py-12 text-center sm:px-8 sm:py-16 lg:px-8 lg:py-20">

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58a6ff] sm:text-xs">
            Interactive Git Practice
          </p>

          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Learn Git by doing.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-xs leading-5 text-[#8b949e] sm:text-sm sm:leading-6">
            Practice real Git workflows inside isolated terminal
            environments. Experiment, make mistakes, and build confidence
            through hands-on practice.
          </p>

        </div>
      </section>


      {/* =====================================================
          MOBILE
      ====================================================== */}

      <div className="block sm:hidden">

        {/* Featured */}
        {featured.length > 0 && (
          <section className="border-b border-[#30363d] py-8">

            <div className="px-5">
              <SectionHeading
                title="Featured"
                description="Start with these recommended scenarios."
              />
            </div>

            <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <section className="border-b border-[#30363d] py-8">

            <div className="px-5">
              <SectionHeading
                title="Recently Added"
                description="Explore the latest scenarios."
              />
            </div>

            <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        <section className="px-5 py-8">

          <SectionHeading
            title="Explore Git"
            description="Choose a topic to start practicing."
          />

          <div className="overflow-hidden rounded-xl border border-[#30363d]">

            {categories.map((category, index) => (
              <a
                key={category.slug}
                href={`/browse/${category.slug}`}
                className={`flex items-center gap-3 bg-[#161b22] px-3.5 py-3.5 transition hover:bg-[#21262d] ${
                  index !== categories.length - 1
                    ? "border-b border-[#30363d]"
                    : ""
                }`}
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#30363d] bg-[#0d1117] text-xs text-[#58a6ff]">
                  {category.icon}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-xs font-semibold">
                    {category.name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] leading-4 text-[#8b949e]">
                    {category.description}
                  </p>

                </div>

                <span className="text-sm text-[#8b949e]">
                  →
                </span>

              </a>
            ))}

          </div>

        </section>


        {/* Mobile Footer */}
        <footer className="border-t border-[#30363d] px-5 py-6 text-center text-[10px] text-[#8b949e]">
          Git Workflow Simulator · Open Source Git Practice
        </footer>

      </div>


      {/* =====================================================
          TABLET
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
                description="Explore the latest scenarios."
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


        {/* Explore Git */}
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
                  className="group rounded-xl border border-[#30363d] bg-[#161b22] p-5 transition hover:border-[#58a6ff] hover:bg-[#1c2128]"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#30363d] bg-[#0d1117] text-[#58a6ff]">
                      {category.icon}
                    </div>

                    <span className="text-base text-[#8b949e] transition group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>

                  </div>

                  <h3 className="mt-5 text-sm font-semibold">
                    {category.name}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-[#8b949e]">
                    {category.description}
                  </p>

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
          DESKTOP
      ====================================================== */}

      <div className="hidden lg:block">

        {/* Featured */}
        <section className="mx-auto max-w-7xl px-8 py-12">

          <SectionHeading
            title="Featured"
            description="Start with these recommended scenarios."
          />

          <div className="grid grid-cols-3 gap-4">
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

            <div className="mx-auto max-w-7xl px-8 py-12">

              <SectionHeading
                title="Recently Added"
                description="Explore the latest scenarios added to the library."
              />

              <div className="grid grid-cols-3 gap-4">
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


        {/* Explore Git */}
        <section className="border-t border-[#30363d]">

          <div className="mx-auto max-w-7xl px-8 py-12">

            <SectionHeading
              title="Explore Git"
              description="Choose an area and start practicing."
            />

            <div className="grid grid-cols-2 gap-4">

              {categories.map((category) => (
                <a
                  key={category.slug}
                  href={`/browse/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] p-5 transition hover:border-[#58a6ff] hover:bg-[#1c2128]"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#30363d] bg-[#0d1117] text-[#58a6ff]">
                      {category.icon}
                    </div>

                    <span className="text-lg text-[#8b949e] transition group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>

                  </div>

                  <h3 className="mt-5 text-base font-semibold">
                    {category.name}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-[#8b949e]">
                    {category.description}
                  </p>

                </a>
              ))}

            </div>

          </div>

        </section>


        {/* Desktop Footer */}
        <footer className="border-t border-[#30363d]">

          <div className="mx-auto max-w-7xl px-8 py-7 text-center text-xs text-[#8b949e]">
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
    <div className="mb-5">

      <h2 className="text-lg font-bold sm:text-xl">
        {title}
      </h2>

      <p className="mt-1 text-xs text-[#8b949e] sm:text-sm">
        {description}
      </p>

    </div>
  );
}