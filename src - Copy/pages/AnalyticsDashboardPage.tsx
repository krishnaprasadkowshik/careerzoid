import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Crown,
  LineChart,
  RefreshCw,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { db } from "../firebase/firestore";

export default function AnalyticsDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const careersSnapshot = await getDocs(collection(db, "careers"));
      const formsSnapshot = await getDocs(collection(db, "forms"));
      const groupsSnapshot = await getDocs(collection(db, "community"));

      setUsers(
        usersSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );

      setCareers(
        careersSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );

      setForms(
        formsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );

      setGroups(
        groupsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    } catch (error) {
      console.error("Analytics dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isProUser = (user: any) => {
    const plan = String(
      user.membership || user.subscription || user.plan || ""
    ).toLowerCase();

    return (
      plan.includes("pro") ||
      plan.includes("launch") ||
      user.launchBatchActive === true
    );
  };

  const isAchieversUser = (user: any) => {
    return (
      user.achieversEligible === true ||
      user.eligibleForAchieversClub === true
    );
  };

  const proUsers = users.filter((user) => isProUser(user));
  const freeUsers = users.filter((user) => !isProUser(user));
  const achieversUsers = users.filter((user) => isAchieversUser(user));

  const totalSuccessfulReferrals = users.reduce(
    (total, user) => total + Number(user.successfulReferrals || 0),
    0
  );

  const totalRevenueEstimate = proUsers.reduce((total, user) => {
    return total + Number(user.subscriptionPrice || 49);
  }, 0);

  const conversionRate =
    users.length === 0 ? 0 : Math.round((proUsers.length / users.length) * 100);

  const achieversRate =
    proUsers.length === 0
      ? 0
      : Math.round((achieversUsers.length / proUsers.length) * 100);

  const freePercent =
    users.length === 0 ? 0 : Math.round((freeUsers.length / users.length) * 100);

  const proPercent =
    users.length === 0 ? 0 : Math.round((proUsers.length / users.length) * 100);

  const achieversPercent =
    users.length === 0
      ? 0
      : Math.round((achieversUsers.length / users.length) * 100);

  const topReferrers = useMemo(() => {
    return [...users]
      .sort(
        (a, b) =>
          Number(b.successfulReferrals || 0) -
          Number(a.successfulReferrals || 0)
      )
      .slice(0, 5);
  }, [users]);

  const topCareers = useMemo(() => {
    return careers.slice(0, 5);
  }, [careers]);

  const progressAverage = useMemo(() => {
    if (users.length === 0) return 0;

    const getProgress = (student: any) => {
      const steps = [
        student.careerDiscoveryCompleted === true ||
          student.careerDiscovery === true,
        student.careerPathSelected === true ||
          student.careerSelection === true,
        student.skillGapCompleted === true,
        student.resumeSubmitted === true,
        student.linkedinSubmitted === true,
        student.roadmapCompleted === true,
        student.interviewCompleted === true,
      ];

      const completed = steps.filter(Boolean).length;

      return Math.round((completed / steps.length) * 100);
    };

    const total = users.reduce((sum, user) => sum + getProgress(user), 0);

    return Math.round(total / users.length);
  }, [users]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-5 text-gray-400">Loading Analytics Dashboard...</p>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
              <BarChart3 size={16} />
              CareerZoid Business Intelligence
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Analytics Dashboard
            </h1>

            <p className="text-gray-400 text-xl mt-4 max-w-3xl">
              Real-time Firestore analytics for users, Launch Batch, Achievers
              Club, referrals, forms, communities and career content.
            </p>
          </div>

          <button
            onClick={loadAnalytics}
            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-bold flex items-center gap-3 w-fit"
          >
            <RefreshCw size={20} />
            Refresh Analytics
          </button>
        </div>

        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={users.length} icon={<Users />} />
          <StatCard
            title="PRO Students"
            value={proUsers.length}
            icon={<Crown />}
          />
          <StatCard
            title="Achievers Club"
            value={achieversUsers.length}
            icon={<Trophy />}
          />
          <StatCard
            title="Revenue Estimate"
            value={`₹${totalRevenueEstimate}`}
            icon={<LineChart />}
          />
        </section>

        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Careers"
            value={careers.length}
            icon={<BookOpen />}
          />
          <StatCard
            title="Forms"
            value={forms.length}
            icon={<ClipboardList />}
          />
          <StatCard
            title="Communities"
            value={groups.length}
            icon={<Users />}
          />
          <StatCard
            title="Successful Referrals"
            value={totalSuccessfulReferrals}
            icon={<Target />}
          />
        </section>

        <section className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">
              Membership Breakdown
            </h2>

            <div className="space-y-6">
              <ProgressRow
                label="Free Users"
                value={freeUsers.length}
                percent={freePercent}
                helper={`${freeUsers.length} out of ${users.length} users`}
              />

              <ProgressRow
                label="Launch Batch / PRO"
                value={proUsers.length}
                percent={proPercent}
                helper={`${conversionRate}% conversion rate`}
              />

              <ProgressRow
                label="Achievers Club"
                value={achieversUsers.length}
                percent={achieversPercent}
                helper={`${achieversRate}% of PRO students eligible`}
              />
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">Quick Insights</h2>

            <div className="space-y-4">
              <Insight text={`🎓 Total Students: ${users.length}`} />
              <Insight text={`⭐ PRO Members: ${proUsers.length}`} />
              <Insight text={`🏆 Achievers Eligible: ${achieversUsers.length}`} />
              <Insight text={`🚀 Careers Published: ${careers.length}`} />
              <Insight text={`📋 Forms Managed: ${forms.length}`} />
              <Insight text={`👥 Communities: ${groups.length}`} />
              <Insight text={`🎯 Referrals: ${totalSuccessfulReferrals}`} />
              <Insight text={`📈 Average Progress: ${progressAverage}%`} />
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-8">
          <GlassCard title="Top Referrers">
            {topReferrers.length === 0 ? (
              <EmptyText text="No referral data yet." />
            ) : (
              <div className="space-y-3">
                {topReferrers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-2xl p-4"
                  >
                    <div>
                      <p className="font-bold">
                        #{index + 1}{" "}
                        {student.name || student.fullName || "Student"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {student.email || "No email"}
                      </p>
                    </div>

                    <p className="text-green-300 font-black text-xl">
                      {Number(student.successfulReferrals || 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard title="Career Content Overview">
            {topCareers.length === 0 ? (
              <EmptyText text="No careers added yet." />
            ) : (
              <div className="space-y-3">
                {topCareers.map((career) => (
                  <div
                    key={career.id}
                    className="bg-slate-950/50 border border-white/10 rounded-2xl p-4"
                  >
                    <p className="font-bold">{career.name || "Untitled Career"}</p>

                    <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-500">Salary</p>
                        <p>{career.salary || "N/A"}</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-500">Time</p>
                        <p>{career.learningTime || "N/A"}</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-500">Demand</p>
                        <p>{career.demand || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
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

function ProgressRow({ label, value, percent, helper }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold">{label}</p>
          <p className="text-xs text-gray-500">{helper}</p>
        </div>

        <p className="text-xl font-black text-purple-300">
          {value} / {percent}%
        </p>
      </div>

      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function GlassCard({ title, children }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
      <h2 className="text-3xl font-black mb-6">{title}</h2>
      {children}
    </div>
  );
}

function Insight({ text }: any) {
  return (
    <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4">
      {text}
    </div>
  );
}

function EmptyText({ text }: any) {
  return (
    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-8 text-center text-gray-400">
      {text}
    </div>
  );
}