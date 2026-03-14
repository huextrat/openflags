"use client"

import { motion } from "framer-motion"
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"
import {
  ArrowRight,
  BarChart3,
  Blocks,
  CheckCircle2,
  Gauge,
  GitBranch,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import Link from "next/link"

function RailwayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4 17h-8v-1h8v1zm0-4h-8v-1h8v1zm0-4h-8v-1h8v1z" />
    </svg>
  )
}

function ZeaburIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm0-10c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z" />
    </svg>
  )
}

const featurePillars = [
  {
    icon: Rocket,
    title: "Ship faster",
    description:
      "Release progressively with percentage rollouts and targeted activation, instead of all-or-nothing launches.",
  },
  {
    icon: Gauge,
    title: "Low-latency by design",
    description: "Evaluate flags locally in your app so feature checks stay fast and predictable.",
  },
  {
    icon: ShieldCheck,
    title: "Self-hosted control",
    description:
      "Keep your flags, audit surface, and runtime ownership inside your own infrastructure.",
  },
]

const productBenefits = [
  "Progressive launches with rollouts",
  "Kill switches without redeploys",
  "Safe experiments for roadmap bets",
  "A clearer bridge between product and engineering",
]

const developerBenefits = [
  "JavaScript-first SDKs for modern stacks",
  "Simple REST API and lightweight control plane",
  "Monorepo-friendly setup and local evaluation",
  "Built for Bun, React, Next.js, Vite, and Node apps",
]

