# api/server/planner_slm.py
import json
from typing import Dict, Any
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
from pydantic import BaseModel, Field, ValidationError

# Init Vertex (same project/region you use elsewhere)
vertexai.init(project="teja-sunhack", location="us-central1")

# Use a small/cheap planner model
#PLANNER_MODEL_ID = "gemini-2.5-flash"
PLANNER_MODEL_ID = "gemma-2-2b-it"  # even cheaper, still capable

# Registry of domain ➜ target SLM (you can expand this easily)
DOMAIN_REGISTRY = {
    # domain            target model id          default params
    "finance":  {"model_id": "gemini-2.5-pro",   "temperature": 0.2, "max_output_tokens": 1536},
    "hr":       {"model_id": "gemini-2.5-flash", "temperature": 0.2, "max_output_tokens": 1024},
    "legal":    {"model_id": "gemini-2.5-pro",   "temperature": 0.2, "max_output_tokens": 1536},
    "general":  {"model_id": "gemini-2.5-flash", "temperature": 0.2, "max_output_tokens": 1024},
    "engineering": {"model_id": "gemini-2.5-pro", "temperature": 0.2, "max_output_tokens": 1536},
}

class Route(BaseModel):
    domain: str = Field(..., description="Resolved domain key in lower case")
    model_id: str = Field(..., description="Gemini model id to call for answering")
    temperature: float = 0.2
    max_output_tokens: int = 1024
    rationale: str = Field(..., description="1-2 sentence reason for this routing decision")

_SYS = """You are a tiny routing planner.
Decide which domain and target model should answer the user's question.

Rules:
- Output ONLY JSON (no prose).
- If the domain_hint is present, prefer it unless the question clearly belongs elsewhere.
- Map to these domains: finance, hr, legal, engineering, general.
- Choose the least expensive model that can answer safely; escalate to 'gemini-2.5-pro' only for finance/legal/complex analytical queries.
- Keep rationale short (<= 2 sentences).
"""

# In new Vertex SDKs you can force JSON by setting response_mime_type='application/json'
def _llm_plan(query: str, domain_hint: str) -> Dict[str, Any]:
    model = GenerativeModel(PLANNER_MODEL_ID)
    plan_prompt = {
        "query": query.strip(),
        "domain_hint": (domain_hint or "").lower(),
        "domains_available": list(DOMAIN_REGISTRY.keys()),
        "registry_defaults": DOMAIN_REGISTRY,
    }
    cfg = GenerationConfig(temperature=0.1, max_output_tokens=256, response_mime_type="application/json")
    resp = model.generate_content(
        [{"role": "user", "parts": [{"text": _SYS}, {"text": json.dumps(plan_prompt)}]}],
        generation_config=cfg,
    )
    # Pull raw text (should be JSON)
    text = resp.candidates[0].content.parts[0].text if resp and resp.candidates else "{}"
    return json.loads(text)

def _fallback_route(domain_hint: str, query: str) -> Route:
    dh = (domain_hint or "general").lower()
    if dh not in DOMAIN_REGISTRY:
        # tiny heuristic if hint is missing/unknown
        if any(k in query.lower() for k in ("invoice", "budget", "expense", "reimbursement", "p&l", "financial")):
            dh = "finance"
        elif any(k in query.lower() for k in ("benefits", "leave", "vacation", "hiring", "offer", "onboarding", "i-9")):
            dh = "hr"
        elif any(k in query.lower() for k in ("contract", "nda", "compliance", "policy exception", "regulation", "gdpr")):
            dh = "legal"
        elif any(k in query.lower() for k in ("api", "deploy", "kubernetes", "service", "error", "stacktrace")):
            dh = "engineering"
        else:
            dh = "general"
    base = DOMAIN_REGISTRY[dh].copy()
    return Route(domain=dh, rationale="Fallback deterministic routing.", **base)

def pick_model(domain_hint: str, query: str) -> Dict[str, Any]:
    """
    LLM-driven planner that returns a dict:
      { model_id, temperature, max_output_tokens, domain, rationale }
    Robust to planner failures (validates JSON, falls back deterministically).
    """
    try:
        raw = _llm_plan(query, domain_hint)
        # Normalize with registry defaults and validate
        dh = (raw.get("domain") or domain_hint or "general").lower()
        if dh not in DOMAIN_REGISTRY:
            dh = "general"
        base = DOMAIN_REGISTRY[dh].copy()
        route = Route(
            domain=dh,
            model_id=raw.get("model_id", base["model_id"]),
            temperature=float(raw.get("temperature", base["temperature"])),
            max_output_tokens=int(raw.get("max_output_tokens", base["max_output_tokens"])),
            rationale=raw.get("rationale", "Planner routed using query semantics."),
        )
        return route.model_dump()
    except (ValidationError, Exception):
        # Any parse or call error → deterministic fallback
        return _fallback_route(domain_hint, query).model_dump()
