Here’s a clean, copy-pasteable **README.md** you can drop into your repo.

---

# Secure Multi-SLM RAG on GCP (FastAPI + Vertex AI + Vector Search)

Production-ready Retrieval-Augmented Generation service with:

* **FastAPI** HTTP API (containerized)
* **Vertex AI Vector Search** for semantic retrieval
* **Vertex AI models** for embeddings and generation
* **Planner SLM** (Gemma-2-2B-IT) to route queries to the right model/config
* Metadata-based **access control** (domain + clearance) enforced at retrieval time

> This README reflects the code in `app.py`, `auth.py`, `planner.py`, `retriever.py`, `seed_vectors.py`, and `requirements.txt`.

---

## Architecture (at a glance)

* **Clients** → HTTPS → **FastAPI** (Uvicorn)
* **Retriever** → Vertex AI **Vector Search** (`FindNeighbors(return_full_datapoint=True)`)
* **Planner SLM** → Vertex AI **Gemma-2-2B-IT** decides target model/config by domain
* **Generator** → Vertex AI **Gemini 2.5 Pro / Flash**
* **Embeddings** → `text-embedding-004` (QUERY/DOCUMENT)
* **Metadata restricts** (domain, clearance) → enforced at search time
* **Containerized** → Docker / Cloud Run

---

## Repo layout

```
api/
  server/
    app.py               # FastAPI app + endpoints + prompt assembly
    auth.py              # DEV-only header auth (X-API-Key, domain, clearance)
    planner.py           # Planner SLM (Gemma-2-2B-IT), domain→model routing
    retriever.py         # Vertex Vector Search client (FindNeighbors)
    seed_vectors.py      # Minimal upsert example for datapoints
requirements.txt         # Python deps
Dockerfile               # (provided below)
docker-compose.yml       # (provided below)
```

> If `Dockerfile` / `docker-compose.yml` aren’t committed yet, you can copy the versions I generated earlier.

---

## Prerequisites

1. **GCP project** (you’ll export the ID as `$PROJECT`)
2. **Enable APIs**

   ```bash
   gcloud services enable aiplatform.googleapis.com run.googleapis.com artifactregistry.googleapis.com
   ```
3. **Auth (local dev)**

   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```
4. **Service Account for Cloud Run** (recommended)

   ```bash
   gcloud iam service-accounts create rag-api --display-name="RAG API"

   # Minimal roles for runtime:
   gcloud projects add-iam-policy-binding $PROJECT \
     --member="serviceAccount:rag-api@$PROJECT.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"

   # If you also manage indexes programmatically from the service, add:
   gcloud projects add-iam-policy-binding $PROJECT \
     --member="serviceAccount:rag-api@$PROJECT.iam.gserviceaccount.com" \
     --role="roles/aiplatform.admin"
   ```
5. **Vertex AI Vector Search**

   * Create an **Index** and an **Index Endpoint**, then **Deploy** the index.
   * You’ll need these values (visible in the Vertex Console):

     * `ME_API_HOST` (host of the index endpoint, e.g. `xxxxxxxx.us-central1-<project>.vdb.vertexai.goog`)
     * `ME_INDEX_ENDPOINT` (resource path, e.g. `projects/<proj>/locations/us-central1/indexEndpoints/<ID>`)
     * `ME_DEPLOYED_INDEX_ID` (the deployed index ID, e.g. `my_deploy_1234567890`)

---

## Environment variables

| Name                   | Purpose                          | Example                                                     |
| ---------------------- | -------------------------------- | ----------------------------------------------------------- |
| `GCP_PROJECT`          | GCP project ID                   | `teja-sunhack`                                              |
| `GCP_LOCATION`         | Vertex region                    | `us-central1`                                               |
| `ME_API_HOST`          | Vector Search host               | `xxxxx.us-central1-<proj>.vdb.vertexai.goog`                |
| `ME_INDEX_ENDPOINT`    | Index Endpoint resource path     | `projects/<proj>/locations/us-central1/indexEndpoints/<ID>` |
| `ME_DEPLOYED_INDEX_ID` | Deployed index ID                | `sunhack_deploy_1759016...`                                 |
| `EMBED_MODEL`          | Embedding model                  | `text-embedding-004`                                        |
| `DEV_API_KEY`          | Dev only API key (see `auth.py`) | **Change from default!**                                    |

Create a `.env` (optional) for local use:

```env
GCP_PROJECT=teja-sunhack
GCP_LOCATION=us-central1
ME_API_HOST=xxxxx.us-central1-<proj>.vdb.vertexai.goog
ME_INDEX_ENDPOINT=projects/<proj>/locations/us-central1/indexEndpoints/<ID>
ME_DEPLOYED_INDEX_ID=my_deploy_123
EMBED_MODEL=text-embedding-004
DEV_API_KEY=replace-with-long-random
```

---

## Quickstart (local, Python)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export GCP_PROJECT=teja-sunhack
export GCP_LOCATION=us-central1
export ME_API_HOST="xxxxx.us-central1-<proj>.vdb.vertexai.goog"
export ME_INDEX_ENDPOINT="projects/<proj>/locations/us-central1/indexEndpoints/<ID>"
export ME_DEPLOYED_INDEX_ID="my_deploy_123"
export DEV_API_KEY="replace-me"
uvicorn api.server.app:app --host 0.0.0.0 --port 8080 --reload
```

Open the tiny dev page:

```
http://localhost:8080/
```

**Sample request (GET):**

```bash
curl -G "http://localhost:8080/query" \
  --data-urlencode "q=How do I claim travel reimbursement?" \
  -H "X-API-Key: replace-me" \
  -H "X-User-Email: alice@org.com" \
  -H "X-User-Domain: finance" \
  -H "X-User-Clearance: 2"
```

