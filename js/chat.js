// "Ask about Gideon" assistant. Nothing is sent anywhere until a visitor submits a question.
// Hidden entirely unless SITE.chatEndpoint is set.
(function () {
  'use strict';
  const SITE = window.SITE || {};
  const endpoint = SITE.chatEndpoint;
  if (!endpoint) return;

  const EMAIL = (SITE.person && SITE.person.email) || '';
  const SUGGESTIONS = [
    'What has Gideon built in Go?',
    'Does Gideon know C# and .NET?',
    'What did Gideon do at Solera?',
    'How can I contact Gideon?',
  ];
  const MAX_LEN = 400;
  const history = [];
  let busy = false;
  let lastFocus = null;

  const el = (tag, cls, attrs) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  };
  const ICON_CHAT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg>';
  const ICON_SEND = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const ICON_CLOSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  // ----- build UI -----
  const launcher = el('button', 'chat-launcher', { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'chat-panel' });
  launcher.innerHTML = ICON_CHAT + '<span class="chat-launcher-label">Ask about Gideon</span>';

  const panel = el('section', 'chat-panel', { id: 'chat-panel', role: 'dialog', 'aria-labelledby': 'chat-title', 'aria-modal': 'false', 'data-lenis-prevent': '' });
  panel.hidden = true;

  const head = el('header', 'chat-head');
  const titles = el('div', 'chat-titles');
  const title = el('h2', 'chat-title', { id: 'chat-title' });
  title.textContent = 'Ask about Gideon';
  const sub = el('p', 'chat-sub');
  sub.textContent = 'AI assistant. Answers come from this site.';
  titles.append(title, sub);
  const closeBtn = el('button', 'icon-btn chat-close', { type: 'button', 'aria-label': 'Close chat' });
  closeBtn.innerHTML = ICON_CLOSE;
  head.append(titles, closeBtn);

  const log = el('div', 'chat-log', { role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation', 'data-lenis-prevent': '' });
  const intro = el('div', 'chat-msg chat-msg--bot');
  intro.textContent = "Hi, I can answer questions about Gideon's projects, skills, experience and education. What would you like to know?";
  log.append(intro);

  const chips = el('div', 'chat-chips');
  SUGGESTIONS.forEach((s) => {
    const b = el('button', 'chat-chip', { type: 'button' });
    b.textContent = s;
    b.addEventListener('click', () => send(s));
    chips.append(b);
  });

  const form = el('form', 'chat-form', { autocomplete: 'off' });
  const input = el('input', 'chat-input', { type: 'text', maxlength: String(MAX_LEN), placeholder: 'Ask a question…', 'aria-label': 'Your question', enterkeyhint: 'send' });
  const sendBtn = el('button', 'chat-send', { type: 'submit', 'aria-label': 'Send question' });
  sendBtn.innerHTML = ICON_SEND;
  form.append(input, sendBtn);

  const note = el('p', 'chat-note');
  note.textContent = 'AI can be wrong. Please do not share personal details. For anything else, ';
  const mail = el('a', '', { href: 'mailto:' + EMAIL });
  mail.textContent = 'email Gideon';
  note.append(mail, '.');

  panel.append(head, log, chips, form, note);
  document.body.append(launcher, panel);

  // ----- helpers -----
  function linkify(text, into) {
    const re = /(https?:\/\/[^\s)]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      let token = m[0];
      const trail = token.match(/[.,;:!?]+$/);
      if (trail) token = token.slice(0, -trail[0].length);
      into.append(text.slice(last, m.index));
      const a = el('a', '', { href: token.includes('@') && !token.startsWith('http') ? 'mailto:' + token : token, rel: 'noopener' });
      if (token.startsWith('http')) a.target = '_blank';
      a.textContent = token;
      into.append(a);
      last = m.index + token.length;
      re.lastIndex = last;
    }
    into.append(text.slice(last));
  }
  function addMsg(role, text, withMail) {
    const m = el('div', 'chat-msg chat-msg--' + (role === 'user' ? 'user' : 'bot'));
    if (role === 'user') m.textContent = text; else linkify(text, m);
    if (withMail) { m.append(' '); const a = el('a', '', { href: 'mailto:' + EMAIL }); a.textContent = EMAIL; m.append(a); }
    log.append(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function setBusy(v) {
    busy = v;
    sendBtn.disabled = v;
    panel.setAttribute('aria-busy', String(v));
  }

  // ----- send -----
  async function send(text) {
    text = String(text || '').trim().slice(0, MAX_LEN);
    if (!text || busy) return;
    chips.hidden = true;
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    setBusy(true);
    const typing = el('div', 'chat-msg chat-msg--bot chat-typing');
    typing.textContent = 'Thinking…';
    log.append(typing);
    log.scrollTop = log.scrollHeight;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-6) }), signal: ctrl.signal });
      typing.remove();
      if (res.status === 429) {
        history.pop();
        addMsg('bot', 'That is a lot of questions at once. Please wait a minute and try again.');
      } else if (!res.ok) {
        history.pop();
        addMsg('bot', 'The assistant is unavailable right now. You can reach Gideon directly at', true);
      } else {
        const data = await res.json();
        history.push({ role: 'assistant', content: data.reply });
        addMsg('bot', data.reply);
      }
    } catch (e) {
      typing.remove();
      history.pop();
      addMsg('bot', 'I could not reach the assistant. You can reach Gideon directly at', true);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      input.focus();
    }
  }

  // ----- open / close -----
  const narrow = window.matchMedia('(max-width: 700px)');
  function open() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.classList.add('is-hidden');
    if (narrow.matches) document.body.style.overflow = 'hidden';
    input.focus();
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.classList.remove('is-hidden');
    document.body.style.overflow = '';
    away();
    (lastFocus && lastFocus.focus ? lastFocus : launcher).focus();
  }
  launcher.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });

  // keep the hero clean: the launcher appears once the visitor scrolls past the first screen
  const away = () => launcher.classList.toggle('is-away', window.scrollY < window.innerHeight * 0.6 && panel.hidden);
  window.addEventListener('scroll', away, { passive: true });
  window.addEventListener('resize', away);
  away();

  // lift the launcher above the footer strip so it never covers the social links
  const strip = document.querySelector('.footer-strip');
  if (strip && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => launcher.classList.toggle('is-lifted', en.isIntersecting), { threshold: 0.05 }).observe(strip);
  }
})();
