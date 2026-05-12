export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM =
  process.env.OG_RPC_URL?.trim() ||
  process.env.NEXT_PUBLIC_RPC_URL?.trim() ||
  "https://evmrpc-testnet.0g.ai";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, GET, OPTIONS",
  "access-control-allow-headers": "*, content-type, authorization",
  "access-control-max-age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  const body = await req.text();
  try {
    const res = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { ...CORS_HEADERS, "content-type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: `proxy fetch failed: ${msg}` },
      }),
      {
        status: 502,
        headers: { ...CORS_HEADERS, "content-type": "application/json" },
      },
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, upstream: UPSTREAM }), {
    status: 200,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}
