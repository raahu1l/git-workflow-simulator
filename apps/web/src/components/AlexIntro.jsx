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
    confused: "/alex/confused.png",
  };

  const imageSrc =
    imageMap[emotion] || imageMap.talking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl">

        <div className="grid min-h-[430px] md:grid-cols-[0.9fr_1.1fr]">

          {/* CHARACTER */}

          <div className="relative flex items-end justify-center overflow-hidden border-b border-[#30363d] bg-[#111820] md:border-b-0 md:border-r">

            <Image
              src={imageSrc}
              alt={name}
              width={500}
              height={500}
              priority
              className="h-[300px] w-[300px] object-contain md:h-[420px] md:w-[420px]"
            />

          </div>

          {/* STORY */}

          <div className="flex flex-col justify-center p-7 sm:p-9 md:p-11">

            <div className="mb-5">

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#58a6ff]">
                Your teammate
              </span>

              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {name}
              </h2>

            </div>

            <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">

              <p className="text-sm leading-6 text-[#c9d1d9] sm:text-base sm:leading-7">
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
                    className="flex-1 rounded-lg border border-[#30363d] bg-[#161b22] px-5 py-3 text-sm font-semibold text-[#c9d1d9] transition hover:bg-[#21262d] hover:text-white active:scale-[0.99]"
                  >
                    {action.label}
                  </button>
                ))}

              </div>
            ) : (
              <button
                type="button"
                onClick={onContinue}
                className="mt-7 w-full rounded-lg bg-[#238636] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2ea043] active:scale-[0.99]"
              >
                Got it — Start Scenario →
              </button>
            )}

            {!actions && (
              <p className="mt-3 text-center text-[10px] text-[#8b949e]">
                You'll work through the tasks in the terminal.
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}