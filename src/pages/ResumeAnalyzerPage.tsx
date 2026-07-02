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
  Award,
  Briefcase,
  CheckCircle,
  FileText,
  Lock,
  Search,
  Sparkles,
  Target,
  Upload,
  Zap,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

const emptyResult = {
  isResume: true,
  purposeFitScore: 0,
  overallScore: 0,
  aiScreeningScore: 0,
  atsScore: 0,
  skillsScore: 0,
  projectsScore: 0,
  educationScore: 0,
  experienceScore: 0,
  certificationsScore: 0,
  selectionChance: "Medium",
  strengths: [],
  rejectionReasons: [],
  missingProof: [],
  exactImprovements: [],
  missingKeywords: [],
  recommendedProjects: [],
  recommendedCertifications: {
    free: [],
    paid: [],
  },
};

export default function ResumeAnalyzerPage() {
  const navigate = useNavigate();

  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePurpose, setResumePurpose] = useState("Job Application");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [courseOrProgram, setCourseOrProgram] = useState("");
  const [collegeOrUniversity, setCollegeOrUniversity] = useState("");
  const [academicStream, setAcademicStream] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setResumeName(file.name);
    setResumeFile(file);
    setResult(null);
  };

  const cleanJsonResponse = (text: string) => {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
  };

  const analyzeResume = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!resumeFile) {
      alert("Please upload resume first.");
      return;
    }

    try {
      setAnalyzing(true);
      setResult(null);

      const resumeText = await readResumeFile(resumeFile);

      if (!resumeText || resumeText.trim().length < 80) {
        alert(
          "Could not read enough text from this file. Please upload a proper resume PDF, DOCX, or TXT."
        );
        setAnalyzing(false);
        return;
      }

      const prompt = `
You are CareerZoid AI Resume Screening Expert.

Analyze the resume based on the user's purpose.

USER PURPOSE:
${resumePurpose}

TARGET ROLE:
${targetRole || "Not provided"}

TARGET COMPANY:
${targetCompany || "Not provided"}

COURSE OR PROGRAM:
${courseOrProgram || "Not provided"}

COLLEGE OR UNIVERSITY:
${collegeOrUniversity || "Not provided"}

ACADEMIC STREAM / GROUP:
${academicStream || "Not provided"}

EXTRA CONTEXT:
${extraContext || "Not provided"}

RESUME TEXT:
${resumeText.slice(0, 12000)}

If this is NOT a resume/CV, return ONLY:
{
  "isResume": false,
  "error": "This file doesn't appear to be a resume. Please upload a valid resume or CV."
}

If this IS a resume/CV, return ONLY valid JSON:
{
  "isResume": true,
  "purposeFitScore": 0,
  "overallScore": 0,
  "aiScreeningScore": 0,
  "atsScore": 0,
  "skillsScore": 0,
  "projectsScore": 0,
  "educationScore": 0,
  "experienceScore": 0,
  "certificationsScore": 0,
  "selectionChance": "Low / Medium / High",
  "strengths": [],
  "rejectionReasons": [],
  "missingProof": [],
  "exactImprovements": [],
  "missingKeywords": [],
  "recommendedProjects": [],
  "recommendedCertifications": {
    "free": [],
    "paid": []
  }
}

Rules:
- Return JSON only.
- No markdown.
- Scores must be realistic from 0 to 100.
- Be strict like a company/admission screening system.
- Give clear, short, practical points.
- Do not write long paragraphs inside arrays.
`;

      const aiResponse = await askGemini(prompt);
      const cleanResponse = cleanJsonResponse(aiResponse);
      const analysis = JSON.parse(cleanResponse);

      if (!analysis.isResume) {
        alert(analysis.error || "This file does not look like a resume.");
        setAnalyzing(false);
        return;
      }

      const finalResult = {
        ...emptyResult,
        ...analysis,
        recommendedCertifications: {
          free: analysis?.recommendedCertifications?.free || [],
          paid: analysis?.recommendedCertifications?.paid || [],
        },
      };

      setResult(finalResult);

      await addDoc(collection(db, "resumeAnalyses"), {
        userId: user.uid,
        userEmail: user.email || "",
        resumeName,
        resumePurpose,
        targetRole,
        targetCompany,
        courseOrProgram,
        collegeOrUniversity,
        academicStream,
        extraContext,
        ...finalResult,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      alert("Resume analysis failed. Please try again with a proper resume file.");
    } finally {
      setAnalyzing(false);
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
              Purpose-Based Resume Screening
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Resume Analyzer
            </h1>

            <p className="text-gray-400 text-lg mt-5">
              Check whether your resume is strong for admission, internship,
              job, scholarship, or portfolio screening.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
              <FileText size={48} />
            </div>

            <h2 className="text-3xl font-black">
              Company-Style AI Review
            </h2>

            <p className="text-gray-400 mt-3">
              CareerZoid checks purpose fit, AI screening score, rejection risks,
              missing proof, keywords, projects, and certificates.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl h-fit">
            <h2 className="text-3xl font-black mb-6">Resume Details</h2>

            <label className="block mb-5">
              <span className="text-gray-400 text-sm">
                Why are you creating this resume?
              </span>

              <select
                value={resumePurpose}
                onChange={(e) => setResumePurpose(e.target.value)}
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none"
              >
                <option className="bg-slate-900">Job Application</option>
                <option className="bg-slate-900">Internship</option>
                <option className="bg-slate-900">
                  B.Tech / College Admission
                </option>
                <option className="bg-slate-900">International Admission</option>
                <option className="bg-slate-900">Scholarship</option>
                <option className="bg-slate-900">Freelancing / Portfolio</option>
              </select>
            </label>

            {(resumePurpose === "Job Application" ||
              resumePurpose === "Internship") && (
              <>
                <InputBox
                  label="Target Role"
                  value={targetRole}
                  onChange={setTargetRole}
                  placeholder="Example: Frontend Developer"
                />

                <InputBox
                  label="Target Company"
                  value={targetCompany}
                  onChange={setTargetCompany}
                  placeholder="Example: Google / TCS / Startup"
                />
              </>
            )}

            {(resumePurpose === "B.Tech / College Admission" ||
              resumePurpose === "International Admission" ||
              resumePurpose === "Scholarship") && (
              <>
                <InputBox
                  label="Course / Program"
                  value={courseOrProgram}
                  onChange={setCourseOrProgram}
                  placeholder="Example: B.Tech CSE / Data Science"
                />

                <InputBox
                  label="College / University"
                  value={collegeOrUniversity}
                  onChange={setCollegeOrUniversity}
                  placeholder="Example: IIT / ISM Germany"
                />

                <InputBox
                  label="Academic Stream / Group"
                  value={academicStream}
                  onChange={setAcademicStream}
                  placeholder="Example: MPC / CSE / Commerce"
                />
              </>
            )}

            <label className="block mb-5">
              <span className="text-gray-400 text-sm">Extra Context</span>

              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="Example: I made this resume for B.Tech admission / Google role / scholarship."
                rows={4}
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none"
              />
            </label>

            <label className="block cursor-pointer bg-slate-950/60 border-2 border-dashed border-purple-500/40 rounded-[2rem] p-8 text-center hover:border-purple-400 transition">
              <Upload size={48} className="mx-auto text-purple-300" />

              <h3 className="text-2xl font-black mt-5">Choose Resume</h3>

              <p className="text-gray-400 mt-2">PDF, DOCX or TXT</p>

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {resumeName && (
              <div className="mt-5 bg-slate-950/60 border border-white/10 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">Selected File</p>
                <p className="font-bold mt-1 break-all">{resumeName}</p>
              </div>
            )}

            <button
              onClick={analyzeResume}
              disabled={analyzing}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black disabled:opacity-60"
            >
              {analyzing ? "Screening Resume..." : "Analyze Resume"}
            </button>
          </div>

          <div className="lg:col-span-2">
            {!result ? (
              <EmptyResult />
            ) : (
              <div className="space-y-8">
                <ResultHero result={result} purpose={resumePurpose} />

                <section className="grid md:grid-cols-3 gap-5">
                  <SmallScore title="Overall" score={result.overallScore} />
                  <SmallScore title="Skills" score={result.skillsScore} />
                  <SmallScore title="Projects" score={result.projectsScore} />
                  <SmallScore title="Education" score={result.educationScore} />
                  <SmallScore title="Experience" score={result.experienceScore} />
                  <SmallScore
                    title="Certificates"
                    score={result.certificationsScore}
                  />
                </section>

                <ReportSection
                  title="Why It May Get Selected"
                  icon={<CheckCircle className="text-green-300" />}
                  items={result.strengths}
                  tone="green"
                />

                <ReportSection
                  title="Why It May Get Rejected"
                  icon={<AlertTriangle className="text-yellow-300" />}
                  items={result.rejectionReasons}
                  tone="yellow"
                />

                <ReportSection
                  title="Missing Proof"
                  icon={<Target className="text-purple-300" />}
                  items={result.missingProof}
                  tone="purple"
                />

                <ReportSection
                  title="Exact Improvements"
                  icon={<Zap className="text-cyan-300" />}
                  items={result.exactImprovements}
                  tone="cyan"
                />

                <ReportSection
                  title="Missing Keywords"
                  icon={<Search className="text-yellow-300" />}
                  items={result.missingKeywords}
                  tone="yellow"
                  chipMode
                />

                <ProjectsSection items={result.recommendedProjects} />

                <CertificationSection
                  free={result.recommendedCertifications?.free || []}
                  paid={result.recommendedCertifications?.paid || []}
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
        Screening Result Will Appear Here
      </h2>

      <p className="text-gray-400 mt-4">
        Select the purpose, upload resume, and get a clean AI report.
      </p>
    </div>
  );
}

function InputBox({ label, value, onChange, placeholder }: any) {
  return (
    <label className="block mb-5">
      <span className="text-gray-400 text-sm">{label}</span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none"
      />
    </label>
  );
}

function ResultHero({ result, purpose }: any) {
  const chance = String(result.selectionChance || "Medium").toUpperCase();

  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
        <div>
          <p className="text-purple-300 font-black mb-3">
            AI SCREENING REPORT
          </p>

          <h2 className="text-4xl md:text-5xl font-black">
            {purpose}
          </h2>

          <p className="text-gray-400 mt-3">
            Purpose fit, AI screening, ATS readiness, and rejection risk analysis.
          </p>

          <div className="mt-6 inline-flex px-5 py-3 rounded-2xl bg-slate-950/60 border border-white/10">
            <span className="text-gray-400 mr-2">Selection Chance:</span>
            <span className="font-black text-purple-300">{chance}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 min-w-[360px]">
          <HeroScore title="Purpose Fit" score={result.purposeFitScore} />
          <HeroScore title="AI Score" score={result.aiScreeningScore} />
          <HeroScore title="ATS" score={result.atsScore} />
        </div>
      </div>
    </section>
  );
}

function HeroScore({ title, score }: any) {
  const safeScore = Number(score) || 0;

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-5 text-center">
      <p className="text-gray-400 text-sm">{title}</p>

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
      <p className="text-gray-400 text-sm">{title}</p>

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

function ReportSection({ title, icon, items, chipMode }: any) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        {icon}
        <h3 className="text-2xl font-black">{title}</h3>
      </div>

      {chipMode ? (
        <div className="flex flex-wrap gap-3">
          {safeItems.length === 0 ? (
            <span className="px-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-gray-400">
              No items found
            </span>
          ) : (
            safeItems.map((item: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-gray-300"
              >
                {item}
              </span>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {safeItems.length === 0 ? (
            <ReportItem text="No items found." />
          ) : (
            safeItems.map((item: string, index: number) => (
              <ReportItem key={index} text={item} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function ReportItem({ text }: any) {
  return (
    <div className="flex gap-3 bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-gray-300">
      <span className="text-purple-300 font-black">✓</span>
      <p>{text}</p>
    </div>
  );
}

function ProjectsSection({ items }: any) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Briefcase className="text-purple-300" />
        <h3 className="text-2xl font-black">Recommended Projects</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {safeItems.length === 0 ? (
          <ReportItem text="No project recommendation found." />
        ) : (
          safeItems.map((item: string, index: number) => (
            <div
              key={index}
              className="bg-slate-950/60 border border-white/10 rounded-2xl p-5"
            >
              <p className="text-purple-300 font-black mb-2">
                Project {index + 1}
              </p>
              <p className="text-gray-300">{item}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function CertificationSection({ free, paid }: any) {
  const freeItems = Array.isArray(free) ? free : [];
  const paidItems = Array.isArray(paid) ? paid : [];

  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Award className="text-cyan-300" />
        <h3 className="text-2xl font-black">Recommended Certifications</h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CertGroup title="Free Certifications" items={freeItems} />
        <CertGroup title="Paid Certifications" items={paidItems} />
      </div>
    </section>
  );
}

function CertGroup({ title, items }: any) {
  return (
    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-5">
      <p className="font-black text-purple-300 mb-4">{title}</p>

      <div className="flex flex-wrap gap-3">
        {items.length === 0 ? (
          <span className="px-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-gray-400">
            No items found
          </span>
        ) : (
          items.map((item: string, index: number) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-gray-300"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}