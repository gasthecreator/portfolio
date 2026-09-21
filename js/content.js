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

  tagline: 'I build fault-tolerant systems, Kubernetes automation, and AI pipelines that verify their own work.',

  bio: "I'm a Computer Science & Cybersecurity student at Grambling State University (graduating May 2028) who builds the parts of software that have to keep working when things go wrong: distributed data pipelines, Kubernetes automation, and AI systems that must prove their own fixes. In summer 2026 at Solera Holdings I shipped two AI-driven pipelines that save 500+ engineering hours a month, built so AI-generated fixes must clear a failing-test proof and a human approval gate.",

  stats: [
    { value: '500+', label: 'engineering hours saved per month at Solera' },
    { value: '101ms', label: 'p95 in Pharos multi-datacenter load tests' },
    { value: 'Top 5', label: 'of 64 teams, BE Smart Hackathon' },
  ],

  skills: [
    { name: 'Languages', items: ['Go', 'Python', 'TypeScript', 'Rust', 'C#', 'Java', 'SQL'] },
    { name: 'Backend & Data', items: ['Node.js', 'FastAPI', '.NET', 'ASP.NET Core', 'Kafka', 'Cassandra', 'PostgreSQL'] },
    { name: 'Infrastructure', items: ['Kubernetes', 'Docker', 'Prometheus', 'Cloudflare'] },
    { name: 'Frontend', items: ['React', 'React Native', 'Vite'] },
    { name: 'AI Tooling', items: ['Claude', 'Cursor', 'Copilot', 'MCP'] },
  ],

  marquee: ['Go', 'Kubernetes', 'Kafka', 'Cassandra', 'TypeScript', 'Python', 'Rust', 'C#', '.NET', 'PostgreSQL', 'Node.js', 'Prometheus'],

  featured: [
    {
      id: 'pharos', idx: '01', name: 'Pharos',
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
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/pharos' }],
    },
    {
      id: 'cascade', idx: '02', name: 'Cascade Operator',
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
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/Cascade-Operator' }],
    },
    {
      id: 'safelink', idx: '03', name: 'SafeLink',
      tagline: 'Offline-first disaster alerts delivered over a Bluetooth mesh.',
      tags: ['FastAPI', 'Bluetooth mesh', 'AI'],
      metric: { value: '70%', label: 'lower alert notification latency' },
      cardProblem: 'When networks fail in a disaster, people cannot call for help.',
      cardStack: 'FastAPI, GDACS, Bluetooth / Wi-Fi mesh',
      cardOutcome: 'Top 5 of 64 teams; notification latency down 70%.',
      problem: 'During disasters, cell towers and the internet fail exactly when people need to reach help. SafeLink keeps communities connected with an offline mesh and AI-prioritized alerts.',
      approach: 'Phones form a Bluetooth and Wi-Fi mesh so alerts move device to device without internet. I built the distributed FastAPI backend for real-time event ingestion from GDACS, IP geolocation, dynamic risk scoring and tiered alert dispatch. Built with a team of five.',
      stack: 'FastAPI, GDACS event feed, Bluetooth and Wi-Fi mesh networking, AI routing and message prioritization.',
      outcome: 'Top 5 of 64 teams at the BE Smart Hackathon. The ingestion and dispatch path reduced notification latency by 70%.',
      links: [
        { label: 'Source', href: 'https://github.com/BE-Hackathon-2025/SafeLink-' },
        { label: 'Live demo', href: 'https://safelink-dashboard.onrender.com/' },
      ],
    },
    {
      id: 'tripwire', idx: '04', name: 'Tripwire', status: 'in-progress',
      tagline: 'Automated DeFi exploit containment, in seconds instead of minutes.',
      tags: ['Rust', 'Solidity', 'Foundry'],
      metric: { value: '55 tests', label: 'detection and contract tests, incl. fuzzing' },
      cardProblem: 'An exploit can drain a protocol before a human is even paged.',
      cardStack: 'Rust, Solidity, OpenZeppelin, Foundry/anvil, Slither',
      cardOutcome: 'Detection engine pauses a vault on-chain; 36 detection and 19 contract tests.',
      problem: 'A single-transaction exploit finalizes in one block, so no reactive system can prevent the first loss. Real incidents often continue with more drains while a team is still being paged, and today\'s detection tools leave the response step to a human.',
      approach: 'A Rust detection engine (signature matching plus confidence scoring) feeds an on-chain, OpenZeppelin-based Guardian contract that can pause a protected vault. An integration test deploys the real contracts to a live anvil node and pauses them through the full pipeline.',
      stack: 'Rust, Solidity, OpenZeppelin, Foundry/anvil, Slither.',
      outcome: 'The claim is deliberately bounded: cut response time from human minutes to seconds so the second transaction never lands. 36 detection tests including adversarial cases, and 19 contract tests including fuzzing and a live reentrancy simulation. A portfolio-stage project, not an audited deployment.',
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/tripwire' }],
    },
  ],

  archive: [
    {
      id: 'disaster-sentinel', name: 'Disaster Sentinel', domain: 'Backend', status: 'shipped',
      tech: ['Python', 'REST'], thumb: 'Python',
      tagline: 'Location-aware disaster alerts from live event feeds.',
      problem: 'Disaster alerts are often delayed, overly broad or irrelevant to where a user actually is, which erodes trust and slows response.',
      approach: 'Ingests user location (with an IP-geolocation fallback), pulls live events from the GDACS API, caches them for resilience, computes geodesic distance to classify risk tiers, and runs scheduled jobs with APScheduler. Alert delivery is rate-limited to prevent notification spam.',
      stack: 'Python, APScheduler, GDACS API, REST endpoints, lightweight JSON persistence.',
      outcome: 'Built during the BE Smart Hackathon (Top 5 of 64 teams). This repository preserves my individual backend contribution.',
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/disaster-sentinel' }],
    },
    {
      id: 'refraction', name: 'The Refraction', domain: 'Healthcare', status: 'shipped',
      tech: ['TypeScript', 'PostgreSQL', 'Passport.js'], thumb: 'TypeScript',
      tagline: 'An eye-prescription dashboard for optometrists.',
      problem: 'Optometrists need one place to create, view, edit and share patient prescription records.',
      approach: 'I implemented Passport.js authentication and RESTful PostgreSQL APIs, and integrated Mailjet and MessageBird so prescriptions can be shared and patients notified.',
      stack: 'TypeScript, Passport.js, PostgreSQL, REST APIs, Mailjet, MessageBird.',
      outcome: 'Built as a team during my Software Engineering internship at Grambling State University (Jan to Apr 2025).',
      links: [{ label: 'Source', href: 'https://github.com/gasthecreator/Refraction-Team' }],
    },
  ],

  experience: [
    {
      dates: 'May 2026 – Aug 2026', role: 'Software Engineering Intern', org: 'Solera Holdings LLC · Westlake, TX',
      bullets: [
        'Built and deployed two approval-triggered pipelines: one runs end-to-end AI fixes on customer feedback (cutting engineering hours 50%+), the other auto-generates release documentation (saving 500+ engineering hours a month).',
        'Co-designed and built a human-approved feedback pipeline on .NET 10: approved user feedback becomes an AI-generated GitHub issue and fix pull request. The pilot produced 127 AI-authored fix PRs.',
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
