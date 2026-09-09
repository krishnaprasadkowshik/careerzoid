import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  Award,
  Brain,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Lock,
  Map,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { askGemini } from "../services/gemini";

export default function SkillGapAnalysisPage() {
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState("");
  const [targetCareer, setTargetCareer] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const analyzeSkillGap = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!currentRole.trim()) {
      alert("Enter your current role.");
      return;
    }

    if (!targetCareer.trim()) {
      alert("Enter your target role.");
      return;
    }

    if (!currentSkills.trim()) {
      alert("Enter your current skills.");
      return;
    }

    if (!experienceYears.trim()) {
      alert("Enter your years of experience.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setResult(null);

    const skillList = currentSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const prompt = `
You are CareerZoid's professional Skill Gap Analysis Engine.

Your job is to analyze a person's career transition from their CURRENT ROLE to their TARGET ROLE.

IMPORTANT:
Do NOT give a generic career answer.
Do NOT assume the person is a beginner.
Do NOT limit the missing skills to only 5 items.
Identify ALL important skill gaps that are reasonably relevant to the target role, then prioritize the most important ones.

USER INFORMATION

Current Role:
${currentRole.trim()}

Target/Future Role:
${targetCareer.trim()}

Years of Experience:
${experienceYears.trim()}

Current Skills:
${skillList.join(", ")}

YOUR ANALYSIS MUST COMPARE:

1. What the user already knows based on their current role and listed skills.
2. What the target role normally requires.
3. Which skills are transferable.
4. Which skills are missing.
5. Which missing skills are critical versus useful.
6. What the user should learn first.
7. What evidence they should build to prove the skill.
8. Which certifications could help.
9. Which practical projects would demonstrate readiness.
10. How ready the person is to move from the current role to the target role.

IMPORTANT:
The user is a working professional, so recommendations should respect their existing experience.
Do not tell an experienced professional to start from absolute basics unless their information genuinely indicates a fundamental gap.

For certifications:
Separate FREE certifications/resources from PAID certifications.
Only recommend certifications that are genuinely relevant to the target role.
Do not invent certification names.

For projects:
Recommend practical projects that directly demonstrate target-role capability.
Avoid generic projects that do not help with the career transition.

For each important missing skill, explain:
- Skill
- Priority
- Why it matters
- What to learn
- How to prove the skill

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text before or after the JSON.

Use EXACTLY this JSON structure:

{
  "readinessScore": 0,
  "careerMatch": 0,
  "transitionDifficulty": "Low",
  "estimatedTransitionTime": "3-6 months",
  "overallAssessment": "Short professional assessment",

  "currentStrengths": [
    {
      "skill": "Skill name",
      "reason": "Why this is a strength for the target role"
    }
  ],

  "transferableSkills": [
    {
      "skill": "Skill name",
      "reason": "How this transfers to the target role"
    }
  ],

  "skillGaps": [
    {
      "skill": "Missing skill",
      "priority": "Critical",
      "whyItMatters": "Why this skill matters",
      "whatToLearn": [
        "Topic 1",
        "Topic 2",
        "Topic 3"
      ],
      "howToProveIt": "Project, work evidence, portfolio evidence, etc."
    }
  ],

  "prioritySkills": [
    {
      "skill": "Skill",
      "priority": "High",
      "reason": "Why this should be learned now"
    }
  ],

  "freeCertifications": [
    {
      "name": "Certification or learning resource",
      "provider": "Provider",
      "reason": "Why it is useful"
    }
  ],

  "paidCertifications": [
    {
      "name": "Certification",
      "provider": "Provider",
      "reason": "Why it is useful"
    }
  ],

  "recommendedProjects": [
    {
      "title": "Project title",
      "skills": [
        "Skill 1",
        "Skill 2"
      ],
      "description": "What the project should demonstrate"
    }
  ],

  "learningPlan": [
    {
      "stage": "Stage 1",
      "title": "Stage title",
      "focus": "What to focus on",
      "skills": [
        "Skill 1",
        "Skill 2"
      ],
      "outcome": "What the user should be able to do after this stage"
    }
  ],

  "roleReadiness": [
    {
      "area": "Technical Skills",
      "status": "Needs Improvement",
      "reason": "Explanation"
    }
  ],

  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}

SCORING RULES:

readinessScore:
Estimate how ready this person is TODAY for the target role from 0-100.

careerMatch:
Estimate how closely their existing experience and skills align with the target role from 0-100.

transitionDifficulty:
Use only:
"Low"
"Moderate"
"High"
"Very High"

Do not give an artificially high score just to be positive.
Be realistic and evidence-based.

Return comprehensive but clear information.
`;

    try {
      const aiResponse = await askGemini(prompt);

      if (
        !aiResponse ||
        aiResponse.includes("AI response failed")
      ) {
        throw new Error("Gemini did not return a valid response.");
      }

      let cleanedResponse = aiResponse.trim();

      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/^```json/i, "")
          .replace(/^```/i, "")
          .replace(/```$/i, "")
          .trim();
      }

      const firstBrace = cleanedResponse.indexOf("{");
      const lastBrace = cleanedResponse.lastIndexOf("}");

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI returned an invalid analysis.");
      }

      cleanedResponse = cleanedResponse.slice(
        firstBrace,
        lastBrace + 1
      );

      const generatedResult = JSON.parse(cleanedResponse);

      if (
        typeof generatedResult.readinessScore !== "number" ||
        typeof generatedResult.careerMatch !== "number"
      ) {
        throw new Error("AI returned an incomplete analysis.");
      }

      setResult(generatedResult);

      await addDoc(collection(db, "skillGapAnalyses"), {
        userId: user.uid,
        userEmail: user.email || "",

        currentRole: currentRole.trim(),
        targetCareer: targetCareer.trim(),
        currentSkills: skillList,
        experienceYears: experienceYears.trim(),

        ...generatedResult,

        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Skill Gap Analysis Error:", error);

      setError(
        "Unable to generate the AI analysis right now. Please try again."
      );
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
              CareerZoid AI Tool
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Skill Gap Analysis
            </h1>

            <p className="text-gray-400 text-lg mt-5">
              Discover exactly what you need to learn to move from your
              current role to your future career.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              <InfoBadge
                icon={<Target size={17} />}
                title="Current Role"
                text="Where you are"
              />

              <InfoBadge
                icon={<Map size={17} />}
                title="Target Role"
                text="Where you want to go"
              />

              <InfoBadge
                icon={<Brain size={17} />}
                title="AI Analysis"
                text="Your skill gaps"
              />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
              <Brain size={48} />
            </div>

            <h2 className="text-3xl font-black">
              Career Transition Intelligence
            </h2>

            <p className="text-gray-400 mt-3 leading-7">
              Gemini compares your current professional experience with
              your target role and identifies the skills, certifications,
              projects, and knowledge you need to become job-ready.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm text-green-300">
              <CheckCircle size={18} />
              Personalized AI analysis
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-2">
              Your Career Transition
            </h2>

            <p className="text-gray-500 text-sm mb-7">
              Tell us where you are and where you want to go.
            </p>

            <label className="block">
              <span className="text-gray-400 text-sm">
                Present / Current Role
              </span>

              <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4">
                <Target
                  size={18}
                  className="text-purple-300 shrink-0"
                />

                <input
                  value={currentRole}
                  onChange={(e) =>
                    setCurrentRole(e.target.value)
                  }
                  placeholder="Example: Data Analyst"
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </label>

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Future / Target Role
              </span>

              <div className="mt-2 flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4">
                <Map
                  size={18}
                  className="text-cyan-300 shrink-0"
                />

                <input
                  value={targetCareer}
                  onChange={(e) =>
                    setTargetCareer(e.target.value)
                  }
                  placeholder="Example: Data Scientist"
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </label>

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Years of Experience
              </span>

              <input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) =>
                  setExperienceYears(e.target.value)
                }
                placeholder="Example: 3"
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
              />
            </label>

            <label className="block mt-5">
              <span className="text-gray-400 text-sm">
                Current Skills
              </span>

              <textarea
                value={currentSkills}
                onChange={(e) =>
                  setCurrentSkills(e.target.value)
                }
                placeholder="Example: Python, SQL, Excel, Power BI, Communication"
                rows={6}
                className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 resize-none"
              />

              <p className="text-xs text-gray-500 mt-2">
                Separate your skills using commas.
              </p>
            </label>

            <button
              onClick={analyzeSkillGap}
              disabled={analyzing}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black disabled:opacity-60 hover:scale-[1.01] transition"
            >
              {analyzing
                ? "AI is analyzing your career..."
                : "Analyze My Skill Gap"}
            </button>

            {error && (
              <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-5 leading-5">
              CareerZoid uses AI to provide personalized career guidance.
              Results are recommendations and should be verified against
              current job requirements.
            </p>
          </div>

          <div className="lg:col-span-2">
            {!result ? (
              <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center min-h-[500px] flex flex-col justify-center">
                <Lock
                  size={60}
                  className="mx-auto text-purple-300"
                />

                <h2 className="text-4xl font-black mt-6">
                  Your Career Gap Report
                </h2>

                <p className="text-gray-400 mt-4 max-w-xl mx-auto leading-7">
                  Enter your present role, future target role, experience,
                  and current skills. CareerZoid will identify the gap
                  between where you are today and where you want to be.
                </p>

                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    Skill gaps
                  </span>

                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    Certifications
                  </span>

                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    Projects
                  </span>

                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    Learning plan
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                      <p className="text-gray-500 text-sm">
                        Career transition
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="font-black text-xl">
                          {currentRole}
                        </span>

                        <span className="text-purple-300">
                          →
                        </span>

                        <span className="font-black text-xl text-purple-300">
                          {targetCareer}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                      <p className="text-xs text-gray-500">
                        Transition difficulty
                      </p>

                      <p className="font-black text-purple-300">
                        {result.transitionDifficulty}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 mt-6 leading-7">
                    {result.overallAssessment}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                      {experienceYears} years experience
                    </span>

                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                      Estimated transition:{" "}
                      {result.estimatedTransitionTime}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <ScoreCard
                    title="Target Role Readiness"
                    score={result.readinessScore}
                  />

                  <ScoreCard
                    title="Career Match"
                    score={result.careerMatch}
                  />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <ObjectListCard
                    title="Current Strengths"
                    icon={
                      <CheckCircle className="text-green-300" />
                    }
                    items={result.currentStrengths}
                    primaryKey="skill"
                    secondaryKey="reason"
                  />

                  <ObjectListCard
                    title="Transferable Skills"
                    icon={
                      <Wrench className="text-cyan-300" />
                    }
                    items={result.transferableSkills}
                    primaryKey="skill"
                    secondaryKey="reason"
                  />

                  <ObjectListCard
                    title="Priority Skills"
                    icon={
                      <Zap className="text-purple-300" />
                    }
                    items={result.prioritySkills}
                    primaryKey="skill"
                    secondaryKey="reason"
                  />
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <AlertTriangle className="text-yellow-300" />

                    <div>
                      <h2 className="text-3xl font-black">
                        Skill Gaps
                      </h2>

                      <p className="text-gray-500 text-sm mt-1">
                        What you need to develop for the target role
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {result.skillGaps?.map(
                      (gap: any, index: number) => (
                        <div
                          key={index}
                          className="bg-slate-950/60 border border-white/10 rounded-3xl p-6"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <h3 className="text-2xl font-black">
                              {gap.skill}
                            </h3>

                            <PriorityBadge
                              priority={gap.priority}
                            />
                          </div>

                          <p className="text-gray-400 mt-4 leading-7">
                            {gap.whyItMatters}
                          </p>

                          <div className="mt-5">
                            <p className="text-sm font-bold text-purple-300 mb-3">
                              What to learn
                            </p>

                            <div className="grid md:grid-cols-3 gap-3">
                              {gap.whatToLearn?.map(
                                (
                                  topic: string,
                                  topicIndex: number
                                ) => (
                                  <div
                                    key={topicIndex}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-300"
                                  >
                                    {topic}
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="mt-5 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                            <p className="text-sm font-bold text-purple-300">
                              How to prove this skill
                            </p>

                            <p className="text-gray-400 mt-2">
                              {gap.howToProveIt}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <CertificationCard
                    title="Free Certifications & Resources"
                    icon={
                      <GraduationCap className="text-green-300" />
                    }
                    items={result.freeCertifications}
                  />

                  <CertificationCard
                    title="Paid Certifications"
                    icon={
                      <Award className="text-yellow-300" />
                    }
                    items={result.paidCertifications}
                  />
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <Target className="text-cyan-300" />

                    <div>
                      <h2 className="text-3xl font-black">
                        Recommended Projects
                      </h2>

                      <p className="text-gray-500 text-sm mt-1">
                        Projects that can prove your target-role readiness
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {result.recommendedProjects?.map(
                      (project: any, index: number) => (
                        <div
                          key={index}
                          className="bg-slate-950/60 border border-white/10 rounded-3xl p-6"
                        >
                          <h3 className="text-xl font-black">
                            {project.title}
                          </h3>

                          <p className="text-gray-400 mt-3 leading-7">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-5">
                            {project.skills?.map(
                              (
                                skill: string,
                                skillIndex: number
                              ) => (
                                <span
                                  key={skillIndex}
                                  className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <Map className="text-purple-300" />

                    <div>
                      <h2 className="text-3xl font-black">
                        Personalized Learning Plan
                      </h2>

                      <p className="text-gray-500 text-sm mt-1">
                        AI-generated transition stages based on your gap
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {result.learningPlan?.map(
                      (stage: any, index: number) => (
                        <div
                          key={index}
                          className="bg-slate-950/60 border border-white/10 rounded-3xl p-6"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 font-black">
                              {index + 1}
                            </span>

                            <div>
                              <p className="text-purple-300 text-sm font-bold">
                                {stage.stage}
                              </p>

                              <h3 className="text-2xl font-black">
                                {stage.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-gray-400 mt-5 leading-7">
                            {stage.focus}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-5">
                            {stage.skills?.map(
                              (
                                skill: string,
                                skillIndex: number
                              ) => (
                                <span
                                  key={skillIndex}
                                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>

                          <div className="mt-5 p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                            <p className="text-sm font-bold text-green-300">
                              Expected outcome
                            </p>

                            <p className="text-gray-400 mt-2">
                              {stage.outcome}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                    <h2 className="text-2xl font-black mb-5">
                      Target Role Readiness
                    </h2>

                    <div className="space-y-3">
                      {result.roleReadiness?.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="bg-slate-950/60 border border-white/10 rounded-2xl p-4"
                          >
                            <div className="flex justify-between gap-3">
                              <span className="font-bold">
                                {item.area}
                              </span>

                              <span
                                className={
                                  item.status
                                    ?.toLowerCase()
                                    .includes("ready")
                                    ? "text-green-300"
                                    : "text-yellow-300"
                                }
                              >
                                {item.status}
                              </span>
                            </div>

                            <p className="text-gray-500 text-sm mt-2">
                              {item.reason}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <ListCard
                    title="CareerZoid Recommendations"
                    icon={
                      <Sparkles className="text-purple-300" />
                    }
                    items={result.recommendations}
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

function InfoBadge({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-purple-300">
        {icon}
        <span className="font-bold text-sm">{title}</span>
      </div>

      <p className="text-gray-500 text-xs mt-2">
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
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function ObjectListCard({
  title,
  icon,
  items,
  primaryKey,
  secondaryKey,
}: {
  title: string;
  icon: React.ReactNode;
  items: any[];
  primaryKey: string;
  secondaryKey: string;
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
        {(items || []).map((item: any, index: number) => (
          <div
            key={index}
            className="bg-slate-950/60 border border-white/10 rounded-2xl p-4"
          >
            <p className="font-bold text-gray-200">
              {item?.[primaryKey] || "Skill"}
            </p>

            <p className="text-gray-500 text-sm mt-2 leading-6">
              {item?.[secondaryKey] || ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListCard({
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
        {(items || []).map(
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

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  const value = String(priority || "").toLowerCase();

  let classes =
    "bg-yellow-500/10 border-yellow-500/30 text-yellow-300";

  if (value.includes("critical")) {
    classes =
      "bg-red-500/10 border-red-500/30 text-red-300";
  } else if (value.includes("high")) {
    classes =
      "bg-orange-500/10 border-orange-500/30 text-orange-300";
  } else if (value.includes("low")) {
    classes =
      "bg-green-500/10 border-green-500/30 text-green-300";
  }

  return (
    <span
      className={`px-4 py-2 rounded-xl border text-sm font-bold ${classes}`}
    >
      {priority}
    </span>
  );
}

function CertificationCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: any[];
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        {icon}

        <h3 className="text-2xl font-black">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {(items || []).map(
          (item: any, index: number) => (
            <div
              key={index}
              className="bg-slate-950/60 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-black text-gray-200">
                    {item?.name}
                  </h4>

                  <p className="text-purple-300 text-sm mt-1">
                    {item?.provider}
                  </p>
                </div>

                <ExternalLink
                  size={17}
                  className="text-gray-600 shrink-0"
                />
              </div>

              <p className="text-gray-500 text-sm mt-3 leading-6">
                {item?.reason}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}