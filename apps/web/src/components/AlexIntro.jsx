
"use client";

import Image from "next/image";

export default function AlexIntro({
  name = "Alex",
  message,
  emotion = "talking",
  onContinue,
  actions = null,
}) {
  const imageMap = {
    talking: "/alex/talking.png",
    success: "/alex/success.png",
    concerned: "/alex/concerned.png",
    thinking: "/alex/thinking.png",
    happy: "/alex/happy.png",
    celebrating: "/alex/celebrating.png",
    confused: "/alex/confused.png",
  };

  const imageSrc =
    imageMap[emotion] || imageMap.talking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-purple-500/40 bg-[#0d0b16] shadow-[0_0_50px_rgba(139,92,246,0.15)]">

        {/* PURPLE DECORATION */}
        <div className="pointer-events-none absolute -top-20 left-1/4 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-40 w-40 rounded-full bg-fuchsia-600/10 blur-3xl" />

        <div className="grid min-h-[430px] md:grid-cols-[0.9fr_1.1fr]">

          {/* CHARACTER */}

          <div className="relative flex items-end justify-center overflow-hidden border-b border-purple-500/20 bg-gradient-to-br from-[#1b1230] via-[#130e20] to-[#0d0b16] md:border-b-0 md:border-r">

            <div className="pointer-events-none absolute bottom-10 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl" />

            <Image
              src={imageSrc}
              alt={name}
              width={500}
              height={500}
              priority
              className="relative z-10 h-[300px] w-[300px] object-contain md:h-[420px] md:w-[420px]"
            />

          </div>

          {/* STORY */}

          <div className="relative flex flex-col justify-center p-7 sm:p-9 md:p-11">

            <div className="mb-5">

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-400">
                Your teammate
              </span>

              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {name}
              </h2>

            </div>

            <div className="rounded-xl border border-purple-500/25 bg-[#191326] p-5">

              <p className="text-sm leading-6 text-[#ddd6eb] sm:text-base sm:leading-7">
                {message}
              </p>

            </div>

            {/* CUSTOM ACTIONS */}

            {actions ? (
              <div className="mt-7 flex gap-3">

                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="flex-1 rounded-lg border border-purple-500/40 bg-[#211832] px-5 py-3 text-sm font-semibold text-purple-200 transition hover:border-purple-400 hover:bg-[#302044] hover:text-white active:scale-[0.99]"
                  >
                    {action.label}
                  </button>
                ))}

              </div>
            ) : (
              <button
                type="button"
                onClick={onContinue}
                className="mt-7 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:from-violet-500 hover:to-purple-500 active:scale-[0.99]"
              >
                Got it — Start Scenario →
              </button>
            )}

            {!actions && (
              <p className="mt-3 text-center text-[10px] text-[#a49ab8]">
                You'll work through the tasks in the terminal.
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
