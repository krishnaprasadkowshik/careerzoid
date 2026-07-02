import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  Brain,
  Bot,
  CheckCircle,
  Lock,
  Send,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { askGemini } from "../services/gemini";
import { db } from "../firebase/firestore";

export default function CareerAICoachPage() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<any[]>([
    {
      type: "ai",
      text: "Hi! I am your CareerZoid AI Coach. Ask me about careers, resume, ATS, LinkedIn, skills, roadmap, or interview preparation.",
    },
  ]);

  const sendMessage = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!message.trim()) return;

    const userMessage = message.trim();

    setChats((prev) => [
      ...prev,
      {
        type: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

const aiResponse = await askGemini(`
You are CareerZoid AI Coach, a premium career guidance assistant for students and early professionals.

User Question:
${userMessage}

Your job:
Answer based exactly on what the user asks.
Do NOT give a fixed template if it does not fit the question.
Be practical, direct, and complete.

Important rules:
- Use clear headings.
- Use bullet points.
- Give complete useful details, not only 5 points.
- If user asks about skills, give all important required skills grouped by category.
- If user asks about certifications, separate free and paid certifications.
- If user asks about roadmap, give month-wise or step-wise plan.
- If user asks about resume, give exact improvement points.
- If user asks about projects, give practical project ideas with difficulty.
- If user asks a small question, give a short clear answer.
- Do not write long paragraph blocks.
- Do not hallucinate exact salaries or guarantees.
- Keep answer student-friendly and action-focused.
- Dont add *,# these symbols
-give answers like premium

When relevant, include these sections:

🎯 Direct Answer
Give the clear answer to the question.

📚 Required Skills
Group skills like:
• Core Skills
• Tools
• Advanced Skills
• Soft Skills

🚀 Projects To Build
Give practical project ideas.

🏆 Certifications
Free Certifications:
• List useful free options

Paid Certifications:
• List useful paid options

⏳ Roadmap
Give step-wise or month-wise path.

✅ Next Action
Tell the user exactly what to do next.

Only include sections that are useful for the user's question.
`);setChats((prev) => [
  ...prev,
  {
    type: "ai",
    text: aiResponse,
  },
]);

await addDoc(collection(db, "careerAiChats"), {
  userId: user.uid,
  userEmail: user.email || "",
  message: userMessage,
  response: aiResponse,
  createdAt: serverTimestamp(),
});

setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/25 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
        >
          ← Back to Dashboard
        </button>

        <section className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
              <Sparkles size={16} />
              CareerZoid Premium AI
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Career AI Coach
            </h1>

            <p className="text-gray-400 text-lg mt-5">
              Ask anything about your career, resume, ATS, LinkedIn, skills,
              roadmap, projects, interviews, and job readiness.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
              <Bot size={50} />
            </div>

            <h2 className="text-3xl font-black">
              AI Career Mentor
            </h2>

            <p className="text-gray-400 mt-3">
              Powered by CareerZoid.Ask about careers, resumes, ATS optimization, LinkedIn growth, projects, interviews, and skill development.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <CoachCard
              icon={<Target />}
              title="Career Readiness"
              value="78%"
            />

            <CoachCard
              icon={<Brain />}
              title="Skill Growth"
              value="68%"
            />

            <CoachCard
              icon={<Zap />}
              title="Next Best Action"
              value="Build 1 project"
            />

            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
              <h3 className="text-2xl font-black mb-5">
                Quick Prompts
              </h3>

              <div className="space-y-3">
                {[
                  "How do I become a Data Scientist?",
                  "What projects should I build?",
                  "How can I improve my resume?",
                  "What should I learn after Python?",
                  "How to prepare for interviews?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setMessage(prompt)}
                    className="w-full text-left bg-slate-950/60 border border-white/10 rounded-2xl p-4 hover:border-purple-500 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] backdrop-blur-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Bot className="text-purple-300" />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  Ask CareerZoid AI
                </h2>

                <p className="text-gray-400 text-sm">
                  Career, resume, skills, roadmap and interview guidance
                </p>
              </div>
            </div>

            <div className="h-[520px] overflow-y-auto p-6 space-y-5">
              {chats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${
                    chat.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl p-5 ${
                      chat.type === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-950/70 border border-white/10 text-gray-300"
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">
  {chat.text}
</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950/70 border border-white/10 rounded-3xl p-5 text-gray-400">
                    Career AI is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Ask your career question..."
                  className="flex-1 bg-slate-950/70 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
                />

                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-black disabled:opacity-60"
                >
                  <Send />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-8">
          <InsightCard title="Resume" text="Improve summary, projects and measurable achievements." />
          <InsightCard title="LinkedIn" text="Add stronger headline, featured projects and weekly posts." />
          <InsightCard title="Roadmap" text="Complete your next unlocked roadmap mission today." />
        </section>
      </div>
    </div>
  );
}


function CoachCard({ icon, title, value }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="text-purple-300 mb-4">
        {icon}
      </div>

      <p className="text-gray-400">
        {title}
      </p>

      <h3 className="text-3xl font-black mt-2 text-purple-300">
        {value}
      </h3>
    </div>
  );
}

function InsightCard({ title, text }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <CheckCircle className="text-green-300 mb-4" />

      <h3 className="text-2xl font-black">
        {title}
      </h3>

      <p className="text-gray-400 mt-3">
        {text}
      </p>
    </div>
  );
}