# api/server/seed_vectors.py  — minimal, works on Tree-AH
import json
import requests
import google.auth
from google.auth.transport.requests import Request
import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

PROJECT = "teja-sunhack"
LOCATION = "us-central1"
INDEX_ID = "3872376598934061056"  # your index id
INDEX_NAME = f"projects/{PROJECT}/locations/{LOCATION}/indexes/{INDEX_ID}"
EMBED_MODEL = "text-embedding-004"

# auth
SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]
creds, _ = google.auth.default(scopes=SCOPES)
creds.refresh(Request())
HEADERS = {"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"}

vertexai.init(project=PROJECT, location=LOCATION)
embed_model = TextEmbeddingModel.from_pretrained(EMBED_MODEL)

def embed(txt: str):
    vals = embed_model.get_embeddings([TextEmbeddingInput(txt, "RETRIEVAL_DOCUMENT")])[0].values
    return [float(x) for x in vals]

# (id, text, domain, clearance_min, doc_id, section)
DOCS = [
    ("fin-1", "Employees may claim travel expenses for approved trips.", "finance", 2, "finance-policy.pdf", "3.2"),
    ("fin-2", "Airfare must be economy unless pre-approved by Finance.",   "finance", 2, "finance-policy.pdf", "3.3"),
    ("hr-1",  "New hires must complete I-9 within three business days.",   "hr",      1, "onboarding.md",      "I-9"),
]

datapoints = []
for did, text, domain, cmin, doc_id, section in DOCS:


    meta = {
        "doc_id": doc_id,
        "section": section,
        "chunk": text,
        "domain": domain,
        "clearance_min": cmin,
    }

    datapoints.append({
        "datapointId": did,
        "featureVector": embed(text),

        # keep if you want, but we won't rely on it
        "crowdingTag": {"crowdingAttribute": json.dumps(meta)},

        # ✅ reliable place for our JSON
        "restricts": [
            {
                "namespace": "meta",
                "allowList": [json.dumps(meta)]   # <-- THIS field name matters
            }
        ],
    })



url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/{INDEX_NAME}:upsertDatapoints"
body = {"datapoints": datapoints}

r = requests.post(url, headers=HEADERS, data=json.dumps(body), timeout=60)

# after requests.post(...) success
id_map = {d["datapointId"]: json.loads(d["crowdingTag"]["crowdingAttribute"]) for d in datapoints}
with open("api/server/seed_meta.json", "w") as f:
    json.dump(id_map, f)
print("Wrote api/server/seed_meta.json with", len(id_map), "entries")

if r.status_code >= 300:
    raise RuntimeError(f"Upsert failed: {r.status_code} {r.text}")
print("Upserted:", [d["datapointId"] for d in datapoints])
