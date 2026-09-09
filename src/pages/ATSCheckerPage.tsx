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
  FileCheck,
  FileText,
  Lock,
  Search,
  Sparkles,
  Target,
  Upload,
  Building2,
  Briefcase,
  XCircle,
  Lightbulb,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

import { askGemini } from "../services/gemini";
import { readResumeFile } from "../services/resumeReader";

export default function ATSCheckerPage() {
  const navigate = useNavigate();

  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");

  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // FILE UPLOAD
  // ---------------------------------------------------------

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setResumeName(file.name);
    setResumeFile(file);
    setResult(null);
    setError("");
  };

  // ---------------------------------------------------------
  // GEMINI ATS ANALYSIS
  // ---------------------------------------------------------

  const checkATS = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your resume first.");
      return;
    }

    if (!targetRole.trim()) {
      setError("Please enter your target role.");
      return;
    }

    setChecking(true);
    setError("");
    setResult(null);

    try {
      // -------------------------------------------------------
      // STEP 1: READ ACTUAL RESUME
      // -------------------------------------------------------

      const resumeText = await readResumeFile(resumeFile);

      if (!resumeText || resumeText.trim().length < 100) {
        throw new Error(
          "We could not extract enough text from this file. Please upload a readable resume."
        );
      }

      // -------------------------------------------------------
      // STEP 2: GEMINI PROMPT
      // -------------------------------------------------------

      const prompt = `
You are CareerZoid's professional ATS and recruitment analysis engine.

You must analyze the uploaded document exactly like a professional ATS system combined with a human recruiter.

TARGET ROLE:
${targetRole.trim()}

TARGET COMPANY:
${targetCompany.trim() || "Not specified"}

RESUME CONTENT:
${resumeText}

========================================================
IMPORTANT TRUST AND VALIDATION RULES
========================================================

FIRST determine whether the uploaded document is actually a resume or CV.

A valid resume normally contains several of these:
- Candidate name
- Education
- Skills
- Projects
- Experience
- Internship
- Certifications
- Career summary
- Contact information
- Achievements

If this is NOT a resume or CV, DO NOT generate scores.

Examples of invalid documents:
- Payment receipt
- Payment slip
- Bank statement
- Invoice
- Certificate
- ID card
- Random document
- Unrelated PDF
- Screenshot of a payment
- Empty document
- Advertisement

If the document is not a resume, return:

{
  "isResume": false,
  "rejectionReason": "Clear explanation of why this document is not a resume."
}

DO NOT invent resume information.

========================================================
IF IT IS A RESUME
========================================================

Analyze the resume against the target role.

Do NOT assume that the candidate has a skill simply because it is common for the role.

Only use information actually present in the resume.

Do NOT invent:
- Skills
- Experience
- Projects
- Certifications
- Achievements
- Education
- Companies
- Job titles

Missing skills must remain missing.

If recommending a skill, clearly distinguish whether:
- It is missing from the resume
- The candidate should learn it
- The candidate may add it only if they genuinely possess it

========================================================
ATS ANALYSIS
========================================================

Evaluate:

1. ATS readability
2. Resume structure
3. Standard sections
4. Keyword relevance
5. Target-role alignment
6. Technical skills
7. Soft skills
8. Education
9. Experience
10. Projects
11. Certifications
12. Achievements
13. Measurable results
14. Action verbs
15. Contact information
16. Resume clarity
17. Keyword stuffing
18. Unnecessary information
19. Formatting risks
20. Recruiter impression

========================================================
ROLE MATCH
========================================================

Compare the resume against:

TARGET ROLE:
${targetRole.trim()}

If a target company is provided:

TARGET COMPANY:
${targetCompany.trim()}

IMPORTANT:

Do NOT claim to know the private ATS algorithm of any company.

Do NOT say:

"Microsoft's ATS will definitely reject this."

Instead say:

"CareerZoid estimates that this resume has weaker alignment with the selected role because..."

========================================================
SCORING
========================================================

Give honest scores from 0 to 100.

atsScore:
Overall ATS readiness.

roleMatchScore:
How strongly the resume aligns with the target role.

keywordScore:
Relevant keyword coverage.

formatScore:
ATS-readable structure and formatting.

experienceScore:
Quality and relevance of demonstrated experience.

skillsScore:
Quality and relevance of demonstrated skills.

educationScore:
Relevance and clarity of education.

projectScore:
Relevance and quality of projects.

Do NOT automatically give high scores.

A student without experience should not receive a high experience score.

A resume without measurable achievements should lose points.

A resume missing important role-specific skills should lose points.

========================================================
KEYWORD ANALYSIS
========================================================

Identify:

matchedKeywords:
Important role-related keywords genuinely present.

missingKeywords:
Important role-related keywords absent from the resume.

Do NOT tell users to falsely add skills.

========================================================
RECRUITER ANALYSIS
========================================================

Explain:

- What would make a recruiter interested?
- What could cause the recruiter to reject the resume?
- What is the biggest weakness?
- What is the strongest part?
- What should be fixed first?

========================================================
OUTPUT
========================================================

Return ONLY valid JSON.

DO NOT use markdown.

DO NOT use code fences.

DO NOT add explanations outside JSON.

Use exactly this structure:

{
  "isResume": true,

  "atsScore": 0,
  "roleMatchScore": 0,
  "keywordScore": 0,
  "formatScore": 0,
  "experienceScore": 0,
  "skillsScore": 0,
  "educationScore": 0,
  "projectScore": 0,

  "candidateSummary": "",

  "matchedKeywords": [],
  "missingKeywords": [],

  "strongSkills": [],
  "weakAreas": [],

  "passedChecks": [],
  "failedChecks": [],

  "exactImprovements": [],

  "recommendedProjects": [],

  "learningRecommendations": [],

  "recruiterPerspective": "",

  "atsExplanation": "",

  "priority": {
    "high": [],
    "medium": [],
    "low": []
  }
}
`;

      // -------------------------------------------------------
      // STEP 3: CALL GEMINI
      // -------------------------------------------------------

      const aiResponse = await askGemini(prompt);

      console.log("CareerZoid ATS Gemini response:", aiResponse);

      if (
        !aiResponse ||
        aiResponse.includes("AI response failed")
      ) {
        throw new Error(
          "Gemini could not analyze the resume. Please try again."
        );
      }

      // -------------------------------------------------------
      // STEP 4: CLEAN GEMINI RESPONSE
      // -------------------------------------------------------

      let cleanedResponse = aiResponse.trim();

      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```json/gi, "")
          .replace(/```/gi, "")
          .trim();
      }

      // Remove accidental text before JSON
      const firstBrace = cleanedResponse.indexOf("{");
      const lastBrace = cleanedResponse.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedResponse = cleanedResponse.substring(
          firstBrace,
          lastBrace + 1
        );
      }

      // -------------------------------------------------------
      // STEP 5: PARSE JSON
      // -------------------------------------------------------

      let generatedResult: any;

      try {
        generatedResult = JSON.parse(cleanedResponse);
      } catch (jsonError) {
        console.error(
          "Gemini JSON parsing error:",
          jsonError
        );

        console.error(
          "Gemini raw response:",
          aiResponse
        );

        throw new Error(
          "The AI returned an invalid analysis. Please try again."
        );
      }

      // -------------------------------------------------------
      // STEP 6: INVALID DOCUMENT
      // -------------------------------------------------------

      if (generatedResult.isResume === false) {
        const invalidResult = {
          isResume: false,
          rejectionReason:
            generatedResult.rejectionReason ||
            "The uploaded document does not appear to be a resume or CV.",
        };

        setResult(invalidResult);

        await addDoc(collection(db, "atsChecks"), {
          userId: user.uid,
          userEmail: user.email || "",

          resumeName,

          targetRole: targetRole.trim(),

          targetCompany: targetCompany.trim(),

          ...invalidResult,

          createdAt: serverTimestamp(),
        });

        return;
      }

      // -------------------------------------------------------
      // STEP 7: NORMALIZE AI RESULT
      // -------------------------------------------------------

      const safeResult = {
        isResume: true,

        atsScore: Number(generatedResult.atsScore) || 0,

        roleMatchScore:
          Number(generatedResult.roleMatchScore) || 0,

        keywordScore:
          Number(generatedResult.keywordScore) || 0,

        formatScore:
          Number(generatedResult.formatScore) || 0,

        experienceScore:
          Number(generatedResult.experienceScore) || 0,

        skillsScore:
          Number(generatedResult.skillsScore) || 0,

        educationScore:
          Number(generatedResult.educationScore) || 0,

        projectScore:
          Number(generatedResult.projectScore) || 0,

        candidateSummary:
          generatedResult.candidateSummary || "",

        matchedKeywords:
          Array.isArray(generatedResult.matchedKeywords)
            ? generatedResult.matchedKeywords
            : [],

        missingKeywords:
          Array.isArray(generatedResult.missingKeywords)
            ? generatedResult.missingKeywords
            : [],

        strongSkills:
          Array.isArray(generatedResult.strongSkills)
            ? generatedResult.strongSkills
            : [],

        weakAreas:
          Array.isArray(generatedResult.weakAreas)
            ? generatedResult.weakAreas
            : [],

        passedChecks:
          Array.isArray(generatedResult.passedChecks)
            ? generatedResult.passedChecks
            : [],

        failedChecks:
          Array.isArray(generatedResult.failedChecks)
            ? generatedResult.failedChecks
            : [],

        exactImprovements:
          Array.isArray(generatedResult.exactImprovements)
            ? generatedResult.exactImprovements
            : [],

        recommendedProjects:
          Array.isArray(generatedResult.recommendedProjects)
            ? generatedResult.recommendedProjects
            : [],

        learningRecommendations:
          Array.isArray(
            generatedResult.learningRecommendations
          )
            ? generatedResult.learningRecommendations
            : [],

        recruiterPerspective:
          generatedResult.recruiterPerspective || "",

        atsExplanation:
          generatedResult.atsExplanation || "",

        priority: {
          high:
            Array.isArray(
              generatedResult.priority?.high
            )
              ? generatedResult.priority.high
              : [],

          medium:
            Array.isArray(
              generatedResult.priority?.medium
            )
              ? generatedResult.priority.medium
              : [],

          low:
            Array.isArray(
              generatedResult.priority?.low
            )
              ? generatedResult.priority.low
              : [],
        },
      };

      // -------------------------------------------------------
      // STEP 8: DISPLAY RESULT
      // -------------------------------------------------------

      setResult(safeResult);

      // -------------------------------------------------------
      // STEP 9: SAVE TO FIRESTORE
      // -------------------------------------------------------

      await addDoc(collection(db, "atsChecks"), {
        userId: user.uid,
        userEmail: user.email || "",

        resumeName,

        targetRole: targetRole.trim(),

        targetCompany: targetCompany.trim(),

        ...safeResult,

        createdAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error(
        "CareerZoid ATS analysis error:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong while analyzing your resume."
      );
    } finally {
      setChecking(false);
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/20 blur-[160px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />

        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-700/10 blur-[180px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 hover:bg-purple-500/10 transition"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <section className="grid lg:grid-cols-2 gap-8 items-stretch mb-8">

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
              <Sparkles size={16} />
              CareerZoid AI Tool
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              ATS Checker
            </h1>

            <p className="text-gray-400 text-lg mt-5 max-w-2xl">
              See how strongly your resume aligns with your target role,
              identify missing skills and keywords, and understand what
              could improve your chances of reaching the recruiter.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">

              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4">
                <Search className="text-purple-300 mb-2" size={22} />
                <p className="font-bold text-sm">
                  ATS Analysis
                </p>
              </div>

              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4">
                <Target className="text-cyan-300 mb-2" size={22} />
                <p className="font-bold text-sm">
                  Role Match
                </p>
              </div>

              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4">
                <Briefcase className="text-green-300 mb-2" size={22} />
                <p className="font-bold text-sm">
                  Recruiter View
                </p>
              </div>

            </div>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">

            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20">
              <FileCheck size={48} />
            </div>

            <h2 className="text-3xl font-black">
              CareerZoid AI ATS Engine
            </h2>

            <p className="text-gray-400 mt-3 leading-relaxed">
              CareerZoid analyzes the actual content of your resume
              against your selected role. It does not use fixed demo
              scores or pretend to know a company's private ATS system.
            </p>

            <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <CheckCircle
                className="text-green-300 mt-0.5 shrink-0"
                size={20}
              />

              <p className="text-sm text-gray-300">
                Invalid documents are rejected instead of receiving
                fabricated resume scores.
              </p>
            </div>

          </div>
        </section>

        {/* Main */}
        <section className="grid lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">

            <h2 className="text-3xl font-black mb-6">
              Analyze Your Resume
            </h2>

            {/* Upload */}
            <label className="block cursor-pointer bg-slate-950/60 border-2 border-dashed border-purple-500/40 rounded-[2rem] p-10 text-center hover:border-purple-400 hover:bg-purple-500/5 transition">

              <Upload
                size={54}
                className="mx-auto text-purple-300"
              />

              <h3 className="text-2xl font-black mt-5">
                Upload Resume
              </h3>

              <p className="text-gray-400 mt-2">
                PDF, DOCX or TXT
              </p>

              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Selected File */}
            {resumeName && (
              <div className="mt-5 bg-slate-950/60 border border-white/10 rounded-2xl p-4">

                <div className="flex items-center gap-3">

                  <FileText
                    className="text-purple-300 shrink-0"
                    size={22}
                  />

                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs">
                      Selected Resume
                    </p>

                    <p className="font-bold mt-1 break-all text-sm">
                      {resumeName}
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* Target Role */}
            <label className="block mt-5">

              <div className="flex items-center gap-2">
                <Briefcase
                  size={17}
                  className="text-purple-300"
                />

                <span className="text-gray-300 text-sm font-semibold">
                  Target Role
                </span>
              </div>

              <input
                value={targetRole}
                onChange={(e) =>
                  setTargetRole(e.target.value)
                }
                placeholder="Example: Data Analyst"
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
              />

            </label>

            {/* Company */}
            <label className="block mt-5">

              <div className="flex items-center gap-2">
                <Building2
                  size={17}
                  className="text-cyan-300"
                />

                <span className="text-gray-300 text-sm font-semibold">
                  Target Company
                </span>

                <span className="text-xs text-gray-600">
                  Optional
                </span>
              </div>

              <input
                value={targetCompany}
                onChange={(e) =>
                  setTargetCompany(e.target.value)
                }
                placeholder="Example: Deloitte"
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
              />

            </label>

            {/* Error */}
            {error && (
              <div className="mt-5 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300">

                <div className="flex gap-3">

                  <AlertTriangle
                    size={20}
                    className="shrink-0"
                  />

                  <p className="text-sm">
                    {error}
                  </p>

                </div>

              </div>
            )}

            {/* Button */}
            <button
              onClick={checkATS}
              disabled={checking}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-4 rounded-2xl font-black transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
            >
              {checking
                ? "AI Analyzing Resume..."
                : "Analyze With AI"}
            </button>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              CareerZoid analyzes the resume content and target role.
              Scores are estimates based on the information provided,
              not a company's private hiring algorithm.
            </p>

          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">

            {/* EMPTY */}
            {!result && !checking && (
              <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center min-h-[520px] flex flex-col justify-center">

                <Lock
                  size={60}
                  className="mx-auto text-purple-300"
                />

                <h2 className="text-4xl font-black mt-6">
                  Your AI ATS Report
                </h2>

                <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                  Upload your resume, choose the role you're targeting,
                  and let CareerZoid analyze your actual resume content.
                </p>

                <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 text-left">

                  <InfoBox
                    icon={<Search size={20} />}
                    title="ATS"
                    text="Parsing and keyword analysis"
                  />

                  <InfoBox
                    icon={<Target size={20} />}
                    title="Match"
                    text="Role-specific alignment"
                  />

                  <InfoBox
                    icon={<Lightbulb size={20} />}
                    title="Improve"
                    text="Actionable recommendations"
                  />

                </div>

              </div>
            )}

            {/* LOADING */}
            {checking && (
              <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center min-h-[520px] flex flex-col justify-center">

                <div className="w-20 h-20 mx-auto rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin" />

                <h2 className="text-3xl font-black mt-8">
                  CareerZoid AI is analyzing...
                </h2>

                <p className="text-gray-400 mt-4">
                  Reading your resume and comparing it with your target role.
                </p>

              </div>
            )}

            {/* INVALID DOCUMENT */}
            {result && result.isResume === false && (
              <InvalidDocument
                reason={result.rejectionReason}
              />
            )}

            {/* RESULT */}
            {result && result.isResume !== false && (
              <div className="space-y-8">

                {/* TOP SCORE */}
                <div className="grid md:grid-cols-2 gap-6">

                  <ScoreCard
                    title="CareerZoid ATS Score"
                    score={result.atsScore}
                  />

                  <ScoreCard
                    title="Target Role Match"
                    score={result.roleMatchScore}
                  />

                </div>

                {/* SUMMARY */}
                {result.candidateSummary && (
                  <TextCard
                    title="AI Resume Summary"
                    icon={
                      <Sparkles
                        className="text-purple-300"
                      />
                    }
                    text={result.candidateSummary}
                  />
                )}

                {/* MINI SCORES */}
                <div className="grid md:grid-cols-4 gap-5">

                  <MiniScore
                    title="Keywords"
                    score={result.keywordScore}
                  />

                  <MiniScore
                    title="Formatting"
                    score={result.formatScore}
                  />

                  <MiniScore
                    title="Experience"
                    score={result.experienceScore}
                  />

                  <MiniScore
                    title="Skills"
                    score={result.skillsScore}
                  />

                  <MiniScore
                    title="Education"
                    score={result.educationScore}
                  />

                  <MiniScore
                    title="Projects"
                    score={result.projectScore}
                  />

                </div>

                {/* KEYWORDS */}
                <div className="grid lg:grid-cols-2 gap-6">

                  <KeywordCard
                    title="Matched Keywords"
                    items={result.matchedKeywords}
                    positive
                  />

                  <KeywordCard
                    title="Missing Keywords"
                    items={result.missingKeywords}
                  />

                </div>

                {/* SKILLS */}
                <div className="grid lg:grid-cols-2 gap-6">

                  <ListCard
                    title="Strong Skills"
                    icon={
                      <CheckCircle
                        className="text-green-300"
                      />
                    }
                    items={result.strongSkills}
                    type="success"
                  />

                  <ListCard
                    title="Weak Areas"
                    icon={
                      <AlertTriangle
                        className="text-yellow-300"
                      />
                    }
                    items={result.weakAreas}
                    type="warning"
                  />

                </div>

                {/* CHECKS */}
                <div className="grid lg:grid-cols-2 gap-6">

                  <ListCard
                    title="Passed ATS Checks"
                    icon={
                      <CheckCircle
                        className="text-green-300"
                      />
                    }
                    items={result.passedChecks}
                    type="success"
                  />

                  <ListCard
                    title="Failed ATS Checks"
                    icon={
                      <XCircle
                        className="text-red-300"
                      />
                    }
                    items={result.failedChecks}
                    type="danger"
                  />

                </div>

                {/* IMPROVEMENTS */}
                <ListCard
                  title="Exact Improvements"
                  icon={
                    <Target
                      className="text-purple-300"
                    />
                  }
                  items={result.exactImprovements}
                  type="info"
                />

                {/* LEARNING */}
                <ListCard
                  title="Learning Recommendations"
                  icon={
                    <Lightbulb
                      className="text-cyan-300"
                    />
                  }
                  items={result.learningRecommendations}
                  type="info"
                />

                {/* PROJECTS */}
                <ListCard
                  title="Recommended Projects"
                  icon={
                    <Briefcase
                      className="text-blue-300"
                    />
                  }
                  items={result.recommendedProjects}
                  type="info"
                />

                {/* PRIORITY */}
                <PriorityCard
                  priority={result.priority}
                />

                {/* RECRUITER */}
                {result.recruiterPerspective && (
                  <TextCard
                    title="Recruiter Perspective"
                    icon={
                      <Briefcase
                        className="text-cyan-300"
                      />
                    }
                    text={result.recruiterPerspective}
                  />
                )}

                {/* ATS EXPLANATION */}
                {result.atsExplanation && (
                  <TextCard
                    title="Why You Got This Score"
                    icon={
                      <Search
                        className="text-purple-300"
                      />
                    }
                    text={result.atsExplanation}
                  />
                )}

              </div>
            )}

          </div>
        </section>

      </div>
    </div>
  );
}

// ============================================================
// SCORE CARD
// ============================================================

function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">

      <p className="text-gray-400">
        {title}
      </p>

      <div className="flex items-end gap-3 mt-4">

        <h3 className="text-7xl font-black text-purple-300">
          {safeScore}
        </h3>

        <p className="text-gray-400 mb-3">
          /100
        </p>

      </div>

      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mt-6">

        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
          style={{
            width: `${safeScore}%`,
          }}
        />

      </div>

    </div>
  );
}

