import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  Brain,
  CheckCircle,
  Compass,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  BookOpen,
  Briefcase,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { askGemini } from "../services/gemini";

export default function CareerAssessmentPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [workStyle, setWorkStyle] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    "Technology & AI",
    "Business & Finance",
    "Design & Creativity",
    "Healthcare",
    "Education",
    "Entrepreneurship",
    "Research & Science",
    "Government Jobs",
  ];

  const subjectOptions = [
    "Maths",
    "Computer Science",
    "Physics",
    "Biology",
    "Commerce",
    "Economics",
    "Arts",
    "English",
  ];

  const workOptions = [
    "Problem Solving",
    "Leadership",
    "Creativity",
    "Communication",
    "Analysis",
    "Research",
    "Teaching",
    "Building Products",
  ];

  const goalOptions = [
    "High Salary",
    "Work Life Balance",
    "Remote Work",
    "Startup Founder",
    "Job Security",
    "International Career",
    "Research",
    "Social Impact",
  ];

  const toggleValue = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const generateResults = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (interests.length === 0) {
      alert("Please select at least one interest.");
      return;
    }

    if (subjects.length === 0) {
      alert("Please select at least one subject.");
      return;
    }

    if (workStyle.length === 0) {
      alert("Please select at least one work preference.");
      return;
    }

    if (goals.length === 0) {
      alert("Please select at least one career goal.");
      return;
    }

    setLoading(true);

    const prompt = `
You are CareerZoid's professional AI Career Assessment Engine.

Your job is to analyze a user's interests, academic subjects, preferred working style, and career goals and recommend careers that genuinely fit the user.

IMPORTANT:
- Do NOT return generic careers.
- Do NOT always recommend AI Engineer, Data Scientist, or Software Engineer.
- Recommendations MUST be based on the user's answers.
- Consider combinations between interests, subjects, work preferences and goals.
- Give realistic career options for the user's profile.
- Do not invent personal information.
- Do not guarantee salary or employment.
- Salary information must be presented as an approximate market range, not a promise.
- Give practical reasoning.
- Recommend different types of careers when appropriate.
- Avoid recommending careers simply because they are popular.
- The result should help a student or professional make a better decision.
- Return exactly 5 career recommendations.
- Rank them from strongest match to weakest match.
- Match percentages must be reasonable and should not all be extremely high.
- The highest match should normally be between 75 and 97.
- Do not use fake precision.
- Explain WHY each career matches the person's profile.
- Mention important skills required.
- Mention what the user should learn next.
- Mention possible education/background routes.
- Mention suitable industries.
- Mention approximate salary range in India.
- Mention global/international potential where relevant.
- Mention career difficulty realistically.

USER PROFILE:

Interests:
${interests.join(", ")}

Subjects:
${subjects.join(", ")}

Preferred Work Style:
${workStyle.join(", ")}

Career Goals:
${goals.join(", ")}

Return ONLY valid JSON.

Use exactly this structure:

{
  "careers": [
    {
      "name": "Career name",
      "matchScore": 91,
      "whyMatch": "Clear explanation of why this career fits the user's answers.",
      "salaryIndia": "Approximate range",
      "demand": "High / Medium / Growing / etc.",
      "difficulty": "Low / Medium / High",
      "growth": "Strong / Good / Moderate",
      "internationalPotential": "High / Medium / Low",
      "requiredSkills": [
        "Skill 1",
        "Skill 2",
        "Skill 3",
        "Skill 4",
        "Skill 5"
      ],
      "skillsToLearnNext": [
        "Skill to learn 1",
        "Skill to learn 2",
        "Skill to learn 3"
      ],
      "educationRoutes": [
        "Relevant degree or education route",
        "Alternative route"
      ],
      "industries": [
        "Industry 1",
        "Industry 2",
        "Industry 3"
      ],
      "firstSteps": [
        "Practical first step",
        "Second practical step",
        "Third practical step"
      ]
    }
  ]
}
`;

    try {
      const response = await askGemini(prompt);

      if (!response) {
        throw new Error("Empty AI response.");
      }

      let cleanedResponse = response.trim();

      // Remove markdown code fences if Gemini adds them
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanedResponse);

      if (
        !parsed.careers ||
        !Array.isArray(parsed.careers) ||
        parsed.careers.length === 0
      ) {
        throw new Error("Invalid career assessment response.");
      }

      const careerResults = parsed.careers.slice(0, 5).map((career: any) => ({
        name: career.name || "Career",
        score: Number(career.matchScore) || 0,
        whyMatch: career.whyMatch || "No explanation available.",
        salary: career.salaryIndia || "Not available",
        demand: career.demand || "Not specified",
        difficulty: career.difficulty || "Not specified",
        growth: career.growth || "Not specified",
        internationalPotential:
          career.internationalPotential || "Not specified",
        requiredSkills: Array.isArray(career.requiredSkills)
          ? career.requiredSkills
          : [],
        skillsToLearnNext: Array.isArray(career.skillsToLearnNext)
          ? career.skillsToLearnNext
          : [],
        educationRoutes: Array.isArray(career.educationRoutes)
          ? career.educationRoutes
          : [],
        industries: Array.isArray(career.industries)
          ? career.industries
          : [],
        firstSteps: Array.isArray(career.firstSteps)
          ? career.firstSteps
          : [],
      }));

      setResults(careerResults);

      await addDoc(collection(db, "careerAssessments"), {
        userId: user.uid,
        userEmail: user.email || "",
        interests,
        subjects,
        workStyle,
        goals,
        results: careerResults,
        aiGenerated: true,
        createdAt: serverTimestamp(),
      });

      setStep(5);
    } catch (error) {
      console.error("Career Assessment Error:", error);

      alert(
        "We couldn't generate your career assessment right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const canContinue =
    step === 0 ||
    (step === 1 && interests.length > 0) ||
    (step === 2 && subjects.length > 0) ||
    (step === 3 && workStyle.length > 0) ||
    (step === 4 && goals.length > 0);

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

        {step === 0 && (
          <section className="min-h-[70vh] flex items-center justify-center">
            <div className="max-w-3xl text-center bg-white/[0.04] border border-white/10 rounded-[2rem] p-10">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Compass size={52} />
              </div>

              <h1 className="text-5xl md:text-7xl font-black mt-8">
                Career Assessment
              </h1>

              <p className="text-gray-400 text-xl mt-5">
                Discover careers that actually match your interests,
                strengths, working style, and future goals.
              </p>

              <p className="text-gray-500 mt-4">
                Your answers are analyzed by CareerZoid AI to create
                personalized career recommendations.
              </p>

              <button
                onClick={() => setStep(1)}
                className="mt-8 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-black"
              >
                Start Assessment
              </button>
            </div>
          </section>
        )}

        {step === 1 && (
          <QuestionStep
            title="What excites you the most?"
            subtitle="Choose the areas you genuinely enjoy."
            options={interestOptions}
            selected={interests}
            onToggle={(value: string) =>
              toggleValue(value, interests, setInterests)
            }
          />
        )}

        {step === 2 && (
          <QuestionStep
            title="Which subjects do you enjoy?"
            subtitle="Select subjects you enjoy learning or performing well in."
            options={subjectOptions}
            selected={subjects}
            onToggle={(value: string) =>
              toggleValue(value, subjects, setSubjects)
            }
          />
        )}

        {step === 3 && (
          <QuestionStep
            title="How do you prefer to work?"
            subtitle="Choose the activities that sound most natural to you."
            options={workOptions}
            selected={workStyle}
            onToggle={(value: string) =>
              toggleValue(value, workStyle, setWorkStyle)
            }
          />
        )}

        {step === 4 && (
          <QuestionStep
            title="What matters most to you?"
            subtitle="Select the outcomes you want from your future career."
            options={goalOptions}
            selected={goals}
            onToggle={(value: string) =>
              toggleValue(value, goals, setGoals)
            }
          />
        )}

        {step >= 1 && step <= 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10"
            >
              Back
            </button>

            {step < 4 ? (
              <button
                disabled={!canContinue}
                onClick={() => setStep(step + 1)}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                disabled={!canContinue || loading}
                onClick={generateResults}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold disabled:opacity-50"
              >
                {loading ? "CareerZoid AI is analyzing..." : "Generate AI Results"}
              </button>
            )}
          </div>
        )}

        {step === 5 && (
          <section>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200">
                <Sparkles size={16} />
                AI Career Assessment
              </div>

              <h1 className="text-5xl md:text-7xl font-black mt-6">
                Your Career Matches
              </h1>

              <p className="text-gray-400 text-lg mt-4 max-w-3xl mx-auto">
                These recommendations are based on your selected interests,
                subjects, preferred working style, and career goals.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {results.map((career, index) => (
                <div
                  key={`${career.name}-${index}`}
                  className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 hover:border-purple-500 transition"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-purple-300 font-black">
                        Match #{index + 1}
                      </p>

                      <h2 className="text-3xl font-black mt-2">
                        {career.name}
                      </h2>
                    </div>

                    <div className="text-right">
                      <p className="text-5xl font-black text-green-300">
                        {career.score}%
                      </p>

                      <p className="text-gray-400 text-sm">
                        Match
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={18} className="text-purple-300" />

                      <h3 className="font-black">
                        Why this matches you
                      </h3>
                    </div>

                    <p className="text-gray-300 leading-relaxed">
                      {career.whyMatch}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-5">
                    <Info
                      title="Approx. India Salary"
                      value={career.salary}
                    />

                    <Info
                      title="Market Demand"
                      value={career.demand}
                    />

                    <Info
                      title="Difficulty"
                      value={career.difficulty}
                    />

                    <Info
                      title="Growth"
                      value={career.growth}
                    />

                    <Info
                      title="International Potential"
                      value={career.internationalPotential}
                    />
                  </div>

                  <div className="mt-6">
                    <SectionTitle
                      icon={<Target size={18} />}
                      title="Skills Required"
                    />

                    <TagList items={career.requiredSkills} />
                  </div>

                  <div className="mt-6">
                    <SectionTitle
                      icon={<TrendingUp size={18} />}
                      title="What You Should Learn Next"
                    />

                    <div className="space-y-2">
                      {career.skillsToLearnNext.map(
                        (skill: string, skillIndex: number) => (
                          <div
                            key={skillIndex}
                            className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-gray-300"
                          >
                            {skill}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <SectionTitle
                      icon={<BookOpen size={18} />}
                      title="Education Routes"
                    />

                    <div className="space-y-2">
                      {career.educationRoutes.map(
                        (route: string, routeIndex: number) => (
                          <div
                            key={routeIndex}
                            className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-gray-300"
                          >
                            {route}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <SectionTitle
                      icon={<Briefcase size={18} />}
                      title="Suitable Industries"
                    />

                    <TagList items={career.industries} />
                  </div>

                  <div className="mt-6">
                    <SectionTitle
                      icon={<Rocket size={18} />}
                      title="Your First Steps"
                    />

                    <div className="space-y-2">
                      {career.firstSteps.map(
                        (stepText: string, stepIndex: number) => (
                          <div
                            key={stepIndex}
                            className="flex gap-3 bg-slate-950/60 border border-white/10 rounded-xl p-3 text-gray-300"
                          >
                            <span className="text-purple-300 font-black">
                              {stepIndex + 1}.
                            </span>

                            <span>{stepText}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-7">
                    <button
                      onClick={() =>
                        navigate(
                          `/career/${career.name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")}`
                        )
                      }
                      className="px-5 py-3 rounded-2xl bg-purple-600 font-bold"
                    >
                      Explore Career
                    </button>

                    <button
                      onClick={() => navigate("/skill-gap-analysis")}
                      className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 font-bold"
                    >
                      Analyze Skill Gap
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 text-center">
              <p className="text-gray-400 text-sm">
                CareerZoid provides AI-based career guidance, not a guarantee
                of employment, salary, or career success. Always validate
                important career decisions using current market information
                and qualified professionals.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function QuestionStep({
  title,
  subtitle,
  options,
  selected,
  onToggle,
}: any) {
  return (
    <section className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
          <Target size={42} />
        </div>

        <h1 className="text-4xl md:text-6xl font-black mt-6">
          {title}
        </h1>

        <p className="text-gray-400 mt-3">
          {subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {options.map((option: string) => {
          const active = selected.includes(option);

          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`rounded-3xl border p-6 text-left transition ${
                active
                  ? "bg-purple-600 border-purple-300"
                  : "bg-slate-950/60 border-white/10 hover:border-purple-500"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-black">
                  {option}
                </h3>

                {active ? (
                  <CheckCircle className="text-green-300" />
                ) : (
                  <Rocket className="text-purple-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Info({ title, value }: any) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <p className="font-black text-lg mt-1">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ icon, title }: any) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-purple-300">
        {icon}
      </span>

      <h3 className="font-black text-lg">
        {title}
      </h3>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={index}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}