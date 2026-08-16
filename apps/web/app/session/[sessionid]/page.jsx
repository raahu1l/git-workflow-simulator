import Terminal from "@/src/components/Terminal";

export default async function SessionPage({ params }) {
  const { sessionid } = await params;
  const sessionId = sessionid;

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#0d1117] text-[#f0f6fc]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="flex h-12 items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-4 sm:px-5">

        {/* Left side */}
        <div className="flex min-w-0 items-center gap-3">

          {/* Back button */}
          <a
            href="/browse"
            aria-label="Back to Browse All"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#30363d] bg-[#161b22] text-sm text-[#8b949e] transition hover:bg-[#21262d] hover:text-white"
          >
            ←
          </a>

          {/* Logo */}
          <a
            href="/"
            className="flex min-w-0 items-center gap-2"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#238636] text-[10px] font-bold">
              G
            </div>

            <span className="truncate text-xs font-semibold sm:text-sm">
              Git Workflow Simulator
            </span>
          </a>

        </div>


        {/* Desktop session ID */}
        <div className="hidden items-center gap-2 text-[10px] text-[#8b949e] sm:flex">
          <span>Session</span>

          <span className="text-[#30363d]">
            •
          </span>

          <span className="font-mono">
            {sessionId.slice(0, 8)}
          </span>
        </div>


        {/* Mobile Exit */}
        <a
          href="/browse"
          className="rounded-md px-2.5 py-1.5 text-[10px] text-[#8b949e] transition hover:bg-[#161b22] hover:text-white sm:hidden"
        >
          Exit
        </a>

      </header>


      {/* =====================================================
          DESKTOP / TABLET
      ====================================================== */}

      <div className="hidden h-[calc(100dvh-7rem)] min-h-0 sm:flex">

        {/* LEFT PANEL */}

        <aside className="flex w-[270px] shrink-0 flex-col border-r border-[#30363d] bg-[#0d1117] lg:w-[300px]">

          <div className="overflow-y-auto p-5">

            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#58a6ff]">
              Objective
            </p>

            <h1 className="mt-2 text-lg font-bold leading-6">
              Create Your First Commit
            </h1>

            <p className="mt-4 text-xs leading-5 text-[#8b949e]">
              Initialize a Git repository and create your first commit.
            </p>


            {/* TASKS */}

            <div className="mt-8">

              <h2 className="text-xs font-semibold uppercase tracking-wide text-white">
                Tasks
              </h2>

              <div className="mt-4 space-y-3">

                <Task>
                  Initialize a Git repository
                </Task>

                <Task>
                  Create a file
                </Task>

                <Task>
                  Stage the file
                </Task>

                <Task>
                  Create your first commit
                </Task>

              </div>

            </div>

          </div>

        </aside>


        {/* TERMINAL */}

        <section className="min-w-0 flex-1 p-4 lg:p-5">

          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#30363d] bg-[#0b0f14]">

            {/* Terminal Header */}

            <div className="flex h-10 shrink-0 items-center gap-3 border-b border-[#30363d] bg-[#161b22] px-3">

              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f85149]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#d29922]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#3fb950]" />
              </div>

              <span className="font-mono text-[10px] text-[#8b949e]">
                terminal
              </span>

            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <Terminal sessionId={sessionId} />
            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          MOBILE
      ====================================================== */}

      <div className="flex h-[calc(100dvh-7rem)] min-h-0 flex-col sm:hidden">

        {/* OBJECTIVE */}

        <section className="shrink-0 border-b border-[#30363d] px-4 py-3">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">
                Objective
              </p>

              <h1 className="mt-1 truncate text-sm font-bold">
                Create Your First Commit
              </h1>

            </div>

            <span className="shrink-0 rounded-full bg-[#21262d] px-2 py-1 text-[9px] text-[#8b949e]">
              0/4
            </span>

          </div>

          <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-[#8b949e]">
            Initialize a Git repository and create your first commit.
          </p>


          {/* Compact tasks */}

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">

            <Task compact>
              Initialize repository
            </Task>

            <Task compact>
              Create a file
            </Task>

            <Task compact>
              Stage the file
            </Task>

            <Task compact>
              Create commit
            </Task>

          </div>

        </section>


        {/* TERMINAL */}

        <section className="min-h-0 flex-1 p-3">

          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[#30363d] bg-[#0b0f14]">

            <div className="flex h-8 shrink-0 items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-2.5">

              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#f85149]" />
                <span className="h-2 w-2 rounded-full bg-[#d29922]" />
                <span className="h-2 w-2 rounded-full bg-[#3fb950]" />
              </div>

              <span className="font-mono text-[9px] text-[#8b949e]">
                Terminal
              </span>

            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <Terminal sessionId={sessionId} />
            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          ACTION BAR
      ====================================================== */}

      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-[#30363d] bg-[#0d1117] px-3 sm:px-5">

        {/* Hints */}

        <div className="flex items-center gap-2">

          <button
            type="button"
            className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-[10px] text-[#c9d1d9] transition hover:bg-[#21262d] sm:text-xs"
          >
            💡 Hint 1
          </button>

          <button
            type="button"
            className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-[10px] text-[#c9d1d9] transition hover:bg-[#21262d] sm:text-xs"
          >
            💡 Hint 2
          </button>

        </div>


        {/* Actions */}

        <div className="flex items-center gap-2">

          <button
            type="button"
            className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-[10px] font-medium text-[#c9d1d9] transition hover:bg-[#21262d] sm:text-xs"
          >
            Reset
          </button>

          <button
            type="button"
            className="rounded-md bg-[#238636] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#2ea043] sm:px-5 sm:text-xs"
          >
            ✓ Check Solution
          </button>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   TASK
========================================================= */

function Task({
  children,
  compact = false,
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        compact ? "rounded-md px-1 py-0.5" : ""
      }`}
    >

      <span
        className={`flex shrink-0 items-center justify-center rounded-full border border-[#8b949e] ${
          compact
            ? "h-3 w-3"
            : "h-5 w-5"
        }`}
      />

      <span
        className={`truncate text-[#c9d1d9] ${
          compact
            ? "text-[8px]"
            : "text-[11px]"
        }`}
      >
        {children}
      </span>

    </div>
  );
}