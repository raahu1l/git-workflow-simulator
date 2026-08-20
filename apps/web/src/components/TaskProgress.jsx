"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";

export default function TaskProgress({
  sessionId,
  tasks = [],
  compact = false,
  onProgressChange,
}) {
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(false);

  /*
   * Keep the latest progress available without
   * triggering React state updates during render.
   */
  const progressRef = useRef({});

  useEffect(() => {
    let cancelled = false;

    const fetchProgress = async () => {
      if (!sessionId || cancelled) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}/progress`,
          {
            cache: "no-store",
          }
        );

        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          const message =
            data?.message ||
            `Progress request failed (${response.status})`;

          throw new Error(message);
        }

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data)
        ) {
          throw new Error(
            "Invalid progress response from server"
          );
        }

        if (cancelled) {
          return;
        }

        /*
         * Merge the new backend state with the
         * already-achieved tasks.
         *
         * This makes task progression monotonic:
         *
         * false → true
         *
         * but never:
         *
         * true → false
         */
        const previousProgress =
          progressRef.current;

        const mergedProgress = {};

        for (const task of tasks) {
          mergedProgress[task.id] =
            previousProgress[task.id] === true ||
            data[task.id] === true;
        }

        /*
         * Store the merged state in the ref first.
         */
        progressRef.current =
          mergedProgress;

        /*
         * Then update React state.
         */
        setProgress(mergedProgress);

        setError(false);

        /*
         * IMPORTANT:
         *
         * Notify the parent AFTER the state update
         * calculation, not inside the setState updater.
         */
        if (onProgressChange) {
          onProgressChange(
            mergedProgress
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Progress fetch failed:",
          err
        );

        /*
         * Keep the last valid progress state.
         */
        setError(true);
      }
    };

    fetchProgress();

    const interval = setInterval(
      fetchProgress,
      1000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    sessionId,
    tasks,
    onProgressChange,
  ]);

  const completedCount = tasks.filter(
    (task) => progress[task.id] === true
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
          const completed =
            progress[task.id] === true;

          return (
            <div
              key={task.id}
              className="flex items-center gap-2"
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full border ${
                  compact
                    ? "h-3 w-3"
                    : "h-5 w-5"
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