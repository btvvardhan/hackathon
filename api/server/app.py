# api/server/app.py
from typing import List, Dict, Any, Optional

import os
import vertexai
from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from vertexai.generative_models import GenerativeModel, GenerationConfig

from auth import dev_auth
from retriever import search, inspect_neighbors
from planner import pick_model

# ---- Vertex init (project/region) ----
vertexai.init(project=os.getenv("GCP_PROJECT", "teja-sunhack"),
              location=os.getenv("GCP_LOCATION", "us-central1"))

app = FastAPI(title="org-rag", version="0.1.0")

# ---- CORS (so a simple static page can call the API) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryIn(BaseModel):
    query: str

def build_prompt(chunks: List[Dict[str, Any]], user_domain: str, q: str) -> str:
    if not chunks:
        context = "(no domain-approved documents were retrieved)"
    else:
        trimmed = []
        for c in chunks[:6]:
            t = (c.get("text") or "").strip()
            if len(t) > 1500:
                t = t[:1500] + " …"
            trimmed.append(t)
        context = "\n\n".join(f"[{i+1}] {t}" for i, t in enumerate(trimmed))

    return f"""You are the {user_domain} domain assistant for an internal org.
Use ONLY the provided context when possible. If the answer isn't in the context, say you don't have that information.
Cite sources as [#] where # is the chunk index.

Context:
{context}

User question: {q}

Answer with clear, concise steps and include citations."""

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/debug/raw_chunks")
def raw_chunks(q: str = Query(...), k: int = Query(5), user=Depends(dev_auth)):
    # dev_auth keeps this behind your header/API key guard
    return inspect_neighbors(q, k=k)

@app.post("/query")
def query(body: QueryIn, user=Depends(dev_auth)):
    q = body.query.strip()
    if not q:
        return {
            "answer": "Please provide a question.",
            "citations": [],
            "route": {},
            "domain": user["domain"],
            "clearance": user["clearance"],
        }

    # 1) Retrieve filtered chunks (domain + clearance enforced inside retriever)
    chunks = search(q, user["domain"], user["clearance"], k=8)

    # 2) Tiny planner picks model/params
    route = pick_model(user["domain"], q)
    model_id = route.get("model_id", "gemini-2.5-pro")
    temperature = float(route.get("temperature", 0.2))
    max_tokens = int(route.get("max_output_tokens", 1536))

    # 3) LLM call
    prompt = build_prompt(chunks, user["domain"], q)
    model = GenerativeModel(model_id)
    cfg = GenerationConfig(temperature=temperature, max_output_tokens=max_tokens)
    resp = model.generate_content(prompt, generation_config=cfg)
    text = resp.candidates[0].content.parts[0].text if resp and resp.candidates else "I couldn't generate a response."

    # 4) Simple citations
    citations = []
    for i, c in enumerate(chunks[:6], start=1):
        citations.append({
            "index": i,
            "doc_id": c.get("doc_id"),
            "section": c.get("section"),
            "distance": c.get("distance"),
        })

    return {
        "answer": text,
        "citations": citations,
        "route": {"model_id": model_id, "temperature": temperature, "max_output_tokens": max_tokens},
        "domain": user["domain"],
        "clearance": user["clearance"],
    }

# Tiny demo page
@app.get("/", response_class=HTMLResponse)
def home():
    return """
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Org RAG</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: system-ui, Arial; margin: 2rem; max-width: 720px }
    label { display:block; margin-top: 1rem; font-weight: 600 }
    input, select, textarea { width: 100%; padding: .6rem; margin-top:.3rem }
    button { margin-top: 1rem; padding:.7rem 1rem; cursor:pointer }
    .answer { margin-top: 1.5rem; white-space: pre-wrap; background:#f8f8fa; padding:1rem; border-radius:.5rem }
  </style>
</head>
<body>
  <h1>Org RAG</h1>
  <p>Ask a question. Domain & clearance are sent as headers.</p>
  <label>Query</label>
  <input id="q" placeholder="What is our travel reimbursement policy?" />
  <label>Domain</label>
  <select id="domain">
    <option>finance</option><option>hr</option><option>engineering</option>
  </select>
  <label>Clearance (int)</label>
  <input id="clr" type="number" value="2" />
  <button onclick="send()">Ask</button>
  <div id="out" class="answer" style="display:none"></div>
<script>
async function send() {
  const q = document.getElementById('q').value.trim();
  const domain = document.getElementById('domain').value.trim();
  const clr = document.getElementById('clr').value.trim();
  const out = document.getElementById('out');
  out.style.display='block';
  out.textContent = 'Asking...';
  const resp = await fetch('/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': '123456789',
      'X-User-Email': 'alice@company.com',
      'X-User-Domain': domain,
      'X-User-Clearance': clr
    },
    body: JSON.stringify({ query: q })
  });
  const data = await resp.json();
  let txt = data.answer ? data.answer + "\\n\\n" : JSON.stringify(data, null, 2);
  if (data.citations?.length) {
    txt += '— Citations —\\n';
    for (const c of data.citations) {
      txt += `[#${c.index}] ${c.doc_id || '-'} ${c.section || ''} (dist=${c.distance?.toFixed?.(3)})\\n`;
    }
  }
  out.textContent = txt;
}
</script>
</body>
</html>
"""
