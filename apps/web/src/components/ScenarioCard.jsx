"use client";

import { useRouter } from "next/navigation";

const categoryNames = {
  "git-foundations": "Git Foundations",
  "branching-collaboration": "Branching & Collaboration",
  "history-recovery": "History & Recovery",
  "advanced-workflows": "Advanced Git Workflows",
};

export default function ScenarioCard({ scenario, compact = false }) {
  const router = useRouter();

  const startScenario = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scenarios/${scenario.id}/start`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start scenario");
      }

      const data = await response.json();

      router.push(`/session/${data.sessionId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to start scenario.");
    }
  };

  const category =
    categoryNames[scenario.category] || scenario.category;

  /* =====================================================
     MOBILE COMPACT CARD
  ====================================================== */

  if (compact) {
    return (
      <article className="w-[270px] shrink-0 rounded-xl border border-[#30363d] bg-[#161b22] p-4">
        <div className="flex min-h-[175px] flex-col">
          <div>
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white">
              {scenario.title}
            </h3>

            <div className="mt-3 flex items-center gap-2">
              <span className="max-w-[190px] truncate rounded-full bg-[#21262d] px-2.5 py-1 text-[11px] text-[#8b949e]">
                {category}
              </span>

              <span className="shrink-0 text-xs text-[#8b949e]">
                {scenario.estimatedTime}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#8b949e]">
              {scenario.description}
            </p>
          </div>

          <button
            type="button"
            onClick={startScenario}
            className="mt-auto flex w-full items-center justify-center rounded-md bg-[#238636] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2ea043] active:bg-[#2ea043]"
          >
            Start Scenario →
          </button>
        </div>
      </article>
    );
  }

  /* =====================================================
     TABLET / DESKTOP CARD
  ====================================================== */

  return (
    <article className="group flex min-h-[220px] flex-col justify-between rounded-xl border border-[#30363d] bg-[#161b22] p-5 transition hover:border-[#58a6ff]">
      <div>
        <h3 className="text-lg font-semibold leading-6 text-white">
          {scenario.title}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="max-w-[230px] truncate rounded-full bg-[#21262d] px-2.5 py-1 text-[11px] text-[#8b949e]">
            {category}
          </span>

          <span className="shrink-0 text-xs text-[#8b949e]">
            {scenario.estimatedTime}
          </span>
        </div>

        <p className="mt-3 text-sm leading-5 text-[#8b949e]">
          {scenario.description}
        </p>
      </div>

      <button
        type="button"
        onClick={startScenario}
        className="mt-5 flex w-full items-center justify-center rounded-md bg-[#238636] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2ea043] active:bg-[#2ea043]"
      >
        Start Scenario →
      </button>
    </article>
  );
}