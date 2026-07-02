import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import {
  CheckCircle,
  Clock,
  Crown,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

import { db } from "../firebase/firestore";

export default function EligibilityManagementProPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    let results = students;

    if (search.trim()) {
      const query = search.toLowerCase();

      results = results.filter((student: any) => {
        const name = String(
          student.name || student.fullName || "Student"
        ).toLowerCase();

        const email = String(student.email || "").toLowerCase();

        const referralCode = String(student.referralCode || "").toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          referralCode.includes(query)
        );
      });
    }

    if (statusFilter !== "all") {
      results = results.filter((student: any) => {
        const eligible = isEligible(student);
        const completed = getProgressPercent(student) === 100;

        if (statusFilter === "eligible") return eligible;
        if (statusFilter === "pending") return !eligible;
        if (statusFilter === "completed") return completed;
        if (statusFilter === "incomplete") return !completed;

        return true;
      });
    }

    setFilteredStudents(results);
  }, [students, search, statusFilter]);

  const loadStudents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Eligibility management error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isEligible = (student: any) => {
    return (
      student.achieversEligible === true ||
      student.eligibleForAchieversClub === true
    );
  };

  const isLaunchBatchMember = (student: any) => {
    const plan = String(
      student.membership || student.subscription || student.plan || ""
    ).toLowerCase();

    return (
      plan.includes("pro") ||
      plan.includes("launch") ||
      student.launchBatchActive === true
    );
  };

  const getProgressSteps = (student: any) => {
    return [
      {
        key: "careerDiscovery",
        title: "Career Discovery",
        done:
          student.careerDiscoveryCompleted === true ||
          student.careerDiscovery === true,
      },
      {
        key: "careerSelection",
        title: "Career Path Selection",
        done:
          student.careerPathSelected === true ||
          student.careerSelection === true,
      },
      {
        key: "skillGap",
        title: "Skill Gap Analysis",
        done: student.skillGapCompleted === true,
      },
      {
        key: "resume",
        title: "Resume Submission",
        done: student.resumeSubmitted === true,
      },
      {
        key: "linkedin",
        title: "LinkedIn Submission",
        done: student.linkedinSubmitted === true,
      },
      {
        key: "roadmap",
        title: "Learning Roadmap",
        done: student.roadmapCompleted === true,
      },
      {
        key: "interview",
        title: "Interview Readiness",
        done: student.interviewCompleted === true,
      },
    ];
  };

  const getProgressPercent = (student: any) => {
    const steps = getProgressSteps(student);
    const completed = steps.filter((step) => step.done).length;

    return Math.round((completed / steps.length) * 100);
  };

  const updateEligibility = async (student: any, value: boolean) => {
    setUpdatingId(student.id);

    try {
      await setDoc(
        doc(db, "users", student.id),
        {
          achieversEligible: value,
          eligibleForAchieversClub: value,
          referralAccess: value,
        },
        { merge: true }
      );

      await loadStudents();
    } catch (error) {
      console.error("Eligibility update error:", error);
      alert("Failed to update eligibility.");
    } finally {
      setUpdatingId("");
    }
  };

  const updateProgressStep = async (
    student: any,
    field: string,
    value: boolean
  ) => {
    setUpdatingId(student.id);

    try {
      await setDoc(
        doc(db, "users", student.id),
        {
          [field]: value,
        },
        { merge: true }
      );

      await loadStudents();
    } catch (error) {
      console.error("Progress update error:", error);
      alert("Failed to update progress.");
    } finally {
      setUpdatingId("");
    }
  };

  const totalStudents = students.length;

  const eligibleStudents = students.filter((student) => isEligible(student)).length;

  const pendingStudents = totalStudents - eligibleStudents;

  const completedStudents = students.filter(
    (student) => getProgressPercent(student) === 100
  ).length;

  const averageProgress = useMemo(() => {
    if (students.length === 0) return 0;

    const total = students.reduce(
      (sum, student) => sum + getProgressPercent(student),
      0
    );

    return Math.round(total / students.length);
  }, [students]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-5 text-gray-400">Loading Eligibility Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/25 blur-[160px] rounded-full" />
        <div className="absolute top-20 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[800px] h-[800px] bg-cyan-700/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
            <Trophy size={16} />
            CareerZoid Achievers Club Control
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Eligibility Management
          </h1>

          <p className="text-gray-400 text-xl mt-4 max-w-3xl">
            Manage Launch Batch completion, manually approve Achievers Club
            eligibility and control referral access.
          </p>
        </div>

        <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={<Users size={26} />}
          />

          <StatCard
            title="Eligible"
            value={eligibleStudents}
            icon={<ShieldCheck size={26} />}
          />

          <StatCard
            title="Pending"
            value={pendingStudents}
            icon={<Clock size={26} />}
          />

          <StatCard
            title="Completed"
            value={completedStudents}
            icon={<CheckCircle size={26} />}
          />

          <StatCard
            title="Avg Progress"
            value={`${averageProgress}%`}
            icon={<Sparkles size={26} />}
          />
        </section>

        <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl mb-8">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                placeholder="Search student, email or referral code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-purple-500 transition"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
            >
              <option value="all">All Students</option>
              <option value="eligible">Eligible Students</option>
              <option value="pending">Pending Students</option>
              <option value="completed">100% Completed</option>
              <option value="incomplete">Incomplete Progress</option>
            </select>

            <button
              onClick={loadStudents}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-bold hover:bg-white/10 transition"
            >
              Refresh Data
            </button>
          </div>
        </section>

        <section className="space-y-6">
          {filteredStudents.length === 0 ? (
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center backdrop-blur-2xl">
              <Trophy size={50} className="mx-auto text-purple-300" />
              <h2 className="text-3xl font-black mt-5">No Students Found</h2>
              <p className="text-gray-400 mt-2">
                Try changing filters or refreshing data.
              </p>
            </div>
          ) : (
            filteredStudents.map((student: any) => {
              const progress = getProgressPercent(student);
              const eligible = isEligible(student);
              const launchMember = isLaunchBatchMember(student);
              const steps = getProgressSteps(student);

              return (
                <div
                  key={student.id}
                  className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl"
                >
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-black">
                          {student.name || student.fullName || "Student"}
                        </h2>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black ${
                            launchMember
                              ? "bg-green-500/20 text-green-300"
                              : "bg-slate-700 text-gray-300"
                          }`}
                        >
                          {launchMember ? "Launch Batch" : "Free"}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black ${
                            eligible
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-slate-700 text-gray-300"
                          }`}
                        >
                          {eligible ? "Achievers Eligible" : "Not Eligible"}
                        </span>
                      </div>

                      <p className="text-gray-500 mt-2 break-all">
                        {student.email || "No email"}
                      </p>

                      <p className="text-purple-300 text-sm mt-2">
                        {student.referralCode || "No referral code generated"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => updateEligibility(student, !eligible)}
                        disabled={updatingId === student.id}
                        className={`px-5 py-3 rounded-2xl font-bold disabled:opacity-50 ${
                          eligible
                            ? "bg-red-500/10 border border-red-500/20 text-red-300"
                            : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {eligible ? "Remove Eligibility" : "Mark Eligible"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-400">Launch Batch Completion</p>
                      <p className="font-black">{progress}%</p>
                    </div>

                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                    {steps.map((step) => (
                      <button
                        key={step.key}
                        onClick={() =>
                          updateProgressStep(student, getStepField(step.key), !step.done)
                        }
                        disabled={updatingId === student.id}
                        className={`text-left border rounded-2xl p-4 transition disabled:opacity-50 ${
                          step.done
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-slate-950/50 border-white/10 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold">{step.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {step.done ? "Completed" : "Pending"}
                            </p>
                          </div>

                          {step.done ? (
                            <CheckCircle className="text-green-400" size={20} />
                          ) : (
                            <XCircle className="text-yellow-400" size={20} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {progress === 100 && !eligible && (
                    <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-black text-yellow-300">
                            Student completed all requirements
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            You can manually mark this student as Achievers Club
                            eligible.
                          </p>
                        </div>

                        <button
                          onClick={() => updateEligibility(student, true)}
                          disabled={updatingId === student.id}
                          className="px-5 py-3 rounded-2xl bg-yellow-500 text-black font-black disabled:opacity-50"
                        >
                          Approve Now
                        </button>
                      </div>
                    </div>
                  )}

                  {eligible && (
                    <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                      <div className="flex items-center gap-3">
                        <Crown className="text-green-300" />
                        <p className="text-green-300 font-bold">
                          This student can access Achievers Club resources and
                          referral system.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

function getStepField(key: string) {
  const fields: any = {
    careerDiscovery: "careerDiscoveryCompleted",
    careerSelection: "careerPathSelected",
    skillGap: "skillGapCompleted",
    resume: "resumeSubmitted",
    linkedin: "linkedinSubmitted",
    roadmap: "roadmapCompleted",
    interview: "interviewCompleted",
  };

  return fields[key];
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl hover:-translate-y-1 hover:border-purple-500/50 transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-5">
        {icon}
      </div>

      <p className="text-gray-400">{title}</p>

      <h3 className="text-4xl font-black mt-3 text-purple-300">{value}</h3>
    </div>
  );
}