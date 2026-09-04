import { DigitalBook, BlogPost, StudyTopic, PracticeQuestionItem } from "../types";

export const DIGITAL_BOOKS: DigitalBook[] = [
  {
    id: "star-method-mastery",
    title: "The STAR Method Playbook",
    subtitle: "Structuring Unbeatable Behavioral & Leadership Answers",
    author: "Elena Rostova & AIVM Editorial",
    category: "Behavioral",
    coverColor: "from-blue-600 to-indigo-800",
    readTime: "45 min read",
    chapters: [
      {
        id: "ch-1-framework",
        title: "Deconstructing the STAR Framework",
        summary: "Why hiring committees judge candidates on Situation, Task, Action, and Result.",
        content: [
          "Behavioral interviews are based on an empirical premise: past performance in unstructured conditions is the best predictor of future output.",
          "Most candidates falter by dedicating 70% of their response to the Situation and Task. Elite candidates invert this ratio: 15% Situation, 15% Task, 50% Action, and 20% quantified Result.",
          "In the Action phase, avoid the passive 'we decided' or 'the team thought'. Interviewers cannot evaluate a team; they evaluate you. Use 'I spearheaded', 'I diagnosed', 'I resolved the disagreement by benchmarking...'"
        ],
        actionItems: [
          "Draft 5 primary career stories covering: Conflict, High-Stakes Delivery, Failure/Recovery, Leadership, and Ambiguity.",
          "Ensure every story contains at least one numeric metric of business outcome."
        ]
      },
      {
        id: "ch-2-conflict-resolution",
        title: "Navigating Cross-Functional Disagreements",
        summary: "How to answer 'Tell me about a time you disagreed with a colleague or stakeholder' with grace.",
        content: [
          "Hiring managers don't look for people who avoid conflict; they look for people who can productively navigate differing perspectives without escalating emotions.",
          "Key formula: Clarify the core disagreement -> Identify shared business objectives -> Bring empirical data / run a small proof of concept -> Disagree and commit if necessary with zero resentment."
        ],
        actionItems: [
          "Highlight how empathy and active listening altered your perspective before reaching a final resolution."
        ]
      },
      {
        id: "ch-3-quantifying-impact",
        title: "The Power of Concrete Metrics",
        summary: "Transforming vague accomplishments into undeniable financial and engineering value.",
        content: [
          "Instead of saying 'I improved query performance significantly', state: 'I reduced P99 latency from 450ms to 42ms, decreasing database CPU utilization by 34% and unlocking $120k in annual cloud infrastructure savings.'",
          "If precise figures are proprietary, use percentage shifts, order-of-magnitude estimates, or team velocity indices."
        ],
        actionItems: [
          "Rewrite your resume bullets using Google's X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z]."
        ]
      }
    ]
  },
  {
    id: "modern-system-design",
    title: "System Design at Scale: The 45-Minute Blueprint",
    subtitle: "Architecting Resilient, Distributed Cloud Systems Under Pressure",
    author: "Dr. Marcus Vance",
    category: "System Design",
    coverColor: "from-emerald-600 to-teal-800",
    readTime: "60 min read",
    chapters: [
      {
        id: "sys-ch-1-requirements",
        title: "Scope & Back-of-the-Envelope Math",
        summary: "How to capture functional and non-functional requirements in the first 5 minutes.",
        content: [
          "Never start drawing boxes before you calculate throughput and storage requirements.",
          "Calculate QPS (Queries Per Second), Peak QPS (typically 2x-5x), Read-to-Write ratio, and 5-year storage projections.",
          "Rule of thumb: 1 million requests per day = ~12 QPS. 100 million requests/day = ~1,160 QPS."
        ],
        actionItems: [
          "Memorize standard power-of-two latencies: RAM access ~100ns, SSD read ~100μs, cross-datacenter roundtrip ~150ms."
        ]
      },
      {
        id: "sys-ch-2-data-layer",
        title: "The Data Layer: Sharding, Replication & Caching",
        summary: "Deciding between Relational, Document, Key-Value, and Time-Series data stores.",
        content: [
          "Consistency vs. Availability (CAP theorem) in practice: evaluate whether your service can tolerate eventual consistency (e.g. social feeds) or requires strict linearizability (e.g. payments/inventory).",
          "Cache strategies: Cache-Aside vs. Write-Through vs. Write-Back. Always discuss eviction policies (LRU, LFU) and cache stampede prevention (mutex locks or probabilistic early expiration)."
        ],
        actionItems: [
          "Be prepared to defend your shard key choice against hot-spotting."
        ]
      },
      {
        id: "sys-ch-3-failure-modes",
        title: "Resilience, Circuit Breakers & Graceful Degradation",
        summary: "What separates Senior from Staff engineers is designing for catastrophic failure.",
        content: [
          "Discuss rate limiters (Token Bucket, Leaky Bucket), circuit breakers (e.g., Netflix Hystrix/Resilience4j pattern), and fallback caches.",
          "Explain how the system operates when downstream services experience 100% outage: shed non-critical load, serve stale read-only cached snapshots, and queue writes with idempotent consumer replay."
        ],
        actionItems: [
          "Always include a dedicated Observability section (metrics, logs, distributed tracing)."
        ]
      }
    ]
  },
  {
    id: "executive-presence",
    title: "Executive Presence & Communication in Tech",
    subtitle: "Influencing Committees, Managing Up, and Projecting Calm Authority",
    author: "Sarah Chen",
    category: "Communication",
    coverColor: "from-amber-600 to-orange-800",
    readTime: "35 min read",
    chapters: [
      {
        id: "exec-ch-1-bottom-line",
        title: "The BLUF Principle (Bottom Line Up Front)",
        summary: "Deliver the answer in the first 10 seconds before unfolding the supporting narrative.",
        content: [
          "Senior interviewers have short attention spans. If asked 'Which database would you choose?', never spend 4 minutes surveying history. Say: 'I recommend PostgreSQL with read replicas for this phase, due to ACID compliance and relational integrity constraints. Here is the three-part rationale...'"
        ],
        actionItems: [
          "Practice answer compression: Summarize complex ideas into a 15-second thesis statement."
        ]
      },
      {
        id: "exec-ch-2-handling-curveballs",
        title: "What to Do When You Don't Know the Answer",
        summary: "Turning knowledge gaps into demonstrations of intellectual curiosity and diagnostic ability.",
        content: [
          "Never pretend to know an API or theorem you've never used. An interviewer will quickly identify bluffing.",
          "Instead, state your hypothesis: 'I haven't worked directly with that specific protocol, but based on the constraints of network latency and encryption overhead, my mental model suggests...' Then verify your hypothesis with the interviewer."
        ],
        actionItems: [
          "Use the 'Thinking Aloud' protocol to show how you decompose ambiguous questions."
        ]
      }
    ]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "cracking-the-behavioral-interview",
    title: "Why Most Senior Engineers Fail Behavioral Interviews (And How to Fix It)",
    snippet: "Technical excellence gets you the interview; emotional intelligence and structured storytelling get you the offer.",
    category: "Behavioral",
    author: "Marcus Vance",
    date: "Sep 2026",
    readTime: "6 min read",
    tags: ["Behavioral", "Career", "Leadership", "STAR"],
    content: [
      "When engineering candidates fail behavioral rounds, it is rarely because they lack achievements. It is almost always because their communication is unstructured, overly self-deprecating, or too vague to assess ownership.",
      "In tech interviews, the interviewer is answering one primary question: 'Do I want to work through a critical Sev-1 outage with this person at 2 AM?'",
      "Key takeaways to transform your performance: (1) Always define constraints clearly. (2) Own your specific contributions. (3) Emphasize what you learned when experiments failed. (4) Keep answers between 2.5 to 3.5 minutes."
    ]
  },
  {
    id: "system-design-back-of-envelope",
    title: "Mastering Back-of-the-Envelope Calculations for Tech Interviews",
    snippet: "A cheat-sheet of numbers every engineer should know by heart before walking into a system design interview.",
    category: "System Design",
    author: "Elena Rostova",
    date: "Aug 2026",
    readTime: "8 min read",
    tags: ["System Design", "Architecture", "Scaling"],
    content: [
      "Estimating system sizing is not about guessing exact numbers; it demonstrates comfort with scale, storage trade-offs, and throughput boundaries.",
      "Useful constants: 1 Byte = 8 bits. 1 KB = 10^3 Bytes. 1 MB = 10^6 Bytes. 1 GB = 10^9 Bytes. 1 TB = 10^12 Bytes. 1 PB = 10^15 Bytes.",
      "Time conversions: 1 day = 86,400 seconds (~10^5 seconds). 1 million daily active users making 10 requests each = 100 QPS average, with peak around 200-300 QPS."
    ]
  },
  {
    id: "voice-interviews-ai-coaching",
    title: "How to Practice with AI Voice to Eliminate Filler Words and Vocal Hesitations",
    snippet: "Using real-time speech analytics to master cadence, pitch modulation, and confident phrasing.",
    category: "Strategy",
    author: "AIVM Research Team",
    date: "Jul 2026",
    readTime: "5 min read",
    tags: ["Voice Coaching", "Public Speaking", "Confidence"],
    content: [
      "Filler words like 'um', 'like', and 'you know' are neurological buffers used when our speech speed exceeds our thought crystallization.",
      "When practicing with AIVM's voice mode, use deliberate 1-second pauses instead of vocalized fillers. To an interviewer, a pause sounds like thoughtful, strategic reflection; a continuous stream of filler words sounds like uncertainty.",
      "Record your practice sessions, review transcripts, and isolate recurring transition patterns."
    ]
  },
  {
    id: "negotiation-and-closing-the-offer",
    title: "The Subtle Art of Salary and Equity Negotiation for Tech Professionals",
    snippet: "How to leverage multiple offers, research salary percentiles, and communicate value without burning bridges.",
    category: "Career",
    author: "Sarah Chen",
    date: "Jun 2026",
    readTime: "7 min read",
    tags: ["Negotiation", "Offer Review", "Equity"],
    content: [
      "The highest-leverage moment in your job search occurs between the verbal offer and signing the contract.",
      "Never give your current salary or state a single anchor figure during initial recruiter screenings. Respond: 'I am looking for a competitive offer aligned with the market rate and expectations for this tier.'",
      "When countering, anchor with genuine excitement for the team mission, backed by demonstrable industry benchmarks."
    ]
  }
];

