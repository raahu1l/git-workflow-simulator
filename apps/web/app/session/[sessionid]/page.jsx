"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "next/navigation";

import Terminal from "@/src/components/Terminal";
import AlexTeammate from "@/src/components/alex/AlexTeammate";
import SessionIntro from "@/src/components/SessionIntro";
import TaskProgress from "@/src/components/TaskProgress";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionid;

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  const [validation, setValidation] = useState(null);
  const [checking, setChecking] = useState(false);

  /*
   * Current Alex sidebar reaction.
   *
   * null = normal/neutral Alex
   */
  const [alexReaction, setAlexReaction] = useState(null);

  /*
   * Previous progress is kept in a ref so that
   * progress changes don't cause unnecessary renders.
   */
  const previousProgressRef = useRef(null);

  /*
   * Used to automatically remove the reaction
   * after a few seconds.
   */
  const reactionTimeoutRef = useRef(null);

  /* =====================================================
     LOAD SESSION → SCENARIO
  ====================================================== */

  useEffect(() => {
    const loadScenario = async () => {
      try {
        const sessionResponse = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}`,
          {
            cache: "no-store",
          }
        );

        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch session");
        }

        const sessionData =
          await sessionResponse.json();

        const scenarioResponse = await fetch(
          `http://localhost:5000/api/scenarios/${sessionData.scenarioId}`,
          {
            cache: "no-store",
          }
        );

        if (!scenarioResponse.ok) {
          throw new Error("Failed to fetch scenario");
        }

        const scenarioData =
          await scenarioResponse.json();

        setScenario(scenarioData);
      } catch (error) {
        console.error(
          "Failed to load scenario:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadScenario();
    }
  }, [sessionId]);

  /* =====================================================
     PROGRESS → ALEX REACTION
  ====================================================== */

  const handleProgressChange = useCallback(
    (progress) => {
      if (!scenario) {
        return;
      }

      const previousProgress =
        previousProgressRef.current;

      /*
       * First progress response establishes the baseline.
       *
       * This prevents Alex from reacting to tasks that
       * were already completed before the page loaded.
       */
      if (previousProgress === null) {
        previousProgressRef.current = progress;
        return;
      }

      const situations =
        scenario.alex?.situations || {};

      for (const task of scenario.tasks || []) {
        const wasComplete = Boolean(
          previousProgress[task.id]
        );

        const isComplete = Boolean(
          progress[task.id]
        );

        /*
         * Detect:
         *
         * false → true
         *
         * meaning the user just completed this task.
         */
        if (!wasComplete && isComplete) {
          const reaction =
            situations[task.id];

          if (reaction) {
            setAlexReaction(reaction);

            /*
             * If another reaction happens while one
             * is already visible, restart the timer.
             */
            if (reactionTimeoutRef.current) {
              clearTimeout(
                reactionTimeoutRef.current
              );
            }

            reactionTimeoutRef.current =
              setTimeout(() => {
                setAlexReaction(null);
              }, 4000);
          }

          /*
           * Only react to one newly completed task
           * per progress update.
           */
          break;
        }
      }

      previousProgressRef.current = progress;
    },
    [scenario]
  );

  /* =====================================================
     CLEANUP ALEX REACTION TIMER
  ====================================================== */

  useEffect(() => {
    return () => {
      if (reactionTimeoutRef.current) {
        clearTimeout(
          reactionTimeoutRef.current
        );
      }
    };
  }, []);

  /* =====================================================
     CHECK SOLUTION
  ====================================================== */

  const checkSolution = async () => {
    setChecking(true);
    setValidation(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/validate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Validation request failed"
        );
      }

      const data = await response.json();

      /*
       * Validation is a major story event, so remove
       * the small sidebar reaction while the overlay
       * is being shown.
       */
      setAlexReaction(null);

      setValidation(data);
    } catch (error) {
      console.error(
        "Validation failed:",
        error
      );

      setValidation({
        success: false,
        message: "Unable to check the solution.",
      });
    } finally {
      setChecking(false);
    }
  };

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-[#0d1117] text-[#8b949e]">
        <span className="text-xs">
          Loading scenario...
        </span>
      </main>
    );
  }

  /* =====================================================
     SCENARIO NOT FOUND
  ====================================================== */

  if (!scenario) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-[#0d1117] px-4 text-[#f0f6fc]">
        <div className="text-center">

          <h1 className="text-lg font-semibold">
            Scenario unavailable
          </h1>

          <p className="mt-2 text-xs text-[#8b949e]">
            This scenario could not be loaded.
          </p>

          <a
            href="/browse"
            className="mt-5 inline-flex rounded-md bg-[#238636] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2ea043]"
          >
            Browse All
          </a>

        </div>
      </main>
    );
  }

  const alexIntro =
    scenario.alex?.intro;

  const alexSuccess =
    scenario.alex?.success;

  const alexFailure =
    scenario.alex?.failure;

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#0d1117] text-[#f0f6fc]">

      {/* =====================================================
          INITIAL STORY
      ====================================================== */}

      <SessionIntro
        emotion={
          alexIntro?.emotion || "talking"
        }
        message={
          alexIntro?.message || ""
        }
      />

      {/* =====================================================
          VALIDATION STORY
      ====================================================== */}
{validation && (
  <SessionIntro
    key={
      validation.success
        ? "validation-success"
        : "validation-failure"
    }
    emotion={
      validation.success
        ? alexSuccess?.emotion || "celebrating"
        : alexFailure?.emotion || "concerned"
    }
    message={
      validation.success
        ? alexSuccess?.message || ""
        : alexFailure?.message || ""
    }
    actions={[
      {
        label: "Retry",
        onClick: () => {
          setValidation(null);
        },
      },
      {
        label: "Browse All",
        onClick: () => {
          window.location.href = "/browse";
        },
      },
    ]}
  />
)}

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="flex h-12 items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-4 sm:px-5">

        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">

          <a
            href="/browse"
            aria-label="Back to Browse All"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#30363d] bg-[#161b22] text-sm text-[#8b949e] transition hover:bg-[#21262d] hover:text-white"
          >
            ←
          </a>

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

        {/* SESSION */}

        <div className="hidden items-center gap-2 text-[10px] text-[#8b949e] sm:flex">

          <span>
            Session
          </span>

          <span className="text-[#30363d]">
            •
          </span>

          <span className="font-mono">
            {sessionId.slice(0, 8)}
          </span>

        </div>

        {/* MOBILE EXIT */}

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
              {scenario.title}
            </h1>

            <p className="mt-4 text-xs leading-5 text-[#8b949e]">
              {scenario.description}
            </p>

            {/* TASKS */}

            <div className="mt-8">

              <TaskProgress
                sessionId={sessionId}
                tasks={scenario.tasks}
                onProgressChange={
                  handleProgressChange
                }
              />

            </div>

            {/* ALEX SIDEBAR */}

            <div className="mt-8">

              <AlexTeammate
                emotion={
                  alexReaction?.emotion ||
                  "neutral"
                }
                name="Alex"
                message={
                  alexReaction?.message || ""
                }
              />

            </div>

          </div>

        </aside>

        {/* TERMINAL */}

        <section className="min-w-0 flex-1 p-4 lg:p-5">

          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#30363d] bg-[#0b0f14]">

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
              <Terminal
                sessionId={sessionId}
              />
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

          <div className="min-w-0">

            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">
              Objective
            </p>

            <h1 className="mt-1 truncate text-sm font-bold">
              {scenario.title}
            </h1>

          </div>

          <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-[#8b949e]">
            {scenario.description}
          </p>

          {/* TASKS */}

          <div className="mt-3">

            <TaskProgress
              sessionId={sessionId}
              tasks={scenario.tasks}
              compact
              onProgressChange={
                handleProgressChange
              }
            />

          </div>

          {/* MOBILE ALEX REACTION */}

          {alexReaction && (
            <div className="mt-3">

              <AlexTeammate
                emotion={
                  alexReaction.emotion ||
                  "neutral"
                }
                name="Alex"
                message={
                  alexReaction.message || ""
                }
              />

            </div>
          )}

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
              <Terminal
                sessionId={sessionId}
              />
            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          ACTION BAR
      ====================================================== */}

      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-[#30363d] bg-[#0d1117] px-3 sm:px-5">

        {/* HINTS */}

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

        {/* ACTIONS */}

        <div className="flex items-center gap-2">

          <button
            type="button"
            className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-[10px] font-medium text-[#c9d1d9] transition hover:bg-[#21262d] sm:text-xs"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={checkSolution}
            disabled={checking}
            className="rounded-md bg-[#238636] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-xs"
          >
            {checking
              ? "Checking..."
              : "✓ Check Solution"}
          </button>

        </div>

      </footer>

    </main>
  );
}