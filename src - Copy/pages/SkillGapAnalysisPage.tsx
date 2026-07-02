import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Lock,
  Map,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

export default function SkillGapAnalysisPage() {
  const navigate = useNavigate();

  const [targetCareer, setTargetCareer] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeSkillGap = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!targetCareer.trim()) {
      alert("Enter your target career.");
      return;
    }

    if (!currentSkills.trim()) {
      alert("Enter your current skills.");
      return;
    }

    setAnalyzing(true);

    const skillList = currentSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const generatedResult = {
      readinessScore: 68,
      careerMatch: 74,
      learningPriority: "High",
      currentStrengths: skillList.length > 0 ? skillList : ["Basic learning interest"],
      missingSkills: [
        "Advanced concepts",
        "Real-world projects",
        "Portfolio building",
        "Interview preparation",
        "Industry tools",
      ],
      prioritySkills: [
        "Core fundamentals",
        "Project building",
        "Problem solving",
        "Communication",
        "Portfolio presentation",
      ],
      roadmap: [
        {
          month: "Month 1",
          title: "Foundation Building",
          tasks: ["Strengthen basics", "Practice daily", "Learn key tools"],
        },
        {
          month: "Month 2",
          title: "Project Practice",
          tasks: ["Build 2 mini projects", "Upload to GitHub", "Document learning"],
        },
        {
          month: "Month 3",
          title: "Job Readiness",
          tasks: ["Prepare resume", "Practice interviews", "Apply for internships"],
        },
      ],
      suggestions: [
        "Focus on one target career path instead of learning everything randomly",
        "Build projects that prove your skill, not only certificates",
        "Track progress weekly inside CareerZoid roadmap generator",
        "Improve resume and LinkedIn after completing key projects",
      ],
    };

    setTimeout(async () => {
      setResult(generatedResult);

      await addDoc(collection(db, "skillGapAnalyses"), {
        userId: user.uid,
        userEmail: user.email || "",
        targetCareer: targetCareer.trim(),
        currentSkills: skillList,
        experienceLevel,
        ...generatedResult,
        createdAt: serverTimestamp(),
      });

      setAnalyzing(false);
    }, 1500);
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

        <section className="grid lg:grid-cols-2 gap-8 items-center mb-8">
          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
              <Sparkles size={16} />
              CareerZoid AI Tool
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Skill Gap Analysis
            </h1>

            <p className="text-gray-400 text-lg mt-5">
              Compare your current skills with your target career and get a clear
              missing-skill report with a priority learning roadmap.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
              <Brain size={48} />
            </div>

            <h2 className="text-3xl font-black">
              Career Readiness Engine
            </h2>

            <p className="text-gray-400 mt-3">
              This MVP generates a professional demo report. Real Gemini AI can be connected later.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">
              Analyze Your Gap
            </h2>

            <label className="block">
              <span className="text-gray-400 text-sm">
                Target Career
              </span>

              <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4">
                <Target size={18} className="text-purple-300" />

                <input
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  placeholder="Example: Data Scientist"
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </label>

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Current Skills
              </span>

              <textarea
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="Example: Python, Excel, HTML, Communication"
                rows={5}
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
              />
            </label>

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Experience Level
              </span>

              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
              >
                <option className="bg-slate-900">Beginner</option>
                <option className="bg-slate-900">Intermediate</option>
                <option className="bg-slate-900">Advanced</option>
              </select>
            </label>

            <button
              onClick={analyzeSkillGap}
              disabled={analyzing}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black disabled:opacity-60"
            >
              {analyzing ? "Analyzing..." : "Analyze Skill Gap"}
            </button>
          </div>

          <div className="lg:col-span-2">
            {!result ? (
              <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center">
                <Lock size={60} className="mx-auto text-purple-300" />

                <h2 className="text-4xl font-black mt-6">
                  Skill Gap Report Will Appear Here
                </h2>

                <p className="text-gray-400 mt-4">
                  Enter your target career and current skills to generate a report.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <ScoreCard title="Readiness Score" score={result.readinessScore} />
                  <ScoreCard title="Career Match" score={result.careerMatch} />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <ListCard
                    title="Current Strengths"
                    icon={<CheckCircle className="text-green-300" />}
                    items={result.currentStrengths}
                  />

                  <ListCard
                    title="Missing Skills"
                    icon={<AlertTriangle className="text-yellow-300" />}
                    items={result.missingSkills}
                  />

                  <ListCard
                    title="Priority Skills"
                    icon={<Zap className="text-purple-300" />}
                    items={result.prioritySkills}
                  />
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Map className="text-purple-300" />

                    <h2 className="text-3xl font-black">
                      Suggested Learning Roadmap
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {result.roadmap.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-slate-950/60 border border-white/10 rounded-3xl p-6"
                      >
                        <p className="text-purple-300 font-black">
                          {item.month}
                        </p>

                        <h3 className="text-2xl font-black mt-2">
                          {item.title}
                        </h3>

                        <div className="grid md:grid-cols-3 gap-3 mt-5">
                          {item.tasks.map((task: string, taskIndex: number) => (
                            <div
                              key={taskIndex}
                              className="bg-white/5 border border-white/10 rounded-2xl p-4"
                            >
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ListCard
                  title="CareerZoid Suggestions"
                  icon={<Sparkles className="text-purple-300" />}
                  items={result.suggestions}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ScoreCard({ title, score }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
      <p className="text-gray-400">
        {title}
      </p>

      <div className="flex items-end gap-3 mt-4">
        <h3 className="text-7xl font-black text-purple-300">
          {score}
        </h3>

        <p className="text-gray-400 mb-3">
          /100
        </p>
      </div>

      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mt-6">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function ListCard({ title, icon, items }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        {icon}

        <h3 className="text-2xl font-black">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {items.map((item: string, index: number) => (
          <div
            key={index}
            className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-gray-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}