import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { runQuery } from "@/lib/api"

export default function App() {
  const [apiKey, setApiKey] = useState("")
  const [userEmail, setUserEmail] = useState("dev@example.com")
  const [userDomain, setUserDomain] = useState("engineering")
  const [userClearance, setUserClearance] = useState(2)
  const [query, setQuery] = useState("what is the company reimbursement policy for travel?")
  const [answer, setAnswer] = useState("")
  const [citations, setCitations] = useState<any[]>([])

  async function ask() {
    setAnswer("")
    setCitations([])
    try {
      const res = await runQuery(
        { apiKey, userEmail, userDomain, userClearance },
        query
      )
      setAnswer(res.answer)
      setCitations(res.citations ?? [])
    } catch (e: any) {
      setAnswer("Error: " + e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900">
      {/* Hero Section */}
      <header className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          RAG Console
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          A sleek interface to query your enterprise knowledge base
        </p>
      </header>

      {/* Main Container */}
      <main className="container mx-auto max-w-4xl px-6 space-y-8">
        {/* API Setup */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Setup Headers</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="X-API-Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Input
              placeholder="X-User-Email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <Input
              placeholder="X-User-Domain"
              value={userDomain}
              onChange={(e) => setUserDomain(e.target.value)}
            />
            <Input
              placeholder="X-User-Clearance"
              type="number"
              value={userClearance}
              onChange={(e) => setUserClearance(Number(e.target.value))}
            />
          </CardContent>
        </Card>

        {/* Query Console */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Ask a Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-end">
              <Button onClick={ask} className="px-6">
                Ask
              </Button>
            </div>

            {answer && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-800">Answer</h3>
                <p className="mt-2 p-4 bg-gray-50 rounded-lg border text-gray-700 leading-relaxed">
                  {answer}
                </p>
                {citations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Citations</h4>
                    <div className="p-3 rounded-lg bg-gray-50 border overflow-x-auto text-xs text-gray-600">
                      <pre>{JSON.stringify(citations, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} RAG Console · Built with ❤️ for modern enterprises
      </footer>
    </div>
  )
}
