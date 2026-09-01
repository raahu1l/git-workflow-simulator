"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "next/navigation";

import Terminal from "@/src/components/Terminal";
import AlexTeammate from "@/src/components/alex/AlexTeammate";
import SessionIntro from "@/src/components/SessionIntro";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionid;

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * =========================================
   * SANDBOX STARTUP STATUS
   * =========================================
   *
   * The session can exist before Docker
   * and setup.sh have finished.
   */
  const [sandboxStatus, setSandboxStatus] =
    useState("starting");

  const [validation, setValidation] =
    useState(null);

  const [checking, setChecking] =
    useState(false);

  const [alexReaction, setAlexReaction] =
    useState(null);

  const [announcedMilestones, setAnnouncedMilestones] =
    useState({});

  const previousProgressRef =
    useRef(null);

  const [activeHint, setActiveHint] =
    useState(null);

  const [terminalRefreshKey, setTerminalRefreshKey] =
    useState(0);

  const [resetting, setResetting] =
    useState(false);

  /* =====================================================
     LOAD SESSION → SCENARIO
  ====================================================== */

  useEffect(() => {
    let cancelled = false;
    let startupInterval = null;

    const loadScenario = async () => {
      try {
        const sessionResponse = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}`,
          {
            cache: "no-store",
          }
        );

        if (!sessionResponse.ok) {
          throw new Error(
            "Failed to fetch session"
          );
        }

        const sessionData =
          await sessionResponse.json();

        if (cancelled) {
          return;
        }

        setSandboxStatus(
          sessionData.status
        );

        const scenarioResponse = await fetch(
          `http://localhost:5000/api/scenarios/${sessionData.scenarioId}`,
          {
            cache: "no-store",
          }
        );

        if (!scenarioResponse.ok) {
          throw new Error(
            "Failed to fetch scenario"
          );
        }

        const scenarioData =
          await scenarioResponse.json();

        if (cancelled) {
          return;
        }

        setScenario(scenarioData);
      } catch (error) {
        console.error(
          "Failed to load scenario:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const checkSandboxStatus = async () => {
      if (cancelled) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        setSandboxStatus(data.status);

        /*
         * Stop polling once the scenario is
         * ready or has failed.
         */
        if (
          data.status === "created" ||
          data.status === "failed"
        ) {
          if (startupInterval) {
            clearInterval(
              startupInterval
            );

            startupInterval = null;
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "Failed to check sandbox status:",
            error
          );
        }
      }
    };

    if (sessionId) {
      loadScenario();

      /*
       * Initial startup polling only.
       *
       * This is not task/progress polling.
       */
      startupInterval = setInterval(
        checkSandboxStatus,
        500
      );
    }

    return () => {
      cancelled = true;

      if (startupInterval) {
        clearInterval(startupInterval);
      }
    };
  }, [sessionId]);

  /* =====================================================
     AUTOMATIC ALEX MILESTONE CHECK
  ====================================================== */
  /*
   * The scenario validator is the source of truth.
   *
   * We periodically ask it for the current repository
   * milestone state. We do NOT use typed commands and we
   * do NOT show task/progress checkboxes.
   *
   * A milestone triggers Alex only once when its verified
   * state becomes true.
   */
  useEffect(() => {
    if (
      !sessionId ||
      !scenario ||
      sandboxStatus !== "created" ||
      resetting
    ) {
      return;
    }

    const milestoneDefinitions =
      scenario.alex?.situations || {};

    const milestoneIds =
      Object.keys(milestoneDefinitions);

    if (milestoneIds.length === 0) {
      return;
    }

    let cancelled = false;
    let interval = null;

    const checkMilestones = async () => {
      if (
        cancelled ||
        resetting
      ) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}/validate`,
          {
            method: "POST",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          cancelled ||
          resetting ||
          !data?.progress
        ) {
          return;
        }

        const previousProgress =
          previousProgressRef.current;

        /*
         * The first successful check establishes the
         * starting repository state. We must NOT treat
         * milestones already true at scenario startup
         * as newly reached.
         */
        if (!previousProgress) {
          previousProgressRef.current = {
            ...data.progress,
          };
          return;
        }

        const newlyReached =
          milestoneIds.find(
            (milestoneId) =>
              data.progress[milestoneId] === true &&
              previousProgress[milestoneId] !== true &&
              !announcedMilestones[milestoneId] &&
              milestoneDefinitions[milestoneId]
          );

        previousProgressRef.current = {
          ...data.progress,
        };

        if (newlyReached) {
          const reaction =
            milestoneDefinitions[newlyReached];

          setAlexReaction({
            id: newlyReached,
            ...reaction,
          });

          setAnnouncedMilestones((current) => ({
            ...current,
            [newlyReached]: true,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "Automatic milestone check unavailable."
          );
        }
      }
    };

    checkMilestones();

    interval = setInterval(
      checkMilestones,
      1000
    );

    return () => {
      cancelled = true;

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    sessionId,
    scenario,
    sandboxStatus,
    resetting,
  ]);

  /* =====================================================
     RESET / RETRY / RESTART SCENARIO
  ====================================================== */

  const resetScenario = async () => {
    if (
      resetting ||
      !sessionId
    ) {
      return;
    }

    /*
     * =========================================
     * IMMEDIATE UI RESET
     * =========================================
     */

    setResetting(true);

    setValidation(null);
    setActiveHint(null);
    setAlexReaction(null);
    setAnnouncedMilestones({});
    previousProgressRef.current = null;

    try {
      /*
       * =========================================
       * RESET BACKEND SESSION
       * =========================================
       */

      const response = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/reset`,
        {
          method: "POST",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        throw new Error(
          data?.message ||
            `Reset failed (${response.status})`
        );
      }

      /*
       * =========================================
       * BACKEND RESET COMPLETE
       * =========================================
       *
       * Reconnect the terminal to the fresh
       * scenario workspace.
       */

      setTerminalRefreshKey(
        (value) => value + 1
      );
    } catch (error) {
      /*
       * Keep reset errors user-friendly.
       */

      console.warn(
        "Scenario reset could not be completed."
      );

      setValidation({
        success: false,
        resetError: true,
        message:
          "The scenario could not be reset. Try again.",
      });
    } finally {
      setResetting(false);
    }
  };

  /* =====================================================
     CHECK SOLUTION
  ====================================================== */

  const checkSolution = async () => {
    if (
      checking ||
      resetting
    ) {
      return;
    }

    setChecking(true);
    setValidation(null);
    setActiveHint(null);
    setAlexReaction(null);
    setAnnouncedMilestones({});
    previousProgressRef.current = null;

    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/validate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        throw new Error(
          data?.message ||
            "Validation request failed"
        );
      }

      const data =
        await response.json();

      setValidation(data);


    } catch (error) {
      console.error(
        "Validation failed:",
        error
      );

      setValidation({
        success: false,
        message:
          "Unable to check the solution.",
      });
    } finally {
      setChecking(false);
    }
  };

  /* =====================================================
     HINTS
  ====================================================== */

  const hints = scenario?.hints || [];

  const toggleHint = (index) => {
    if (resetting) {
      return;
    }

    setActiveHint((current) =>
      current === index
        ? null
        : index
    );
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
            This scenario could not be
            loaded.
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

  /*
   * =========================================
   * TERMINAL CONTENT
   * =========================================
   *
   * During initial startup, do not mount
   * Terminal until Docker/setup.sh is ready.
   */

  const terminalContent = (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {sandboxStatus === "created" ? (
        <Terminal
          key={`terminal-${terminalRefreshKey}`}
          sessionId={sessionId}
          resetting={resetting}
        />
      ) : sandboxStatus === "failed" ? (
        <div className="flex h-full items-center justify-center bg-[#0d1117]">
          <div className="text-center">
            <p className="text-xs font-medium text-[#f85149]">
              Failed to prepare workspace
            </p>

            <p className="mt-1 text-[10px] text-[#8b949e]">
              Please return to Browse and try
              starting the scenario again.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center bg-[#0d1117]">
          <div className="text-center">
            <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-[#30363d] border-t-[#58a6ff]" />

            <p className="text-xs font-medium text-[#f0f6fc]">
              Preparing workspace...
            </p>

            <p className="mt-1 text-[10px] text-[#8b949e]">
              Your scenario is being prepared
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#0d1117] text-[#f0f6fc]">

      {/* =====================================================
          INITIAL STORY
      ====================================================== */}

      <SessionIntro
        emotion={
          alexIntro?.emotion ||
          "talking"
        }
        message={
          alexIntro?.message || ""
        }
      />

      {/* =====================================================
          VALIDATION STORY
      ====================================================== */}

      {validation &&
        !resetting && (
          <SessionIntro
            key={
              validation.resetError
                ? "reset-error"
                : validation.success
                ? "validation-success"
                : "validation-failure"
            }
            emotion={
              validation.resetError
                ? "concerned"
                : validation.success
                ? alexSuccess?.emotion ||
                  "celebrating"
                : alexFailure?.emotion ||
                  "concerned"
            }
            message={
              validation.resetError
                ? validation.message
                : validation.success
                ? alexSuccess?.message ||
                  ""
                : alexFailure?.message ||
                  ""
            }
            actions={[
              {
                label:
                  validation.success
                    ? "Restart Scenario"
                    : "Retry",
                onClick:
                  resetScenario,
              },
              {
                label: "Browse All",
                onClick: () => {
                  window.location.href =
                    "/browse";
                },
              },
            ]}
          />
        )}

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="flex h-12 items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-4 sm:px-5">

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

        <div className="hidden items-center gap-2 text-[10px] text-[#8b949e] sm:flex">
          <span>Session</span>

          <span className="text-[#30363d]">
            •
          </span>

          <span className="font-mono">
            {sessionId.slice(0, 8)}
          </span>
        </div>

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

        <aside className="flex w-[320px] shrink-0 flex-col border-r border-[#30363d] bg-[#0d1117]">

          {/* SCENARIO INFO */}

          <div className="min-h-0 flex-1 p-4 lg:p-5">

            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#58a6ff]">
              Objective
            </p>

            <p className="mt-2 text-xs leading-5 text-[#c9d1d9]">
              {scenario.objective || scenario.description}
            </p>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#58a6ff]">
              What To Do
            </p>

            <ul className="mt-3 space-y-2.5">
              {(scenario.whatToDo || []).map((item, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 text-[11px] leading-4 text-[#c9d1d9]"
                >
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#58a6ff]" />
                  <span>
                    {typeof item === "string" ? item : item.text}
                  </span>
                </li>
              ))}
            </ul>

          </div>

          {/* ALEX — MILESTONE REACTION */}

          <div className="shrink-0 border-t border-[#30363d] px-3 pb-3 pt-3 lg:px-4 lg:pb-4 lg:pt-3">

            <AlexTeammate
              emotion={
                alexReaction?.emotion ||
                "neutral"
              }
              name="Alex"
              message={
                alexReaction?.message ||
                "Your teammate is here when you need them."
              }
            />

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

            {terminalContent}

          </div>

        </section>

      </div>

      {/* =====================================================
          MOBILE
      ====================================================== */}

      <div className="flex h-[calc(100dvh-7rem)] min-h-0 flex-col sm:hidden">

        {/* COLLAPSIBLE SCENARIO INFO */}

        <section className="shrink-0 border-b border-[#30363d] bg-[#0d1117]">

          <details className="group px-4 py-2.5">

            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">

              <div className="min-w-0">

                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">
                  Objective
                </p>

                <p className="mt-1 truncate text-[10px] font-semibold text-[#f0f6fc]">
                  {scenario.objective || scenario.description}
                </p>

              </div>

              <span className="shrink-0 text-[10px] text-[#8b949e] transition-transform group-open:rotate-180">
                ▼
              </span>

            </summary>

            <div className="pt-3 pb-1">

              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">
                What To Do
              </p>

              <ul className="mt-2 space-y-1.5">

                {(scenario.whatToDo || []).map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-2 text-[9px] leading-3.5 text-[#c9d1d9]"
                  >
                    <span className="mt-[4px] h-1 w-1 shrink-0 rounded-full bg-[#58a6ff]" />
                    <span>
                    {typeof item === "string" ? item : item.text}
                  </span>
                  </li>
                ))}

              </ul>

            </div>

          </details>

        </section>

        {/* TERMINAL */}

        <section className="min-h-0 flex-1 p-2.5">

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

            {terminalContent}

          </div>

        </section>

        {/* COLLAPSIBLE ALEX */}

        <section className="shrink-0 border-t border-[#30363d] bg-[#0d1117]">

          <details className="group px-4 py-2">

            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">

              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#8b949e]">
                  Alex
                </p>

                <p className="mt-0.5 truncate text-[9px] text-[#8b949e]">
                  Your teammate is here when you need them.
                </p>
              </div>

              <span className="shrink-0 text-[10px] text-[#8b949e] transition-transform group-open:rotate-180">
                ▼
              </span>

            </summary>

            <div className="pb-1 pt-2">

              <AlexTeammate
                emotion={
                  alexReaction?.emotion ||
                  "neutral"
                }
                name="Alex"
                message={
                  alexReaction?.message ||
                  "Your teammate is here when you need them."
                }
              />

            </div>

          </details>

        </section>

      </div>

      {/* =====================================================
          RESET OVERLAY
      ====================================================== */}

      {resetting && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[#0d1117]/65 backdrop-blur-[2px]">

          <div className="rounded-xl border border-[#30363d] bg-[#161b22] px-6 py-5 text-center shadow-2xl">

            <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-[#30363d] border-t-[#58a6ff]" />

            <p className="text-sm font-semibold text-[#f0f6fc]">
              Resetting workspace...
            </p>

            <p className="mt-1 text-[10px] text-[#8b949e]">
              Preparing a fresh scenario
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          ACTION BAR
      ====================================================== */}

      <footer className="flex h-14 shrink-0 items-center justify-between gap-2 border-t border-[#30363d] bg-[#0d1117] px-2.5 sm:px-5">

        {/* HINTS */}

        <div className="relative flex min-w-0 items-center gap-1.5">

          {hints.map((hint, index) => (
            <div
              key={index}
              className="relative"
            >

              <button
                type="button"
                disabled={resetting}
                onClick={() =>
                  toggleHint(index)
                }
                className={`rounded-md border px-3 py-2 text-[10px] transition sm:text-xs ${
                  activeHint === index
                    ? "border-[#58a6ff] bg-[#161b22] text-white"
                    : "border-[#30363d] bg-[#161b22] text-[#c9d1d9] hover:bg-[#21262d]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                💡 Hint {index + 1}
              </button>

              {activeHint === index &&
                !resetting && (
                  <div className="absolute bottom-12 left-0 z-40 w-64 rounded-lg border border-[#30363d] bg-[#161b22] p-3 shadow-xl sm:w-72">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#58a6ff]">
                        Hint {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveHint(null)
                        }
                        className="text-xs text-[#8b949e] hover:text-white"
                      >
                        ×
                      </button>

                    </div>

                    <p className="text-xs leading-5 text-[#c9d1d9]">
                      {hint}
                    </p>

                  </div>
                )}

            </div>
          ))}

        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          <button
            type="button"
            onClick={resetScenario}
            disabled={
              resetting ||
              checking
            }
            className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-[10px] font-medium text-[#c9d1d9] transition hover:bg-[#21262d] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
          >
            {resetting
              ? "Resetting..."
              : "Reset"}
          </button>

          <button
            type="button"
            onClick={checkSolution}
            disabled={
              checking ||
              resetting
            }
            className="rounded-md bg-[#238636] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-xs"
          >
            {checking
              ? "Checking..."
              : resetting
              ? "Resetting..."
              : "✓ Check Solution"}
          </button>

        </div>

      </footer>

    </main>
  );
}