export const STUDY_TOPICS: StudyTopic[] = [
  {
    id: "distributed-caching",
    title: "Distributed Caching & Invalidation",
    category: "System Design",
    targetRole: "Backend / Fullstack / Infrastructure",
    summary: "Cache-aside vs write-through, redis clustering, thundering herd problems, and TTL strategies.",
    difficulty: "Advanced",
    estimatedMinutes: 25,
    keyPoints: [
      "Cache Aside pattern: App reads cache; on miss, reads DB, writes to cache.",
      "Thundering herd: when high-traffic key expires simultaneously, causing DB collapse.",
      "Solution: Probabilistic early expiration (XFetch) or mutex locks on cache misses."
    ],
    practicePrompt: "Design a caching layer for a trending news portal with 50M concurrent readers."
  },
  {
    id: "star-conflict-mastery",
    title: "Conflict Management with Product & Leadership",
    category: "Behavioral",
    targetRole: "All Roles",
    summary: "Proven frameworks to discuss disagreements on roadmap priorities, technical debt, and deadlines.",
    difficulty: "Intermediate",
    estimatedMinutes: 20,
    keyPoints: [
      "Frame the conflict around user or business impact, never personal opinions.",
      "Show how you gathered objective data or prototype results to test assumptions.",
      "Demonstrate 'Disagree and Commit' when the decision goes in the other direction."
    ],
    practicePrompt: "Tell me about a time you strongly disagreed with a product manager's feature priority."
  },
  {
    id: "database-indexing-query-plan",
    title: "B-Trees, LSM-Trees & Database Query Optimization",
    category: "Technical",
    targetRole: "Backend / Data / Fullstack",
    summary: "Understanding index scans, composite indexes, write amplification, and execution plans.",
    difficulty: "Advanced",
    estimatedMinutes: 30,
    keyPoints: [
      "B-Tree: Optimized for fast read lookups (O(log N)), disk page friendly.",
      "LSM-Tree: Optimized for sequential write throughput (Cassandra, RocksDB).",
      "Composite index order: equality columns first, then range filter columns."
    ],
    practicePrompt: "A query with WHERE tenant_id = ? AND created_at > ? is slow. How do you index it?"
  },
  {
    id: "mlops-model-serving",
    title: "Model Serving & Latency Optimization",
    category: "Machine Learning",
    targetRole: "ML Engineer / AI Specialist",
    summary: "Batching vs real-time inference, ONNX runtime, quantizing weights, and drift detection.",
    difficulty: "Advanced",
    estimatedMinutes: 35,
    keyPoints: [
      "Dynamic batching: combining requests within a 5ms window to maximize GPU utilization.",
      "Quantization: FP32 to INT8 precision reduction with minimal accuracy degradation.",
      "Concept drift vs Data drift monitoring with Kolmogorov-Smirnov statistical tests."
    ],
    practicePrompt: "How would you serve a 7B LLM with <100ms P95 latency for real-time customer support?"
  },
  {
    id: "frontend-performance-core-web-vitals",
    title: "Core Web Vitals & Hydration Optimization",
    category: "Frontend",
    targetRole: "Frontend / Fullstack Developer",
    summary: "LCP, INP, CLS benchmarks, streaming SSR, code splitting, and bundle size reduction.",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    keyPoints: [
      "INP (Interaction to Next Paint) measures responsiveness to user clicks and taps.",
      "Optimize by breaking up long JavaScript tasks (>50ms) using requestIdleCallback or scheduler.yield().",
      "Use skeleton layouts with fixed aspect ratios to prevent CLS layout shifts."
    ],
    practicePrompt: "A dashboard has an INP of 320ms during table filtering. How do you diagnose and fix it?"
  }
];