const stats = [
  { label: "Perf", value: "0ms local latency" },
  { label: "Control", value: "Fully open source" },
  { label: "Rollouts", value: "Granular targeting" },
  { label: "Ecosystem", value: "Type-safe SDKs" },
]

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#050505] min-h-screen text-white">
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-10 lg:px-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative group overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all hover:border-violet-500/40 hover:bg-violet-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 opacity-50 animate-shimmer" />
            <div className="relative flex items-center justify-center gap-4 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-2 text-violet-200">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                <span>
                  <strong className="text-white">OpenFlags Cloud is coming soon.</strong>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-lg"
        >
          <div className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
              <FlagLogo />
            </div>
            <div>
              <p className="text-[13px] font-bold tracking-[0.24em] bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 uppercase">
                OpenFlags
              </p>
              <p className="text-[11px] text-white/50 tracking-wide font-medium">
                Feature flags for modern teams
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-[13px] font-medium text-white/60 md:flex">
            <Link href="/docs" className="transition-colors hover:text-white">
              Documentation
            </Link>
            <Link
              href="https://github.com/huextrat/openflags"
              className="transition-colors hover:text-white"
            >
              GitHub
            </Link>
            <Link
              href="/docs"
              className="flex items-center justify-center rounded-full bg-white/10 px-4 py-1.5 text-white transition-all hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
            >
              Get Started
            </Link>
          </nav>
        </motion.header>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative min-w-0 w-full"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-[13px] font-medium text-violet-200 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.1)]"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Open source, self-hosted, built for safety</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="max-w-4xl w-full text-4xl leading-[1.15] font-semibold tracking-tight text-white sm:text-5xl lg:text-[4rem] break-words text-balance"
            >
              Feature flags that feel{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                lightweight
              </span>{" "}
              for engineers and trustworthy for product teams.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 sm:mt-8 max-w-2xl w-full text-[15px] sm:text-[17px] leading-7 sm:leading-8 text-white/60 font-medium break-words"
            >
              OpenFlags gives you progressive delivery, local evaluation, and a simple control plane
              without the enterprise tax. Launch faster, de-risk releases, and keep ownership in
              your stack.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            >
              <Link
                href="/docs"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-cyan-50 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              >
                Read the docs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/huextrat/openflags"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 backdrop-blur-md"
              >
                Explore GitHub
              </Link>

              <Link
                href="https://railway.com/deploy/IOxrOx?referralCode=Xxs5kf&utm_medium=integration&utm_source=template&utm_campaign=generic"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-6 py-3.5 text-sm font-semibold text-violet-200 transition-all hover:bg-violet-500/20 hover:border-violet-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <RailwayIcon className="h-4 w-4" />
                Railway
              </Link>
              <Link
                href="https://zeabur.com/templates/NMMXD0"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-6 py-3.5 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ZeaburIcon className="h-4 w-4" />
                Zeabur
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="relative group rounded-2xl border border-white/5 bg-[#09090b]/40 p-5 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-cyan-500/0 opacity-0 group-hover:from-violet-500/10 group-hover:to-cyan-500/10 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute -inset-px rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 w-1 shrink-0 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[11px] font-bold tracking-[0.2em] text-white/50 uppercase break-words">
                        {stat.label}
                      </p>
                    </div>
                    <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:from-white group-hover:to-cyan-200 transition-all duration-300">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative min-w-0 w-full"
          >
            <div className="absolute inset-[-10%] rounded-[3rem] bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 blur-3xl opacity-50" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#09090b]/60 p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(139,92,246,0.15)] backdrop-blur-3xl overflow-hidden w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 sm:pb-5 gap-3 sm:gap-0">
                <div>
                  <p className="text-[15px] font-semibold text-white">Progressive delivery</p>
                  <p className="text-[13px] font-medium text-white/40 mt-1">
                    A release stack designed for modern apps
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                </div>
              </div>

              <div className="space-y-4 py-6">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-3 sm:gap-0">
                    <div className="flex items-center gap-3.5">
                      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-2 sm:p-2.5 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        <GitBranch className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">new_checkout</p>
                        <p className="text-[12px] font-medium text-white/40 mt-0.5">
                          Roll out to a controlled slice
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      enabled
                    </span>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="mb-3 flex justify-between text-[13px] font-medium text-white/60">
                        <span>Rollout Progress</span>
                        <span className="text-cyan-300 font-bold">35%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "35%" }}
                          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] relative"
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <MiniCard icon={Users} label="Targeted users" value="beta_customers" />
                      <MiniCard icon={BarChart3} label="Evaluation" value="local SDK" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                  <p className="mb-3 text-[13px] font-semibold text-white/80 flex items-center gap-2">
                    <CodeIcon /> JavaScript-first DX
                  </p>
                  <CodeBlock className="my-0">
                    <Pre className="text-[13px] leading-relaxed text-cyan-200/90 bg-transparent p-4">
                      {`const flags = await createClient({
  apiUrl: "https://api.openflags.dev",
  project: "marketing-site",
  userId: "user_123",
})

if (flags.isEnabled("new_checkout")) {
  renderNewExperience()
}`}
                    </Pre>
                  </CodeBlock>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 pb-6 sm:px-10 lg:px-12 z-10 pt-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid gap-5 lg:grid-cols-3 w-full"
        >
          {featurePillars.map((item) => (
            <motion.div
              variants={fadeUp}
              key={item.title}
              className="group rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.04] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 p-4 text-violet-300 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-shadow">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">{item.title}</h2>
              <p className="text-[15px] leading-relaxed text-white/60 font-medium">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="relative mx-auto grid w-full max-w-7xl gap-5 px-6 py-10 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            Built for devs
          </div>
          <h2 className="mt-8 text-3xl font-bold text-white leading-snug">
            Developer ergonomics
            <br />
            that stay out of the way
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-white/60 font-medium">
            OpenFlags is shaped for the way modern teams already ship: typed SDKs, local evaluation,
            a simple REST surface, and a codebase you can run anywhere.
          </p>
          <div className="mt-10 space-y-4">
            {developerBenefits.map((item) => (
              <BenefitItem key={item}>{item}</BenefitItem>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-[2.5rem] border border-violet-500/20 bg-gradient-to-br from-[#09090b]/80 to-violet-950/20 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
          <div className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            Valuable for product
          </div>
          <h2 className="mt-8 text-3xl font-bold text-white leading-snug">
            Safer launches, smaller blast radius.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-white/70 font-medium relative z-10">
            Product teams get a release lever they can trust. Engineers keep ownership of
            implementation. Everyone gets a faster path from idea to rollout without depending on a
            heavy platform migration.
          </p>
          <div className="mt-10 space-y-4 relative z-10">
            {productBenefits.map((item) => (
              <BenefitItem key={item}>{item}</BenefitItem>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 pb-12 sm:px-10 lg:px-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid gap-8 rounded-[3rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

          <div className="relative z-10 my-auto">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-white/70">
              Open architecture
            </div>
            <h2 className="mt-8 text-4xl font-bold text-white leading-tight">
              Small moving parts,
              <br /> clear ownership
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-white/60 font-medium">
              Server, dashboard, SDKs, and docs each live in the monorepo with a focused role. That
              keeps contribution straightforward and lowers the cost of full ownership.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-1 relative z-10">
            <ArchitectureCard
              icon={Blocks}
              title="Control plane"
              description="A Bun-powered API for fast flag storage, accurate targeting, and safe rollout evaluations."
              gradient="from-cyan-500/10 to-blue-500/5"
            />
            <ArchitectureCard
              icon={Users}
              title="Dashboard"
              description="A dedicated admin UI built on React to let your team toggle releases confidently."
              gradient="from-violet-500/10 to-fuchsia-500/5"
            />
            <ArchitectureCard
              icon={CheckCircle2}
              title="SDK layer"
              description="Typescript packages that evaluate flags at zero latency and keep your app code simple."
              gradient="from-emerald-500/10 to-teal-500/5"
            />
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 pb-16 sm:px-10 lg:px-12 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[3rem] border border-violet-500/30 bg-gradient-to-br from-[#09090b] via-violet-950/20 to-cyan-950/20 p-6 sm:p-10 text-center lg:p-16 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_70%)]" />

          <div className="relative z-10">
            <p className="text-[13px] font-bold tracking-[0.24em] text-cyan-300 uppercase shadow-sm">
              Start with the fundamentals
            </p>
            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-white sm:text-5xl leading-tight">
              Launch the docs, onboard your team, and ship behind flags.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70 font-medium">
              The documentation is ready for product messaging, guides, and SDK usage. Customize it
              to your needs as OpenFlags grows.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-5">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-black transition-all hover:bg-cyan-50 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
              >
                Open documentation
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white transition-all hover:bg-white/10 hover:border-white/30 backdrop-blur-md hover:-translate-y-0.5 shadow-inner"
              >
                Jump to quickstart
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}

function BenefitItem({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-black/20 p-5 shadow-inner transition-colors hover:bg-black/30 group">
      <div className="rounded-full bg-emerald-500/10 p-1 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-shadow">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      </div>
      <p className="text-[14px] leading-relaxed text-white/80 font-medium pt-0.5">{children}</p>
    </div>
  )
}

function MiniCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="relative rounded-xl border border-white/5 bg-black/20 p-4 shadow-inner overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500/50 to-cyan-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="mb-2 flex items-center gap-2.5 text-white/50 pl-2">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-[13px] font-semibold text-white/90 pl-2">{value}</p>
    </div>
  )
}

function ArchitectureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: typeof Users
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="group rounded-[2rem] border border-white/5 bg-black/20 p-6 shadow-inner transition-all hover:bg-white/[0.03] flex gap-5 items-start">
      <div
        className={`shrink-0 inline-flex rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white border border-white/10 shadow-inner group-hover:scale-105 transition-transform`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-[14px] leading-relaxed text-white/60 font-medium">{description}</p>
      </div>
    </div>
  )
}

function FlagLogo() {
  return (
    <svg viewBox="0 0 32 32" className="h-[22px] w-[22px] fill-current" aria-hidden="true">
      <path d="M9 5.5a1.5 1.5 0 0 1 3 0v1.2h9.2c1.47 0 2.38 1.6 1.64 2.87l-2.7 4.63 2.7 4.63c.74 1.28-.17 2.87-1.64 2.87H12V26.5a1.5 1.5 0 0 1-3 0V5.5Z" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-current stroke-2 fill-none stroke-linecap-round stroke-linejoin-round"
      aria-hidden="true"
    >
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  )
}

