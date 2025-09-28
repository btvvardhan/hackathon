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

# Paste this below your existing DOCS list or replace it entirely.
# Make sure ids don't collide with what you've already seeded.

DOCS_EXT = [
    # -------------------- FINANCE --------------------
    ("fin-3",  "Hotel stays are reimbursable up to $180/night in Tier-1 cities and $130/night elsewhere; taxes and mandatory fees are included in the cap.", "finance", 2, "finance-policy.pdf", "3.5"),
    ("fin-4",  "Ground transportation should favor public transit and rideshare pool options when safe and practical.", "finance", 1, "t&e-policy.md", "4.1"),
    ("fin-5",  "Personal car mileage is reimbursed at the IRS standard rate; parking and tolls require itemized receipts.", "finance", 2, "t&e-policy.md", "4.2"),
    ("fin-6",  "Per-diem covers meals and incidentals only; alcohol is not reimbursable under any circumstances.", "finance", 1, "t&e-policy.md", "4.3"),
    ("fin-7",  "International travel must be booked at least 14 days in advance unless approved by the CFO.", "finance", 3, "finance-policy.pdf", "3.7"),
    ("fin-8",  "Conference registration fees are reimbursable when pre-approved and directly related to the employee’s role.", "finance", 1, "training-and-events.md", "2.1"),
    ("fin-9",  "All corporate card transactions must be expensed within 15 calendar days of the statement close.", "finance", 2, "card-program.md", "1.2"),
    ("fin-10", "Spend over $5,000 requires a purchase order and vendor onboarding through Procurement.", "finance", 2, "procurement.md", "PO-Thresholds"),
    ("fin-11", "Three competitive quotes are required for purchases between $10,000 and $50,000 unless a sole-source justification is approved.", "finance", 3, "procurement.md", "Sourcing"),
    ("fin-12", "Subscription software must be tied to an owner and a cost center; auto-renewals should be reviewed 30 days prior.", "finance", 2, "spend-ops.md", "SaaS"),
    ("fin-13", "Expense reports missing receipts over $25 will be returned; repeated violations may result in card suspension.", "finance", 2, "t&e-policy.md", "4.4"),
    ("fin-14", "Grants and customer-funded travel must bill actuals to the project code provided by FP&A.", "finance", 3, "finance-policy.pdf", "Project-Billing"),
    ("fin-15", "Stipends for remote work equipment are capped at $400/year and must be purchased through approved vendors.", "finance", 1, "stipends.md", "Home-Office"),
    ("fin-16", "Currency conversion fees on corporate cards are reimbursable; personal card conversions are not.", "finance", 2, "t&e-policy.md", "International"),
    ("fin-17", "Airfare changes after ticketing require Finance approval unless due to airline-initiated changes.", "finance", 2, "travel-booking.md", "Changes"),
    ("fin-18", "Team meals require a business purpose and attendee list; tips should not exceed 20% before tax.", "finance", 1, "t&e-policy.md", "Meals"),
    ("fin-19", "Capital purchases (useful life > 1 year) must be coded to the fixed asset account and tagged for inventory.", "finance", 3, "accounting-manual.md", "Capex"),
    ("fin-20", "Employees must use the preferred travel agency for booking to enable duty-of-care and negotiated rates.", "finance", 2, "travel-booking.md", "Preferred-Agency"),

    # -------------------- ENGINEERING --------------------
    ("eng-1",  "All production deploys require an approved change ticket linked to the relevant issue and a rollback plan.", "engineering", 2, "eng-runbook.md", "Deploys"),
    ("eng-2",  "Services must expose a /healthz endpoint that returns 200 OK when dependencies are healthy.", "engineering", 1, "service-standards.md", "Healthchecks"),
    ("eng-3",  "Critical alerts page on-call within 2 minutes and must have actionable runbook steps.", "engineering", 2, "oncall.md", "Alerting"),
    ("eng-4",  "Every microservice must publish an OpenAPI spec to the internal registry and keep it versioned.", "engineering", 2, "api-governance.md", "Spec-Registry"),
    ("eng-5",  "Pull requests require at least one approving review and all required checks passing; self-merges are disallowed.", "engineering", 1, "code-review.md", "PR-Policy"),
    ("eng-6",  "Secrets must be stored in the centralized vault; environment variables should reference secret paths, not plaintext.", "engineering", 3, "security-std.md", "Secrets"),
    ("eng-7",  "Datastores must define RPO ≤ 24h and RTO ≤ 4h, with quarterly restore tests documented.", "engineering", 3, "resilience.md", "Backups"),
    ("eng-8",  "Breaking API changes require a deprecation notice and a minimum 2 minor releases of overlap.", "engineering", 2, "api-governance.md", "Versioning"),
    ("eng-9",  "Production data may not be copied to developer laptops; use masked datasets or synthetic fixtures.", "engineering", 3, "data-handling.md", "Prod-Data"),
    ("eng-10", "Infrastructure changes must be represented as code and peer-reviewed before apply.", "engineering", 2, "iac-guidelines.md", "Change-Control"),
    ("eng-11", "Services must emit structured logs in JSON with request IDs and user IDs when available.", "engineering", 1, "observability.md", "Logging"),
    ("eng-12", "SLOs: target availability ≥ 99.9% for external APIs; error budgets are reviewed in postmortems.", "engineering", 2, "sre-playbook.md", "SLOs"),
    ("eng-13", "All containers must run as non-root and have a read-only root filesystem unless justified.", "engineering", 3, "security-std.md", "Containers"),
    ("eng-14", "Dependencies must be scanned for known CVEs weekly; high severity issues fixed within 7 days.", "engineering", 3, "security-std.md", "Vulnerability-Scanning"),
    ("eng-15", "Feature flags must default to safe values and be auto-removed within two releases.", "engineering", 1, "release-engineering.md", "Feature-Flags"),
    ("eng-16", "Schema migrations must be backwards compatible for at least one deployment cycle.", "engineering", 2, "database-guidelines.md", "Migrations"),
    ("eng-17", "PII fields must be tagged in the schema and encrypted at rest; access is logged and reviewed monthly.", "engineering", 3, "data-handling.md", "PII"),
    ("eng-18", "Incident severity is determined by customer impact and SLA breach risk; SEV-1 requires exec comms within 30 min.", "engineering", 2, "incident-response.md", "Severity-Matrix"),

    # -------------------- HR --------------------
    ("hr-2",  "Employees accrue 1.5 vacation days per month; balances carry over up to 10 days into the next year.", "hr", 1, "benefits.md", "Vacation"),
    ("hr-3",  "New hires must complete security and code-of-conduct training within 14 days of start.", "hr", 1, "onboarding.md", "Training"),
    ("hr-4",  "Remote work arrangements require manager approval and must comply with local labor laws.", "hr", 2, "work-arrangements.md", "Remote"),
    ("hr-5",  "Performance reviews occur biannually; calibration sessions are facilitated by HRBPs.", "hr", 2, "performance.md", "Review-Cycle"),
    ("hr-6",  "Expense reimbursements are paid on the next payroll after approval and audit.", "hr", 1, "payroll.md", "Reimbursements"),
    ("hr-7",  "Company holidays are published annually; essential operations may require coverage with premium pay.", "hr", 1, "time-off.md", "Holidays"),
    ("hr-8",  "Parental leave provides 12 weeks paid for birthing parents and 8 weeks paid for non-birthing parents.", "hr", 2, "leave.md", "Parental"),
    ("hr-9",  "Internal job postings are visible for at least 5 business days before external posting.", "hr", 1, "talent.md", "Internal-Mobility"),
    ("hr-10", "Offer letters must use the standard template and be approved by Compensation for band alignment.", "hr", 3, "hiring.md", "Offers"),
    ("hr-11", "All contractors require a signed MSA and a statement of work with clear deliverables and term.", "hr", 2, "vendor-labor.md", "Contractors"),
    ("hr-12", "Workplace concerns can be reported confidentially via the ethics hotline; retaliation is prohibited.", "hr", 1, "ethics.md", "Reporting"),
    ("hr-13", "Annual harassment prevention training is mandatory for all people managers.", "hr", 2, "training.md", "Harassment"),
    ("hr-14", "Equity grants are subject to board approval and follow the company’s standard vesting schedule.", "hr", 3, "compensation.md", "Equity"),
    ("hr-15", "Sick leave is separate from vacation and should be used for personal or family health needs.", "hr", 1, "leave.md", "Sick-Leave"),
    ("hr-16", "Exit interviews are scheduled during the notice period and insights are anonymized quarterly.", "hr", 2, "offboarding.md", "Exit-Interviews"),
    ("hr-17", "Badge access is terminated at end of employment date; equipment must be returned within 5 business days.", "hr", 2, "offboarding.md", "Access"),
    ("hr-18", "Reasonable accommodations are available through HR upon request with supporting documentation.", "hr", 2, "policies.md", "Accommodation"),
]

# Optional: merge into your existing DOCS
DOCS = DOCS + DOCS_EXT


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
