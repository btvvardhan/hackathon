import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Pricing() {
  const plans = [
    { tier: "Starter", price: "$0", desc: "Perfect for individuals exploring RAG Console." },
    { tier: "Pro", price: "$29/mo", desc: "Ideal for small teams needing fast, secure knowledge retrieval." },
    { tier: "Enterprise", price: "Contact us", desc: "Custom integrations, priority support, and enterprise-grade scaling." },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-emerald-950 text-white">
      {/* Hero */}
      <motion.section
        className="py-28 text-center border-b border-emerald-800"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-emerald-300 via-white to-emerald-400 bg-clip-text text-transparent">
            Pricing
          </h1>
          <p className="text-xl text-gray-300">
            Simple, transparent pricing. Choose the plan that fits your team.
          </p>
        </div>
      </motion.section>

      {/* Plans */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {plans.map((p, i) => (
            <motion.div
              key={p.tier}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className={`rounded-2xl shadow-lg border ${
                  p.tier === "Pro"
                    ? "border-emerald-500 shadow-emerald-500/30"
                    : "border-gray-800"
                } hover:scale-105 hover:shadow-emerald-400/20 transition`}
              >
                <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                  <h2
                    className={`text-3xl font-bold ${
                      p.tier === "Pro" ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {p.tier}
                  </h2>
                  <p className="text-gray-400 text-lg">{p.desc}</p>
                  <p
                    className={`text-4xl font-extrabold ${
                      p.tier === "Pro" ? "text-emerald-400" : "text-emerald-300"
                    }`}
                  >
                    {p.price}
                  </p>
                  <Button
                    className={`mt-4 w-full ${
                      p.tier === "Enterprise"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-90"
                        : "bg-emerald-500 text-black hover:bg-emerald-400"
                    }`}
                  >
                    {p.tier === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        className="py-28 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl font-extrabold">Ready to get started?</h2>
        <p className="mt-4 text-xl text-emerald-100">
          Empower your team with fast, secure, and trusted AI answers.
        </p>
        <motion.div
          className="mt-8"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Button className="px-10 py-7 text-lg bg-black text-emerald-400 border-2 border-emerald-400 hover:bg-emerald-400 hover:text-black transition">
            Launch Console
          </Button>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 bg-black border-t border-emerald-700">
        © {new Date().getFullYear()} RAG Console · Built with 🚀 at Hackathon
      </footer>
    </div>
  )
}
