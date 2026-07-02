import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle,
  Link,
  Link as LinkIcon,
  Lock,
  Sparkles,
  Target,
  UserCheck,
  Zap,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

export default function LinkedInAnalyzerPage() {
  const navigate = useNavigate();

  const [profileUrl, setProfileUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeLinkedIn = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!profileUrl.trim()) {
      alert("Enter LinkedIn profile URL.");
      return;
    }

    if (!targetRole.trim()) {
      alert("Enter your target role.");
      return;
    }

    setAnalyzing(true);

    const generatedResult = {
      profileScore: 81,
      headlineScore: 76,
      aboutScore: 70,
      skillsScore: 84,
      experienceScore: 78,
      networkingScore: 68,
      strengths: [
        "Profile has a clear professional direction",
        "Skills section is useful for recruiter search",
        "Education and basic details are visible",
        "Good foundation for personal branding",
      ],
      weaknesses: [
        "Headline can be more role-specific",
        "About section needs stronger storytelling",
        "Featured section is missing or weak",
        "Networking activity can be improved",
      ],
      missingKeywords: [
        "Internship",
        "Projects",
        "GitHub",
        "Problem Solving",
        "Portfolio",
      ],
      suggestions: [
        "Rewrite headline with target role + skills",
        "Add a strong About section with goals and achievements",
        "Add GitHub, portfolio, certificates and projects to Featured section",
        "Post 2-3 learning updates every week",
        "Connect with founders, recruiters, seniors and alumni",
      ],
    };

    setTimeout(async () => {
      setResult(generatedResult);

      await addDoc(collection(db, "linkedinAnalyses"), {
        userId: user.uid,
        userEmail: user.email || "",
        profileUrl: profileUrl.trim(),
        targetRole: targetRole.trim(),
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
              LinkedIn Analyzer
            </h1>

            <p className="text-gray-400 text-lg mt-5">
              Analyze your LinkedIn profile for headline quality, about section,
              skills, experience, networking strength and recruiter visibility.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
              <Link size={48} />
            </div>

            <h2 className="text-3xl font-black">
              Recruiter Visibility Engine
            </h2>

            <p className="text-gray-400 mt-3">
              This MVP gives demo LinkedIn analysis. Real AI profile analysis can be connected later through Gemini.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">
              Analyze Profile
            </h2>

            <label className="block">
              <span className="text-gray-400 text-sm">
                LinkedIn Profile URL
              </span>

              <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4">
                <LinkIcon size={18} className="text-purple-300" />

                <input
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </label>

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Target Role
              </span>

              <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4">
                <Target size={18} className="text-purple-300" />

                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Example: Data Analyst"
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </label>

            <button
              onClick={analyzeLinkedIn}
              disabled={analyzing}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black disabled:opacity-60"
            >
              {analyzing ? "Analyzing..." : "Analyze LinkedIn"}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              For MVP, this creates a professional demo analysis and stores it in Firestore.
            </p>
          </div>

          <div className="lg:col-span-2">
            {!result ? (
              <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center">
                <Lock size={60} className="mx-auto text-purple-300" />

                <h2 className="text-4xl font-black mt-6">
                  LinkedIn Report Will Appear Here
                </h2>

                <p className="text-gray-400 mt-4">
                  Add LinkedIn profile URL and target role to generate report.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <ScoreCard title="Profile Strength" score={result.profileScore} />
                  <ScoreCard title="Recruiter Visibility" score={result.networkingScore} />
                </div>

                <div className="grid md:grid-cols-4 gap-5">
                  <MiniScore title="Headline" score={result.headlineScore} />
                  <MiniScore title="About" score={result.aboutScore} />
                  <MiniScore title="Skills" score={result.skillsScore} />
                  <MiniScore title="Experience" score={result.experienceScore} />
                </div>

                <KeywordCard
                  title="Missing Recruiter Keywords"
                  items={result.missingKeywords}
                />

                <div className="grid lg:grid-cols-3 gap-6">
                  <FeedbackCard
                    title="Strengths"
                    icon={<CheckCircle className="text-green-300" />}
                    items={result.strengths}
                  />

                  <FeedbackCard
                    title="Weaknesses"
                    icon={<AlertTriangle className="text-yellow-300" />}
                    items={result.weaknesses}
                  />

                  <FeedbackCard
                    title="Suggestions"
                    icon={<Zap className="text-purple-300" />}
                    items={result.suggestions}
                  />
                </div>
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

function MiniScore({ title, score }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-3xl font-black mt-2 text-purple-300">
        {score}%
      </h3>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-purple-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function KeywordCard({ title, items }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <h3 className="text-2xl font-black mb-5">
        {title}
      </h3>

      <div className="flex flex-wrap gap-3">
        {items.map((item: string, index: number) => (
          <span
            key={index}
            className="px-4 py-3 rounded-2xl border bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeedbackCard({ title, icon, items }: any) {
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