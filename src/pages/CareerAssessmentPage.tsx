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
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

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

    setLoading(true);

    const careerResults = [
      {
        name: "AI Engineer",
        score: 95,
        salary: "₹8L - ₹35L+",
        demand: "Very High",
        difficulty: "High",
        growth: "Excellent",
      },
      {
        name: "Data Scientist",
        score: 92,
        salary: "₹7L - ₹30L+",
        demand: "Very High",
        difficulty: "Medium",
        growth: "Excellent",
      },
      {
        name: "Software Engineer",
        score: 89,
        salary: "₹5L - ₹28L+",
        demand: "High",
        difficulty: "Medium",
        growth: "Excellent",
      },
      {
        name: "Business Analyst",
        score: 84,
        salary: "₹4L - ₹18L+",
        demand: "High",
        difficulty: "Medium",
        growth: "Good",
      },
      {
        name: "Product Manager",
        score: 80,
        salary: "₹8L - ₹40L+",
        demand: "High",
        difficulty: "High",
        growth: "Excellent",
      },
    ];

    setTimeout(async () => {
      setResults(careerResults);

      await addDoc(collection(db, "careerAssessments"), {
        userId: user.uid,
        userEmail: user.email || "",
        interests,
        subjects,
        workStyle,
        goals,
        results: careerResults,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      setStep(5);
    }, 1500);
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
                Discover your best-fit career path in a few minutes.
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
                {loading ? "Analyzing..." : "Generate Results"}
              </button>
            )}
          </div>
        )}

        {step === 5 && (
          <section>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200">
                <Sparkles size={16} />
                AI Career Match Results
              </div>

              <h1 className="text-5xl md:text-7xl font-black mt-6">
                Your Best Career Matches
              </h1>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {results.map((career, index) => (
                <div
                  key={career.name}
                  className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 hover:border-purple-500 transition"
                >
                  <div className="flex items-start justify-between gap-4">
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
                      <p className="text-gray-400 text-sm">Match</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <Info title="Salary" value={career.salary} />
                    <Info title="Demand" value={career.demand} />
                    <Info title="Difficulty" value={career.difficulty} />
                    <Info title="Growth" value={career.growth} />
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() =>
                        navigate(
                          `/career/${career.name.toLowerCase().replace(/\s+/g, "-")}`
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
                      Skill Gap
                    </button>

                    <button
                      onClick={() => navigate("/roadmap-generator")}
                      className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 font-bold"
                    >
                      Roadmap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function QuestionStep({ title, options, selected, onToggle }: any) {
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
          Select one or more options.
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