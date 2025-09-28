import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

const modelCostData = [
  { model: "Gemma (v5e-8, est.)", cost: 0.5 },
  { model: "Gemini 2.5 Pro (≤200k)", cost: 10 },
  { model: "Gemini 1.5 Pro (≤128k)", cost: 5 },
  { model: "Gemini 1.5 Flash (≤128k)", cost: 0.3 },
  { model: "Gemini 2.0 Flash-Lite", cost: 0.3 },
]

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-emerald-950 text-white">
      {/* Navbar */}
      <motion.nav
        className="w-full sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-emerald-700/30"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
      >
        <div className="container mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            RAG Console
          </span>
          <div className="flex items-center gap-6 text-sm text-gray-300">
            <Link to="/about" className="hover:text-emerald-400">About</Link>
            <Link to="/pricing" className="hover:text-emerald-400">Pricing</Link>
            <Link to="/docs" className="hover:text-emerald-400">Docs</Link>
            <Link to="/contact" className="hover:text-emerald-400">Contact</Link>
          </div>
          <Link to="/console">
            <Button
              size="sm"
              className="relative overflow-hidden px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
            >
              <span className="relative z-10">Launch Console</span>
              <span className="absolute inset-0 animate-pulse bg-emerald-400/30 blur-xl" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <header className="py-32 text-center">
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 1 }}
        >
          Smarter. Faster. Lighter.
        </motion.h1>
        <motion.p
          className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Enterprise knowledge retrieval powered by{" "}
          <span className="font-semibold text-emerald-400">Small Language Models</span> — 
          built to crush latency and costs.
        </motion.p>
        <motion.div
          className="mt-10 flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-90 shadow-lg shadow-emerald-500/30">
            Try Console
          </Button>
          <Button variant="outline" className="px-10 py-6 text-lg border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black">
            Read Docs
          </Button>
        </motion.div>
      </header>

      {/* Section 1 */}
      <motion.section
        className="py-28 border-t border-emerald-900/40"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-emerald-400">Security without compromise</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Every query enforces your org’s clearance levels. 
              Zero trust, maximum compliance.
            </p>
          </div>
          <motion.div
            className="h-64 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-28 h-28 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.7)]" />
          </motion.div>
        </div>
      </motion.section>

      {/* Section 2 with Chart */}
      <motion.section
        className="py-28 border-t border-emerald-900/40 bg-gradient-to-b from-gray-900 to-black"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-emerald-400">Efficiency proven in numbers</h2>
            <p className="text-lg text-gray-300 mb-8">
              SLMs slash cost per million tokens. The future isn’t just smarter, it’s cheaper.
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelCostData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="model" tick={{ fontSize: 12, fill: "white" }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fill: "white" }} />
                  <Tooltip cursor={{ fill: "rgba(16,185,129,0.1)" }} />
                  <Bar dataKey="cost" fill="#34d399" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-gray-400 italic max-w-sm">
              “Gemma delivers LLM-grade intelligence at a fraction of the cost.”
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 3 */}
      <motion.section
        className="py-28 border-t border-emerald-900/40"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-emerald-400">Designed for speed</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Lightweight models respond in milliseconds, not seconds.
              Productivity unlocked.
            </p>
          </div>
          <motion.div
            className="h-64 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-28 h-28 text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.8)]" />
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="py-28 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 text-white text-center"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold">Experience the future of knowledge retrieval</h2>
        <p className="mt-4 text-xl text-emerald-100">Onboard your team today with RAG Console.</p>
        <div className="mt-8">
          <Link to="/console">
            <Button className="relative px-12 py-7 text-lg bg-black text-emerald-400 border-2 border-emerald-400 rounded-xl hover:bg-emerald-400 hover:text-black transition">
              Open Console
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 bg-black border-t border-emerald-900/40">
        © {new Date().getFullYear()} RAG Console · Built with 💸 in Silicon Valley
      </footer>
    </div>
  )
}
