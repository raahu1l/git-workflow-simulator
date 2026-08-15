"use client";

import { useRouter } from "next/navigation";

const categoryNames = {
  "git-foundations": "Git Foundations",
  "branching-collaboration": "Branching & Collaboration",
  "history-recovery": "History & Recovery",
  "advanced-workflows": "Advanced Git Workflows",
};

export default function MobileScenarioRow({ scenario }) {
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

  return (
    <article className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
      <div className="flex items-start justify-between gap-3">

        <h3 className="min-w-0 flex-1 truncate text-xs font-semibold text-white">
          {scenario.title}
        </h3>

        <span className="shrink-0 text-[9px] text-[#8b949e]">
          {scenario.estimatedTime}
        </span>

      </div>

      <p className="mt-1 line-clamp-1 text-[9px] leading-4 text-[#8b949e]">
        {scenario.description}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">

        <span className="truncate text-[9px] text-[#8b949e]">
          {category}
        </span>

        <button
          type="button"
          onClick={startScenario}
          className="shrink-0 text-[10px] font-medium text-[#2ea043] hover:text-[#3fb950]"
        >
          Start →
        </button>

      </div>
    </article>
  );
}