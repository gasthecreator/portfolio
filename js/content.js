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

  bio: "I'm a Computer Science & Cybersecurity student at Grambling State University (graduating May 2028) who builds the parts of software that have to keep working when things go wrong: distributed data pipelines, Kubernetes automation, and AI systems that must prove their own fixes. In summer 2026 at Solera Holdings I shipped two AI-driven pipelines that save 500+ engineering hours a month, built so AI-generated fixes must clear a failing-test proof and a human approval gate.",

  stats: [
    { value: '500+', label: 'engineering hours saved per month at Solera' },
    { value: '101ms', label: 'p95 in Pharos multi-datacenter load tests' },
    { value: 'Top 5', label: 'of 64 teams, BE Smart Hackathon' },
  ],

  skills: [
    { name: 'Languages', items: ['Go', 'Python', 'TypeScript', 'JavaScript', 'Rust', 'C#', 'Java', 'Solidity', 'SQL'] },
    { name: 'Backend & Data', items: ['Node.js', 'Express', 'FastAPI', '.NET', 'ASP.NET Core', 'Kafka', 'Cassandra', 'MongoDB', 'PostgreSQL', 'Supabase'] },
    { name: 'Infrastructure', items: ['Kubernetes', 'Docker', 'Prometheus', 'Cloudflare'] },
    { name: 'Frontend', items: ['React', 'React Native', 'Vite'] },
    { name: 'AI Tooling', items: ['Claude', 'Cursor', 'Copilot', 'Gemini', 'Codex', 'MCP'] },
  ],

  // Which projects on this site back each skill. A skill with no entry is on the résumé but has no project here yet.
  skillEvidence: {
    'Go': ['pharos', 'cascade'], 'Python': ['safelink'], 'TypeScript': ['refraction'], 'JavaScript': ['praecept'],
    'Rust': ['tripwire'], 'C#': ['feedback-automation', 'release-checklist'], 'Solidity': ['tripwire'], 'SQL': ['refraction'],
    'Node.js': ['praecept'], 'Express': ['refraction'], 'FastAPI': ['safelink'],
    '.NET': ['feedback-automation', 'release-checklist'], 'ASP.NET Core': ['feedback-automation', 'release-checklist'],
    'Kafka': ['pharos'], 'Cassandra': ['pharos'], 'MongoDB': ['feedback-automation', 'release-checklist'],
    'PostgreSQL': ['refraction'], 'Supabase': ['praecept'],
    'Kubernetes': ['cascade', 'feedback-automation'], 'Docker': ['pharos', 'feedback-automation'],
    'Prometheus': ['cascade', 'pharos'], 'Cloudflare': ['praecept'],
    'Copilot': ['feedback-automation', 'release-checklist'],
  },
  skillsCore: ['Go', 'Kubernetes', 'C#', '.NET', 'Kafka', 'Cassandra'],

  marquee: ['Go', 'Kubernetes', 'Kafka', 'Cassandra', 'TypeScript', 'Python', 'Rust', 'C#', '.NET', 'PostgreSQL', 'Node.js', 'Prometheus'],

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
      stack: 'Node.js, LLM extraction, the CourtListener API, Supabase Auth with OAuth (PKCE), JWKS token verification, token revocation, HttpOnly session cookies, Cloudflare-aware rate limiting.',
      outcome: 'Live at praecept.ai, currently by invitation. Sessions use HttpOnly cookies instead of browser-stored tokens, and the pipeline feeds a structured review workflow. The source is private.',
      gallery: [
        { src: 'assets/projects/praecept/landing-map.webp', alt: 'Praecept landing page showing the interactive map of legal doctrine', caption: 'The public landing page at praecept.ai. My work sits behind it: the extraction pipeline and the authentication system.' },
      ],
      links: [{ label: 'Live site', href: 'https://praecept.ai' }],
    },
    {
      id: 'pharos', idx: '03', name: 'Pharos',
      tagline: 'A distributed adverse-event ingestion pipeline for clinical trials.',
      tags: ['Go', 'Kafka', 'Cassandra'],
      metric: { value: '101ms', label: 'p95 under multi-datacenter load' },
      cardProblem: 'Sites drop offline, retries duplicate records, and events arrive out of order.',
      cardStack: 'Go, Kafka, Cassandra, MirrorMaker 2',
      cardOutcome: 'Five real correctness bugs caught before shipping; 101ms p95 under load.',
      problem: 'A trial site can lose connectivity for days, a retry can silently duplicate a record, one misbehaving site can degrade everyone else, and event timestamps rarely arrive in the order they happened. Pharos tackles those four problems for adverse-event reporting across countries and time zones.',
      approach: 'Each site runs an edge collector with a SQLite WAL queue, so durability starts on local disk. Central ingestion applies per-site rate limiting, validation and deduplication through a Cassandra transactional outbox. Kafka is partitioned by site to preserve ordering, and every event carries both event-time and ingestion-time.',
      stack: 'Go, Apache Kafka (KRaft), Apache Cassandra across two datacenters, MirrorMaker 2 replication, Docker Compose, TLS everywhere with per-site API keys.',
      outcome: 'Fault-injection tests against real Cassandra and Kafka (not mocks) covered total partitions, asymmetric healing and out-of-order delivery, and design review caught five real correctness bugs before they shipped. Load-tested to a 101ms p95 with confirmed per-site rate-limit isolation, shipping signed container images with SBOM and SLSA provenance.',
      gallery: [
        { src: 'assets/projects/pharos/load-test.webp', alt: 'Charts of Pharos load-test latency percentiles and burst rate-limiting results', caption: 'Load-test results from the repo\'s benchmark doc: latency for steady sites, and one bursting site being rate-limited without affecting the others.' },
        { src: 'assets/projects/pharos/tests.webp', alt: 'Terminal output of the Pharos unit, property and simulation tests passing', caption: 'Unit, property and simulation tests that need no cluster, run locally. The cluster-backed integration tests need the full Cassandra and Kafka topology.' },
        { src: 'assets/projects/pharos/cli.webp', alt: 'Terminal output of pharos-cli showing a stored adverse event and a dead-letter entry', caption: 'pharos-cli running against its built-in synthetic sample data: a stored event with its Kafka lineage, and a rejected event in the dead-letter queue.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/pharos' }],
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
      outcome: 'A k6 benchmark on a live cluster, detect-only versus mitigated, cut fan-out amplification\'s error rate from 63.2% to 31.8% and the latency/error cascade\'s from 8.6% to 3.3%. Reconciler correctness is fuzzed with property-based tests against invariants like restore-step monotonicity.',
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
      id: 'tripwire', idx: '05', name: 'Tripwire', status: 'in-progress',
      tagline: 'Automated DeFi exploit containment, in seconds instead of minutes.',
      tags: ['Rust', 'Solidity', 'Foundry'],
      metric: { value: '257 tests', label: 'passing: 220 Rust, 37 Foundry, incl. fuzzing' },
      cardProblem: 'An exploit can drain a protocol before a human is even paged.',
      cardStack: 'Rust, Solidity, OpenZeppelin, Foundry/anvil, Slither',
      cardOutcome: 'Detection engine pauses a vault on-chain; 257 passing tests across Rust and Solidity.',
      problem: 'A single-transaction exploit finalizes in one block, so no reactive system can prevent the first loss. Real incidents often continue with more drains while a team is still being paged, and today\'s detection tools leave the response step to a human.',
      approach: 'A Rust detection engine (signature matching plus confidence scoring) feeds an on-chain, OpenZeppelin-based Guardian contract that can pause a protected vault. An integration test deploys the real contracts to a live anvil node and pauses them through the full pipeline.',
      stack: 'Rust, Solidity, OpenZeppelin, Foundry/anvil, Slither.',
      outcome: 'The claim is deliberately bounded: cut response time from human minutes to seconds so the second transaction never lands. 257 passing tests: 220 in Rust (including suites that run against live local anvil nodes and replays of four historical exploits) and 37 in Foundry (including fuzzing, a live reentrancy simulation and a seven-invariant stateful suite). A portfolio-stage project, not an audited deployment.',
      gallery: [
        { src: 'assets/projects/tripwire/forge-tests.webp', alt: 'Terminal output of the Foundry contract tests, including the invariant suite, passing', caption: 'Foundry contract tests: 37 passing, including a fuzz test and a seven-invariant stateful suite.' },
        { src: 'assets/projects/tripwire/cargo-tests.webp', alt: 'Terminal output of the Rust workspace integration test suites passing', caption: 'Rust workspace tests, trimmed to each integration suite\'s summary line. 220 pass in total, including suites that run against live local anvil nodes and replays of four historical exploits.' },
      ],
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/tripwire' }],
    },
  ],

  archive: [
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
      id: 'safelink', name: 'SafeLink', domain: 'Disaster response', status: 'shipped',
      tagline: 'Offline-first disaster alerts over a Bluetooth mesh, with a location-aware backend that decides who needs which alert.',
      tech: ['FastAPI', 'Bluetooth mesh', 'APScheduler', 'GDACS'], thumb: '70%',
      problem: 'During disasters, cell towers and the internet fail exactly when people need to reach help, and the alerts that do arrive are often delayed, overly broad or irrelevant to where a person actually is. SafeLink keeps communities connected with an offline mesh and sends alerts that match a user\'s real location.',
      approach: 'Phones form a Bluetooth and Wi-Fi mesh so alerts move device to device without internet. I built the backend, a distributed FastAPI service: it ingests live disaster events from GDACS and caches them for resilience, falls back to IP geolocation when a user\'s coordinates are missing, classifies risk tiers from geodesic distance and disaster type, runs scheduled refresh and proximity jobs with APScheduler, and dispatches rate-limited, tiered alerts so users are not spammed. Built with a team of five during a 24-hour hackathon sprint. My standalone backend is also published as its own repository.',
      stack: 'Python, FastAPI, APScheduler, GDACS event feed, geodesic distance with Geopy, JSON file persistence, Bluetooth and Wi-Fi mesh networking, AI routing and message prioritization.',
      outcome: 'Top 5 of 64 teams at the BE Smart Hackathon. The ingestion and dispatch path reduced notification latency by 70%.',
      gallery: [
        { src: 'assets/projects/safelink/dashboard.webp', alt: 'SafeLink rescue operations dashboard', caption: 'The team dashboard from the live demo. The counters read zero because the public demo holds no live rescue data. My part was the FastAPI ingestion and alert-dispatch backend.' },
        { src: 'assets/projects/safelink/disaster-management.webp', alt: 'SafeLink disaster management screen with an emergency preparedness checklist', caption: 'Pre-, during- and post-disaster checklists in the same live demo.' },
        { src: 'assets/projects/safelink/first-aid.webp', alt: 'SafeLink AI first aid guide screen', caption: 'The AI first-aid guide screen.' },
        { src: 'assets/projects/disaster-sentinel/api-docs.webp', alt: 'Interactive API documentation for the SafeLink backend service', caption: 'My backend service running locally on its own, with its interactive API docs.' },
        { src: 'assets/projects/disaster-sentinel/requests.webp', alt: 'Terminal output of API requests subscribing a user, pushing a notification and reading health', caption: 'Real responses from a local run of the backend. The event cache is empty because the GDACS endpoint it calls has changed since the hackathon.' },
      ],
      links: [
        { label: 'Source', href: 'https://github.com/BE-Hackathon-2025/SafeLink-' },
        { label: 'Live demo', href: 'https://safelink-dashboard.onrender.com/' },
        { label: 'Backend source', href: 'https://github.com/gasthecreator/disaster-sentinel' },
      ],
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
        'Built and deployed two approval-triggered pipelines: one runs end-to-end AI fixes on customer feedback (cutting engineering hours 50%+), the other auto-generates release documentation (saving 500+ engineering hours a month).',
        'Co-designed and built a faster feedback-to-fix pipeline on .NET 10: after a single approval, user feedback becomes an AI-generated GitHub issue and fix pull request. The pilot produced 127 AI-authored fix PRs.',
        'Owned delivery and reliability: GitHub Actions handoff to a one-shot .NET runner, Kubernetes deployment with health checks, and a lease-based durable state machine with idempotent dispatch, bounded retry and stranded-work recovery.',
        'Set the RED to GREEN success criterion for the AI core: a fix is only accepted after a failing test reproduces the defect and independent verification confirms it passes.',
        'Owned an Excel export subsystem for release-checklist automation: Open XML SDK writer with GridFS persistence, blocking invalid workbooks before writing and again on reopen, validated by a 60-image regression suite and 87 passing tests.',
      ],
      tags: ['C# / .NET 10', 'GitHub Actions', 'Open XML'],
    },
    {
      dates: 'Mar 2026 – May 2026', role: 'Software Engineer', org: 'Praecept · Remote, US',
      bullets: [
        'Engineered a Node.js CLI that orchestrates a multi-stage data pipeline, combining LLM extraction, external APIs (CourtListener) and asynchronous task routing into a structured review workflow.',
        'Architected production authentication: migrated custom JWT to Supabase Auth with backend-proxied HttpOnly sessions, OAuth (PKCE), JWKS verification, token revocation and Cloudflare-aware rate limiting.',
      ],
      tags: ['Node.js', 'Supabase Auth', 'OAuth PKCE'],
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
      degree: 'BSc. Computer Science & Cybersecurity',
      school: 'Grambling State University · Grambling, LA',
      dates: 'Graduating May 2028',
      achievements: ["National Olympiad Medalist", "Academic Achievement Scholarship (full ride)", "President's List"],
      coursework: 'Computer Science I & II, Data Structures and Algorithms, Discrete Structures, Intro to AI & AI Engineering, Foundations of Deep Learning, Programming Language Concepts, Computer Architecture, Database Management Systems',
    },
  ],
  certifications: ['AWS Cloud Foundations', 'IBM (AI, Cybersecurity, Data)', 'PwC Extern'],
  programs: ['BE Smart Hackathon (Top 5 of 64)', 'eBay Software Engineer Fellow (Pathways)', 'Break Through Tech (Cornell Tech)', 'EY Expedition', 'Computing Talent Initiative', 'AI4ALL', 'CodePath', 'Eli Lilly Discovery Day Fellow', 'Amazon AI/ML Symposium & Prep Series', 'ColorStack', 'Vassar College Burnam Fellowship Volunteer', 'NSBE', 'New Seasons Youth Program', 'NaijaCoder'],

  closing: "Let's build something that keeps working.",
};
