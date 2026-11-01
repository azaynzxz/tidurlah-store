import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Injects DNS/TLS preconnect hints and an ultra-lightweight inline bootstrap script
 * into <head> so storefront routes begin fetching live Supabase products and the
 * static /products.json fallback BEFORE the main JS bundle finishes downloading.
 */
function tidurlahCatalogPrefetchPlugin(
  supabaseUrl?: string,
  supabaseAnonKey?: string,
  isProd?: boolean
): Plugin {
  let sbOrigin = "";
  if (supabaseUrl) {
    try {
      sbOrigin = new URL(supabaseUrl).origin;
    } catch {
      sbOrigin = "";
    }
  }

  return {
    name: "tidurlah-catalog-prefetch",
    transformIndexHtml(html) {
      const tags: Array<{
        tag: string;
        attrs?: Record<string, string | boolean>;
        children?: string;
        injectTo: "head-prepend" | "head";
      }> = [];

      if (sbOrigin) {
        tags.push({
          tag: "link",
          attrs: { rel: "preconnect", href: sbOrigin, crossorigin: "" },
          injectTo: "head-prepend",
        });
        tags.push({
          tag: "link",
          attrs: { rel: "dns-prefetch", href: sbOrigin },
          injectTo: "head-prepend",
        });
      }

      const inlineBootstrap = `(function(){if(window.__TIDURLAH_PREFETCH__)return;var p=window.location.pathname||"/";var isStore=p==="/"||p==="/beta"||p.indexOf("/product/")===0||p.indexOf("/beta/product/")===0;if(!isStore)return;var fj=function(u,h,t){var c=typeof AbortController!=="undefined"?new AbortController():null;var id=c?setTimeout(function(){c.abort();},t):null;return fetch(u,{method:"GET",headers:h||{},signal:c?c.signal:undefined}).then(function(r){var ct=r.headers.get("content-type")||"";return r.ok&&ct.indexOf("json")!==-1?r.json():null;}).catch(function(){return null;}).then(function(d){if(id)clearTimeout(id);return d;});};var su=${JSON.stringify(
        supabaseUrl || ""
      )};var sk=${JSON.stringify(
        supabaseAnonKey || ""
      )};var prod=${JSON.stringify(
        Boolean(isProd)
      )};var pf={resolvedStatic:null,resolvedSupabaseRows:null,consumedSupabase:false,consumedStatic:false,staticCatalog:null,supabaseRows:null};pf.staticCatalog=fj("/products.json",{Accept:"application/json"},6000).then(function(d){pf.resolvedStatic=d;return d;});var directP=su&&sk?fj(su.replace(/\\/+$/,"")+"/rest/v1/products?select=*&is_active=eq.true&order=sort_order.asc",{apikey:sk,Authorization:"Bearer "+sk,Accept:"application/json"},8000):Promise.resolve(null);var edgeP=prod?fj("/api/products",{Accept:"application/json"},4000):Promise.resolve(null);pf.supabaseRows=new Promise(function(res){var done=false;var pending=2;var check=function(d){pending--;if(!done&&Array.isArray(d)&&d.length>0){done=true;pf.resolvedSupabaseRows=d;res(d);return;}if(!done&&pending<=0){res(null);}};edgeP.then(check);directP.then(check);});window.__TIDURLAH_PREFETCH__=pf;})();`;

      tags.push({
        tag: "script",
        children: inlineBootstrap,
        injectTo: "head-prepend",
      });

      return { html, tags };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  return {
    server: {
      host: "::",
      port: 8080,
      fs: {
        // Allow serving files from cashier directory
        allow: [".."],
      },
    },
    plugins: [
      react(),
      tidurlahCatalogPrefetchPlugin(supabaseUrl, supabaseAnonKey, mode === "production"),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
        output: {
          // Add hash to filenames for cache busting
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      // Ensure CSS is also cache-busted
      cssCodeSplit: true,
    },
    publicDir: "public",
  };
});
