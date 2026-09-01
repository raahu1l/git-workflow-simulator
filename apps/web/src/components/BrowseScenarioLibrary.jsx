"use client";

import { useMemo, useState } from "react";
import ScenarioCard from "@/src/components/ScenarioCard";
import MobileScenarioRow from "@/src/components/MobileScenarioRow";

const categoryNames = {
  "git-foundations": "Git Foundations",
  "branching-collaboration": "Branching & Collaboration",
  "history-recovery": "History & Recovery",
  "advanced-workflows": "Advanced Git Workflows",
};

export default function BrowseScenarioLibrary({
  scenarios,
  categories,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScenarios = useMemo(() => {
  const uniqueScenarios = Array.from(
    new Map(
      scenarios.map((scenario) => [scenario.id, scenario])
    ).values()
  );

  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return uniqueScenarios;
  }

  return uniqueScenarios.filter((scenario) => {
    const categoryName =
      categoryNames[scenario.category] || scenario.category || "";

    return (
      scenario.title?.toLowerCase().includes(query) ||
      scenario.description?.toLowerCase().includes(query) ||
      categoryName.toLowerCase().includes(query)
    );
  });
}, [scenarios, searchQuery]);

  return (
    <>
      {/* Search */}
      <section className="border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="relative max-w-2xl">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8b949e]">
              ⌕
            </span>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search scenarios..."
              className="h-10 w-full rounded-md border border-[#30363d] bg-[#0d1117] pl-9 pr-4 text-xs text-white outline-none placeholder:text-[#6e7681] focus:border-[#58a6ff]"
            />
          </div>

          {searchQuery.trim() && (
            <p className="mt-3 text-[10px] text-[#8b949e] sm:text-xs">
              {filteredScenarios.length}{" "}
              {filteredScenarios.length === 1
                ? "scenario"
                : "scenarios"}{" "}
              found
            </p>
          )}
        </div>
      </section>

      {/* Scenario Library */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {categories.map((category) => {
          const categoryScenarios = filteredScenarios.filter(
            (scenario) => scenario.category === category.slug
          );

          // When searching, don't show empty categories.
          if (searchQuery.trim() && categoryScenarios.length === 0) {
            return null;
          }

          return (
            <section
              key={category.slug}
              className="border-b border-[#30363d] py-8 sm:py-10"
            >
              {/* Category Header */}
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold sm:text-lg">
                    {category.name}
                  </h2>

                  <p className="mt-1 text-[10px] leading-4 text-[#8b949e] sm:text-xs">
                    {category.description}
                  </p>
                </div>

                <a
                  href={`/browse/${category.slug}`}
                  className="shrink-0 text-[10px] font-medium text-[#58a6ff] hover:underline sm:text-xs"
                >
                  View all →
                </a>
              </div>

              {/* Desktop */}
              <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
                {categoryScenarios.length > 0 ? (
                  categoryScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                    />
                  ))
                ) : (
                  <EmptyCategory />
                )}
              </div>

              {/* Tablet */}
              <div className="hidden sm:grid lg:hidden sm:grid-cols-2 sm:gap-4">
                {categoryScenarios.length > 0 ? (
                  categoryScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                    />
                  ))
                ) : (
                  <EmptyCategory />
                )}
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-2 sm:hidden">
                {categoryScenarios.length > 0 ? (
                  categoryScenarios.map((scenario) => (
                    <MobileScenarioRow
                      key={scenario.id}
                      scenario={scenario}
                    />
                  ))
                ) : (
                  <EmptyCategory />
                )}
              </div>
            </section>
          );
        })}

        {/* No search results */}
        {searchQuery.trim() && filteredScenarios.length === 0 && (
          <div className="py-16 text-center">
            <h2 className="text-base font-semibold text-white">
              No scenarios found
            </h2>

            <p className="mt-2 text-xs text-[#8b949e]">
              Try a different title, category, or keyword.
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs font-medium text-[#58a6ff] hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyCategory() {
  return (
    <div className="rounded-lg border border-dashed border-[#30363d] bg-[#161b22] px-4 py-6 text-center text-xs text-[#6e7681]">
      No scenarios in this category yet.
    </div>
  );
}