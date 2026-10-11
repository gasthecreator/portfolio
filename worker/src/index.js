import { SYSTEM_PROMPT } from './prompt.js';

// Short names are what the dev/eval harness can ask for; production uses env.MODEL.
const MODELS = {
  qwen3: { id: '@cf/qwen/qwen3-30b-a3b-fp8', tokenParam: 'max_tokens', extra: { chat_template_kwargs: { enable_thinking: false } } },
  gemma4: { id: '@cf/google/gemma-4-26b-a4b-it', tokenParam: 'max_completion_tokens', extra: { chat_template_kwargs: { enable_thinking: false } } },
  llama8b: { id: '@cf/meta/llama-3.1-8b-instruct-fp8-fast', tokenParam: 'max_tokens', extra: {} },
};

const MAX_BODY_BYTES = 8000;
const MAX_TURNS = 6;
const MAX_CHARS = 500;
const MAX_NEW_TOKENS = 350;

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ok = origin && allowed.includes(origin);
  return {
    ok,
    headers: {
      'Access-Control-Allow-Origin': ok ? origin : allowed[0] || '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  };
}

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .filter((m) => m.content)
    .slice(-MAX_TURNS);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return null;
  return msgs;
}

function extractText(res) {
  let t = '';
  if (typeof res === 'string') t = res;
  else if (res && typeof res.response === 'string') t = res.response;
  else if (res && res.choices && res.choices[0]) {
    // Qwen3 on Workers AI can return its whole answer in reasoning_content with content: null.
    const msg = res.choices[0].message || {};
    t = msg.content || res.choices[0].text || msg.reasoning_content || msg.reasoning || '';
  }
  return t.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<think>[\s\S]*$/, '').trim();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const { ok: originOk, headers } = cors(origin, env);
    const devMode = env.ALLOW_MODEL_OVERRIDE === '1';

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (url.pathname !== '/chat' || request.method !== 'POST') return json({ error: 'not_found' }, 404, headers);
    // Browsers always send Origin on cross-site POSTs; reject other sites. (Dev/eval clients send none.)
    if (origin && !originOk) return json({ error: 'forbidden' }, 403, headers);

    if (!devMode) {
      const key = request.headers.get('CF-Connecting-IP') || 'anon';
      const { success } = await env.LIMITER.limit({ key });
      if (!success) return json({ error: 'rate_limited' }, 429, headers);
    }

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413, headers);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400, headers); }
    const messages = cleanMessages(body && body.messages);
    if (!messages) return json({ error: 'bad_request' }, 400, headers);

    const wanted = devMode && MODELS[url.searchParams.get('model')] ? url.searchParams.get('model') : env.MODEL;
    const model = MODELS[wanted] || MODELS.qwen3;

    const run = () => env.AI.run(model.id, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.2,
      [model.tokenParam]: MAX_NEW_TOKENS,
      ...model.extra,
    });

    try {
      let res = await run();
      let reply = extractText(res).slice(0, 1500);
      if (!reply) { res = await run(); reply = extractText(res).slice(0, 1500); } // models occasionally return nothing once
      if (!reply) return json({ error: 'empty' }, 502, headers);
      return json(devMode ? { reply, neurons: res && res.usage && res.usage.neurons, tokens: res && res.usage && res.usage.completion_tokens } : { reply }, 200, headers);
    } catch (err) {
      // Most likely the free daily allowance is used up, or the model is briefly unavailable.
      return json({ error: 'unavailable' }, 503, headers);
    }
  },
};
