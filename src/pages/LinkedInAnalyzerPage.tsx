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
  Briefcase,
  Search,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { askGemini } from "../services/gemini";

export default function LinkedInAnalyzerPage() {
  const navigate = useNavigate();

  const [profileUrl, setProfileUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const [profileContent, setProfileContent] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [copied, setCopied] = useState(false);

  const analyzeLinkedIn = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!profileUrl.trim()) {
      alert("Please enter your LinkedIn profile URL.");
      return;
    }

    if (!targetRole.trim()) {
      alert("Please enter your target role.");
      return;
    }

    if (!profileContent.trim()) {
      alert(
        "Please paste your LinkedIn profile content so CareerZoid can analyze your actual profile."
      );
      return;
    }

    if (profileContent.trim().length < 100) {
      alert(
        "Please provide more LinkedIn profile information for an accurate analysis."
      );
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const prompt = `
You are CareerZoid's professional LinkedIn profile intelligence engine.

Your job is to analyze the user's ACTUAL LinkedIn profile content and determine how effectively the profile positions the person for their target role.

IMPORTANT RULES:

1. Do NOT invent information.
2. Do NOT assume the user has skills, experience, projects, certifications, achievements, or education that are not present in the supplied profile content.
3. Do NOT give fake scores based only on the LinkedIn URL.
4. Analyze ONLY the information supplied by the user.
5. If information is missing, explicitly say it is missing.
6. Give practical recommendations that the user can actually implement.
7. Recommendations must be specific to the target role.
8. Do not give generic advice such as "improve your profile" without explaining exactly how.
9. Identify recruiter-search keywords relevant to the target role.
10. Distinguish between:
   - Present
   - Missing
   - Weak
   - Strong
11. If a section is missing from the supplied profile, reduce its score appropriately.
12. Do not claim that CareerZoid can predict exactly which company will shortlist the candidate.
13. The scores represent CareerZoid's estimated profile optimization score, NOT a guarantee of recruiter selection.
14. Be honest and conservative.

TARGET ROLE:
${targetRole.trim()}

LINKEDIN PROFILE URL:
${profileUrl.trim()}

LINKEDIN PROFILE CONTENT:
${profileContent.trim()}

Return ONLY valid JSON.

Use exactly this structure:

{
  "profileScore": 0,
  "recruiterVisibilityScore": 0,
  "headlineScore": 0,
  "aboutScore": 0,
  "skillsScore": 0,
  "experienceScore": 0,
  "projectsScore": 0,
  "educationScore": 0,
  "profileCompletenessScore": 0,

  "profileVerdict": "",

  "strengths": [],
  "weaknesses": [],

  "missingKeywords": [],
  "presentKeywords": [],

  "missingSections": [],

  "priorityFixes": [],

  "headlineAnalysis": {
    "currentAssessment": "",
    "problems": [],
    "recommendedHeadline": ""
  },

  "aboutAnalysis": {
    "assessment": "",
    "problems": [],
    "recommendedAbout": ""
  },

  "experienceAnalysis": {
    "assessment": "",
    "problems": [],
    "recommendations": []
  },

  "skillsAnalysis": {
    "assessment": "",
    "presentSkills": [],
    "missingSkills": [],
    "recommendedSkills": []
  },

  "projectsAnalysis": {
    "assessment": "",
    "recommendations": []
  },

  "recruiterAnalysis": {
    "searchability": "",
    "roleAlignment": "",
    "keywordStrategy": [],
    "recommendations": []
  },

  "actionPlan": [
    {
      "priority": "High",
      "action": "",
      "reason": "",
      "howToFix": ""
    }
  ]
}

SCORING:

profileScore:
Overall quality and role alignment.

recruiterVisibilityScore:
How well the supplied profile content appears optimized for recruiter search and professional positioning.

headlineScore:
Headline clarity, target role, relevant keywords and value proposition.

aboutScore:
Clarity, storytelling, credibility, goals, skills and achievements.

skillsScore:
Relevance and completeness of skills for the target role.

experienceScore:
Quality of experience descriptions, action verbs, achievements and measurable impact.

projectsScore:
Relevance, technical depth, outcomes and evidence.

educationScore:
Clarity and relevance of education information.

profileCompletenessScore:
How complete the supplied profile appears.

SCORING GUIDELINE:

90-100 = Excellent
80-89 = Strong
70-79 = Good but needs improvement
60-69 = Weak
Below 60 = Major improvement required

IMPORTANT:

Give ALL important missing skills you can reasonably identify for the target role.

Do not arbitrarily limit the user to five skills.

For example, for a Data Analyst role, consider relevant areas such as:

Python
SQL
Excel
Statistics
Power BI
Tableau
Data Visualization
Pandas
NumPy
Data Cleaning
Data Analysis
Dashboard Development
Business Intelligence
A/B Testing
Hypothesis Testing
Git
Communication
Problem Solving

But ONLY recommend skills that are actually relevant to the user's target role and career direction.

Do not recommend every possible technology.

For missing keywords, include useful recruiter-search keywords relevant to the target role.

For the action plan, prioritize the most important changes first.

The final output must be useful to a real student, job seeker, or professional.

Do not use markdown.

Return JSON only.
`;

      const aiResponse = await askGemini(prompt);

      if (
        !aiResponse ||
        aiResponse.includes("AI response failed")
      ) {
        throw new Error("Gemini did not return a valid response.");
      }

      let cleanedResponse = aiResponse.trim();

      // Remove accidental markdown code fences
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let generatedResult;

      try {
        generatedResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Gemini JSON Parse Error:", parseError);
        console.error("Gemini Response:", aiResponse);

        throw new Error(
          "AI returned an invalid analysis format. Please try again."
        );
      }

      // Basic safety/default handling
      generatedResult.profileScore =
        Number(generatedResult.profileScore) || 0;

      generatedResult.recruiterVisibilityScore =
        Number(generatedResult.recruiterVisibilityScore) || 0;

      generatedResult.headlineScore =
        Number(generatedResult.headlineScore) || 0;

      generatedResult.aboutScore =
        Number(generatedResult.aboutScore) || 0;

      generatedResult.skillsScore =
        Number(generatedResult.skillsScore) || 0;

      generatedResult.experienceScore =
        Number(generatedResult.experienceScore) || 0;

      generatedResult.projectsScore =
        Number(generatedResult.projectsScore) || 0;

      generatedResult.educationScore =
        Number(generatedResult.educationScore) || 0;

      generatedResult.profileCompletenessScore =
        Number(generatedResult.profileCompletenessScore) || 0;

      // Make sure arrays always exist
      const arrayFields = [
        "strengths",
        "weaknesses",
        "missingKeywords",
        "presentKeywords",
        "missingSections",
        "priorityFixes",
        "actionPlan",
      ];

      arrayFields.forEach((field) => {
        if (!Array.isArray(generatedResult[field])) {
          generatedResult[field] = [];
        }
      });

      if (!generatedResult.headlineAnalysis) {
        generatedResult.headlineAnalysis = {
          currentAssessment: "",
          problems: [],
          recommendedHeadline: "",
        };
      }

      if (!generatedResult.aboutAnalysis) {
        generatedResult.aboutAnalysis = {
          assessment: "",
          problems: [],
          recommendedAbout: "",
        };
      }

      if (!generatedResult.experienceAnalysis) {
        generatedResult.experienceAnalysis = {
          assessment: "",
          problems: [],
          recommendations: [],
        };
      }

      if (!generatedResult.skillsAnalysis) {
        generatedResult.skillsAnalysis = {
          assessment: "",
          presentSkills: [],
          missingSkills: [],
          recommendedSkills: [],
        };
      }

      if (!generatedResult.projectsAnalysis) {
        generatedResult.projectsAnalysis = {
          assessment: "",
          recommendations: [],
        };
      }

      if (!generatedResult.recruiterAnalysis) {
        generatedResult.recruiterAnalysis = {
          searchability: "",
          roleAlignment: "",
          keywordStrategy: [],
          recommendations: [],
        };
      }

      setResult(generatedResult);

      await addDoc(collection(db, "linkedinAnalyses"), {
        userId: user.uid,
        userEmail: user.email || "",

        profileUrl: profileUrl.trim(),
        targetRole: targetRole.trim(),

        // Save the actual analyzed content
        profileContent: profileContent.trim(),

        ...generatedResult,

        createdAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error("LinkedIn Analysis Error:", error);

      alert(
        error?.message ||
          "Unable to analyze LinkedIn profile. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const copyText = async (text: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/20 blur-[160px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-blue-700/15 blur-[160px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
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
              LinkedIn
              <span className="block text-purple-300">
                Analyzer
              </span>
            </h1>

            <p className="text-gray-400 text-lg mt-5 max-w-2xl">
              Analyze your LinkedIn profile against your target career,
              improve recruiter visibility, discover missing keywords,
              and get AI-powered recommendations.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">

              <InfoPill
                icon={<Search size={18} />}
                text="Recruiter Search"
              />

              <InfoPill
                icon={<Target size={18} />}
                text="Role Matching"
              />

              <InfoPill
                icon={<Lightbulb size={18} />}
                text="AI Recommendations"
              />

            </div>

          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
              <UserCheck size={42} />
            </div>

            <h2 className="text-3xl font-black">
              AI Recruiter Profile Review
            </h2>

            <p className="text-gray-400 mt-4 leading-relaxed">
              CareerZoid evaluates the profile information you provide
              against your target role and identifies the changes that
              can make your professional positioning stronger.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200">
              AI scores are recommendations, not a guarantee of recruiter
              selection.
            </div>

          </div>

        </section>

        {/* Main */}
        <section className="grid lg:grid-cols-3 gap-8">

          {/* INPUT */}
          <div className="lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">

            <h2 className="text-3xl font-black mb-2">
              Analyze Profile
            </h2>

            <p className="text-gray-500 text-sm mb-7">
              Give CareerZoid the information needed to analyze your
              actual LinkedIn profile.
            </p>

            {/* URL */}
            <label className="block">

              <span className="text-gray-400 text-sm">
                LinkedIn Profile URL
              </span>

              <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-purple-500">

                <LinkIcon
                  size={18}
                  className="text-purple-300"
                />

                <input
                  value={profileUrl}
                  onChange={(e) =>
                    setProfileUrl(e.target.value)
                  }
                  placeholder="https://linkedin.com/in/yourname"
                  className="bg-transparent outline-none w-full"
                />

              </div>

            </label>

            {/* Target Role */}
            <label className="block mt-5">

              <span className="text-gray-400 text-sm">
                Target Role
              </span>

              <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-purple-500">

                <Target
                  size={18}
                  className="text-purple-300"
                />

                <input
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(e.target.value)
                  }
                  placeholder="Example: Data Analyst"
                  className="bg-transparent outline-none w-full"
                />

              </div>

            </label>

            {/* Profile Content */}
            <label className="block mt-5">

              <span className="text-gray-400 text-sm">
                LinkedIn Profile Content
              </span>

              <p className="text-gray-600 text-xs mt-1">
                Copy your headline, About, experience, skills,
                education, projects and certifications from LinkedIn.
              </p>

              <textarea
                value={profileContent}
                onChange={(e) =>
                  setProfileContent(e.target.value)
                }
                placeholder={`Example:

Headline:
BSc Computing Student | Python | Data Analytics

About:
I am a computing student interested in...

Experience:
...

Skills:
Python, Excel, SQL...

Education:
...

Projects:
...

Certifications:
...`}
                rows={13}
                className="mt-3 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 resize-none text-sm leading-relaxed"
              />

            </label>

            {/* Button */}
            <button
              onClick={analyzeLinkedIn}
              disabled={analyzing}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black disabled:opacity-60 hover:scale-[1.01] transition"
            >
              {analyzing
                ? "AI Analyzing..."
                : "Analyze With AI"}
            </button>

            <p className="text-xs text-gray-600 mt-4 leading-relaxed">
              CareerZoid analyzes the profile information you provide.
              It does not claim to know information that is not supplied.
            </p>

          </div>

          {/* RESULT */}
          <div className="lg:col-span-2">

            {!result ? (

              <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center min-h-[650px] flex flex-col justify-center">

                <div className="w-24 h-24 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">

                  <Lock
                    size={48}
                    className="text-purple-300"
                  />

                </div>

                <h2 className="text-4xl font-black mt-7">
                  Your AI Profile Review
                </h2>

                <p className="text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
                  Enter your target role and paste your LinkedIn
                  profile information. CareerZoid will generate a
                  detailed, role-specific analysis.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto w-full">

                  <Feature
                    icon={<Search size={20} />}
                    title="Keywords"
                    text="Discover missing recruiter keywords"
                  />

                  <Feature
                    icon={<Target size={20} />}
                    title="Role Match"
                    text="Compare your profile with your goal"
                  />

                  <Feature
                    icon={<Zap size={20} />}
                    title="Action Plan"
                    text="Get prioritized improvements"
                  />

                </div>

              </div>

            ) : (

              <div className="space-y-8">

                {/* Top Scores */}
                <div className="grid md:grid-cols-2 gap-6">

                  <ScoreCard
                    title="Profile Strength"
                    score={result.profileScore}
                  />

                  <ScoreCard
                    title="Recruiter Visibility"
                    score={
                      result.recruiterVisibilityScore
                    }
                  />

                </div>

                {/* Verdict */}
                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-7">

                  <div className="flex items-center gap-3 mb-4">

                    <Briefcase className="text-purple-300" />

                    <h2 className="text-2xl font-black">
                      CareerZoid Verdict
                    </h2>

                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {result.profileVerdict ||
                      "Your LinkedIn profile has been analyzed against your target role."}
                  </p>

                </div>

                {/* Detailed scores */}
                <div className="grid md:grid-cols-3 gap-5">

                  <MiniScore
                    title="Headline"
                    score={result.headlineScore}
                  />

                  <MiniScore
                    title="About"
                    score={result.aboutScore}
                  />

                  <MiniScore
                    title="Skills"
                    score={result.skillsScore}
                  />

                  <MiniScore
                    title="Experience"
                    score={result.experienceScore}
                  />

                  <MiniScore
                    title="Projects"
                    score={result.projectsScore}
                  />

                  <MiniScore
                    title="Profile Completeness"
                    score={
                      result.profileCompletenessScore
                    }
                  />

                </div>

                {/* Priority fixes */}
                {result.priorityFixes?.length > 0 && (

                  <ListSection
                    title="Priority Fixes"
                    icon={
                      <Target className="text-purple-300" />
                    }
                    items={result.priorityFixes}
                  />

                )}

                {/* Keywords */}
                <div className="grid lg:grid-cols-2 gap-6">

                  <KeywordCard
                    title="Keywords Already Present"
                    items={result.presentKeywords || []}
                    positive
                  />

                  <KeywordCard
                    title="Missing Recruiter Keywords"
                    items={result.missingKeywords || []}
                  />

                </div>

                {/* Missing sections */}
                {result.missingSections?.length > 0 && (

                  <ListSection
                    title="Missing Profile Sections"
                    icon={
                      <AlertTriangle className="text-yellow-300" />
                    }
                    items={result.missingSections}
                  />

                )}

                {/* Headline */}
                <AnalysisCard
                  title="Headline Analysis"
                  icon={
                    <Target className="text-purple-300" />
                  }
                  assessment={
                    result.headlineAnalysis
                      ?.currentAssessment
                  }
                  problems={
                    result.headlineAnalysis?.problems
                  }
                >

                  {result.headlineAnalysis
                    ?.recommendedHeadline && (

                    <RecommendationBox
                      title="Recommended Headline"
                      text={
                        result.headlineAnalysis
                          .recommendedHeadline
                      }
                      onCopy={() =>
                        copyText(
                          result.headlineAnalysis
                            .recommendedHeadline
                        )
                      }
                      copied={copied}
                    />

                  )}

                </AnalysisCard>

                {/* About */}
                <AnalysisCard
                  title="About Section Analysis"
                  icon={
                    <FileTextIcon />
                  }
                  assessment={
                    result.aboutAnalysis?.assessment
                  }
                  problems={
                    result.aboutAnalysis?.problems
                  }
                >

                  {result.aboutAnalysis
                    ?.recommendedAbout && (

                    <RecommendationBox
                      title="Recommended About Section"
                      text={
                        result.aboutAnalysis
                          .recommendedAbout
                      }
                      onCopy={() =>
                        copyText(
                          result.aboutAnalysis
                            .recommendedAbout
                        )
                      }
                      copied={copied}
                    />

                  )}

                </AnalysisCard>

                {/* Skills */}
                <SkillsAnalysis
                  data={result.skillsAnalysis}
                />

                {/* Recruiter */}
                <AnalysisCard
                  title="Recruiter Search Analysis"
                  icon={
                    <Search className="text-cyan-300" />
                  }
                  assessment={
                    result.recruiterAnalysis
                      ?.searchability
                  }
                  problems={[]}
                >

                  <div className="grid md:grid-cols-2 gap-5 mt-5">

                    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">

                      <p className="text-gray-500 text-sm">
                        Role Alignment
                      </p>

                      <p className="text-gray-200 mt-2 leading-relaxed">
                        {result.recruiterAnalysis
                          ?.roleAlignment ||
                          "Not available"}
                      </p>

                    </div>

                    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">

                      <p className="text-gray-500 text-sm">
                        Keyword Strategy
                      </p>

                      <div className="space-y-2 mt-3">
                        {(result.recruiterAnalysis
                          ?.keywordStrategy || []
                        ).map(
                          (
                            item: string,
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="text-gray-300 text-sm"
                            >
                              • {item}
                            </div>
                          )
                        )}
                      </div>

                    </div>

                  </div>

                </AnalysisCard>

                {/* Strength / Weakness */}
                <div className="grid lg:grid-cols-2 gap-6">

                  <FeedbackCard
                    title="What's Working"
                    icon={
                      <CheckCircle className="text-green-300" />
                    }
                    items={result.strengths || []}
                  />

                  <FeedbackCard
                    title="What Needs Improvement"
                    icon={
                      <AlertTriangle className="text-yellow-300" />
                    }
                    items={result.weaknesses || []}
                  />

                </div>

                {/* Action plan */}
                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-7">

                  <div className="flex items-center gap-3 mb-6">

                    <Zap className="text-purple-300" />

                    <h2 className="text-2xl font-black">
                      Your LinkedIn Action Plan
                    </h2>

                  </div>

                  <div className="space-y-4">

                    {(result.actionPlan || []).map(
                      (
                        item: any,
                        index: number
                      ) => (

                        <div
                          key={index}
                          className="bg-slate-950/60 border border-white/10 rounded-2xl p-5"
                        >

                          <div className="flex flex-wrap items-center gap-3">

                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                              {item.priority ||
                                "Priority"}
                            </span>

                            <h3 className="font-bold text-lg">
                              {item.action}
                            </h3>

                          </div>

                          {item.reason && (
                            <p className="text-gray-400 text-sm mt-3">
                              <span className="text-gray-300 font-semibold">
                                Why:
                              </span>{" "}
                              {item.reason}
                            </p>
                          )}

                          {item.howToFix && (
                            <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                              <span className="text-purple-300 font-semibold">
                                How to fix:
                              </span>{" "}
                              {item.howToFix}
                            </p>
                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>

              </div>

            )}

          </div>

        </section>

      </div>
    </div>
  );
}


/* =========================
   COMPONENTS
========================= */

function InfoPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300">
      {icon}
      {text}
    </div>
  );
}


function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-left">

      <div className="text-purple-300">
        {icon}
      </div>

      <h3 className="font-bold mt-3">
        {title}
      </h3>

      <p className="text-gray-500 text-xs mt-2 leading-relaxed">
        {text}
      </p>

    </div>
  );
}


function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
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
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(
              Math.max(score, 0),
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


function MiniScore({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
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
          className="h-full bg-purple-500 rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(
              Math.max(score, 0),
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


function KeywordCard({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">

      <h3 className="text-2xl font-black mb-5">
        {title}
      </h3>

      {items.length === 0 ? (

        <p className="text-gray-500">
          No items identified.
        </p>

      ) : (

        <div className="flex flex-wrap gap-3">

          {items.map(
            (item: string, index: number) => (

              <span
                key={index}
                className={`px-4 py-3 rounded-2xl border text-sm ${
                  positive
                    ? "bg-green-500/10 border-green-500/30 text-green-300"
                    : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                }`}
              >
                {item}
              </span>

            )
          )}

        </div>

      )}

    </div>
  );
}


function ListSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-7">

      <div className="flex items-center gap-3 mb-5">

        {icon}

        <h2 className="text-2xl font-black">
          {title}
        </h2>

      </div>

      <div className="grid md:grid-cols-2 gap-3">

        {items.map(
          (item: string, index: number) => (

            <div
              key={index}
              className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-gray-300"
            >
              {item}
            </div>

          )
        )}

      </div>

    </div>
  );
}


function FeedbackCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">

      <div className="flex items-center gap-3 mb-5">

        {icon}

        <h3 className="text-2xl font-black">
          {title}
        </h3>

      </div>

      <div className="space-y-3">

        {items.length === 0 ? (

          <p className="text-gray-500">
            Nothing specific identified.
          </p>

        ) : (

          items.map(
            (item: string, index: number) => (

              <div
                key={index}
                className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-gray-300 leading-relaxed"
              >
                {item}
              </div>

            )
          )

        )}

      </div>

    </div>
  );
}


function AnalysisCard({
  title,
  icon,
  assessment,
  problems,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  assessment?: string;
  problems?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-7">

      <div className="flex items-center gap-3 mb-5">

        {icon}

        <h2 className="text-2xl font-black">
          {title}
        </h2>

      </div>

      {assessment && (
        <p className="text-gray-300 leading-relaxed">
          {assessment}
        </p>
      )}

      {problems &&
        problems.length > 0 && (

          <div className="mt-5 space-y-2">

            {problems.map(
              (
                problem: string,
                index: number
              ) => (

                <div
                  key={index}
                  className="text-gray-400 text-sm"
                >
                  • {problem}
                </div>

              )
            )}

          </div>

        )}

      {children}

    </div>
  );
}


function RecommendationBox({
  title,
  text,
  onCopy,
  copied,
}: {
  title: string;
  text: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">

      <div className="flex items-center justify-between gap-4">

        <h3 className="font-bold text-purple-200">
          {title}
        </h3>

        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:border-purple-400 transition"
        >
          {copied ? (
            <>
              <Check size={15} />
              Copied
            </>
          ) : (
            <>
              <Copy size={15} />
              Copy
            </>
          )}
        </button>

      </div>

      <p className="text-gray-200 mt-4 leading-relaxed whitespace-pre-line">
        {text}
      </p>

    </div>
  );
}


function SkillsAnalysis({
  data,
}: {
  data: any;
}) {
  const presentSkills =
    data?.presentSkills || [];

  const missingSkills =
    data?.missingSkills || [];

  const recommendedSkills =
    data?.recommendedSkills || [];

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-7">

      <div className="flex items-center gap-3 mb-5">

        <Lightbulb className="text-purple-300" />

        <h2 className="text-2xl font-black">
          Skills Analysis
        </h2>

      </div>

      {data?.assessment && (
        <p className="text-gray-300 leading-relaxed mb-6">
          {data.assessment}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-5">

        <SkillGroup
          title="Skills Present"
          items={presentSkills}
          type="positive"
        />

        <SkillGroup
          title="Skills Missing"
          items={missingSkills}
          type="warning"
        />

        <SkillGroup
          title="Recommended Skills"
          items={recommendedSkills}
          type="info"
        />

      </div>

    </div>
  );
}


function SkillGroup({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "positive" | "warning" | "info";
}) {
  const styles = {
    positive:
      "bg-green-500/10 border-green-500/20 text-green-300",

    warning:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",

    info:
      "bg-purple-500/10 border-purple-500/20 text-purple-300",
  };

  return (
    <div>

      <h3 className="font-bold mb-3">
        {title}
      </h3>

      <div className="space-y-2">

        {items.length === 0 ? (

          <p className="text-gray-600 text-sm">
            None identified.
          </p>

        ) : (

          items.map(
            (
              item: string,
              index: number
            ) => (

              <div
                key={index}
                className={`px-3 py-2 rounded-xl border text-sm ${styles[type]}`}
              >
                {item}
              </div>

            )
          )

        )}

      </div>

    </div>
  );
}


function FileTextIcon() {
  return (
    <Briefcase className="text-cyan-300" />
  );
}