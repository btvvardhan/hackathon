const BASE = import.meta.env.VITE_API_BASE_URL ?? "https://rag-api-589329822647.us-central1.run.app"

export async function runQuery(
  headers: {
    apiKey: string
    userEmail: string
    userDomain: string
    userClearance: number
  },
  query: string
) {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": headers.apiKey,
      "X-User-Email": headers.userEmail,
      "X-User-Domain": headers.userDomain,
      "X-User-Clearance": String(headers.userClearance),
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    throw new Error(`Query failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

export async function fetchRawChunks(q: string, k = 5) {
  const url = new URL(`${BASE}/debug/raw_chunks_get`)
  url.searchParams.set("q", q)
  url.searchParams.set("k", String(k))

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Debug failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}
