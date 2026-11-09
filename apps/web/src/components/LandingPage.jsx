import Image from "next/image";

const GITHUB_URL =
  "https://github.com/raahu1l/git-workflow-simulator";

const DEPTH = 70; // thickness of the 3D slab in px
const LAYERS = 56; // more layers = smoother edge

export default function LandingPage() {
  return (
    <main className="h-dvh overflow-hidden bg-[#0b0814] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-violet-700/15 blur-[130px]" />
        <div className="absolute right-[-8rem] top-20 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/15 blur-[140px]" />
        <div className="absolute bottom-[-15rem] left-1/3 h-[30rem] w-[40rem] rounded-full bg-purple-700/10 blur-[140px]" />
      </div>

      {/* MAIN FRAME */}
      <div className="relative mx-auto h-full max-w-[1800px] p-3 sm:p-5 lg:p-6">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-violet-300/20 bg-[#11101d]/85 px-5 py-5 shadow-[0_30px_100px_rgba(0,0,0,0.4)] sm:px-8 sm:py-6 lg:px-12 lg:py-7">

          {/* HEADER */}
          <header className="flex shrink-0 items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-3 sm:gap-4">
              {/* TOP-LEFT LOGO */}
              <div className="relative h-14 w-14 shrink-0 [perspective:500px] sm:h-[68px] sm:w-[68px]">
                <div className="absolute inset-1 rounded-2xl bg-purple-600/40 blur-xl" />

                <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-700 to-fuchsia-700 shadow-[5px_9px_12px_rgba(0,0,0,0.65)] [transform:rotateY(-18deg)_rotateX(12deg)_rotateZ(-8deg)]" />

                <div className="absolute inset-[5px] overflow-hidden rounded-[15px] [transform:rotateY(-18deg)_rotateX(12deg)_rotateZ(-8deg)]">
                  <Image
                    src="/git-workflow-simulator-icon.png"
                    alt="Git Workflow Simulator"
                    fill
                    priority
                    sizes="68px"
                    className="object-cover mix-blend-screen"
                  />
                </div>
              </div>

              <span className="whitespace-nowrap text-base font-bold tracking-tight sm:text-xl lg:text-2xl">
                Git Workflow{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Simulator
                </span>
              </span>
            </a>

            {/* GITHUB */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold transition hover:border-violet-300/40 hover:bg-white/10 sm:px-6 sm:py-3"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
                aria-hidden="true"
              >
                <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
              </svg>
              GitHub
            </a>
          </header>

          {/* HERO */}
          <div className="grid min-h-0 flex-1 items-center gap-5 py-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-4 lg:py-2">

            {/* LEFT CONTENT */}
            <div className="relative z-10 max-w-4xl">
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[clamp(2.6rem,4.6vw,4.5rem)]">
                Master Git
                <br />
                <span className="whitespace-nowrap">
                  with{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                    Real Practice
                  </span>
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mt-6 lg:text-xl xl:text-2xl">
                Hands-on, scenario-driven Git learning platform
                with a real terminal and isolated environments.
              </p>

              {/* ONLY START LEARNING */}
              <div className="mt-7 flex flex-wrap gap-3 sm:mt-9">
                <a
                  href="/scenarios"
                  className="inline-flex min-h-[58px] items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 text-base font-bold shadow-[0_10px_35px_rgba(147,51,234,0.35)] transition hover:-translate-y-1 hover:brightness-110 sm:px-9 sm:text-lg"
                >
                  Start Learning
                  <span className="text-2xl" aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            {/* RIGHT 3D TERMINAL */}
            <div className="hidden items-center justify-center overflow-visible lg:flex">
              <div className="relative flex aspect-square w-full max-w-[440px] items-center justify-center">

                {/* AMBIENT LIGHT */}
                <div className="absolute inset-[-20%] rounded-full bg-purple-600/25 blur-[85px]" />

                {/* PERSPECTIVE CAMERA */}
                <div className="relative h-[320px] w-[320px] [perspective:1000px] xl:h-[350px] xl:w-[350px]">

                  <div
                    className="absolute inset-0 [transform-style:preserve-3d]"
                    style={{
                      transform:
                        "rotateY(-24deg) rotateX(10deg) rotateZ(-6deg)",
                    }}
                  >

                    {/* SOLID EXTRUSION: stacked rounded layers, back to front */}
                    {Array.from({ length: LAYERS }).map((_, i) => {
                      const t = i / (LAYERS - 1); // 0 = back, 1 = front
                      const z = -DEPTH / 2 + t * (DEPTH - 2);
                      const lightness = 7 + t * t * 33;
                      return (
                        <div
                          key={i}
                          className="absolute inset-0 rounded-[55px]"
                          style={{
                            transform: `translateZ(${z}px)`,
                            background: `hsl(274 68% ${lightness}%)`,
                            boxShadow:
                              i === 0
                                ? "0 40px 70px rgba(0,0,0,0.6)"
                                : undefined,
                          }}
                        />
                      );
                    })}

                    {/* FRONT FACE */}
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-[55px] border-[10px] border-violet-500 bg-[#100d1d]"
                      style={{
                        transform: `translateZ(${DEPTH / 2}px)`,
                        boxShadow:
                          "0 0 12px #a855f7, 0 0 32px rgba(168,85,247,.85), 0 0 75px rgba(168,85,247,.35), inset 0 0 25px rgba(168,85,247,.12)",
                      }}
                    >
                      {/* INNER BEVEL */}
                      <div className="absolute inset-2 rounded-[42px] border border-fuchsia-300/30" />

                      {/* FRONT LIGHTING */}
                      <div className="pointer-events-none absolute inset-0 rounded-[45px] bg-gradient-to-br from-violet-400/10 via-transparent to-fuchsia-500/15" />

                      {/* TERMINAL SYMBOL: wide chevron + long underscore */}
                      <svg
                        viewBox="0 0 200 120"
                        className="relative w-[62%] select-none drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]"
                        fill="none"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="18,14 86,56 18,98" strokeWidth="18" />
                        <line x1="112" y1="102" x2="186" y2="102" strokeWidth="18" />
                      </svg>
                    </div>

                    {/* TOP EDGE REFLECTION */}
                    <div
                      className="pointer-events-none absolute left-12 right-12 top-0 h-[3px] rounded-full bg-fuchsia-200 blur-[2px]"
                      style={{ transform: `translateZ(${DEPTH / 2 + 1}px)` }}
                    />

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}