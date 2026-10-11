# portfolio-chat

Cloudflare Worker behind the "Ask about Gideon" assistant. It answers only from the site's own content
(`../js/content.js`, compiled into `src/knowledge.js`), runs on Workers AI (no API key), and rate-limits per visitor.

```
npm install
npx wrangler login          # one time, opens the browser
npm run dev                 # local Worker; model override enabled for testing
npm run eval                # bake-off across qwen3 / gemma4 / llama8b (needs `npm run dev` running)
npm run deploy              # rebuilds knowledge.js, then deploys
```

After deploying, set `chatEndpoint` in `../js/content.js` to `https://portfolio-chat.<your-subdomain>.workers.dev/chat`.
Rebuild and redeploy whenever the site copy changes so the assistant stays in sync.
