# api/server/auth.py  (DEV-ONLY AUTH)
from fastapi import Header, HTTPException

# 1) set a long random string here
DEV_API_KEY = "123456789"

def dev_auth(
    x_api_key: str = Header(None, alias="X-API-Key"),
    x_user_email: str = Header("dev@example.com", alias="X-User-Email"),
    x_user_domain: str = Header("engineering", alias="X-User-Domain"),
    x_user_clearance: int = Header(2, alias="X-User-Clearance"),
):
    # 2) check the key
    if x_api_key != DEV_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key (dev)")

    # 3) normalize the user “profile”
    domain = (x_user_domain or "general").lower()
    if domain not in {"finance", "hr", "engineering", "general"}:
        domain = "general"
    try:
        clearance = int(x_user_clearance)
    except Exception:
        clearance = 1
    if clearance not in (1, 2, 3):
        clearance = 1

    # 4) return what app.py needs
    return {"email": x_user_email, "domain": domain, "clearance": clearance}
