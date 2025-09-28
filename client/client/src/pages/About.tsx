import { motion } from "framer-motion"
import { Shield, Zap, Database } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-emerald-950 text-white">
      {/* Hero */}
      <header className="relative py-32 text-center overflow-hidden">
        {/* Animated glow background */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              "radial-gradient(circle at 30% 20%, rgba(34,197,94,0.25), transparent 70%)",
              "radial-gradient(circle at 70% 80%, rgba(20,184,166,0.25), transparent 70%)",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-white to-emerald-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          About RAG Console
        </motion.h1>
        <motion.p
          className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Born at a hackathon. Built for the enterprise. Designed to redefine how knowledge is
          accessed with <span className="text-emerald-400 font-semibold">speed</span>,{" "}
          <span className="text-emerald-400 font-semibold">security</span>, and{" "}
          <span className="text-emerald-400 font-semibold">trust</span>.
        </motion.p>
      </header>

      {/* Story Timeline */}
      <section className="py-28 container mx-auto max-w-6xl px-6 space-y-20">
        {[
          {
            title: "The Frustration",
            text: "Our team was tired of searching endlessly through docs and wikis. Information was fragmented, slow, and insecure.",
            icon: Shield,
          },
          {
            title: "The Breakthrough",
            text: "We realized that Small Language Models (SLMs) could be just as powerful as LLMs — but faster, lighter, and cheaper.",
            icon: Zap,
          },
          {
            title: "The Build",
            text: "In one sleepless hackathon sprint, we engineered RAG Console: a system with clearance levels, citations, and blazing-fast answers.",
            icon: Database,
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <div className={`order-${i % 2 === 0 ? "1" : "2"}`}>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                {item.title}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">{item.text}</p>
            </div>
            <motion.div
              className="order-2 flex justify-center items-center h-64 rounded-2xl bg-black/40 border border-emerald-800"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <item.icon className="w-24 h-24 text-emerald-400" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        ))}
      </section>

      {/* Mission Highlight */}
      <motion.section
        className="py-32 text-center border-t border-emerald-800 bg-black/40"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent mb-8">
          Our Mission
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          We believe enterprise AI doesn’t need to be bloated to be powerful. We’re proving
          that <span className="text-emerald-400 font-semibold">small is mighty</span> —
          delivering security, efficiency, and trust without compromise.
        </p>
      </motion.section>

      {/* Philosophy */}
      <motion.section
        className="py-32 text-center border-t border-emerald-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto max-w-4xl px-6">
          <motion.h2
            className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            Philosophy: Small is the New Big
          </motion.h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Small Language Models are efficient, controllable, and sustainable. We’re pushing
            the boundaries of what’s possible — because intelligence doesn’t need to be
            oversized to make an oversized impact.
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 text-center text-sm text-gray-400 bg-black border-t border-emerald-800">
        © {new Date().getFullYear()} RAG Console · Built with 🚀 energy at Hackathon
      </footer>
    </div>
  )
}
