"use client";

import Image from "next/image";

const alexImages = {
  talking: "/alex/talking.png",
  neutral: "/alex/neutral.png",
  thinking: "/alex/thinking.png",
  concerned: "/alex/concerned.png",
  happy: "/alex/happy.png",
  celebrating: "/alex/celebrating.png",
};

export default function AlexTeammate({
  emotion = "neutral",
  name = "Alex",
  message = "",
  className = "",
}) {
  const image = alexImages[emotion] || alexImages.neutral;

  return (
    <div
      className={`rounded-xl border border-[#30363d] bg-[#161b22] ${className}`}
    >
      {/* HEADER */}

      <div className="flex items-center gap-3 border-b border-[#30363d] px-3 py-2.5">

        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#21262d]">

          <Image
            src={image}
            alt={name}
            fill
            sizes="36px"
            className="object-cover object-top"
          />

        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold text-white">
            {name}
          </p>

          <p className="text-[9px] text-[#8b949e]">
            Teammate
          </p>

        </div>

      </div>

      {/* OPTIONAL REACTION */}

      {message && (
        <div className="px-3 py-3">

          <p className="text-xs leading-5 text-[#c9d1d9]">
            {message}
          </p>

        </div>
      )}

    </div>
  );
}