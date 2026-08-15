import BrowseScenarioLibrary from "@/src/components/BrowseScenarioLibrary";

type Scenario = {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  estimatedTime: string;
};

const categories = [
  {
    slug: "git-foundations",
    name: "Git Foundations",
    description: "Learn the fundamentals of everyday Git.",
  },
  {
    slug: "branching-collaboration",
    name: "Branching & Collaboration",
    description: "Practice branches, merges, and collaboration.",
  },
  {
    slug: "history-recovery",
    name: "History & Recovery",
    description: "Understand Git history and recover from mistakes.",
  },
  {
    slug: "advanced-workflows",
    name: "Advanced Git Workflows",
    description: "Master powerful Git workflows.",
  },
];

export default async function BrowsePage() {
  const response = await fetch("http://localhost:5000/api/scenarios", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load scenarios");
  }

  const scenarios: Scenario[] = await response.json();

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
              className="rounded-md px-2.5 py-1.5 text-[10px] font-medium text-[#8b949e]"
            >
              Home
            </a>

            <a
              href="/browse"
              aria-label="Browse all scenarios"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#30363d] bg-[#161b22] text-sm text-[#8b949e]"
            >
              ☰
            </a>

          </div>

        </div>
      </nav>


      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Browse Git Scenarios
          </h1>

          <p className="mt-2 max-w-xl text-xs leading-5 text-[#8b949e] sm:text-sm sm:leading-6">
            Practice Git through hands-on scenarios, organized by workflow.
          </p>

        </div>
      </section>


      {/* =====================================================
          SCENARIO LIBRARY
      ====================================================== */}

      <BrowseScenarioLibrary
        scenarios={scenarios}
        categories={categories}
      />


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#30363d] px-5 py-7 text-center text-[10px] text-[#8b949e] sm:px-8 sm:py-8 sm:text-xs">
        Git Workflow Simulator · Open Source Git Practice
      </footer>

    </main>
  );
}