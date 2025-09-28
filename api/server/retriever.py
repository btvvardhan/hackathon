# api/server/retriever.py  (cloud-only, no local JSON)
import os, json
from typing import Any, Dict, List, Optional

from vertexai import init as vertex_init
from vertexai.language_models import TextEmbeddingModel, TextEmbeddingInput
from google.cloud import aiplatform_v1

# --- Config (env overridable) ---
PROJECT = os.getenv("GCP_PROJECT", "589329822647")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-004")

API_ENDPOINT = os.getenv("ME_API_HOST", "257828499.us-central1-589329822647.vdb.vertexai.goog")
INDEX_ENDPOINT = os.getenv("ME_INDEX_ENDPOINT", "projects/589329822647/locations/us-central1/indexEndpoints/1398598581740371968")
DEPLOYED_ID   = os.getenv("ME_DEPLOYED_INDEX_ID", "sunhack_deploy_1759016114032")

# --- Init once ---
vertex_init(project=PROJECT, location=LOCATION)
_embed_model = TextEmbeddingModel.from_pretrained(EMBED_MODEL)
_client = aiplatform_v1.MatchServiceClient(client_options={"api_endpoint": API_ENDPOINT})

def embed_query(text: str) -> List[float]:
    # Use RETRIEVAL_QUERY for queries (doc vectors used RETRIEVAL_DOCUMENT at upsert)
    return _embed_model.get_embeddings([TextEmbeddingInput(text, "RETRIEVAL_QUERY")])[0].values

def _neighbor_id(n) -> Optional[str]:
    # Works across shapes
    if getattr(n, "id", None): return n.id
    if getattr(n, "entity_id", None): return n.entity_id
    dp = getattr(n, "datapoint", None)
    if dp:
        if getattr(dp, "datapoint_id", None): return dp.datapoint_id
        if getattr(dp, "entity_id", None):    return dp.entity_id
    return None

def _meta_from_neighbor(n):
    import json
    dp = getattr(n, "datapoint", None)
    if not dp:
        return {}

    # ✅ Prefer restricts (robust)
    # In python proto, it's 'allow_list' (snake_case)
    for r in getattr(dp, "restricts", []) or []:
        ns = getattr(r, "namespace", None)
        allow = getattr(r, "allow_list", None)
        if ns == "meta" and allow:
            try:
                first = allow[0]
                if isinstance(first, bytes):
                    first = first.decode("utf-8", errors="ignore")
                if isinstance(first, str):
                    return json.loads(first)
            except Exception:
                pass

    # Fallback (often numeric in your env)
    ct = getattr(dp, "crowding_tag", None)
    ca = getattr(ct, "crowding_attribute", None) if ct else None
    if isinstance(ca, str):
        try:
            return json.loads(ca)
        except Exception:
            pass

    return {}



# def _meta_from_neighbor(n):
#     # Prefer restricts (robust across shapes)
#     dp = getattr(n, "datapoint", None)
#     if not dp:
#         return {}
#     # dp.restricts is a repeated field of IndexDatapoint.Restricts
#     for r in getattr(dp, "restricts", []) or []:
#         # Try common fields across proto shapes
#         val = getattr(r, "value", None) or getattr(r, "string_value", None) or getattr(r, "stringValue", None)
#         if isinstance(val, str) and r.namespace == "meta":
#             try:
#                 return json.loads(val)
#             except Exception:
#                 pass

#     # Fallback: crowding_tag (often unreliable)
#     ct = getattr(dp, "crowding_tag", None)
#     ca = getattr(ct, "crowding_attribute", None) if ct else None
#     if isinstance(ca, str):
#         try:
#             return json.loads(ca)
#         except Exception:
#             pass

#     return {}



def search(q: str, domain: str, clearance: int, k: int = 8) -> List[Dict[str, Any]]:
    # 1) Embed
    vec = embed_query(q)

    # 2) Retrieve with full datapoints so we can parse metadata directly
   


    req = aiplatform_v1.FindNeighborsRequest(
        index_endpoint=INDEX_ENDPOINT,
        deployed_index_id=DEPLOYED_INDEX_ID,
        queries=[aiplatform_v1.FindNeighborsRequest.Query(
            datapoint=aiplatform_v1.IndexDatapoint(feature_vector=qvec),
            neighbor_count=10
        )],
        return_full_datapoint=True,   # <-- make sure this is True
    )



    resp = _client.find_neighbors(req)
    neighbors = list(resp.nearest_neighbors[0].neighbors or []) if resp.nearest_neighbors else []

    # 3) Build items from metadata on the datapoint itself
    items: List[Dict[str, Any]] = []
    for n in neighbors:
        meta = _meta_from_neighbor(n)
        dp_id = _neighbor_id(n)

        # normalize clearance
        cm = meta.get("clearance_min")
        try:
            cm_int = int(cm) if cm is not None else 0
        except Exception:
            cm_int = 0

        items.append({
            "text": meta.get("chunk") or f"(no-chunk) id={dp_id}",
            "doc_id": meta.get("doc_id"),
            "section": meta.get("section"),
            "domain_meta": meta.get("domain"),
            "clearance_min": cm_int,
            "datapoint_id": dp_id,
            "distance": n.distance,
        })

    # 4) Domain + clearance filter (your original behavior)
    same = [it for it in items if it.get("domain_meta") == domain and it["clearance_min"] <= int(clearance)]
    return same if same else [it for it in items if it["clearance_min"] <= int(clearance)]

def inspect_neighbors(q: str, k: int = 5) -> Dict[str, Any]:
    vec = embed_query(q)
    req = aiplatform_v1.FindNeighborsRequest(
        index_endpoint=INDEX_ENDPOINT,
        deployed_index_id=DEPLOYED_ID,
        queries=[aiplatform_v1.FindNeighborsRequest.Query(
            datapoint=aiplatform_v1.IndexDatapoint(feature_vector=vec),
            neighbor_count=k
        )],
        return_full_datapoint=True,
    )
    resp = _client.find_neighbors(req)
    neighbors = list(resp.nearest_neighbors[0].neighbors or []) if resp.nearest_neighbors else []
    out = []
    for n in neighbors:
        out.append({
            "id": _neighbor_id(n),
            "distance": n.distance,
            "meta": _meta_from_neighbor(n),  # ← shows chunk/doc/section directly
        })
    return {"neighbors": out}