**Debug raw neighbors:**

```bash
curl -G "http://localhost:8080/debug/raw_chunks" \
  --data-urlencode "q=travel reimbursement" \
  -H "X-API-Key: replace-me"
```

---

## Seeding / Updating the Vector Index

`api/server/seed_vectors.py` shows a **minimal** datapoint upsert using:

* `TextEmbeddingModel("text-embedding-004")` to embed chunks
* Google REST call to `indexes:upsertDatapoints` with **metadata** carrying
  `{"domain": "...", "clearance": <int>, "doc_id": "...", "section": "..."}`

**Edit these in the script**:

* `PROJECT`, `LOCATION`
* `INDEX_ID` (or change to use your endpoint)
* Replace the placeholder datapoints with your own chunked documents

Run:

```bash
source .venv/bin/activate
python api/server/seed_vectors.py
```

If successful, it writes `api/server/seed_meta.json` mapping your chunk IDs.

---

## Docker (local)

Build & run:

```bash
docker build -t org-rag:local .
docker run --rm -p 8080:8080 \
  -e GCP_PROJECT=teja-sunhack \
  -e GCP_LOCATION=us-central1 \
  -e ME_API_HOST="xxxxx.us-central1-<proj>.vdb.vertexai.goog" \
  -e ME_INDEX_ENDPOINT="projects/<proj>/locations/us-central1/indexEndpoints/<ID>" \
  -e ME_DEPLOYED_INDEX_ID="my_deploy_123" \
  -e DEV_API_KEY="replace-me" \
  org-rag:local
```

With **docker-compose**:

```bash
docker compose up --build
```

---

## Deploy to Cloud Run

> Uses a dedicated Artifact Registry repo (Docker) and a Cloud Run service.

```bash
export PROJECT=teja-sunhack
export REGION=us-central1
gcloud config set project $PROJECT
gcloud config set run/region $REGION

# 1) Artifact Registry repo (once)
gcloud artifacts repositories create containers \
  --repository-format=docker --location=$REGION --description="RAG containers"

# 2) Build & push
IMAGE="$REGION-docker.pkg.dev/$PROJECT/containers/org-rag-api:$(date +%Y%m%d-%H%M)"
docker build -t $IMAGE .
gcloud auth configure-docker $REGION-docker.pkg.dev
docker push $IMAGE

# 3) Deploy
gcloud run deploy org-rag-api \
  --image $IMAGE \
  --region $REGION \
  --service-account rag-api@$PROJECT.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --memory 2Gi --cpu 1 \
  --set-env-vars GCP_PROJECT=$PROJECT,GCP_LOCATION=$REGION,EMBED_MODEL=text-embedding-004,DEV_API_KEY=replace-me \
  --set-env-vars ME_API_HOST="xxxxx.us-central1-$PROJECT.vdb.vertexai.goog" \
  --set-env-vars ME_INDEX_ENDPOINT="projects/$PROJECT/locations/$REGION/indexEndpoints/<ID>" \
  --set-env-vars ME_DEPLOYED_INDEX_ID="my_deploy_123"
```

**Test Cloud Run endpoint:**

```bash
curl -G "https://<RUN_URL>/query" \
  --data-urlencode "q=benefits enrollment window" \
  -H "X-API-Key: replace-me" \
  -H "X-User-Domain: hr" \
  -H "X-User-Clearance: 1"
```

> For private access, remove `--allow-unauthenticated` and protect with IAM or put **Cloudflare Access** in front.

---

## API Overview

* `GET /` — tiny HTML tester
* `GET /health` — health probe
* `GET /query?q=...&k=5` — returns `{ answer, citations[] }`
* `GET /debug/raw_chunks?q=...&k=5` — raw neighbors `{ id, distance, meta }`

**Required headers (dev):**

```
X-API-Key: <value from DEV_API_KEY>
X-User-Email: you@org.com
X-User-Domain: finance|hr|engineering|general
X-User-Clearance: 1|2|3
```

---

## Tuning & Notes

* **Planner SLM** (`planner.py`): default `PLANNER_MODEL_ID="gemma-2-2b-it"`.
  Switch to `"gemini-2.5-flash"` if you prefer faster routing with higher quality.
* **Model registry** (`planner.py`): expand `DOMAIN_REGISTRY` per domain (finance/hr/engineering).
* **Retriever** (`retriever.py`): Uses `FindNeighbors` with `return_full_datapoint=True` so your chunk metadata is returned and rendered as citations.
* **Metadata filters**: Implemented via `restricts(namespace="meta", allowList=[JSON])`—ensure every datapoint you upsert includes the right `domain` and `clearance` fields.
* **Security**: `auth.py` is *dev only*. Replace with a real gateway (Cloud Endpoints / API Gateway / Cloudflare Access) before production.

---

## Troubleshooting

* **401 Invalid API key** → Set `DEV_API_KEY` and pass the header.
* **403 PERMISSION_DENIED** on `FindNeighbors` → Service account lacks `roles/aiplatform.user` (or you’re hitting the wrong project/region).
* **404 index / endpoint not found** → Check `ME_INDEX_ENDPOINT` & `ME_DEPLOYED_INDEX_ID`.
* **Empty answers** → Use `/debug/raw_chunks` to confirm neighbors. If distances are high, re-embed with better chunking or verify your `EMBED_MODEL`.
* **Latency** → Planner SLM adds 100–300 ms. You can disable it temporarily by routing queries to a fixed model in `planner.py`.

---

## License

MIT (or your preferred license)

---

If you want, I can tailor this to your Google Doc’s exact wording (sections like Problem, Solution, Architecture, etc.) and add CI/CD steps (Cloud Build triggers) or a one-click `make deploy` flow.
