// Bake-off: asks every question to each candidate model through a locally running dev Worker.
//   Terminal 1:  npm run dev          (wrangler dev --remote, model override enabled)
//   Terminal 2:  npm run eval         (or: node eval/run.mjs qwen3 gemma4)
// Note: runs use real Workers AI quota (roughly 25 questions x ~30-50 neurons per model).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://localhost:8787';
const questions = JSON.parse(readFileSync(join(dir, 'questions.json'), 'utf8'));
const models = process.argv.slice(2).length ? process.argv.slice(2) : ['qwen3', 'gemma4', 'llama8b'];
const test = (re, s) => new RegExp(re, 'i').test(s);

const summary = [];
const transcript = {};
for (const model of models) {
  let pass = 0, ms = 0, chars = 0, errors = 0;
  const fails = [];
  transcript[model] = [];
  for (const item of questions) {
    const t0 = Date.now();
    let reply = '', err = '';
    try {
      const r = await fetch(`${BASE}/chat?model=${model}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: item.q }] }) });
      const j = await r.json();
      if (!r.ok) err = `${r.status} ${j.error}`; else reply = j.reply;
    } catch (e) { err = String(e.message || e); }
    ms += Date.now() - t0;
    const problems = [];
    if (err) { errors++; problems.push(`error: ${err}`); }
    else {
      chars += reply.length;
      for (const group of item.all || []) if (!group.some((re) => test(re, reply))) problems.push(`missing one of: ${group.join(' | ')}`);
      for (const re of item.none || []) if (test(re, reply)) problems.push(`contains forbidden: ${re}`);
    }
    if (!problems.length) pass++; else fails.push({ q: item.q, problems, reply });
    transcript[model].push({ q: item.q, reply, err, problems });
  }
  const n = questions.length;
  summary.push({ model, pass, n, errors, avgMs: Math.round(ms / n), avgChars: Math.round(chars / Math.max(1, n - errors)), fails });
}

console.log('\n=== RESULTS ===');
for (const s of summary) {
  console.log(`\n${s.model}: ${s.pass}/${s.n} passed, ${s.errors} errors, avg ${s.avgMs} ms, avg reply ${s.avgChars} chars`);
  for (const f of s.fails) console.log(`  x ${f.q}\n      ${f.problems.join('; ')}\n      reply: ${f.reply.replace(/\s+/g, ' ').slice(0, 220)}`);
}
writeFileSync(join(dir, 'last-run.json'), JSON.stringify({ when: new Date().toISOString(), summary, transcript }, null, 2));
console.log('\nFull answers saved to eval/last-run.json (read them yourself: automated checks are only a floor).');
