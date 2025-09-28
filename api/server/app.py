# api/server/app.py
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig


from fastapi import Query, Depends
from auth import dev_auth
from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel




# DEV auth (swap to verify_cf_access_jwt later)
from auth import dev_auth
# Retriever returns list of {text, doc_id, section, distance, clearance_min, ...}
from retriever import search
# Tiny router that picks model/params
from planner import pick_model

# --- Vertex AI init (same project/region you used everywhere) ---
vertexai.init(project="teja-sunhack", location="us-central1")

app = FastAPI(title="org-rag", version="0.1.0")

class QueryIn(BaseModel):
    query: str

def build_prompt(chunks: List[Dict[str, Any]], user_domain: str, q: str) -> str:
    """
    Make a small, focused context. Cite as [#] using the order we pass in.
    """
    if not chunks:
        context = "(no domain-approved documents were retrieved)"
    else:
        # keep up to 6 snippets
        trimmed = []
        for c in chunks[:6]:
            t = (c.get("text") or "").strip()
            # soft trim super long chunks
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

@app.post("/query")
def query(body: QueryIn, user=Depends(dev_auth)):
    q = body.query.strip()
    if not q:
        return {"answer": "Please provide a question.", "citations": [], "route": {}, "domain": user["domain"], "clearance": user["clearance"]}

    # 1) Retrieve filtered chunks (your retriever already enforces domain+clearance in app code)
    chunks = search(q, user["domain"], user["clearance"], k=8)

    # 2) Planner decides model/params
    route = pick_model(user["domain"], q)
    model_id = route.get("model_id", "gemini-2.5-flash")
    temperature = float(route.get("temperature", 0.2))
    max_tokens = int(route.get("max_output_tokens", 1024))

    # 3) Build the prompt and call Gemini
    prompt = build_prompt(chunks, user["domain"], q)
    model = GenerativeModel(model_id)
    cfg = GenerationConfig(temperature=temperature, max_output_tokens=max_tokens)

    resp = model.generate_content(prompt, generation_config=cfg)
    text = resp.candidates[0].content.parts[0].text if resp and resp.candidates else "I couldn't generate a response."

    # 4) Return answer + simple citations (doc_id + section)
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
        "clearance": user["clearance"]
    }



############


@app.get("/debug/retrieval")
def debug_retrieval(
    q: str = Query(..., description="query"),
    domain: str = Query("finance"),
    clr: int = Query(2),
    user=Depends(dev_auth),
):
    items = search(q, domain, clr, k=8)
    return {"count": len(items), "items": items}

@app.get("/debug/retrieval_raw")
def debug_retrieval_raw(
    q: str = Query(..., description="query"),
    user=Depends(dev_auth),
):
    try:
        emb = TextEmbeddingModel.from_pretrained("text-embedding-004")
        vec = emb.get_embeddings([TextEmbeddingInput(q, "RETRIEVAL_QUERY")])[0].values




        vs = aiplatform.MatchingEngineIndexEndpoint(VS_ENDPOINT)
        resp = vs.find_neighbors(
            deployed_index_id=DEPLOYED_ID,
            queries=[vec],
            num_neighbors=8,
            return_full_datapoint=True,   # <<< IMPORTANT
        )
        neighs = _neighbors_from_resp(resp)

        out = []
        for n in neighs[:5]:
            dp = getattr(n, "datapoint", None)
            ct = getattr(dp, "crowding_tag", None) if dp else None
            ca = getattr(ct, "crowding_attribute", None) if ct else None
            out.append({
                "datapoint_id": getattr(dp, "datapoint_id", None) or getattr(n, "entity_id", None),
                "distance": getattr(n, "distance", None),
                "has_crowding_tag": bool(ct),
                "crowding_attribute": ca,  # should be your JSON string
            })
        return {"ok": True, "neighbors": out}



    except Exception as e:
        return {"ok": False, "error": f"{e.__class__.__name__}: {e}"}



############
from fastapi import FastAPI, Query
from retriever import inspect_neighbors

app = FastAPI()

@app.get("/debug/raw_chunks")
def raw_chunks(q: str = Query(...), k: int = Query(5)):
    return inspect_neighbors(q, k=k)


