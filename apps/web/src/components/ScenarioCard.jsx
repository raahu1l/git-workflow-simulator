"use client";

import { useRouter } from "next/navigation";

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

  const category = scenario.category;

  /* =========================
     MOBILE COMPACT CARD
  ========================== */

  if (compact) {
    return (
      <article className="w-[280px] shrink-0 rounded-xl border border-[#30363d] bg-[#161b22] p-4">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white">
            {scenario.title}
          </h3>

          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-[#21262d] px-2.5 py-1 text-[11px] text-[#8b949e]">
              {category}
            </span>

            <span className="text-xs text-[#8b949e]">
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
          className="mt-4 flex w-full items-center justify-center rounded-md bg-[#238636] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2ea043] active:bg-[#2ea043]"
        >
          Start Scenario →
        </button>
      </article>
    );
  }

  /* =========================
     TABLET / DESKTOP CARD
  ========================== */

  return (
    <article className="flex min-h-[220px] flex-col justify-between rounded-xl border border-[#30363d] bg-[#161b22] p-6 transition hover:border-[#58a6ff]">
      <div>
        <h3 className="text-xl font-semibold leading-tight">
          {scenario.title}
        </h3>

        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-[#21262d] px-3 py-1 text-xs text-[#8b949e]">
            {category}
          </span>

          <span className="rounded-full bg-[#21262d] px-3 py-1 text-xs text-[#8b949e]">
            {scenario.estimatedTime}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#8b949e]">
          {scenario.description}
        </p>
      </div>

      <button
        type="button"
        onClick={startScenario}
        className="mt-6 w-full rounded-lg bg-[#238636] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
      >
        Start Scenario →
      </button>
    </article>
  );
}