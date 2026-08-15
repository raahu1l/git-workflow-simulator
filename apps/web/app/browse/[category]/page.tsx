import ScenarioCard from "@/src/components/ScenarioCard";

type Scenario = {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  estimatedTime: string;
};

const categories = {
  "git-foundations": {
    name: "Git Foundations",
    description: "Learn the fundamentals of everyday Git.",
  },
  "branching-collaboration": {
    name: "Branching & Collaboration",
    description: "Practice branches, merges, and collaboration.",
  },
  "history-recovery": {
    name: "History & Recovery",
    description: "Understand Git history and recover from mistakes.",
  },
  "advanced-workflows": {
    name: "Advanced Git Workflows",
    description: "Master powerful Git workflows.",
  },
};

type CategorySlug = keyof typeof categories;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const categoryData = categories[category as CategorySlug];

  if (!categoryData) {
    return (
      <main className="min-h-screen bg-[#0d1117] text-white">

        {/* Navbar */}
        <nav className="border-b border-[#30363d]">
          <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

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

          </div>
        </nav>

        {/* Not Found */}
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">

          <h1 className="text-2xl font-bold">
            Category not found
          </h1>

          <p className="mt-2 text-sm text-[#8b949e]">
            The category you're looking for doesn't exist.
          </p>

          <a
            href="/browse"
            className="mt-6 inline-block text-sm text-[#58a6ff] hover:underline"
          >
            Browse All
          </a>

        </div>
      </main>
    );
  }

  const response = await fetch(
    "http://localhost:5000/api/scenarios",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load scenarios");
  }

  const scenarios: Scenario[] = await response.json();

  const categoryScenarios = scenarios.filter(
    (scenario) => scenario.category === category
  );

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-[#30363d]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo → Home */}
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

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 sm:flex">

            <a
              href="/"
              className="rounded-md px-3 py-2 text-xs font-medium text-[#8b949e] transition hover:bg-[#161b22] hover:text-white"
            >
              Home
            </a>

            <a
              href="/browse"
              className="rounded-md bg-[#161b22] px-3 py-2 text-xs font-medium text-white"
            >
              Browse All
            </a>

          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 sm:hidden">

            <a
              href="/"
              className="text-[10px] font-medium text-[#8b949e]"
            >
              Home
            </a>

            <a
              href="/browse"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#30363d] bg-[#161b22] text-sm text-[#8b949e]"
              aria-label="Browse all scenarios"
            >
              ☰
            </a>

          </div>

        </div>
      </nav>


      {/* =====================================================
          CATEGORY HEADER
      ====================================================== */}

      <section className="border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">

          {/* Category label */}
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#58a6ff] sm:text-[10px]">
            {categoryData.name}
          </p>

          {/* Title */}
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {categoryData.name}
          </h1>

          {/* Description */}
          <p className="mt-2 max-w-xl text-xs leading-5 text-[#8b949e] sm:text-sm sm:leading-6">
            {categoryData.description}
          </p>

          {/* Count */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#21262d] px-2.5 py-1 text-[10px] text-[#8b949e]">
            <span>▣</span>

            <span>
              {categoryScenarios.length}{" "}
              {categoryScenarios.length === 1
                ? "scenario"
                : "scenarios"}
            </span>
          </div>

        </div>
      </section>


      {/* =====================================================
          SCENARIOS
      ====================================================== */}

      <section>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">

          {categoryScenarios.length > 0 ? (
            <>
              {/* Desktop */}
              <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">

                {categoryScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                  />
                ))}

              </div>

              {/* Tablet */}
              <div className="hidden sm:grid lg:hidden sm:grid-cols-2 sm:gap-4">

                {categoryScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                  />
                ))}

              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-2 sm:hidden">

                {categoryScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    compact
                  />
                ))}

              </div>
            </>
          ) : (
            <EmptyCategory />
          )}

        </div>
      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#30363d] px-5 py-7 text-center text-[10px] text-[#8b949e] sm:px-8 sm:py-8 sm:text-xs">
        Git Workflow Simulator · Open Source Git Practice
      </footer>

    </main>
  );
}


/* =========================================================
   EMPTY CATEGORY
========================================================= */

function EmptyCategory() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-dashed border-[#30363d] bg-[#161b22] px-5 py-10 text-center">

      <h2 className="text-base font-semibold text-white">
        No scenarios yet
      </h2>

      <p className="mt-2 text-xs leading-5 text-[#8b949e]">
        This category doesn't have any scenarios yet.
        Check back later.
      </p>

      <a
        href="/browse"
        className="mt-5 inline-block text-xs font-medium text-[#58a6ff] hover:underline"
      >
        Browse All
      </a>

    </div>
  );
}