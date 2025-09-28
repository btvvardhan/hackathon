import { motion } from "framer-motion"

export default function Docs() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-emerald-950 text-white">
      {/* Hero */}
      <motion.header
        className="py-20 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-300 via-white to-emerald-400 bg-clip-text text-transparent">
          API Documentation
        </h1>
        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          The <span className="text-emerald-400 font-semibold">Query API</span> lets you ask natural
          language questions and get trusted, cited answers — all while enforcing clearance levels.
        </p>
      </motion.header>

      {/* Docs Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* POST /query */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-emerald-400">POST /query</h2>
          <p className="text-gray-400 text-lg">
            Submit a query and receive an AI-generated answer with citations, tailored to your
            user’s clearance level.
          </p>

          <h3 className="text-lg font-semibold text-white">Headers</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li><span className="text-emerald-400 font-medium">X-API-Key</span> — Your API key</li>
            <li><span className="text-emerald-400 font-medium">X-User-Email</span> — Identifies the user</li>
            <li><span className="text-emerald-400 font-medium">X-User-Domain</span> — Business unit / team</li>
            <li><span className="text-emerald-400 font-medium">X-User-Clearance</span> — Clearance level (0-4)</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6">Request Body</h3>
          <pre className="bg-black/60 border border-emerald-700 rounded-xl p-6 text-sm text-emerald-300 font-mono shadow-lg shadow-emerald-500/20 overflow-x-auto">
{`{
  "query": "What is the company reimbursement policy for travel?"
}`}
          </pre>

          <h3 className="text-lg font-semibold text-white mt-6">cURL Example</h3>
          <motion.pre
            className="bg-black/60 border border-emerald-700 rounded-xl p-6 text-sm text-emerald-300 font-mono shadow-lg shadow-emerald-500/20 overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
{`curl -X POST \\
  ${import.meta.env.VITE_API_BASE_URL}/query \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "X-User-Email: dev@example.com" \\
  -H "X-User-Domain: engineering" \\
  -H "X-User-Clearance: 2" \\
  -d '{"query": "What is the travel policy?"}'`}
          </motion.pre>

          <h3 className="text-lg font-semibold text-white mt-6">Response Example</h3>
          <motion.pre
            className="bg-black/60 border border-emerald-700 rounded-xl p-6 text-sm text-emerald-300 font-mono shadow-lg shadow-emerald-500/20 overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
{`{
  "answer": "Employees are reimbursed for economy travel expenses with manager approval.",
  "citations": [
    { "source": "travel_policy.pdf", "page": 3 },
    { "source": "finance_handbook.docx", "section": "2.1" }
  ]
}`}
          </motion.pre>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-400 border-t border-gray-800">
        © {new Date().getFullYear()} RAG Console · Built with ❤️ at Hackathon
      </footer>
    </div>
  )
}
