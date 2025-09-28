export default {
  async fetch(req, env, ctx) {
    const jwt = req.headers.get("CF-Access-Jwt-Assertion");
    if (!jwt) return new Response("Unauthorized", { status: 401 });
    // (optional) quick CF Access check via Access rules; deeper verify at backend.
    const backendUrl = env.BACKEND_URL; // e.g., https://your-cloud-run-url.run.app/query
    return fetch(backendUrl, {
      method: req.method,
      headers: { "CF-Access-Jwt-Assertion": jwt, "Content-Type": "application/json" },
      body: req.method === "GET" ? null : await req.text(),
    });
  }
}
