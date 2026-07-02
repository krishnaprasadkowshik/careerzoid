import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { askGemini } from "../services/gemini";
import { readResumeFile } from "../services/resumeReader";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle,
  FileCheck,
  FileText,
  Lock,
  Search,
  Sparkles,
  Target,
  Upload,
  Building2,
  Briefcase,
  FileSearch,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

const emptyResult = {
  isResume: true,
  atsScore: 0,
  parsingScore: 0,
  keywordScore: 0,
  formatScore: 0,
  sectionScore: 0,
  readabilityScore: 0,
  roleMatchScore: 0,
  interviewChance: "Medium",
  parsePreview: [],
  matchedKeywords: [],
  missingKeywords: [],
  formattingIssues: [],
  passedChecks: [],
  failedChecks: [],
  rejectionReasons: [],
  atsSuggestions: [],
  resumeRewriteTips: [],
};

export default function ATSCheckerPage() {
  const navigate = useNavigate();

  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [jobDescription, setJobDescription] = useState("");

  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setResumeName(file.name);
    setResumeFile(file);
    setResult(null);
  };

  const cleanJsonResponse = (text: string) => {
    return text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  };

  const checkATS = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!resumeFile) {
      alert("Please upload your resume first.");
      return;
    }

    if (!targetRole.trim()) {
      alert("Enter your target role.");
      return;
    }

    try {
      setChecking(true);
      setResult(null);

      const resumeText = await readResumeFile(resumeFile);

      if (!resumeText || resumeText.trim().length < 80) {
        alert("This file does not contain enough readable resume text.");
        setChecking(false);
        return;
      }

      const prompt = `
You are CareerZoid ATS Checker.

Your job is NOT to give general resume advice.
Your job is to simulate an Applicant Tracking System and AI recruiter screening.

TARGET ROLE:
${targetRole}

TARGET COMPANY:
${targetCompany || "Not provided"}

EXPERIENCE LEVEL:
${experienceLevel}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

RESUME TEXT:
${resumeText.slice(0, 12000)}

First decide if this document is actually a resume/CV.

If it is NOT a resume/CV, return ONLY valid JSON:
{
  "isResume": false,
  "error": "This file does not look like a resume or CV. Please upload a valid resume."
}

If it IS a resume/CV, return ONLY valid JSON:
{
  "isResume": true,
  "atsScore": 0,
  "parsingScore": 0,
  "keywordScore": 0,
  "formatScore": 0,
  "sectionScore": 0,
  "readabilityScore": 0,
  "roleMatchScore": 0,
  "interviewChance": "Low / Medium / High",
  "parsePreview": [],
  "matchedKeywords": [],
  "missingKeywords": [],
  "formattingIssues": [],
  "passedChecks": [],
  "failedChecks": [],
  "rejectionReasons": [],
  "atsSuggestions": [],
  "resumeRewriteTips": []
}

Rules:
- Return JSON only.
- No markdown.
- Scores must be realistic from 0 to 100.
- Focus on ATS parsing, keyword matching, section detection, formatting, readability, and role match.
- If job description is provided, compare resume directly with the job description.
- If target company is provided, judge company-style ATS expectations.
- parsePreview must include things ATS can detect, like Name, Email, Phone, Skills, Education, Experience, Projects, GitHub, LinkedIn.
- formattingIssues should include ATS problems like tables, icons, two columns, missing standard headings, graphics, unreadable structure if likely.
- rejectionReasons must be specific and strict.
- resumeRewriteTips must give better ATS-friendly bullet examples.
`;

      const aiResponse = await askGemini(prompt);
      const cleanResponse = cleanJsonResponse(aiResponse);
      const analysis = JSON.parse(cleanResponse);

      if (!analysis.isResume) {
        alert(analysis.error || "This file does not look like a resume.");
        setChecking(false);
        return;
      }

      const finalResult = {
        ...emptyResult,
        ...analysis,
      };

      setResult(finalResult);

      await addDoc(collection(db, "atsChecks"), {
        userId: user.uid,
        userEmail: user.email || "",
        resumeName,
        targetRole: targetRole.trim(),
        targetCompany: targetCompany.trim(),
        experienceLevel,
        jobDescription,
        ...finalResult,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("ATS check error:", error);
      alert("ATS check failed. Please try again with a proper resume.");
    } finally {
      setChecking(false);
    }
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
              CareerZoid ATS Intelligence
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              ATS Checker
            </h1>

            <p className="text-gray-400 text-lg mt-5">
              Simulate how an ATS reads your resume, checks keywords, detects
              sections, and ranks you for a specific role or company.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
              <FileCheck size={48} />
            </div>

            <h2 className="text-3xl font-black">
              ATS Simulation Engine
            </h2>

            <p className="text-gray-400 mt-3">
              Different from Resume Analyzer. This checks parsing, keywords,
              formatting, job description match, and ATS rejection risk.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl h-fit">
            <h2 className="text-3xl font-black mb-6">
              ATS Inputs
            </h2>

            <label className="block cursor-pointer bg-slate-950/60 border-2 border-dashed border-purple-500/40 rounded-[2rem] p-8 text-center hover:border-purple-400 transition">
              <FileText size={54} className="mx-auto text-purple-300" />

              <h3 className="text-2xl font-black mt-5">
                Upload Resume
              </h3>

              <p className="text-gray-400 mt-2">
                PDF, DOCX or TXT
              </p>

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {resumeName && (
              <div className="mt-5 bg-slate-950/60 border border-white/10 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">
                  Selected File
                </p>

                <p className="font-bold mt-1 break-all">
                  {resumeName}
                </p>
              </div>
            )}

            <InputBox
              label="Target Role"
              value={targetRole}
              onChange={setTargetRole}
              placeholder="Example: Frontend Developer"
              icon={<Briefcase size={18} />}
            />

            <InputBox
              label="Target Company"
              value={targetCompany}
              onChange={setTargetCompany}
              placeholder="Example: Google / TCS / Startup"
              icon={<Building2 size={18} />}
            />

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Experience Level
              </span>

              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
              >
                <option className="bg-slate-900">Student</option>
                <option className="bg-slate-900">Fresher</option>
                <option className="bg-slate-900">Internship Seeker</option>
                <option className="bg-slate-900">1-3 Years</option>
                <option className="bg-slate-900">3+ Years</option>
              </select>
            </label>

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Job Description Optional
              </span>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for more accurate ATS matching."
                rows={5}
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
              />
            </label>

            <button
              onClick={checkATS}
              disabled={checking}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black disabled:opacity-60"
            >
              {checking ? "Running ATS Simulation..." : "Check ATS Score"}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              For best results, paste the actual job description from LinkedIn,
              Naukri, Internshala, or the company careers page.
            </p>
          </div>

          <div className="lg:col-span-2">
            {!result ? (
              <EmptyResult />
            ) : (
              <div className="space-y-8">
                <ATSHero result={result} targetRole={targetRole} />

                <section className="grid md:grid-cols-4 gap-5">
                  <SmallScore title="Parsing" score={result.parsingScore} />
                  <SmallScore title="Keywords" score={result.keywordScore} />
                  <SmallScore title="Format" score={result.formatScore} />
                  <SmallScore title="Sections" score={result.sectionScore} />
                  <SmallScore title="Readability" score={result.readabilityScore} />
                  <SmallScore title="Role Match" score={result.roleMatchScore} />
                  <SmallScore title="ATS Score" score={result.atsScore} />
                  <SmallScore title="Interview" score={result.roleMatchScore} />
                </section>

                <ParsePreviewSection items={result.parsePreview} />

                <section className="grid lg:grid-cols-2 gap-6">
                  <KeywordCard
                    title="Matched Keywords"
                    items={result.matchedKeywords}
                    positive
                  />

                  <KeywordCard
                    title="Missing Keywords"
                    items={result.missingKeywords}
                  />
                </section>

                <ReportSection
                  title="Formatting Issues"
                  icon={<FileSearch className="text-yellow-300" />}
                  items={result.formattingIssues}
                />

                <section className="grid lg:grid-cols-2 gap-6">
                  <ReportSection
                    title="Passed ATS Checks"
                    icon={<CheckCircle className="text-green-300" />}
                    items={result.passedChecks}
                  />

                  <ReportSection
                    title="Failed ATS Checks"
                    icon={<AlertTriangle className="text-yellow-300" />}
                    items={result.failedChecks}
                  />
                </section>

                <ReportSection
                  title="Why ATS / Recruiter May Reject"
                  icon={<ShieldCheck className="text-red-300" />}
                  items={result.rejectionReasons}
                />

                <ReportSection
                  title="ATS Optimization Suggestions"
                  icon={<Target className="text-purple-300" />}
                  items={result.atsSuggestions}
                />

                <ReportSection
                  title="Resume Rewrite Tips"
                  icon={<Zap className="text-cyan-300" />}
                  items={result.resumeRewriteTips}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
function EmptyResult() {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center">
      <Lock size={60} className="mx-auto text-purple-300" />

      <h2 className="text-4xl font-black mt-6">
        ATS Report Will Appear Here
      </h2>

      <p className="text-gray-400 mt-4">
        Upload your resume, enter target role, and optionally paste job
        description for accurate ATS simulation.
      </p>
    </div>
  );
}

function InputBox({ label, value, onChange, placeholder, icon }: any) {
  return (
    <label className="block mt-5">
      <span className="text-gray-400 text-sm">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4">
        <span className="text-purple-300">
          {icon}
        </span>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent outline-none w-full"
        />
      </div>
    </label>
  );
}

function ATSHero({ result, targetRole }: any) {
  const chance = String(result.interviewChance || "Medium").toUpperCase();

  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
        <div>
          <p className="text-purple-300 font-black mb-3">
            AI ATS SIMULATION REPORT
          </p>

          <h2 className="text-4xl md:text-5xl font-black">
            {targetRole || "Target Role"}
          </h2>

          <p className="text-gray-400 mt-3">
            ATS parsing, keyword match, format safety, section detection and
            interview chance.
          </p>

          <div className="mt-6 inline-flex px-5 py-3 rounded-2xl bg-slate-950/60 border border-white/10">
            <span className="text-gray-400 mr-2">
              Interview Chance:
            </span>

            <span className="font-black text-purple-300">
              {chance}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 min-w-[360px]">
          <HeroScore title="ATS" score={result.atsScore} />
          <HeroScore title="Parsing" score={result.parsingScore} />
          <HeroScore title="Role Match" score={result.roleMatchScore} />
        </div>
      </div>
    </section>
  );
}

function HeroScore({ title, score }: any) {
  const safeScore = Number(score) || 0;

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-5 text-center">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-4xl font-black text-purple-300 mt-2">
        {safeScore}
      </h3>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function SmallScore({ title, score }: any) {
  const safeScore = Number(score) || 0;

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-3xl font-black mt-2 text-purple-300">
        {safeScore}%
      </h3>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-purple-500"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function ParsePreviewSection({ items }: any) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Search className="text-purple-300" />

        <h3 className="text-2xl font-black">
          ATS Parse Preview
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {safeItems.length === 0 ? (
          <ParseItem text="No parse preview available." />
        ) : (
          safeItems.map((item: string, index: number) => (
            <ParseItem key={index} text={item} />
          ))
        )}
      </div>
    </section>
  );
}

function ParseItem({ text }: any) {
  return (
    <div className="flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-gray-300">
      <CheckCircle size={18} className="text-green-300" />
      <span>{text}</span>
    </div>
  );
}

function KeywordCard({ title, items, positive }: any) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <h3 className="text-2xl font-black mb-5">
        {title}
      </h3>

      <div className="flex flex-wrap gap-3">
        {safeItems.length === 0 ? (
          <span className="px-4 py-3 rounded-2xl border bg-slate-950/60 border-white/10 text-gray-400">
            No keywords found
          </span>
        ) : (
          safeItems.map((item: string, index: number) => (
            <span
              key={index}
              className={`px-4 py-3 rounded-2xl border ${
                positive
                  ? "bg-green-500/10 border-green-500/30 text-green-300"
                  : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
              }`}
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function ReportSection({ title, icon, items }: any) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        {icon}

        <h3 className="text-2xl font-black">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {safeItems.length === 0 ? (
          <ReportItem text="No items found." />
        ) : (
          safeItems.map((item: string, index: number) => (
            <ReportItem key={index} text={item} />
          ))
        )}
      </div>
    </section>
  );
}

function ReportItem({ text }: any) {
  return (
    <div className="flex gap-3 bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-gray-300">
      <span className="text-purple-300 font-black">
        ✓
      </span>

      <p>
        {text}
      </p>
    </div>
  );
}