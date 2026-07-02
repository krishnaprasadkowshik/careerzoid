import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Crown,
  Play,
  Rocket,
  Trophy,
} from "lucide-react";

import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";

export default function CareerDetailsProPage() {
  const navigate = useNavigate();
  const { careerName } = useParams();

  const [career, setCareer] = useState<any>(null);
  const [allCareers, setAllCareers] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const careerSlug = useMemo(() => careerName || "", [careerName]);

  const safeArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (value && typeof value === "object") {
      return Object.values(value);
    }

    return [];
  };

  const safeText = (value: any, fallback = "Not added") => {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
    return fallback;
  };

  const makeSlug = (name: string) => name?.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    loadCareer();
  }, [careerSlug]);

  const loadCareer = async () => {
    try {
      const snapshot = await getDocs(collection(db, "careers"));

      const careers = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setAllCareers(careers);

      const matchedCareer = careers.find(
        (item: any) => makeSlug(item.name) === careerSlug
      );

      setCareer(matchedCareer || null);

      const user = auth.currentUser;

      if (user && matchedCareer) {
        const savedSnapshot = await getDocs(
          collection(db, "users", user.uid, "savedCareers")
        );

        const isSaved = savedSnapshot.docs.some(
          (docSnap) => docSnap.id === matchedCareer.id
        );

        setSaved(isSaved);
      }
    } catch (error) {
      console.error("Career details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCareer = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!career) return;

    try {
      await setDoc(doc(db, "users", user.uid, "savedCareers", career.id), {
        careerId: career.id,
        careerName: career.name || "",
        description: career.description || "",
        salary: career.salary || "",
        learningTime: career.learningTime || "",
        demand: career.demand || "",
        thumbnail: career.thumbnail || "",
        skills: safeArray(career.skills),
        roadmap: safeArray(career.roadmap),
        companies: safeArray(career.companies || career.topHiringCompanies),
        freeCertifications: safeArray(career.freeCertifications),
        paidCertifications: safeArray(career.paidCertifications),
        savedAt: serverTimestamp(),
      });

      setSaved(true);
      alert("Career saved to dashboard!");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving career.");
    }
  };

  const getItemTitle = (item: any, fallback: string) => {
    if (typeof item === "string") return item;
    if (item?.title) return item.title;
    if (item?.name) return item.name;
    return fallback;
  };

  const getItemDescription = (item: any) => {
    if (typeof item === "string") return "";
    return item?.description || item?.details || item?.task || "";
  };

  const getItemLink = (item: any) => {
    if (typeof item === "string") return item;
    return item?.link || item?.url || "#";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading career details...
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-xl text-center bg-white/[0.04] border border-white/10 rounded-3xl p-10">
          <h1 className="text-4xl font-black">Career Not Found</h1>
          <p className="text-gray-400 mt-4">
            This career is not available in the database.
          </p>

          <button
            onClick={() => navigate("/career-explorer")}
            className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-2xl font-bold"
          >
            Back to Career Explorer
          </button>
        </div>
      </div>
    );
  }

  const skills = safeArray(career.skills);
  const roadmap = safeArray(career.roadmap);
  const youtubePlaylists = safeArray(career.youtubePlaylists || career.playlists);
  const freeCertifications = safeArray(career.freeCertifications);
  const paidCertifications = safeArray(career.paidCertifications);
  const companies = safeArray(career.companies || career.topHiringCompanies);
  const salaryGrowth = safeArray(career.salaryGrowth);
  const relatedCareers = safeArray(career.relatedCareers);

  const autoRelatedCareers = allCareers
    .filter((item) => item.id !== career.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-purple-700/25 blur-[150px] rounded-full" />
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-blue-700/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-cyan-700/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/career-explorer")}
          className="mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
        >
          ← Back to Career Explorer
        </button>

        <section className="grid lg:grid-cols-2 gap-10 items-center bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-[2rem] p-8 lg:p-10">
          <div>
            <div className="inline-flex px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm">
              Career Intelligence Profile
            </div>

            <h1 className="text-5xl md:text-7xl font-black mt-6 leading-tight">
              {career.name}
            </h1>

            <p className="text-gray-400 text-lg mt-6">
              {career.description || "No description added yet."}
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <InfoCard title="Expected Salary" value={career.salary} color="text-green-300" />
              <InfoCard title="Learning Time" value={career.learningTime} color="text-blue-300" />
              <InfoCard title="Demand" value={career.demand} color="text-purple-300" />
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={saveCareer}
                disabled={saved}
                className={`px-7 py-4 rounded-2xl font-black transition ${
                  saved
                    ? "bg-green-500/20 border border-green-500 text-green-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
                }`}
              >
                {saved ? "✅ Saved To Dashboard" : "Save Career"}
              </button>

              <button
                onClick={() => navigate("/launch-batch")}
                className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 font-black hover:bg-white/10 transition"
              >
                Join Launch Batch
              </button>
            </div>
          </div>

          <div className="relative min-h-[430px] bg-slate-950/60 border border-white/10 rounded-[2rem] p-6 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/30 blur-3xl rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />

            {career.thumbnail ? (
              <img
                src={career.thumbnail}
                alt={career.name}
                className="relative z-10 w-full h-[380px] object-cover rounded-3xl"
              />
            ) : (
              <div className="relative z-10 h-[380px] flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <div className="text-7xl text-center">🚀</div>
                  <h3 className="text-2xl font-black text-center mt-6">
                    Career Growth System
                  </h3>

                  <div className="space-y-3 mt-6">
                    <HeroMini title="Skills" value={skills.length} />
                    <HeroMini title="Roadmap Steps" value={roadmap.length} />
                    <HeroMini title="Companies" value={companies.length} />
                    <HeroMini
                      title="Certifications"
                      value={freeCertifications.length + paidCertifications.length}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
          <StatCard label="Skills Needed" value={skills.length} />
          <StatCard label="Roadmap Levels" value={roadmap.length} />
          <StatCard label="Companies" value={companies.length} />
          <StatCard label="Difficulty" value={safeText(career.difficulty, "Beginner")} />
        </section>

        <section className="grid lg:grid-cols-2 gap-8 mt-8">
          <GlassCard title="Required Skills">
            {skills.length === 0 ? (
              <p className="text-gray-400">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill: any, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200"
                  >
                    {getItemTitle(skill, `Skill ${index + 1}`)}
                  </span>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard title="Career Demand">
            <p className="text-gray-300 leading-relaxed">
              {career.demandInfo ||
                career.careerDemandInfo ||
                career.demand ||
                "Demand information is not added yet."}
            </p>
          </GlassCard>
        </section>

        <section className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-[2rem] p-8 mt-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-4">
                Animated Career Roadmap
              </div>

              <h2 className="text-4xl font-black">
                Duolingo-Style Career Path
              </h2>

              <p className="text-gray-400 mt-3 max-w-3xl">
                Follow this career path like levels. Each milestone shows what to learn,
                what to practice and how to move toward job readiness.
              </p>
            </div>

            <button
              onClick={() => navigate("/roadmap-generator")}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold"
            >
              Open PRO Roadmap
            </button>
          </div>

          {roadmap.length === 0 ? (
            <p className="text-gray-400">No roadmap added yet.</p>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-white/10 -translate-x-1/2 hidden md:block" />

              <div className="space-y-10">
                {roadmap.map((step: any, index: number) => {
                  const title = getItemTitle(step, `Roadmap Level ${index + 1}`);
                  const description = getItemDescription(step);
                  const isCheckpoint =
                    typeof step === "object" &&
                    (step.type === "checkpoint" ||
                      step.checkpoint === true ||
                      title.toLowerCase().includes("project") ||
                      title.toLowerCase().includes("job"));

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 40, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`relative flex ${
                        index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                      }`}
                    >
                      <div
                        className={`w-full md:w-[46%] rounded-[2rem] border p-6 hover:-translate-y-1 transition-all duration-300 ${
                          isCheckpoint
                            ? "bg-yellow-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/10"
                            : "bg-slate-950/60 border-white/10 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-400">
                              {isCheckpoint ? "CHECKPOINT" : `LEVEL ${index + 1}`}
                            </p>

                            <h3 className="text-2xl font-black mt-1">
                              {title}
                            </h3>
                          </div>

                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              isCheckpoint
                                ? "bg-yellow-500 text-black"
                                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            }`}
                          >
                            {isCheckpoint ? <Trophy size={28} /> : <Play size={28} />}
                          </div>
                        </div>

                        {description && (
                          <p className="text-gray-400 mt-4">{description}</p>
                        )}

                        {typeof step === "object" && step.skills && (
                          <div className="mt-4">
                            <p className="text-sm text-purple-300 font-bold mb-2">
                              Skills Gained
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {safeArray(step.skills).map((skill: any, skillIndex: number) => (
                                <span
                                  key={skillIndex}
                                  className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm"
                                >
                                  {getItemTitle(skill, `Skill ${skillIndex + 1}`)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {typeof step === "object" && step.task && (
                          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                            <p className="text-sm text-gray-400">Task</p>
                            <p className="font-semibold mt-1">{step.task}</p>
                          </div>
                        )}

                        {typeof step === "object" && step.assignment && (
                          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                            <p className="text-sm text-gray-400">Assignment</p>
                            <p className="font-semibold mt-1">{step.assignment}</p>
                          </div>
                        )}

                        {typeof step === "object" && step.resource && (
                          <a
                            href={step.resource}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex mt-5 text-purple-300 underline font-bold"
                          >
                            Open Resource
                          </a>
                        )}
                      </div>

                      <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden md:flex">
                        <div
                          className={`w-8 h-8 rounded-full border-4 ${
                            isCheckpoint
                              ? "bg-yellow-400 border-yellow-200 animate-bounce"
                              : "bg-purple-500 border-purple-200"
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="grid lg:grid-cols-2 gap-8 mt-8">
          <GlassCard title="Salary Growth">
            {salaryGrowth.length === 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <SalaryBox title="Fresher" value={career.fresherSalary || "Not added"} />
                <SalaryBox title="2 Years" value={career.twoYearSalary || "Not added"} />
                <SalaryBox title="5 Years" value={career.fiveYearSalary || "Not added"} />
                <SalaryBox title="10 Years" value={career.tenYearSalary || "Not added"} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {salaryGrowth.map((item: any, index: number) => (
                  <SalaryBox
                    key={index}
                    title={["Fresher", "2 Years", "5 Years", "10 Years"][index] || `Level ${index + 1}`}
                    value={getItemTitle(item, `Salary ${index + 1}`)}
                  />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard title="Top Hiring Companies">
            {companies.length === 0 ? (
              <p className="text-gray-400">No companies added yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {companies.map((company: any, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl p-5"
                  >
                    🏢 {getItemTitle(company, `Company ${index + 1}`)}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </section>

        <section className="grid lg:grid-cols-2 gap-8 mt-8">
          <GlassCard title="YouTube Playlists">
            {youtubePlaylists.length === 0 ? (
              <p className="text-gray-400">No YouTube playlists added yet.</p>
            ) : (
              <div className="space-y-4">
                {youtubePlaylists.map((item: any, index: number) => (
                  <a
                    key={index}
                    href={getItemLink(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-slate-950/60 border border-white/10 rounded-2xl p-5 hover:border-red-500 transition"
                  >
                    ▶️ {getItemTitle(item, `Playlist ${index + 1}`)}
                  </a>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard title="Certifications">
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-black mb-3 text-green-300">
                  Free Certifications
                </h3>

                {freeCertifications.length === 0 ? (
                  <p className="text-gray-400">No free certifications added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {freeCertifications.map((item: any, index: number) => (
                      <a
                        key={index}
                        href={getItemLink(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-green-500/10 border border-green-500/20 rounded-2xl p-4"
                      >
                        ✅ {getItemTitle(item, `Free Certification ${index + 1}`)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-black mb-3 text-yellow-300">
                  Paid Certifications
                </h3>

                {paidCertifications.length === 0 ? (
                  <p className="text-gray-400">No paid certifications added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {paidCertifications.map((item: any, index: number) => (
                      <a
                        key={index}
                        href={getItemLink(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4"
                      >
                        ⭐ {getItemTitle(item, `Paid Certification ${index + 1}`)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 mt-8">
          <h2 className="text-3xl font-black mb-6">Related Careers</h2>

          {relatedCareers.length === 0 && autoRelatedCareers.length === 0 ? (
            <p className="text-gray-400">No related careers added yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              {(relatedCareers.length > 0 ? relatedCareers : autoRelatedCareers).map(
                (item: any, index: number) => {
                  const title = getItemTitle(item, item?.name || `Career ${index + 1}`);

                  return (
                    <div
                      key={index}
                      onClick={() => navigate(`/career/${makeSlug(title)}`)}
                      className="cursor-pointer bg-slate-950/60 border border-white/10 rounded-3xl p-5 hover:border-purple-500 transition"
                    >
                      <div className="text-4xl mb-4">💼</div>
                      <h3 className="font-black text-lg">{title}</h3>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoCard({ title, value, color }: any) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-5">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className={`text-xl font-black mt-2 ${color}`}>
        {value || "Not added"}
      </h3>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
      <p className="text-gray-400">{label}</p>
      <h3 className="text-3xl font-black mt-3 text-purple-300">{value}</h3>
    </div>
  );
}

function GlassCard({ title, children }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-8">
      <h2 className="text-3xl font-black mb-6">{title}</h2>
      {children}
    </div>
  );
}

function SalaryBox({ title, value }: any) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl font-black mt-2 text-green-300">{value}</h3>
    </div>
  );
}

function HeroMini({ title, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between">
      <span>{title}</span>
      <span className="font-black text-purple-300">{value}</span>
    </div>
  );
}