export const INITIAL_PRACTICE_QUESTIONS: PracticeQuestionItem[] = [
  {
    id: "pq-1",
    category: "Behavioral",
    role: "Any",
    difficulty: "Medium",
    question: "Tell me about a time when a project or initiative you led failed to meet its target or deadline. What happened, and how did you manage the fallout?",
    hints: [
      "Use the STAR method.",
      "Be honest about the failure without throwing teammates under the bus.",
      "Highlight the retrospective analysis and systemic improvements you instituted."
    ],
    evaluationCriteria: "Ownership, accountability, emotional resilience, learning mindset."
  },
  {
    id: "pq-2",
    category: "System Design",
    role: "Backend / Fullstack",
    difficulty: "Hard",
    question: "Design a real-time collaborative document editing service like Google Docs or Figma for 10,000 concurrent editors per document.",
    hints: [
      "Consider Operational Transformation (OT) vs CRDTs (Conflict-free Replicated Data Types).",
      "Think about WebSocket connection termination, room partitioning, and snapshotting.",
      "How do you persist history without unbounded document size?"
    ],
    evaluationCriteria: "Concurrency control, network protocols, state synchronization, edge cases."
  },
  {
    id: "pq-3",
    category: "Technical",
    role: "Software Engineer",
    difficulty: "Medium",
    question: "Explain the difference between optimistic concurrency control and pessimistic locking in distributed databases. When would you choose one over the other?",
    hints: [
      "Pessimistic: locks rows upfront; ideal for high contention (e.g. ticket booking).",
      "Optimistic: uses version numbers or timestamps; ideal for low-contention read-heavy systems."
    ],
    evaluationCriteria: "Deep understanding of database isolation levels, lock contention, throughput implications."
  },
  {
    id: "pq-4",
    category: "HR",
    role: "Any",
    difficulty: "Easy",
    question: "Why are you interested in joining our company, and what sets your technical problem-solving approach apart from other candidates?",
    hints: [
      "Align personal engineering philosophy with the company's product challenges.",
      "Cite specific technical blogs or open-source libraries from the company."
    ],
    evaluationCriteria: "Authenticity, company research, alignment of values."
  },
  {
    id: "pq-5",
    category: "Leadership",
    role: "Senior / Lead / Staff",
    difficulty: "Hard",
    question: "How do you evaluate and prioritize technical debt versus urgent new product features when communicating with non-technical executive stakeholders?",
    hints: [
      "Translate tech debt into business risk: downtime, onboarding velocity, security exposure.",
      "Propose dedicated percentage allocation (e.g. 20% capacity per sprint)."
    ],
    evaluationCriteria: "Executive communication, risk assessment, pragmatic balance."
  }
];
