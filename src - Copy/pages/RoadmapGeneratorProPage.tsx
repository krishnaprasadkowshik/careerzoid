import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Award,
  Check,
  Flame,
  Lock,
  Play,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

export default function RoadmapGeneratorProPage() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const isProUser = (data: any) => {
    const plan = String(
      data?.membership || data?.subscription || data?.plan || ""
    ).toLowerCase();

    return (
      plan.includes("pro") ||
      plan.includes("launch") ||
      data?.launchBatchActive === true
    );
  };

  const loadRoadmaps = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      const roadmapSnap = await getDocs(collection(db, "roadmapTemplates"));

      const roadmapData = roadmapSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setRoadmaps(roadmapData);

      if (roadmapData.length > 0) {
        setSelectedRoadmap(roadmapData[0]);

        const progressSnap = await getDoc(
          doc(db, "users", user.uid, "roadmapProgress", roadmapData[0].id)
        );

        if (progressSnap.exists()) {
          setCompletedDays(progressSnap.data().completedDays || []);
        }
      }
    } catch (error) {
      console.error("Roadmap error:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectRoadmap = async (roadmap: any) => {
    const user = auth.currentUser;
    if (!user) return;

    setSelectedRoadmap(roadmap);
    setSelectedDay(null);

    const progressSnap = await getDoc(
      doc(db, "users", user.uid, "roadmapProgress", roadmap.id)
    );

    if (progressSnap.exists()) {
      setCompletedDays(progressSnap.data().completedDays || []);
    } else {
      setCompletedDays([]);
    }
  };

  const days = useMemo(() => {
    if (!selectedRoadmap?.days) return [];

    if (Array.isArray(selectedRoadmap.days)) {
      return selectedRoadmap.days.sort(
        (a: any, b: any) => Number(a.day) - Number(b.day)
      );
    }

    return [];
  }, [selectedRoadmap]);

  const currentDay = completedDays.length + 1;

  const progress =
    days.length === 0
      ? 0
      : Math.round((completedDays.length / days.length) * 100);

  const xp = completedDays.length * 50;
  const level = Math.max(1, Math.floor(xp / 250) + 1);
  const streak = completedDays.length;
  const badges = Math.floor(completedDays.length / 5);

  const currentDayData = days.find((item: any) => Number(item.day) === currentDay);

  const markDayComplete = async (day: number) => {
    const user = auth.currentUser;
    if (!user || !selectedRoadmap) return;

    const updated = Array.from(new Set([...completedDays, day])).sort(
      (a, b) => a - b
    );

    setCompletedDays(updated);
    setSelectedDay(null);

    await setDoc(
      doc(db, "users", user.uid, "roadmapProgress", selectedRoadmap.id),
      {
        roadmapId: selectedRoadmap.id,
        roadmapTitle: selectedRoadmap.title,
        completedDays: updated,
        currentDay: updated.length + 1,
        xp: updated.length * 50,
        level: Math.max(1, Math.floor((updated.length * 50) / 250) + 1),
        streak: updated.length,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const openDay = (dayData: any) => {
    const day = Number(dayData.day);
    const unlocked = day <= currentDay;

    if (!unlocked) return;

    setSelectedDay(dayData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Roadmap...
      </div>
    );
  }

  if (!isProUser(userData)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-xl text-center bg-white/[0.04] border border-white/10 rounded-[2rem] p-10">
          <Lock size={60} className="mx-auto text-yellow-300" />

          <h1 className="text-5xl font-black mt-6">
            Roadmap Generator PRO Locked
          </h1>

          <p className="text-gray-400 mt-5">
            Join Launch Batch to unlock Duolingo-style animated roadmap.
          </p>

          <button
            onClick={() => navigate("/launch-batch")}
            className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold"
          >
            Join Launch Batch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/25 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />
        <div className="absolute top-1/3 left-1/2 w-[700px] h-[700px] bg-cyan-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
        >
          ← Back to Dashboard
        </button>

        <section className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl overflow-hidden relative">
            <div className="absolute -right-24 -top-24 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
                <Sparkles size={16} />
                Duolingo Style Career Roadmap
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                Welcome Back,
                <br />
                {userData?.fullName || userData?.name || "Student"} 👋
              </h1>

              <p className="text-gray-400 text-lg mt-5 max-w-2xl">
                Complete today’s mission, earn XP, unlock the next level, and move closer to your dream career.
              </p>

              <div className="grid sm:grid-cols-4 gap-4 mt-8">
                <MetricCard icon={<Zap />} label="Level" value={level} />
                <MetricCard icon={<Star />} label="XP" value={xp} />
                <MetricCard icon={<Flame />} label="Streak" value={streak} />
                <MetricCard icon={<Award />} label="Badges" value={badges} />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-7 backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-5xl">
                🤖
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  AI Mentor
                </h2>

                <p className="text-gray-400 text-sm">
                  CareerZoid Guide
                </p>
              </div>
            </div>

            <div className="mt-6 bg-slate-950/60 border border-white/10 rounded-3xl p-5">
              <p className="text-gray-300 leading-relaxed">
                {completedDays.length === 0
                  ? "Start Day 1 today. Your first step is the most important step."
                  : `Great work! You completed ${completedDays.length} days. Complete today's mission to earn +50 XP.`}
              </p>
            </div>

            <button
              onClick={() => currentDayData && setSelectedDay(currentDayData)}
              className="mt-5 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black"
            >
              Start Today’s Mission
            </button>
          </div>
        </section>

        {selectedRoadmap?.careerImage ? (
          <section className="mb-8 rounded-[2rem] overflow-hidden border border-white/10 relative">
            <img
              src={selectedRoadmap.careerImage}
              alt={selectedRoadmap.title}
              className="w-full h-[320px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

            <div className="absolute left-8 top-8 max-w-xl">
              <p className="text-purple-200 font-bold">
                Career Journey
              </p>

              <h2 className="text-5xl font-black mt-3">
                {selectedRoadmap.title}
              </h2>

              <p className="text-gray-300 mt-4">
                {selectedRoadmap.careerName}
              </p>
            </div>
          </section>
        ) : (
          <section className="mb-8 bg-gradient-to-r from-purple-600/20 to-cyan-500/10 border border-white/10 rounded-[2rem] p-8">
            <div className="grid md:grid-cols-5 gap-5 items-center">
              <JourneyStage emoji="🧑" title="Student" />
              <JourneyStage emoji="📚" title="Learner" />
              <JourneyStage emoji="💻" title="Builder" />
              <JourneyStage emoji="🚀" title="Professional" />
              <JourneyStage emoji="👑" title="Expert" />
            </div>
          </section>
        )}

        <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 mb-8">
          <h2 className="text-2xl font-black mb-4">
            Select Roadmap
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {roadmaps.length === 0 ? (
              <p className="text-gray-400">
                Admin has not created roadmap yet.
              </p>
            ) : (
              roadmaps.map((roadmap) => (
                <button
                  key={roadmap.id}
                  onClick={() => selectRoadmap(roadmap)}
                  className={`min-w-[260px] text-left rounded-3xl p-5 border transition ${
                    selectedRoadmap?.id === roadmap.id
                      ? "bg-purple-600 border-purple-400"
                      : "bg-slate-950/60 border-white/10 hover:border-purple-500"
                  }`}
                >
                  <h3 className="font-black">
                    {roadmap.title}
                  </h3>

                  <p className="text-sm text-gray-300 mt-2">
                    {roadmap.careerName || "Career Roadmap"}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {roadmap.durationDays} Days
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 relative bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 md:p-10 backdrop-blur-2xl overflow-hidden">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black">
                {selectedRoadmap?.title || "Your Roadmap"}
              </h2>

              <p className="text-gray-400 mt-3">
                {selectedRoadmap?.careerName || "Career"} • Day {currentDay} active
              </p>

              <div className="max-w-lg mx-auto mt-6">
                <div className="w-full h-5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-purple-300 font-black mt-3">
                  {progress}% Complete
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-white/10 rounded-full -translate-x-1/2" />

              <div className="space-y-16">
                {days.map((item: any, index: number) => {
                  const day = Number(item.day);
                  const completed = completedDays.includes(day);
                  const current = day === currentDay && !completed;
                  const unlocked = day <= currentDay;
                  const checkpoint = item.type === "checkpoint";

                  const sideClass =
                    index % 2 === 0
                      ? "translate-x-[-95px] md:translate-x-[-170px]"
                      : "translate-x-[95px] md:translate-x-[170px]";

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, scale: 0.6, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className={`relative flex justify-center ${sideClass}`}
                    >
                      <button
                        onClick={() => openDay(item)}
                        className={`relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                          completed
                            ? "bg-green-500 border-green-200 shadow-xl shadow-green-500/30"
                            : current
                            ? "bg-purple-600 border-purple-200 shadow-2xl shadow-purple-500/50 animate-bounce"
                            : unlocked
                            ? "bg-blue-600 border-blue-200 shadow-xl shadow-blue-500/30 hover:scale-110"
                            : "bg-slate-800 border-slate-600 opacity-60"
                        }`}
                      >
                        {completed ? (
                          <Check size={38} />
                        ) : checkpoint ? (
                          <Trophy size={38} />
                        ) : unlocked ? (
                          <Play size={38} />
                        ) : (
                          <Lock size={38} />
                        )}

                        <span className="text-sm font-black mt-2">
                          Day {day}
                        </span>

                        {checkpoint && (
                          <span className="text-[10px] font-bold">
                            CHECK
                          </span>
                        )}

                        {current && (
                          <span className="absolute -top-8 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full">
                            START
                          </span>
                        )}
                      </button>

                      <div className="absolute top-full mt-4 w-52 text-center">
                        <p
                          className={`font-black text-sm ${
                            completed
                              ? "text-green-300"
                              : current
                              ? "text-purple-300"
                              : unlocked
                              ? "text-blue-300"
                              : "text-gray-500"
                          }`}
                        >
                          {item.title || `Day ${day}`}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {days.length > 0 && progress === 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative flex justify-center"
                  >
                    <div className="w-40 h-40 rounded-full bg-yellow-400 text-black border-4 border-yellow-100 flex flex-col items-center justify-center shadow-2xl shadow-yellow-400/30">
                      <Trophy size={50} />
                      <p className="font-black mt-2">
                        Completed
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SideCard title="Today’s Mission">
              <p className="text-gray-400 text-sm">
                {currentDayData?.title || "No current task"}
              </p>

              <button
                onClick={() => currentDayData && setSelectedDay(currentDayData)}
                className="mt-5 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-2xl font-bold"
              >
                Open Task
              </button>
            </SideCard>

            <SideCard title="Achievement Badges">
              <Badge active={completedDays.length >= 1} emoji="🥉" title="Beginner Explorer" />
              <Badge active={completedDays.length >= 5} emoji="🥈" title="Skill Builder" />
              <Badge active={completedDays.length >= 10} emoji="🥇" title="Project Creator" />
              <Badge active={completedDays.length >= 20} emoji="🏆" title="Career Champion" />
              <Badge active={progress === 100} emoji="👑" title="Career Master" />
            </SideCard>

            <SideCard title="Next Reward">
              <div className="text-center">
                <div className="text-5xl">🎁</div>
                <p className="text-gray-400 mt-3">
                  Complete today to earn +50 XP and unlock next task.
                </p>
              </div>
            </SideCard>
          </div>
        </section>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-xl w-full bg-slate-950 border border-white/10 rounded-[2rem] p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 font-black">
                  Day {selectedDay.day}
                </p>

                <h2 className="text-3xl font-black mt-2">
                  {selectedDay.title || `Day ${selectedDay.day}`}
                </h2>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="w-10 h-10 rounded-full bg-white/10"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 mt-5">
              {selectedDay.description || "No description added by admin yet."}
            </p>

            <div className="space-y-4 mt-6">
              <InfoBlock title="Task" value={selectedDay.task} />
              <InfoBlock title="Assignment" value={selectedDay.assignment} />
            </div>

            {selectedDay.resource && (
              <a
                href={selectedDay.resource}
                target="_blank"
                rel="noreferrer"
                className="block mt-5 text-purple-300 underline font-bold"
              >
                Open Resource
              </a>
            )}

            {!completedDays.includes(Number(selectedDay.day)) && (
              <button
                onClick={() => markDayComplete(Number(selectedDay.day))}
                className="mt-8 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-black"
              >
                Complete Day {selectedDay.day} · +50 XP
              </button>
            )}

            {completedDays.includes(Number(selectedDay.day)) && (
              <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-green-300 font-bold text-center">
                Completed ✅
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: any) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-5">
      <div className="text-purple-300 mb-3">
        {icon}
      </div>

      <p className="text-gray-400 text-sm">
        {label}
      </p>

      <h3 className="text-3xl font-black mt-1">
        {value}
      </h3>
    </div>
  );
}

function JourneyStage({ emoji, title }: any) {
  return (
    <div className="text-center bg-slate-950/50 border border-white/10 rounded-3xl p-5">
      <div className="text-5xl">
        {emoji}
      </div>

      <p className="font-black mt-3">
        {title}
      </p>
    </div>
  );
}

function SideCard({ title, children }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
      <h3 className="text-2xl font-black mb-5">
        {title}
      </h3>

      {children}
    </div>
  );
}

function Badge({ active, emoji, title }: any) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-4 mb-3 border ${
        active
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
          : "bg-slate-950/50 border-white/10 text-gray-500"
      }`}
    >
      <div className="text-3xl">
        {emoji}
      </div>

      <p className="font-bold">
        {title}
      </p>
    </div>
  );
}

function InfoBlock({ title, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-gray-400 text-sm">{title}</p>

      <p className="font-semibold mt-1">
        {value || "Not added by admin yet."}
      </p>
    </div>
  );
}