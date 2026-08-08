import Terminal from "@/src/components/Terminal";

const scenario = {
  title: "Create Your First Commit",
  difficulty: "Beginner",
  estimatedTime: "5 min",
  description:
    "Initialize a Git repository and create your first commit.",
  objectives: [
    "Initialize a Git repository",
    "Create a file",
    "Stage the file",
    "Create your first commit",
  ],
};

export default async function SessionPage({ params }) {
  const { sessionId } = await params;

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-[#30363d]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a
            href="/"
            className="shrink-0 text-sm text-[#8b949e] transition hover:text-white"
          >
            ← Back
          </a>

          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {scenario.title}
            </h1>
          </div>

          <div className="flex shrink-0 gap-2">
            <span className="rounded-full bg-[#21262d] px-3 py-1 text-xs text-[#8b949e]">
              {scenario.difficulty}
            </span>

            <span className="hidden rounded-full bg-[#21262d] px-3 py-1 text-xs text-[#8b949e] sm:block">
              {scenario.estimatedTime}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto flex max-w-[1500px] flex-col lg:h-[calc(100vh-65px)] lg:flex-row">
        {/* Instructions */}
        <aside className="w-full shrink-0 border-b border-[#30363d] lg:w-[330px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="p-5 sm:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#58a6ff]">
              Objective
            </p>

            <h2 className="mb-3 text-xl font-bold">
              {scenario.title}
            </h2>

            <p className="mb-7 text-sm leading-6 text-[#8b949e]">
              {scenario.description}
            </p>

            <h3 className="mb-4 text-sm font-semibold">
              Tasks
            </h3>

            <div className="space-y-3">
              {scenario.objectives.map((objective) => (
                <div
                  key={objective}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#484f58] text-xs text-[#8b949e]">
                    ✓
                  </span>

                  <span className="leading-5 text-[#c9d1d9]">
                    {objective}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Terminal */}
        <section className="min-h-[500px] min-w-0 flex-1 p-3 sm:p-5 lg:min-h-0">
          <div className="h-full overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117]">
            <div className="flex h-10 items-center border-b border-[#30363d] bg-[#161b22] px-4">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f85149]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#d29922]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#3fb950]" />
              </div>

              <span className="ml-3 text-xs text-[#8b949e]">
                terminal
              </span>
            </div>

            <div className="h-[calc(100%-40px)] min-h-[460px] p-2">
              <Terminal sessionId={sessionId} />
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-[#30363d] bg-[#0d1117]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {/* Hints */}
          <div className="flex gap-2">
            <button
              className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm text-[#c9d1d9] transition hover:border-[#8b949e]"
            >
              💡 Hint 1
            </button>

            <button
              className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm text-[#c9d1d9] transition hover:border-[#8b949e]"
            >
              💡 Hint 2
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm font-medium text-[#c9d1d9] transition hover:border-[#8b949e] sm:flex-none"
            >
              Reset
            </button>

            <button
              className="flex-1 rounded-md bg-[#238636] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2ea043] sm:flex-none"
            >
              Check Solution
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}