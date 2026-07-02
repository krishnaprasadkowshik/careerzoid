import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import {
  CheckCircle,
  Crown,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  XCircle,
} from "lucide-react";

import { db } from "../firebase/firestore";

export default function StudentManagementProPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [eligibilityFilter, setEligibilityFilter] = useState("all");
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

    if (membershipFilter !== "all") {
      results = results.filter((student: any) => {
        const status = getMembershipStatus(student).toLowerCase();

        if (membershipFilter === "free") return status === "free";
        if (membershipFilter === "pro") return status.includes("pro");

        return true;
      });
    }

    if (eligibilityFilter !== "all") {
      results = results.filter((student: any) => {
        const eligible =
          student.achieversEligible === true ||
          student.eligibleForAchieversClub === true;

        if (eligibilityFilter === "eligible") return eligible;
        if (eligibilityFilter === "pending") return !eligible;

        return true;
      });
    }

    setFilteredStudents(results);
  }, [search, students, membershipFilter, eligibilityFilter]);

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
      console.error("Student management error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipStatus = (student: any) => {
    const plan = String(
      student.membership || student.subscription || student.plan || "free"
    );

    if (
      plan.toLowerCase().includes("pro") ||
      plan.toLowerCase().includes("launch") ||
      student.launchBatchActive === true
    ) {
      return "PRO";
    }

    return "Free";
  };

  const getProgressPercent = (student: any) => {
    const steps = [
      student.careerDiscoveryCompleted === true ||
        student.careerDiscovery === true,
      student.careerPathSelected === true || student.careerSelection === true,
      student.skillGapCompleted === true,
      student.resumeSubmitted === true,
      student.linkedinSubmitted === true,
      student.roadmapCompleted === true,
      student.interviewCompleted === true,
    ];

    const completed = steps.filter(Boolean).length;

    return Math.round((completed / steps.length) * 100);
  };

  const toggleAchieversEligibility = async (student: any) => {
    setUpdatingId(student.id);

    const currentStatus =
      student.achieversEligible === true ||
      student.eligibleForAchieversClub === true;

    try {
      await setDoc(
        doc(db, "users", student.id),
        {
          achieversEligible: !currentStatus,
          eligibleForAchieversClub: !currentStatus,
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

  const markAsPro = async (student: any) => {
    setUpdatingId(student.id);

    try {
      await setDoc(
        doc(db, "users", student.id),
        {
          membership: "PRO",
          subscription: "PRO",
          plan: "PRO",
          launchBatchActive: true,
          paymentStatus: "manual-admin",
        },
        { merge: true }
      );

      await loadStudents();
    } catch (error) {
      console.error("Membership update error:", error);
      alert("Failed to update membership.");
    } finally {
      setUpdatingId("");
    }
  };

  const markAsFree = async (student: any) => {
    setUpdatingId(student.id);

    try {
      await setDoc(
        doc(db, "users", student.id),
        {
          membership: "FREE",
          subscription: "FREE",
          plan: "FREE",
          launchBatchActive: false,
        },
        { merge: true }
      );

      await loadStudents();
    } catch (error) {
      console.error("Membership update error:", error);
      alert("Failed to update membership.");
    } finally {
      setUpdatingId("");
    }
  };

  const totalStudents = students.length;

  const activeMembers = students.filter(
    (student: any) => getMembershipStatus(student) === "PRO"
  ).length;

  const achieversEligible = students.filter(
    (student: any) =>
      student.achieversEligible === true ||
      student.eligibleForAchieversClub === true
  ).length;

  const totalReferrals = students.reduce(
    (total: number, student: any) =>
      total + Number(student.successfulReferrals || 0),
    0
  );

  const averageProgress = useMemo(() => {
    if (students.length === 0) return 0;

    const totalProgress = students.reduce(
      (total, student) => total + getProgressPercent(student),
      0
    );

    return Math.round(totalProgress / students.length);
  }, [students]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-5 text-gray-400">Loading Students...</p>
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
            <GraduationCap size={16} />
            CareerZoid Student Operations
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Student Management
          </h1>

          <p className="text-gray-400 text-xl mt-4 max-w-3xl">
            View students, memberships, Launch Batch progress, referrals and
            Achievers Club eligibility from one admin workspace.
          </p>
        </div>

        <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={<Users size={26} />}
          />

          <StatCard
            title="PRO Members"
            value={activeMembers}
            icon={<Crown size={26} />}
          />

          <StatCard
            title="Achievers Eligible"
            value={achieversEligible}
            icon={<ShieldCheck size={26} />}
          />

          <StatCard
            title="Total Referrals"
            value={totalReferrals}
            icon={<Target size={26} />}
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
                placeholder="Search by name, email or referral code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-purple-500 transition"
              />
            </div>

            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
            >
              <option value="all">All Memberships</option>
              <option value="free">Free Users</option>
              <option value="pro">PRO Members</option>
            </select>

            <select
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
            >
              <option value="all">All Eligibility</option>
              <option value="eligible">Achievers Eligible</option>
              <option value="pending">Pending Eligibility</option>
            </select>
          </div>
        </section>

        <section className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Student Database</h2>
              <p className="text-gray-400 mt-2">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>

            <button
              onClick={loadStudents}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-bold"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="text-left p-5">Student</th>
                  <th className="text-left p-5">Membership</th>
                  <th className="text-left p-5">Progress</th>
                  <th className="text-left p-5">Referrals</th>
                  <th className="text-left p-5">Achievers Club</th>
                  <th className="text-left p-5">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student: any) => {
                    const progress = getProgressPercent(student);
                    const membership = getMembershipStatus(student);
                    const eligible =
                      student.achieversEligible === true ||
                      student.eligibleForAchieversClub === true;

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-white/10 hover:bg-white/[0.03] transition"
                      >
                        <td className="p-5">
                          <div>
                            <p className="font-bold text-lg">
                              {student.name || student.fullName || "Student"}
                            </p>

                            <p className="text-sm text-gray-500 break-all">
                              {student.email || "No email"}
                            </p>

                            <p className="text-xs text-purple-300 mt-2">
                              {student.referralCode || "No referral code"}
                            </p>
                          </div>
                        </td>

                        <td className="p-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black ${
                              membership === "PRO"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-slate-700 text-gray-300"
                            }`}
                          >
                            {membership}
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="w-40">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-gray-400">Progress</span>
                              <span className="font-bold">{progress}%</span>
                            </div>

                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-5">
                          <div>
                            <p className="text-purple-300 font-black text-xl">
                              {Number(student.successfulReferrals || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              successful referrals
                            </p>
                          </div>
                        </td>

                        <td className="p-5">
                          {eligible ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-black">
                              <CheckCircle size={14} />
                              Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700 text-gray-300 text-xs font-black">
                              <XCircle size={14} />
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="p-5">
                          <div className="flex flex-wrap gap-2">
                            {membership === "PRO" ? (
                              <button
                                onClick={() => markAsFree(student)}
                                disabled={updatingId === student.id}
                                className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold disabled:opacity-50"
                              >
                                Make Free
                              </button>
                            ) : (
                              <button
                                onClick={() => markAsPro(student)}
                                disabled={updatingId === student.id}
                                className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-bold disabled:opacity-50"
                              >
                                Make PRO
                              </button>
                            )}

                            <button
                              onClick={() => toggleAchieversEligibility(student)}
                              disabled={updatingId === student.id}
                              className={`px-3 py-2 rounded-xl border text-xs font-bold disabled:opacity-50 ${
                                eligible
                                  ? "bg-red-500/10 border-red-500/20 text-red-300"
                                  : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                              }`}
                            >
                              {eligible ? "Remove Eligible" : "Mark Eligible"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
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