// ============================================================
// MINI SCORE
// ============================================================

function MiniScore({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

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
          className="h-full bg-purple-500 rounded-full transition-all duration-700"
          style={{
            width: `${safeScore}%`,
          }}
        />

      </div>

    </div>
  );
}

// ============================================================
// KEYWORD CARD
// ============================================================

function KeywordCard({
  title,
  items,
  positive,
}: {
  title: string;
  items: any[];
  positive?: boolean;
}) {
  const safeItems = Array.isArray(items)
    ? items
    : [];

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">

      <h3 className="text-2xl font-black mb-5">
        {title}
      </h3>

      {safeItems.length === 0 ? (
        <p className="text-gray-500">
          No items identified.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">

          {safeItems.map(
            (item: any, index: number) => {

              const text =
                typeof item === "string"
                  ? item
                  : item?.keyword ||
                    item?.name ||
                    item?.content ||
                    JSON.stringify(item);

              return (
                <span
                  key={index}
                  className={`px-4 py-3 rounded-2xl border ${
                    positive
                      ? "bg-green-500/10 border-green-500/30 text-green-300"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                  }`}
                >
                  {text}
                </span>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

// ============================================================
// LIST CARD
// ============================================================

function ListCard({
  title,
  icon,
  items,
  type,
}: {
  title: string;
  icon: any;
  items: any[];
  type: "success" | "warning" | "danger" | "info";
}) {
  const safeItems = Array.isArray(items)
    ? items
    : [];

  const styles = {
    success:
      "bg-green-500/5 border-green-500/10",

    warning:
      "bg-yellow-500/5 border-yellow-500/10",

    danger:
      "bg-red-500/5 border-red-500/10",

    info:
      "bg-purple-500/5 border-purple-500/10",
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">

      <div className="flex items-center gap-3 mb-5">

        {icon}

        <h3 className="text-2xl font-black">
          {title}
        </h3>

      </div>

      {safeItems.length === 0 ? (
        <p className="text-gray-500">
          Nothing identified.
        </p>
      ) : (
        <div className="space-y-3">

          {safeItems.map(
            (item: any, index: number) => {

              let text = "";

              if (typeof item === "string") {
                text = item;
              } else if (
                item?.title &&
                item?.description
              ) {
                text =
                  `${item.title}: ${item.description}`;
              } else if (
                item?.name &&
                item?.description
              ) {
                text =
                  `${item.name}: ${item.description}`;
              } else if (
                item?.section &&
                item?.content
              ) {
                text =
                  `${item.section}: ${item.content}`;
              } else {
                text = JSON.stringify(item);
              }

              return (
                <div
                  key={index}
                  className={`border rounded-2xl p-4 text-gray-300 ${styles[type]}`}
                >
                  {text}
                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

// ============================================================
// TEXT CARD
// ============================================================

function TextCard({
  title,
  icon,
  text,
}: {
  title: string;
  icon: any;
  text: string;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">

      <div className="flex items-center gap-3 mb-4">

        {icon}

        <h3 className="text-2xl font-black">
          {title}
        </h3>

      </div>

      <p className="text-gray-300 leading-relaxed">
        {text}
      </p>

    </div>
  );
}

// ============================================================
// PRIORITY CARD
// ============================================================

function PriorityCard({
  priority,
}: {
  priority: any;
}) {
  const high = Array.isArray(priority?.high)
    ? priority.high
    : [];

  const medium = Array.isArray(priority?.medium)
    ? priority.medium
    : [];

  const low = Array.isArray(priority?.low)
    ? priority.low
    : [];

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">

      <div className="flex items-center gap-3 mb-6">

        <Target className="text-purple-300" />

        <h3 className="text-2xl font-black">
          Improvement Priority
        </h3>

      </div>

      <div className="grid md:grid-cols-3 gap-4">

        <PriorityColumn
          title="High Priority"
          items={high}
          style="red"
        />

        <PriorityColumn
          title="Medium Priority"
          items={medium}
          style="yellow"
        />

        <PriorityColumn
          title="Low Priority"
          items={low}
          style="green"
        />

      </div>

    </div>
  );
}

// ============================================================
// PRIORITY COLUMN
// ============================================================

function PriorityColumn({
  title,
  items,
  style,
}: {
  title: string;
  items: any[];
  style: "red" | "yellow" | "green";
}) {
  const styles = {
    red:
      "border-red-500/20 bg-red-500/5 text-red-300",

    yellow:
      "border-yellow-500/20 bg-yellow-500/5 text-yellow-300",

    green:
      "border-green-500/20 bg-green-500/5 text-green-300",
  };

  return (
    <div
      className={`border rounded-2xl p-5 ${styles[style]}`}
    >

      <h4 className="font-black mb-4">
        {title}
      </h4>

      <div className="space-y-3">

        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nothing identified.
          </p>
        ) : (
          items.map(
            (item: any, index: number) => {

              const text =
                typeof item === "string"
                  ? item
                  : item?.title ||
                    item?.description ||
                    JSON.stringify(item);

              return (
                <div
                  key={index}
                  className="text-sm text-gray-300"
                >
                  • {text}
                </div>
              );
            }
          )
        )}

      </div>

    </div>
  );
}

// ============================================================
// INVALID DOCUMENT
// ============================================================

function InvalidDocument({
  reason,
}: {
  reason: string;
}) {
  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-10 text-center min-h-[520px] flex flex-col justify-center">

      <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 flex items-center justify-center">

        <XCircle
          size={52}
          className="text-red-400"
        />

      </div>

      <h2 className="text-4xl font-black mt-7">
        This doesn't appear to be a resume
      </h2>

      <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
        CareerZoid did not generate an ATS score because
        the uploaded document does not appear to be a valid
        resume or CV.
      </p>

      <div className="mt-7 bg-slate-950/70 border border-white/10 rounded-2xl p-5 text-left max-w-2xl mx-auto">

        <p className="text-gray-500 text-sm">
          AI validation result
        </p>

        <p className="text-gray-300 mt-2">
          {reason ||
            "Please upload a valid resume or CV."}
        </p>

      </div>

    </div>
  );
}

// ============================================================
// INFO BOX
// ============================================================

function InfoBox({
  icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4">

      <div className="text-purple-300 mb-2">
        {icon}
      </div>

      <p className="font-black">
        {title}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        {text}
      </p>

    </div>
  );
}