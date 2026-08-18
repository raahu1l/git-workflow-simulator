"use client";

import { useEffect, useState } from "react";

export default function TaskProgress({
  sessionId,
  tasks = [],
  compact = false,
  onProgressChange,
}) {
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProgress = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}/progress`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch progress");
        }

        const data = await response.json();

        if (!cancelled) {
          setProgress(data);
          setError(false);

          // Let the session page observe progress changes.
          if (onProgressChange) {
            onProgressChange(data);
          }
        }
      } catch (err) {
        console.error("Progress fetch failed:", err);

        if (!cancelled) {
          setError(true);
        }
      }
    };

    fetchProgress();

    const interval = setInterval(fetchProgress, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, onProgressChange]);

  const completedCount = tasks.filter(
    (task) => progress[task.id]
  ).length;

  return (
    <div>
      {!compact && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white">
            Tasks
          </h2>

          <span className="text-[10px] font-mono text-[#8b949e]">
            {completedCount}/{tasks.length}
          </span>
        </div>
      )}

      {compact && (
        <div className="mb-2 flex justify-end">
          <span className="rounded-full bg-[#21262d] px-2 py-1 text-[9px] text-[#8b949e]">
            {completedCount}/{tasks.length}
          </span>
        </div>
      )}

      <div
        className={
          compact
            ? "grid grid-cols-2 gap-x-3 gap-y-1.5"
            : "space-y-3"
        }
      >
        {tasks.map((task) => {
          const completed = progress[task.id];

          return (
            <div
              key={task.id}
              className="flex items-center gap-2"
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full border ${
                  compact ? "h-3 w-3" : "h-5 w-5"
                } ${
                  completed
                    ? "border-[#3fb950] bg-[#238636] text-white"
                    : "border-[#8b949e]"
                }`}
              >
                {completed && (
                  <span
                    className={
                      compact
                        ? "text-[7px]"
                        : "text-[10px]"
                    }
                  >
                    ✓
                  </span>
                )}
              </span>

              <span
                className={`truncate ${
                  compact
                    ? "text-[8px]"
                    : "text-[11px]"
                } ${
                  completed
                    ? "text-[#8b949e] line-through"
                    : "text-[#c9d1d9]"
                }`}
              >
                {compact
                  ? task.compactLabel
                  : task.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-[9px] text-[#f85149]">
          Unable to update task progress.
        </p>
      )}
    </div>
  );
}