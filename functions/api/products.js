/**
 * Cloudflare Pages Edge Function: GET /api/products
 *
 * Proxies public active products from Supabase over Cloudflare's internal backbone
 * and caches at the edge with stale-while-revalidate. Eliminates third-party
 * *.supabase.co recursive DNS delays (10-18s on cold Indonesian mobile/ISP resolvers)
 * by serving live catalog data over the existing idcardlampung.com HTTP/2 or HTTP/3 connection.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: "Upstream env not configured" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const reqUrl = new URL(request.url);
  const bypassCache = reqUrl.searchParams.get("fresh") === "1";

  const upstreamUrl =
    supabaseUrl.replace(/\/+$/, "") +
    "/rest/v1/products?select=*&is_active=eq.true&order=sort_order.asc";

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json",
      },
      cf: bypassCache
        ? { cacheTtl: 0, cacheEverything: false }
        : { cacheTtl: 60, cacheEverything: true },
    });

    if (!upstreamRes.ok) {
      return new Response(JSON.stringify({ error: `Upstream HTTP ${upstreamRes.status}` }), {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const body = await upstreamRes.text();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": bypassCache
          ? "no-store"
          : "public, max-age=30, s-maxage=60, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream fetch failed" }), {
      status: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}

