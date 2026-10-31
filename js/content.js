// All site content lives here. Edit this file to update the copy, projects, roles and skills.
window.SITE = {
  person: {
    name: 'Gideon Sanni',
    title: 'Software Engineer',
    email: 'gideonsanni2023@gmail.com',
    location: 'Grambling, LA',
    school: 'Grambling State University',
    github: 'https://github.com/gasthecreator',
    linkedin: 'https://www.linkedin.com/in/gideonadeniyisanni/',
  },

  // Set to the deployed Worker URL (https://portfolio-chat.<account>.workers.dev/chat) to enable the "Ask about Gideon" assistant.
  // Privacy-friendly analytics: paste the Cloudflare Web Analytics token here to enable (no cookies). Empty = no analytics.
  analyticsToken: '',
  // A scheduling link (Cal.com, Calendly...) adds a "Book a call" button to the Contact section. Empty = hidden.
  bookingUrl: '',
  chatEndpoint: 'https://portfolio-chat.gideonsanni2023.workers.dev/chat',

  tagline: 'I build fault-tolerant systems, Kubernetes automation, and AI pipelines that verify their own work.',

  bio: "I'm a Computer Science student at Grambling State University (graduating May 2028) who builds the parts of software that have to keep working when things go wrong: distributed data pipelines, Kubernetes automation, offline-first mobile systems, and AI that must prove its own work. In summer 2026 at Solera Holdings I engineered two automation workflows, including an approval-triggered AI feedback pilot that generated 127 fix pull requests, with every AI fix blocked unless a failing test proved it.",

  stats: [
    { value: '127', label: 'AI-authored fix PRs from the Solera feedback pilot' },
    { value: '101ms', label: 'p95 in Pharos multi-datacenter load tests' },
    { value: 'Top 5', label: 'of 64 teams, BE Smart Hackathon' },
  ],

  skills: [
    { name: 'Languages', items: ['Python', 'TypeScript', 'Go', 'Rust', 'C/C++', 'C#', 'Java', 'JavaScript', 'SQL', 'Solidity', 'Swift', 'Kotlin'] },
    { name: 'Backend & Data', items: ['FastAPI', 'Node.js', 'Express', 'ASP.NET Core', '.NET', 'PostgreSQL', 'SQLite', 'Supabase', 'Redis', 'Kafka', 'Cassandra', 'MongoDB'] },
    { name: 'Infrastructure & Observability', items: ['Kubernetes', 'Docker', 'Prometheus', 'OpenTelemetry', 'Cloudflare'] },
    { name: 'Mobile & Web3', items: ['React Native', 'Foundry', 'Alloy'] },
    { name: 'AI / ML', items: ['PyTorch', 'scikit-learn', 'XGBoost', 'JAX', 'NumPyro/NUTS', 'ONNX Runtime', 'Neural posterior estimation', 'Censor-aware evaluation'] },
    { name: 'Agentic Tools', items: ['LLM agents', 'MCP', 'Claude', 'Cursor', 'GitHub Copilot', 'Gemini', 'Antigravity', 'OpenAI Codex'] },
  ],

  // Which projects on this site back each skill. A skill with no entry is on the résumé but has no project here yet.
  skillEvidence: {
    // Languages (by files in the project repos)
    'Python': ['vigil', 'tierfs', 'safelink', 'quorum'], 'TypeScript': ['refraction', 'vigil', 'quorum'], 'Go': ['pharos', 'cascade'], 'Rust': ['tripwire'],
    'C/C++': ['tierfs'], 'C#': ['feedback-automation', 'release-checklist'], 'Java': ['tierfs'],
    'JavaScript': ['praecept', 'safelink', 'pharos', 'cascade'], 'SQL': ['vigil', 'tierfs', 'refraction'], 'Solidity': ['tripwire'],
    'Swift': ['safelink', 'tierfs'], 'Kotlin': ['safelink'],
    // Backend and data
    'FastAPI': ['safelink', 'vigil', 'quorum'], 'Node.js': ['praecept', 'safelink', 'refraction'], 'Express': ['refraction', 'safelink'],
    'ASP.NET Core': ['feedback-automation', 'release-checklist'], '.NET': ['feedback-automation', 'release-checklist'],
    'PostgreSQL': ['refraction', 'vigil'], 'SQLite': ['pharos', 'tierfs', 'safelink', 'quorum'], 'Supabase': ['praecept'], 'Redis': ['pharos'],
    'Kafka': ['pharos'], 'Cassandra': ['pharos'], 'MongoDB': ['feedback-automation', 'release-checklist'],
    // Infrastructure and observability
    'Kubernetes': ['cascade', 'feedback-automation', 'pharos'], 'Docker': ['pharos', 'cascade', 'vigil', 'feedback-automation'],
    'Prometheus': ['cascade', 'pharos', 'vigil', 'tripwire'], 'OpenTelemetry': ['vigil'], 'Cloudflare': ['praecept'],
    // Mobile and web3 tooling
    'React Native': ['safelink'], 'Foundry': ['tripwire'], 'Alloy': ['tripwire'],
    // AI / ML
    'PyTorch': ['vigil'], 'scikit-learn': ['vigil'], 'XGBoost': ['vigil'], 'JAX': ['vigil'], 'NumPyro/NUTS': ['vigil'], 'ONNX Runtime': ['vigil'],
    'Neural posterior estimation': ['vigil'], 'Censor-aware evaluation': ['vigil'],
    // Agentic tools (shown as "used in or while building": commit co-author trailers, agent files and docs in each repo)
    'LLM agents': ['feedback-automation', 'vigil', 'quorum'], 'MCP': ['quorum'], 'Claude': ['pharos', 'cascade', 'tripwire', 'tierfs', 'vigil', 'safelink', 'quorum'],
    'Cursor': ['cascade', 'vigil'], 'GitHub Copilot': ['feedback-automation', 'release-checklist'],
    'Gemini': ['pharos', 'vigil', 'safelink'], 'Antigravity': ['pharos', 'vigil'], 'OpenAI Codex': ['vigil'],
  },
  skillsCore: ['Go', 'Kubernetes', 'C#', '.NET', 'Kafka', 'Cassandra'],

  marquee: ['Go', 'Kubernetes', 'Kafka', 'Cassandra', 'TypeScript', 'Python', 'Rust', 'C/C++', 'C#', '.NET', 'PyTorch', 'PostgreSQL', 'Node.js', 'Prometheus'],

  // Short write-ups of findings that are already documented in the project repos (each links its source).
  notes: [
    {
      project: 'Pharos', title: 'A load test that could not fail',
      body: 'The first burst test used one sequential virtual user and produced zero rate-limit rejections. The limiter was fine: each request took about 120 ms, so that one client managed only about 8 requests a second, below the 10-a-second refill, and the bucket never emptied. A token bucket limits arrival rate, so proving it took k6\'s constant-arrival-rate executor. At 30 requests a second for 15 seconds, about 200 of 450 requests were rejected, matching the arithmetic (100 + 15 x 10 = 250 accepted), and none leaked to the other sites.',
      source: { label: 'Benchmark write-up', href: 'https://github.com/gasthecreator/pharos/blob/main/docs/benchmark-results.md' },
    },
    {
      project: 'Pharos', title: 'The slow part was not Kafka',
      body: 'End-to-end ingestion averaged about 122 ms. The Kafka publish step took about 53 ms and the downstream Cassandra write about 10 ms, which left roughly 69 ms unexplained. It was the Cassandra outbox insert, a lightweight transaction whose Paxos round trip makes it costlier than a normal write. It was the first time that number was measured instead of assumed, and it names the first thing to optimize if the system ever needed to go faster.',
      source: { label: 'Benchmark write-up', href: 'https://github.com/gasthecreator/pharos/blob/main/docs/benchmark-results.md' },
    },
    {
      project: 'Cascade Operator', title: 'Retry storm barely moves, on purpose',
      body: 'In the benchmark, the retry-storm error rate went from 69.5% to 67.1% under mitigation, while fan-out amplification dropped from 63.2% to 31.8%. That is expected. The mitigation removes the retries that turn one failing call into three, which cuts load on the struggling dependency (1,877 requests down to 1,711), but it cannot make the dependency healthy. The honest signal there is request volume, not error rate.',
      source: { label: 'Benchmark write-up', href: 'https://github.com/gasthecreator/Cascade-Operator/blob/main/docs/benchmark-results.md' },
    },
  ],

  featured: [
    {
      id: 'feedback-automation', idx: '01', name: 'Feedback Automation Pipeline', status: 'internal',
      tagline: 'A faster path from user feedback to a reviewable fix: one approval starts an automated investigation, fix and pull request.',
      tags: ['.NET 10', 'Kubernetes', 'GitHub Actions'],
      metric: { value: '127', label: 'AI-authored fix PRs in a six-week pilot' },
      cardProblem: 'Feedback already gets reviewed and fixed, on a normal timeline. This makes that path much faster.',
      cardStack: '.NET 10, ASP.NET Core, Blazor, MongoDB, Kubernetes, GitHub Actions, Copilot SDK',
      cardOutcome: 'A working dev-cluster pilot that generated 127 AI-authored fix PRs from a single approval each.',
      problem: 'Users of Solera\'s claims-estimating platform send product feedback every day, and engineers review and act on it through the normal process on the normal timeline. This pipeline offers a much faster route: the investigation, fix and pull request that would otherwise be produced step by step are generated automatically, so a developer starts from a ready-to-review change.',
      approach: 'A reviewer picks feedback in a Blazor dashboard and approves it. That one approval is the only manual step before the automation runs. The approval writes a durable work item first and only then commits, so it is all-or-nothing. A background worker leases the item and hands it to GitHub Actions on a self-hosted runner, where a one-shot .NET runner drives an agentic Copilot SDK session: localize the defect, reproduce it with a failing test (RED), make a surgical fix, verify (GREEN), then open an issue and a pull request with the evidence. I co-designed the evidence-based architecture, wrote its RED to GREEN success criterion, built a competing AI pipeline and commissioned a ten-dimension comparison against the adopted design, then owned delivery and reliability.',
      stack: '.NET 10, ASP.NET Core, Blazor Server, MongoDB, GitHub Copilot SDK, GitHub Actions on self-hosted runners, Docker, Kubernetes with health probes, Vault-injected secrets, Jira integration, SonarQube quality gates, xUnit.',
      outcome: 'A deployed, demo-validated internal pilot on a dev Kubernetes cluster that generated 127 AI-authored fix pull requests from real, multilingual feedback. Reliability comes from a lease-based state machine with idempotent dispatch, bounded exponential retry and stranded-work recovery. It is a pilot, not production: every fix is a proposal for a developer to review.',
      gallery: [
        { src: 'assets/projects/feedback-automation/architecture.webp', alt: 'Flow diagram of the Feedback Automation Pipeline, from approval to pull request', caption: 'Architecture overview, redrawn for this site. One approval starts the run, and a developer reviews every pull request. No internal names or data are shown.' },
      ],
      links: [],
    },
    {
      id: 'praecept', idx: '02', name: 'Praecept',
      tagline: 'A verified map of common-law doctrine that lawyers can read and reason from.',
      tags: ['Node.js', 'Supabase Auth', 'LLM pipeline'],
      metric: { value: 'Live', label: 'at praecept.ai, by invitation' },
      cardProblem: 'Legal research means rebuilding settled doctrine by hand, every time.',
      cardStack: 'Node.js, Supabase Auth, LLM extraction, CourtListener',
      cardOutcome: 'Live at praecept.ai. I built the production auth system and the LLM data pipeline.',
      problem: 'Lawyers spend days reconstructing doctrine that has already been worked out, and still cannot be sure they have not missed a case. Praecept maps common-law doctrine once, matches every passage to the reporter, and keeps it current, so a lawyer can start from the rule instead of rebuilding it.',
      approach: 'I worked as a software engineer on the product. I built a Node.js CLI that orchestrates a multi-stage data pipeline, combining LLM extraction, the CourtListener API and asynchronous task routing into a structured review workflow. I also migrated authentication from custom JWTs to Supabase Auth, proxied through the backend so sessions live in HttpOnly cookies.',
      stack: 'Node.js, LLM extraction, the CourtListener API, Supabase Auth with Google OAuth (PKCE), JWKS token verification, token revocation, HttpOnly session cookies, Cloudflare-aware rate limiting.',
      outcome: 'Live at praecept.ai, currently by invitation. The extraction pipeline is estimated to accelerate case research by 50% or more, and it prepares findings for structured human review. Sessions use HttpOnly cookies instead of browser-stored tokens. The source is private.',
      gallery: [
        { src: 'assets/projects/praecept/landing-map.webp', alt: 'Praecept landing page showing the interactive map of legal doctrine', caption: 'The public landing page at praecept.ai. My work sits behind it: the extraction pipeline and the authentication system.' },
      ],
      links: [{ label: 'Live site', href: 'https://praecept.ai' }],
    },
    {
      id: 'safelink', idx: '03', name: 'SafeLink', status: 'in-progress',
      tagline: 'An offline-first emergency app: phones relay help requests and road closures over Bluetooth, and give directions from maps stored on the phone.',
      tags: ['React Native', 'BLE', 'Swift / Kotlin'],
      metric: { value: 'Top 5', label: 'of 64 teams, BE Smart Hackathon' },
      cardProblem: 'When cell towers and the internet fail, people cannot call for help or find a way out.',
      cardStack: 'React Native, native BLE modules in Swift and Kotlin, offline A* routing, Node.js, FastAPI (hackathon backend)',
      cardOutcome: 'Top 5 of 64 teams at the BE Smart Hackathon; offline routing checked against an independent shortest-path search.',
      problem: 'During disasters, cell towers and the internet fail exactly when people need to reach help, and the alerts that do arrive are often delayed, overly broad or irrelevant to where a person actually is. SafeLink keeps communities connected without a network and routes people around roads that others have reported closed.',
      approach: 'SafeLink began as a hackathon project built with a team of five, where I built the FastAPI backend: GDACS event ingestion with caching, IP-geolocation fallback, geodesic risk tiers, scheduled proximity jobs and rate-limited alerts. I then carried the codebase forward as SafeLink Sentinel, a React Native app. Signed messages hop between phones over Bluetooth Low Energy, with native modules in Swift and Kotlin, help requests carry a position, and road closures reported by other phones are routed around. Routing is offline A* over typed-array road graphs from signed, downloadable map packs, with a spatial grid for closure masking.',
      stack: 'React Native, Swift and Kotlin (native BLE), Node.js and Express, FastAPI and Python (hackathon backend), signed map packs, typed-array OpenStreetMap graphs.',
      outcome: 'Top 5 of 64 teams at the BE Smart Hackathon. In the app, offline A* routing matches an independent Dijkstra search to within one second across 40 seeded trips per travel mode. Status: pre-release. The automated tests pass on every change, but the mesh has not yet been tested between two real phones.',
      gallery: [
        { src: 'assets/projects/safelink/routing-tests.webp', alt: 'Terminal output of the SafeLink routing tests, which compare the app router with an independent shortest-path search, passing', caption: 'The app\'s routing tests, run locally: 40 random trips per travel mode must match an independent Dijkstra search to within one second, and closure lookups must match a full scan.' },
        { src: 'assets/projects/safelink/dashboard.webp', alt: 'SafeLink rescue operations dashboard', caption: 'The team dashboard from the live demo. The counters read zero because the public demo holds no live rescue data. My part was the FastAPI ingestion and alert-dispatch backend.' },
        { src: 'assets/projects/safelink/disaster-management.webp', alt: 'SafeLink disaster management screen with an emergency preparedness checklist', caption: 'Pre-, during- and post-disaster checklists in the same live demo.' },
        { src: 'assets/projects/safelink/first-aid.webp', alt: 'SafeLink AI first aid guide screen', caption: 'The AI first-aid guide screen.' },
        { src: 'assets/projects/disaster-sentinel/api-docs.webp', alt: 'Interactive API documentation for the SafeLink backend service', caption: 'My backend service running locally on its own, with its interactive API docs.' },
        { src: 'assets/projects/disaster-sentinel/requests.webp', alt: 'Terminal output of API requests subscribing a user, pushing a notification and reading health', caption: 'Real responses from a local run of the backend. The event cache is empty because the GDACS endpoint it calls has changed since the hackathon.' },
      ],
      links: [
        { label: 'App source', href: 'https://github.com/gasthecreator/safelink-sentinel' },
        { label: 'Hackathon source', href: 'https://github.com/BE-Hackathon-2025/SafeLink-' },
        { label: 'Live demo', href: 'https://safelink-dashboard.onrender.com/' },
        { label: 'Backend source', href: 'https://github.com/gasthecreator/disaster-sentinel' },
      ],
    },
    {
      id: 'cascade', idx: '04', name: 'Cascade Operator',
      tagline: 'A Kubernetes operator that stops cascading failures before they finish.',
      tags: ['Go', 'Kubernetes', 'Istio / Linkerd'],
      metric: { value: '63.2% → 31.8%', label: 'fan-out error rate, k6 benchmark' },
      cardProblem: 'Meshes have circuit breakers, but nothing decides when to use them.',
      cardStack: 'Go, Kubebuilder, Prometheus, Istio, Linkerd, Tetragon',
      cardOutcome: 'Cut fan-out error rate from 63.2% to 31.8% on a live cluster.',
      problem: 'Istio and Linkerd both ship circuit breaking, but today a human hand-tunes thresholds after an incident. Nothing decides when to tighten them, so failures spread before anyone reacts.',
      approach: 'The operator watches Prometheus for three cascade signatures (latency/error cascades, retry storms and fan-out amplification), then patches whichever mesh primitive controls that failure mode and ramps a stepwise restore once the signal clears. One shared interface runs on either Istio or Linkerd, and optional Tetragon eBPF TCP-reset signals corroborate a verdict.',
      stack: 'Go, controller-runtime / Kubebuilder, Prometheus, Istio, Linkerd, k6, Tetragon, property-based testing with rapid.',
      outcome: 'A k6 benchmark on a live cluster, detect-only versus mitigated, cut fan-out amplification\'s error rate from 63.2% to 31.8% and the latency/error cascade\'s from 8.6% to 3.3%. Reconciler correctness is fuzzed with property-based tests against invariants like restore-step monotonicity. The repo runs GitHub Actions CI with golangci-lint, unit and integration tests, plus CodeQL, OpenSSF Scorecard, Dependabot and CODEOWNERS.',
      gallery: [
        { src: 'assets/projects/cascade/replay-latency-cascade.webp', alt: 'Cascade Operator visual replay showing a tripped service and the patched DestinationRule', caption: 'Replay of a real episode captured from the live demo cluster: the operator trips and patches the DestinationRule for payments-service.' },
        { src: 'assets/projects/cascade/replay-retry-storm.webp', alt: 'Cascade Operator visual replay of a retry storm during the stepwise restore', caption: 'A retry-storm episode during the stepwise restore (restore step 3).' },
        { src: 'assets/projects/cascade/replay-fanout.webp', alt: 'Cascade Operator visual replay of a fan-out amplification episode', caption: 'A fan-out amplification episode, with the outlier-detection settings the operator applied to payments-service.' },
        { src: 'assets/projects/cascade/benchmark.webp', alt: 'Bar charts comparing error rates with detect-only and mitigate modes for three cascade scenarios', caption: 'Benchmark results from the repo\'s benchmark doc. Retry storm barely moves by design, and the chart says so.' },
        { src: 'assets/projects/cascade/tests.webp', alt: 'Terminal output of the Cascade Operator Go test packages passing', caption: 'The operator\'s unit and controller tests, run locally.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/Cascade-Operator' }],
    },
    {
      id: 'tierfs', idx: '05', name: 'TierFS',
      status: 'in-progress',
      tagline: 'A tiered-storage filesystem for macOS that moves cold files to other devices and recalls them on demand, and never trusts a copy it has not verified.',
      tags: ['C/C++17', 'FUSE-T', 'AES-256-GCM'],
      metric: { value: '1 MiB', label: 'encrypted chunks, verified before anything leaves the Mac' },
      cardProblem: 'A bug in an offload can destroy the only copy of a file.',
      cardStack: 'C/C++17, FUSE-T, Swift/AppKit, OpenSSL 3, SQLite, Bonjour, Android NDK',
      cardOutcome: 'Crash-injection and mutation-tested engines. A work in progress: the mount layer is still unproven.',
      problem: 'A Mac fills up with files it rarely touches, but moving them elsewhere usually means losing the path, the speed, or the certainty that the data is still intact. A bug in an offload can destroy the only copy of a file, so the design starts from never trusting a copy that has not been verified.',
      approach: 'Files are split into 1 MiB chunks, encrypted with AES-256-GCM and authenticated, with keys derived from a recovery phrase, and hydrated on demand. A SQLite ledger (WAL, hash-chained history, full fsync) journals every step of an offload, restore and recall, so a crash is finished or undone at the next start. A file leaves the Mac only after enough copies pass a fresh audit and a backup is on record, and nothing moves until the user approves the exact plan. Devices are found over Bonjour and paired with X25519 and AES-GCM sessions. The device server also builds for Android through JNI and the NDK, with a foreground service that restarts at boot, and a Swift/AppKit menu-bar app shows the state.',
      stack: 'C/C++17, FUSE-T, OpenSSL 3, SQLite (WAL), Bonjour (mDNS/DNS-SD), Swift/AppKit, Android NDK and JNI, mutation testing, GitHub Actions.',
      outcome: 'The core engines (ledger, crypto, replication, offload, recovery) are crash-injection and mutation tested, with GitHub Actions CI on Linux, three Android ABIs and an API 34 emulator, alongside CodeQL scanning, OpenSSF Scorecard and Dependabot. Status: work in progress. The FUSE mount layer is unproven, because mounting through FUSE-T triggered a kernel panic in macOS\'s NFS client during testing, so real-mount testing is paused. The Android agent has so far been tried only on an emulator.',
      gallery: [
        { src: 'assets/projects/tierfs/tests.webp', alt: 'Terminal output of the TierFS no-mount test suite, binary by binary, with the passing summaries', caption: 'The full no-mount test suite run locally, the same target CI runs: ledger, crypto, device store, replication, offload, recovery, overlay, daemon, locks, discovery, pairings and a fuzz run. 20 summaries read ALL PASSED, 16,535 checks passed and none failed. Output trimmed to each binary and its last result line. Nothing here mounts a filesystem.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/tierfs' }],
    },
    {
      id: 'vigil', idx: '06', name: 'Vigil',
      status: 'in-progress',
      tagline: 'An open research platform for breast-cancer follow-up that estimates tumor kinetics from lab trends, with every metric labelled synthetic and every claim policy-checked.',
      tags: ['Python', 'PyTorch', 'JAX'],
      metric: { value: '0.79', label: 'IPCW AUC at best, XGBoost on a synthetic cohort' },
      cardProblem: 'Slow drifts in follow-up lab results are easy to dismiss as noise, especially where resources are thin.',
      cardStack: 'Python, PyTorch, JAX, NumPyro/NUTS, scikit-learn, XGBoost, FastAPI',
      cardOutcome: 'Calibrated posterior estimates and censor-aware evaluation on synthetic cohorts. A research prototype, not a medical device.',
      problem: 'In breast-cancer follow-up, small sustained drifts in biomarkers such as CA 15-3 are often dismissed as noise before a clinician sees a pattern, particularly where tests are infrequent and resources are limited. Vigil explores decision support for that window, under strict rules about what may be claimed.',
      approach: 'PyTorch amortized and neural-posterior estimators, trained on 20,000 synthetic simulations per seed, estimate tumor-doubling time and CA 15-3 kinetics, and are evaluated for parameter recovery and posterior calibration. Evaluation is censor-aware, with leakage canaries and a patient-cluster bootstrap, benchmarked across 15,000 synthetic patients and three simulation generators. A claims policy checked in CI rejects metrics that are not labelled as synthetic.',
      stack: 'Python, PyTorch, JAX, NumPyro/NUTS, PyMC/PyTensor, scikit-learn, XGBoost, FastAPI, Next.js.',
      outcome: 'On the held-out synthetic cohorts, XGBoost reached 0.79 IPCW AUC on the first generator and 0.78 on the third, against 0.50 for a prevalence-only baseline, and the shuffled-label canaries stayed at chance. Everything here is on synthetic data: Vigil is a research prototype and decision-support aid, not a medical device. The repo runs GitHub Actions CI with quality gates, CodeQL, secret scanning (gitleaks), OWASP ZAP baseline scans, OpenSSF Scorecard, Dependabot and CODEOWNERS.',
      gallery: [
        { src: 'assets/projects/vigil/evaluation.webp', alt: 'Bar chart of held-out IPCW AUC for five models across three synthetic generators', caption: 'Held-out evaluation from the repo\'s experiment report, on synthetic cohorts only. The shuffled-label canaries stayed near 0.50 for every model.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/vigil' }],
    },
  ],

  archive: [
    {
      id: 'quorum', name: 'Quorum', domain: 'Applied AI', status: 'in-progress',
      tagline: 'A local app where open-weight models review code, debate it, and a judge rules, with each model\'s vote weighted by how well it measured on that kind of problem.',
      tech: ['Python', 'FastAPI', 'Ollama'], thumb: 'Winner',
      metric: { value: 'Winner', label: 'Best Use of Open Source Models, Hacktoberfest Hack Day Grambling' },
      problem: 'One small model reviewing a diff can miss a bug and sound just as sure either way. A plain majority vote across several models treats a weak reviewer on one kind of bug the same as a strong one, and gives no sign of who changed their mind or why.',
      approach: 'A panel of small open-weight models runs on the local machine through Ollama. They review a diff blind, then read each other\'s anonymized findings and revise, and a model can only change its mind by giving evidence. A judge then rules, and the screen shows who changed their mind, who dissented, and whether the judge overrode the weighted vote. Each model\'s vote is weighted by a per-category skill profile measured on a labeled corpus, using the Wilson 95% lower bound. Text pasted into the input is treated as data, and anything that tries to steer the models is flagged. Semgrep can confirm code findings as tool-verified, and an MCP server lets coding agents ask the panel for a local second opinion.',
      stack: 'Python, FastAPI, SQLite, Pydantic, Server-Sent Events, Semgrep, Model Context Protocol, React, TypeScript, Vite, Ollama. Models: Qwen2.5 3B, Llama 3.2 3B and Gemma 3 4B, all open-weight. MIT licensed.',
      outcome: 'Built solo, and won Best Use of Open Source Models at Hacktoberfest Hack Day Grambling. In a real run on three local models, all three flagged a seeded SQL injection and the judge agreed with the weighted vote (first screenshot). The calibration and evaluation corpora are small and synthetic, so I make no accuracy or model-ranking claims.',
      gallery: [
        { src: 'assets/projects/quorum/ruling.webp', alt: 'Quorum review room showing a seeded SQL injection diff and the final ruling with three supporters', caption: 'A real run on three local open-weight models. The diff with a seeded SQL injection is on the left, and the final ruling on the right shows the finding confirmed by all three reviewers, with the judge agreeing with the weighted vote.' },
        { src: 'assets/projects/quorum/group-chat.webp', alt: 'Quorum group chat where three local models answer one message and a judge summarizes', caption: 'Group chat: one message goes to three local models, they react to each other in the thread, and a judge summarizes where they agreed and disagreed.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/quorum' }],
    },
    {
      id: 'pharos', name: 'Pharos', domain: 'Distributed systems', status: 'shipped',
      tagline: 'A distributed adverse-event ingestion pipeline for clinical trials.',
      tech: ['Go', 'Kafka', 'Cassandra'], thumb: '101ms',
      metric: { value: '101ms', label: 'p95 under multi-datacenter load' },
      problem: 'A trial site can lose connectivity for days, a retry can silently duplicate a record, one misbehaving site can degrade everyone else, and event timestamps rarely arrive in the order they happened. Pharos tackles those four problems for adverse-event reporting across countries and time zones.',
      approach: 'Each site runs an edge collector with a SQLite WAL queue, so durability starts on local disk. Central ingestion applies per-site rate limiting, validation and deduplication through a Cassandra transactional outbox. Kafka is partitioned by site to preserve ordering, and every event carries both event-time and ingestion-time.',
      stack: 'Go, Apache Kafka (KRaft), Apache Cassandra across two datacenters, MirrorMaker 2 replication, Docker Compose, TLS everywhere with per-site API keys.',
      outcome: 'Fault-injection tests against real Cassandra and Kafka (not mocks) covered total partitions, asymmetric healing and out-of-order delivery, and design review caught five real correctness bugs before they shipped. Load-tested to a 101ms p95 with confirmed per-site rate-limit isolation, shipping signed container images with SBOM and SLSA provenance. CI runs on GitHub Actions with golangci-lint, govulncheck and CodeQL, plus OpenSSF Scorecard, Dependabot and CODEOWNERS.',
      gallery: [
        { src: 'assets/projects/pharos/load-test.webp', alt: 'Charts of Pharos load-test latency percentiles and burst rate-limiting results', caption: 'Load-test results from the repo\'s benchmark doc: latency for steady sites, and one bursting site being rate-limited without affecting the others.' },
        { src: 'assets/projects/pharos/tests.webp', alt: 'Terminal output of the Pharos unit, property and simulation tests passing', caption: 'Unit, property and simulation tests that need no cluster, run locally. The cluster-backed integration tests need the full Cassandra and Kafka topology.' },
        { src: 'assets/projects/pharos/cli.webp', alt: 'Terminal output of pharos-cli showing a stored adverse event and a dead-letter entry', caption: 'pharos-cli running against its built-in synthetic sample data: a stored event with its Kafka lineage, and a rejected event in the dead-letter queue.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/pharos' }],
    },
    {
      id: 'tripwire', name: 'Tripwire', domain: 'Security', status: 'in-progress',
      tagline: 'Automated DeFi exploit containment, in seconds instead of minutes.',
      tech: ['Rust', 'Solidity', 'Foundry'], thumb: '257 tests',
      metric: { value: '257 tests', label: 'passing: 220 Rust, 37 Foundry, incl. fuzzing' },
      problem: 'A single-transaction exploit finalizes in one block, so no reactive system can prevent the first loss. Real incidents often continue with more drains while a team is still being paged, and today\'s detection tools leave the response step to a human.',
      approach: 'A Rust detection engine (signature matching plus confidence scoring) feeds an on-chain, OpenZeppelin-based Guardian contract that can pause a protected vault. An integration test deploys the real contracts to a live anvil node and pauses them through the full pipeline.',
      stack: 'Rust, Solidity, OpenZeppelin, Foundry/anvil, Slither.',
      outcome: 'The claim is deliberately bounded: cut response time from human minutes to seconds so the second transaction never lands. 257 passing tests: 220 in Rust (including suites that run against live local anvil nodes and replays of four historical exploits) and 37 in Foundry (including fuzzing, a live reentrancy simulation and a seven-invariant stateful suite). The repo runs GitHub Actions CI for the Rust workspace (clippy) and the Foundry contract suites, plus CodeQL scanning. A portfolio-stage project, not an audited deployment.',
      gallery: [
        { src: 'assets/projects/tripwire/forge-tests.webp', alt: 'Terminal output of the Foundry contract tests, including the invariant suite, passing', caption: 'Foundry contract tests: 37 passing, including a fuzz test and a seven-invariant stateful suite.' },
        { src: 'assets/projects/tripwire/cargo-tests.webp', alt: 'Terminal output of the Rust workspace integration test suites passing', caption: 'Rust workspace tests, trimmed to each integration suite\'s summary line. 220 pass in total, including suites that run against live local anvil nodes and replays of four historical exploits.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/tripwire' }],
    },
    {
      id: 'release-checklist', name: 'Release Checklist Automation', domain: 'Internal tools', status: 'internal',
      tagline: 'Turns a bulk drop of release screenshots into a reviewed, template-faithful Excel checklist.',
      tech: ['C#', 'Open XML', 'MongoDB GridFS'], thumb: '87 tests',
      problem: 'Each release needs a Release Management Checklist workbook: dozens of evidence screenshots placed on the right worksheet tabs, 23 checklist rows set, release-team checkboxes ticked and internal hyperlinks connected so a reviewer can jump straight to the evidence. The reference workbook has 20 worksheets and 60 embedded screenshots, so assembling it takes real time on every release. This tool speeds that up while keeping a human review of every placement.',
      approach: 'An AI vision step suggests where each screenshot belongs, constrained to the allowed worksheet and checklist keys, and a human reviews every placement. I helped design the integration contracts and the stable-key model that hides all Excel coordinates behind a versioned template profile. I owned the export layer: an Open XML writer, sanitizer and manifest service, GridFS persistence for large binaries, and validation that blocks invalid packages before writing and again after reopening the saved file.',
      stack: '.NET 10, ASP.NET Core, Open XML SDK, MongoDB with GridFS, SQLite via EF Core, GitHub Copilot SDK, ImageSharp, Server-Sent Events, xUnit.',
      outcome: 'A dev deployment (v0.1.0) with 87 passing tests and a 60-image regression suite that compares workbooks semantically (structure, relationships, hyperlinks, drawings, formulas, validation rules, control state) instead of byte for byte. Manual checks in desktop Excel caught two defects that green tests missed: hyperlinks that left evidence off-screen, and checkbox state stored in two separate package parts. Both became permanent validation coverage.',
      gallery: [
        { src: 'assets/projects/release-checklist/architecture.webp', alt: 'Flow diagram of the Release Checklist Automation from screenshots to a validated workbook', caption: 'Architecture overview, redrawn for this site. The model suggests, a person decides, and the export layer refuses to write an invalid workbook.' },
      ],
      links: [],
    },
    {
      id: 'refraction', name: 'The Refraction', domain: 'Healthcare', status: 'shipped',
      tech: ['TypeScript', 'PostgreSQL', 'Passport.js'], thumb: 'TypeScript',
      tagline: 'An eye-prescription dashboard for optometrists.',
      problem: 'Optometrists need one place to create, view, edit and share patient prescription records.',
      approach: 'I implemented Passport.js authentication and RESTful PostgreSQL APIs, and integrated Mailjet and MessageBird so prescriptions can be shared and patients notified.',
      stack: 'TypeScript, Passport.js, PostgreSQL, REST APIs, Mailjet, MessageBird.',
      outcome: 'Built as a team during my Software Engineering internship at Grambling State University (Jan to Apr 2025).',
      gallery: [
        { src: 'assets/projects/refraction/dashboard.webp', alt: 'The Refraction optical prescription dashboard', caption: 'The team application running locally.' },
        { src: 'assets/projects/refraction/records.webp', alt: 'The Refraction patient records list', caption: 'Patient records list. Every patient shown is synthetic sample data.' },
        { src: 'assets/projects/refraction/details.webp', alt: 'The Refraction prescription detail page', caption: 'A prescription detail page with lens notes, for a synthetic patient. My part was authentication and the PostgreSQL REST APIs.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/Refraction-Team' }],
    },
  ],

  experience: [
    {
      dates: 'May 2026 – Aug 2026', role: 'Software Engineering Intern', org: 'Solera Holdings LLC · Westlake, TX',
      bullets: [
        'Engineered two automation workflows: an approval-triggered AI feedback pilot that generated 127 fix pull requests and 300+ issues for one target repository, and CAB tooling that converted release screenshots into validated Excel checklists.',
        'Blocked unproven AI fixes with read-only fault localization, xUnit and Jest failing-test gates and a five-part RED-to-GREEN verifier. Built an Open XML exporter validated against 60 regression images that opens cleanly in Excel.',
        'Owned delivery and reliability: GitHub Actions handoff to a one-shot .NET runner, Kubernetes deployment with health checks, and a lease-based durable state machine with idempotent dispatch, bounded retry and stranded-work recovery.',
      ],
      tags: ['C# / .NET 10', 'GitHub Actions', 'Open XML'],
    },
    {
      dates: 'Mar 2026 – May 2026', role: 'Software Engineer', org: 'Praecept · Remote, US',
      bullets: [
        'Implemented a Node.js CLI integrating LLM extraction, CourtListener APIs and asynchronous task handling to accelerate case research by an estimated 50%+ and prepare findings for structured human review.',
        'Hardened authentication by replacing custom JWT with Supabase Auth, adding backend-proxied HttpOnly sessions, Google OAuth (PKCE), JWKS verification, token revocation and Cloudflare-aware rate limiting.',
      ],
      tags: ['Node.js', 'Supabase Auth', 'OAuth PKCE'],
    },
    {
      dates: 'Nov 2025', role: 'Software Engineering Student', org: 'Black Enterprise · Charlotte, NC',
      bullets: [
        'Built SafeLink, a React Native emergency app with native BLE modules in Swift and Kotlin for phone-to-phone road-closure relaying and offline rerouting, placing Top 5 out of 64 teams at the BE Smart Hackathon.',
        'Engineered offline A* routing on typed-array OSM graphs with spatial-grid closure masking, validated against independent Dijkstra travel times within 1 second across 40 seeded trips per mode.',
      ],
      tags: ['React Native', 'BLE', 'A* routing'],
    },
    {
      dates: 'Jan 2025 – Apr 2025', role: 'Software Engineering Intern', org: 'Grambling State University · Grambling, LA',
      bullets: [
        'Implemented Passport.js authentication and RESTful PostgreSQL APIs for an eye clinic platform, integrating Mailjet and MessageBird notifications.',
      ],
      tags: ['Passport.js', 'PostgreSQL', 'REST'],
    },
  ],

  education: [
    {
      degree: 'B.S. in Computer Science',
      school: 'Grambling State University · Grambling, LA',
      dates: 'Graduating May 2028',
      achievements: ["National Olympiad Medalist", "Academic Achievement Scholarship (full ride)", "President's List"],
      coursework: 'Computer Science I & II, Data Structures and Algorithms, Discrete Structures, Intro to AI, AI Engineering, Deep Learning, Programming Languages, Computer Architecture, Database Systems',
    },
  ],
  certifications: ['AWS Cloud Foundations', 'IBM (AI, Cybersecurity, Data)', 'PwC Extern'],
  programs: ['Hacktoberfest Hack Day Grambling (Best Use of Open Source Models)', 'BE Smart Hackathon (Top 5 of 64)', 'eBay SWE Fellow', 'Break Through Tech (Cornell Tech)', 'Computing Talent Initiative', 'AI4ALL', 'CodePath', 'Eli Lilly Discovery Day Fellow', 'Amazon AI/ML Symposium', 'ColorStack', 'Vassar Burnam Fellowship Volunteer', 'NSBE', 'NSYP', 'EY Expedition', 'NaijaCoder'],

  closing: "Let's build something that keeps working.",
};
