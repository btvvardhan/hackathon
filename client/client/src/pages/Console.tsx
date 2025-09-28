import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

export default function Console() {
  const [apiKey, setApiKey] = useState("")
  const [userEmail, setUserEmail] = useState("dev@example.com")
  const [userDomain, setUserDomain] = useState("engineering")
  const [userClearance, setUserClearance] = useState(2)
  const [query, setQuery] = useState("What is the company reimbursement policy for travel?")
  const [answer, setAnswer] = useState("")
  const [citations, setCitations] = useState<any[]>([])
  const [history, setHistory] = useState<{ q: string; a: string }[]>([])

  // Replace with your backend base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rag-api-589329822647.us-central1.run.app"

  async function ask() {
    setAnswer("")
    setCitations([])
    try {
      const res = await fetch(`${API_BASE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "X-User-Email": userEmail,
          "X-User-Domain": userDomain,
          "X-User-Clearance": String(userClearance),
        },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)

      const data = await res.json()
      setAnswer(data.answer || "No answer returned.")
      setCitations(data.citations ?? [])
      setHistory([{ q: query, a: data.answer || "" }, ...history])
    } catch (e: any) {
      setAnswer("Error: " + e.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-emerald-950 text-white">
      {/* Nav */}
      <motion.nav
        className="bg-black/60 backdrop-blur-md border-b border-emerald-800 sticky top-0 z-50"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 70 }}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            RAG Console
          </Link>
          <Link to="/" className="text-sm text-gray-400 hover:text-emerald-400 transition">
            Back to Landing
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <header className="py-20 border-b border-emerald-900 text-center">
        <motion.h1
          className="text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          RAG Console
        </motion.h1>
        <motion.p
          className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Query your enterprise knowledge base securely. Provide headers, ask a question, and get verified answers with citations.
        </motion.p>
      </header>

      {/* Main */}
      <main className="container mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-3 gap-12 flex-grow">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-12">
          {/* Setup Headers */}
          <Card className="bg-gray-900/60 border border-emerald-800 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-emerald-400">Setup Headers</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Input className="bg-black/40 text-white border-gray-700" placeholder="X-API-Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <Input className="bg-black/40 text-white border-gray-700" placeholder="X-User-Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
              <Input className="bg-black/40 text-white border-gray-700" placeholder="X-User-Domain" value={userDomain} onChange={(e) => setUserDomain(e.target.value)} />
              <Input className="bg-black/40 text-white border-gray-700" placeholder="X-User-Clearance" type="number" value={userClearance} onChange={(e) => setUserClearance(Number(e.target.value))} />
            </CardContent>
          </Card>

          {/* Query Box */}
          <Card className="bg-gray-900/60 border border-emerald-800 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-emerald-400">Ask a Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[120px] bg-black/40 text-white border-gray-700"
              />
              <div className="flex justify-end">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Button
                    onClick={ask}
                    className="px-8 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-semibold hover:opacity-90 shadow-lg shadow-emerald-500/30"
                  >
                    Ask
                  </Button>
                </motion.div>
              </div>

              <AnimatePresence>
                {answer && (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 space-y-4"
                  >
                    <div className="p-6 bg-black/40 border border-emerald-800 rounded-xl">
                      <h3 className="font-medium text-emerald-300">Answer</h3>
                      <p className="mt-3 text-lg leading-relaxed text-gray-200">{answer}</p>
                    </div>
                    {citations.length > 0 && (
                      <div className="p-6 bg-gray-800/50 border border-emerald-700 rounded-xl">
                        <h4 className="text-sm font-semibold text-emerald-400 mb-2">Citations</h4>
                        <pre className="overflow-x-auto text-xs text-gray-400">
                          {JSON.stringify(citations, null, 2)}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-12">
          {/* Example Queries */}
          <Card className="bg-gray-900/60 border border-emerald-800 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-emerald-400">Example Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
              {["What is the leave policy?", "How do I file an expense report?", "Who approves travel requests?"].map((ex, i) => (
                <motion.p
                  key={i}
                  whileHover={{ scale: 1.05, color: "#34d399" }}
                  className="cursor-pointer"
                  onClick={() => setQuery(ex)}
                >
                  • {ex}
                </motion.p>
              ))}
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card className="bg-gray-900/60 border border-emerald-800 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-emerald-400">Recent Queries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {history.slice(0, 5).map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="p-3 rounded-lg bg-black/40 border border-emerald-700"
                  >
                    <p className="text-sm text-gray-200">
                      <span className="font-medium text-emerald-300">Q:</span> {h.q}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="font-medium text-emerald-300">A:</span> {h.a}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <motion.footer
        className="py-12 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl font-bold">Ready to bring RAG to your team?</h2>
        <p className="mt-2 text-emerald-100">Try the console and see knowledge retrieval reimagined.</p>
        <div className="mt-6">
          <Link to="/">
            <Button className="px-10 py-6 text-lg bg-black text-emerald-400 border-2 border-emerald-400 hover:bg-emerald-400 hover:text-black transition">
              Back to Landing
            </Button>
          </Link>
        </div>
      </motion.footer>
    </div>
  )
}
