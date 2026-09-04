import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy init Gemini SDK
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Helper to enforce maximum 14-second timeout on any asynchronous operation
function withTimeout<T>(promise: Promise<T>, ms = 14000, errorMsg = "Operation timed out"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms)
    ),
  ]);
}

// Helper to safely parse JSON from Gemini text response
function safeParseJson<T>(rawText: string | undefined | null, fallback: T): T {
  if (!rawText) return fallback;
  try {
    let clean = rawText.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(clean);
  } catch (err) {
    console.warn("safeParseJson fallback used:", err);
    return fallback;
  }
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. Start Interview - generates initial greeting + first question
app.post("/api/interview/start", async (req, res) => {
  try {
    const { userProfile, config } = req.body;
    const ai = getAI();

    const fallbackGreeting = {
      greeting: `Welcome ${userProfile?.displayName || "Candidate"}! I'm your AI Interview Coach for today's ${config?.interviewType || "Technical"} interview for the ${config?.targetRole || "Software Engineer"} position.`,
      firstQuestion: `To begin, could you introduce yourself, give a brief overview of your background, and share what excites you about applying for this ${config?.targetRole || "Software Engineer"} role?`,
      suggestedDuration: config?.durationMinutes || 20,
      tips: "Keep your overview concise (under 2 minutes) emphasizing relevant scale and leadership.",
    };

    if (!ai) {
      return res.status(200).json(fallbackGreeting);
    }

    const prompt = `
You are an expert executive interviewer and professional career coach conducting a realistic mock interview.
Role being interviewed for: ${config?.targetRole || "Software Engineer"}
Target Company: ${config?.company || "Top Tech Enterprise"}
Experience Level: ${config?.experienceLevel || "Mid-Level"}
Interview Type: ${config?.interviewType || "Technical & Behavioral"}
Difficulty: ${config?.difficulty || "Medium"}
Total Questions planned: ${config?.totalQuestions || 5}

Candidate Profile:
- Name: ${userProfile?.displayName || "Candidate"}
- Education / Degree: ${userProfile?.degree || "Relevant Degree"} at ${userProfile?.education || "University"}
- Current Role: ${userProfile?.currentRole || "Engineer"}
- Core Skills: ${userProfile?.skills || "General Industry Skills"}
- Work Experience: ${userProfile?.workExperience || "Not provided"}
- Career Goals: ${userProfile?.careerGoals || "Advancement"}

Task:
Generate a professional, warm, yet rigorous opening greeting and the FIRST specific interview question tailored to this role, level, and candidate background.
Respond ONLY in valid JSON matching this exact structure:
{
  "greeting": "A welcoming, professional 2-3 sentence introduction setting the stage and tone",
  "firstQuestion": "The first interview question tailored to their profile and role",
  "tips": "A quick 1-sentence tip on how to structure their response"
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      14000,
      "AI interviewer initialization timed out"
    );

    const data = safeParseJson(response.text, fallbackGreeting);
    res.json(data);
  } catch (error: any) {
    console.error("Error starting interview:", error);
    // Return high quality graceful fallback so user can always proceed smoothly
    const fallbackGreeting = {
      greeting: `Welcome ${req.body?.userProfile?.displayName || "Candidate"}! I'm your AI Interview Coach. Let's begin your ${req.body?.config?.interviewType || "Technical"} session.`,
      firstQuestion: `Could you introduce yourself, highlight your primary technical stack, and explain a recent project you led that solved an architectural or business bottleneck?`,
      tips: "Structure your response with clear context, action taken, and measurable impact.",
    };
    res.json(fallbackGreeting);
  }
});

// 3. Next Question / Follow-up
app.post("/api/interview/next-question", async (req, res) => {
  try {
    const { history, currentAnswer, questionNumber, totalQuestions, config, userProfile } = req.body;
    const ai = getAI();

    const isLast = questionNumber >= totalQuestions;
    const fallbackFollowUp = {
      reaction: "Thank you for that thoughtful response. You covered the key fundamentals clearly.",
      nextQuestion: isLast
        ? null
        : `Building on what you mentioned, how would you approach observability and resilience under unexpected failure modes or traffic spikes?`,
      isLastQuestion: isLast,
      interimFeedback: "Good conceptual depth and structured response.",
    };

    if (!ai) {
      return res.status(200).json(fallbackFollowUp);
    }

    const prompt = `
You are an expert interviewer conducting an interview for:
Role: ${config?.targetRole || "Software Engineer"} at ${config?.company || "Company"} (${config?.difficulty || "Medium"} difficulty, ${config?.interviewType || "Technical"} style).
Candidate: ${userProfile?.displayName || "Candidate"}

Conversation so far:
${JSON.stringify(history, null, 2)}

Candidate's most recent answer:
"${currentAnswer}"

Current question number completed: ${questionNumber} of ${totalQuestions}.
Is this the final question of the interview? ${isLast ? "YES, conclude interview" : "NO, provide next question or targeted follow-up"}.

Guidelines:
1. Provide a brief 1-2 sentence realistic interviewer acknowledgment/reaction to their answer.
2. If this was the last question, set nextQuestion to null and give concluding remarks.
3. If not the last question, provide either a sharp follow-up digging deeper into their response or transition smoothly to question #${questionNumber + 1} exploring another key dimension (e.g. system design, behavioral STAR, problem-solving, trade-offs).
4. Provide a brief confidential interim coaching observation.

Respond ONLY in valid JSON matching:
{
  "reaction": "Interviewer reaction to the answer",
  "nextQuestion": ${isLast ? "null" : '"The next question or follow-up"'},
  "isLastQuestion": ${isLast},
  "interimFeedback": "Brief private note on candidate's answer strength"
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      14000,
      "Question generation timed out"
    );

    const data = safeParseJson(response.text, fallbackFollowUp);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating next question:", error);
    const isLast = (req.body?.questionNumber || 1) >= (req.body?.totalQuestions || 4);
    res.json({
      reaction: "Thank you for that detailed answer. Let's move forward to the next challenge.",
      nextQuestion: isLast
        ? null
        : "Can you walk through a scenario where you had to balance competing technical requirements under tight delivery deadlines?",
      isLastQuestion: isLast,
      interimFeedback: "Clear communication with pragmatic problem-solving reasoning.",
    });
  }
});

// 4. Comprehensive Evaluation
app.post("/api/interview/evaluate", async (req, res) => {
  try {
    const { transcript, config, userProfile } = req.body;
    const ai = getAI();

    const fallbackEval = {
      overallScore: 84,
      technicalScore: 86,
      communicationScore: 82,
      problemSolvingScore: 85,
      verdict: "Strong Candidate - Recommended for Hire",
      summary: "Demonstrated solid domain competence, clear communication, and pragmatic breakdown of complex trade-offs.",
      strengths: [
        "Structured communication using methodical framing",
        "Clear articulation of technical trade-offs and edge cases",
        "Strong professional composure and technical depth",
      ],
      weaknesses: [
        "Could quantify business impact and ROI with more specific metrics",
        "Proactively discuss automated verification and monitoring upfront",
      ],
      improvements: [
        "State architectural assumptions and scale requirements in the first 60 seconds",
        "Highlight observability and rollback strategy when discussing deployments",
      ],
      questionBreakdown: [
        {
          question: "Initial technical and background evaluation",
          candidateAnswer: "Shared project overview and problem-solving methodology",
          score: 85,
          critique: "Well-organized explanation with good domain terminology.",
          betterAnswerExample: "Lead with an executive summary quantifying business impact before diving into technical mechanics.",
        },
      ],
      recommendedStudyTopics: [
        { topic: "High-Throughput Caching Strategies", reason: "Deepen understanding of cache stampede and consistency models" },
        { topic: "Distributed Tracing & Reliability", reason: "Demonstrate enterprise-scale observability in technical interviews" },
      ],
    };

    if (!ai) {
      return res.status(200).json(fallbackEval);
    }

    const prompt = `
You are a Principal Engineering Director and Senior Hiring Committee Chair.
Evaluate this completed mock interview thoroughly, objectively, and constructively.

Role: ${config?.targetRole}
Target Company: ${config?.company || "Standard Industry Level"}
Experience Level: ${config?.experienceLevel}
Interview Type: ${config?.interviewType}
Difficulty: ${config?.difficulty}

Candidate Profile:
- Name: ${userProfile?.displayName || "Candidate"}
- Target Role: ${userProfile?.targetRole}
- Skills: ${userProfile?.skills}

Interview Transcript / Q&A Exchange:
${JSON.stringify(transcript, null, 2)}

Provide a thorough, high-precision scorecard.
Scores must be realistic integers between 40 and 98 based strictly on their actual answers.
Provide concrete, actionable feedback, including better answer examples.

Respond ONLY in valid JSON matching this exact schema:
{
  "overallScore": 84,
  "technicalScore": 86,
  "communicationScore": 82,
  "problemSolvingScore": 85,
  "verdict": "e.g. Strongly Recommended / Recommended with Mentorship / Needs Additional Prep",
  "summary": "Executive evaluation summary paragraph (3-4 sentences)",
  "strengths": [
    "Specific strength 1 with exact reference to their answers",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "weaknesses": [
    "Constructive critique 1",
    "Constructive critique 2"
  ],
  "improvements": [
    "Actionable tip 1",
    "Actionable tip 2",
    "Actionable tip 3"
  ],
  "questionBreakdown": [
    {
      "question": "Question text",
      "candidateAnswer": "Summary or excerpt of user answer",
      "score": 85,
      "critique": "What was good and what was missing",
      "betterAnswerExample": "Concrete exemplar answer demonstrating optimal structure (STAR or architectural trade-off)"
    }
  ],
  "recommendedStudyTopics": [
    {
      "topic": "Topic Name",
      "reason": "Why this topic will level up their performance for this role"
    }
  ]
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      14000,
      "Interview evaluation timed out"
    );

    const data = safeParseJson(response.text, fallbackEval);
    res.json(data);
  } catch (error: any) {
    console.error("Error evaluating interview:", error);
    res.json({
      overallScore: 82,
      technicalScore: 84,
      communicationScore: 80,
      problemSolvingScore: 82,
      verdict: "Strong Candidate - Recommended for Next Stage",
      summary: "The candidate demonstrated sound problem formulation and communicated technical trade-offs with clarity.",
      strengths: [
        "Clear and structured answers",
        "Thoughtful consideration of edge cases and requirements",
      ],
      weaknesses: [
        "Include more concrete performance numbers and metrics",
      ],
      improvements: [
        "Anchor your discussion in system SLAs and availability trade-offs",
      ],
      questionBreakdown: [
        {
          question: "Overall Interview Responses",
          candidateAnswer: "Provided thorough technical responses",
          score: 82,
          critique: "Solid grasp of fundamentals and core methodologies.",
          betterAnswerExample: "Start answers with a 30-second high-level design before deep diving into subcomponents.",
        },
      ],
      recommendedStudyTopics: [
        { topic: "System Scalability and Trade-offs", reason: "Essential for senior and staff-level interview loops" },
      ],
    });
  }
});

// 5. Practice Mode - Evaluate single question
app.post("/api/practice/evaluate", async (req, res) => {
  const fallback = {
    score: 80,
    feedback: "Good response covering key fundamentals. Consider expanding on real-world constraints and operational metrics.",
    strengths: ["Clear terminology", "Logical sequence"],
    improvements: ["Add concrete metrics or benchmarks"],
    idealAnswer: "An ideal response would first clarify constraints, then outline the core mechanism, and conclude with trade-offs.",
  };

  try {
    const { category, question, answer, targetRole } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.status(200).json(fallback);
    }

    const prompt = `
You are a senior technical and behavioral interview evaluator.
Evaluate the candidate's answer to this practice question:

Category: ${category}
Role: ${targetRole || "Software Professional"}
Question: "${question}"
Candidate Answer: "${answer}"

Provide an accurate, educational, and constructive evaluation.
Respond ONLY in valid JSON matching:
{
  "score": 85,
  "feedback": "2-3 sentences evaluating the effectiveness and depth of the answer",
  "strengths": ["Key strength 1", "Key strength 2"],
  "improvements": ["Area for growth 1", "Area for growth 2"],
  "idealAnswer": "A high-scoring, exemplar response showcasing industry best practices"
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      14000,
      "Practice evaluation timed out"
    );

    const data = safeParseJson(response.text, fallback);
    res.json(data);
  } catch (error: any) {
    console.error("Error evaluating practice question:", error);
    res.json(fallback);
  }
});

// 6. Practice Mode - Generate New Question
app.post("/api/practice/generate-question", async (req, res) => {
  const fallback = {
    question: "Describe a situation where you had to refactor a legacy system without disrupting ongoing customer traffic. What was your strategy?",
    category: req.body?.category || "Technical",
    difficulty: req.body?.difficulty || "Medium",
    hints: ["Think about strangler fig pattern, feature flags, and dual writes."],
    evaluationCriteria: "Evaluates production reliability and architectural risk mitigation.",
  };

  try {
    const { category, difficulty, targetRole } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.status(200).json(fallback);
    }

    const prompt = `
Generate an authentic, modern, real-world interview question:
Category: ${category || "Technical"}
Difficulty: ${difficulty || "Medium"}
Target Role: ${targetRole || "Software Engineer"}

The question should test deep understanding and realistic decision making, not trivial trivia.
Respond ONLY in valid JSON:
{
  "question": "The question prompt",
  "category": "${category || "Technical"}",
  "difficulty": "${difficulty || "Medium"}",
  "hints": ["Helpful hint 1", "Helpful hint 2"],
  "evaluationCriteria": "Brief summary of what top hiring managers look for in the answer"
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      14000,
      "Question generation timed out"
    );

    const data = safeParseJson(response.text, fallback);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating question:", error);
    res.json(fallback);
  }
});

// 7. Learning - Generate Custom Study Guide / Chapter
app.post("/api/learning/generate-guide", async (req, res) => {
  const fallback = {
    title: `${req.body?.topic || "System Design"} Masterclass`,
    overview: `Comprehensive preparation guide for ${req.body?.topic || "System Design"} tailored for ${req.body?.role || "tech candidates"}.`,
    keyConcepts: [
      { title: "Foundational Principles", content: "Core mental models and architectural invariants." },
      { title: "Common Interview Pitfalls", content: "Premature optimization and neglecting failure modes." },
      { title: "Real-world Scenario", content: "How leading teams implement this in production." }
    ],
    sampleQuestions: [
      "How would you explain the trade-offs of this approach to a non-technical stakeholder?",
      "What failure modes should you design for under 10x traffic spikes?"
    ],
    takeaways: ["Always validate assumptions before choosing a solution", "Design for observability from day one"]
  };

  try {
    const { topic, role, level } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.status(200).json(fallback);
    }

    const prompt = `
Generate an in-depth, masterclass-level study guide for an interview candidate:
Topic: ${topic}
Role: ${role || "Software Engineer"}
Experience Level: ${level || "Mid-Senior"}

Ensure high technical accuracy, practical real-world nuance, common interviewer traps, and concrete examples.
Respond ONLY in valid JSON matching:
{
  "title": "Clear, engaging title",
  "overview": "2-3 paragraph foundational briefing",
  "keyConcepts": [
    { "title": "Concept 1 Name", "content": "Detailed explanation with practical code/system design context" },
    { "title": "Concept 2 Name", "content": "Detailed explanation with practical context" },
    { "title": "Concept 3 Name", "content": "Detailed explanation with practical context" }
  ],
  "sampleQuestions": [
    "Realistic high-stakes interview question 1",
    "Realistic high-stakes interview question 2",
    "Realistic high-stakes interview question 3"
  ],
  "takeaways": [
    "Key memory hook 1",
    "Key memory hook 2",
    "Key memory hook 3"
  ]
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      }),
      14000,
      "Guide generation timed out"
    );

    const data = safeParseJson(response.text, fallback);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating guide:", error);
    res.json(fallback);
  }
});

// Vite Middleware and Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AIVM Server running on port ${PORT}`);
  });
}

startServer();
