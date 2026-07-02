import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Percent,
  Rocket,
  Settings,
  ShieldCheck,
  Map,
  Target,
  TicketPercent,
  Trophy,
  Users,
} from "lucide-react";
import { db } from "../firebase/firestore";

export default function AdminDashboardV3Page() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [communityLinks, setCommunityLinks] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const careersSnap = await getDocs(collection(db, "careers"));
      const formsSnap = await getDocs(collection(db, "forms"));
      const communitySnap = await getDocs(collection(db, "community"));
      const promosSnap = await getDocs(collection(db, "promoCodes"));

      setUsers(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCareers(careersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setForms(formsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCommunityLinks(communitySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setPromos(promosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Admin dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const proUsers = users.filter((user) => {
    const plan = String(user.membership || user.subscription || user.plan || "").toLowerCase();
    return plan.includes("pro") || plan.includes("launch") || user.launchBatchActive === true;
  });

  const achieversUsers = users.filter(
    (user) => user.achieversEligible === true || user.eligibleForAchieversClub === true
  );

  const freeUsers = users.length - proUsers.length;

  const activePromos = promos.filter((promo) => promo.active === true).length;

  const totalSuccessfulReferrals = users.reduce(
    (total, user) => total + Number(user.successfulReferrals || 0),
    0
  );

  const conversionRate =
    users.length === 0 ? 0 : Math.round((proUsers.length / users.length) * 100);

  const achieversRate =
    proUsers.length === 0 ? 0 : Math.round((achieversUsers.length / proUsers.length) * 100);

  const topReferrers = useMemo(() => {
    return [...users]
      .sort((a, b) => Number(b.successfulReferrals || 0) - Number(a.successfulReferrals || 0))
      .slice(0, 5);
  }, [users]);

  const modules = [
    {
      title: "Career Management",
      icon: BookOpen,
      route: "/admin/careers",
      description: "Add, edit, delete and manage all career explorer content.",
      badge: `${careers.length} Careers`,
    },
    {
      title: "Roadmap Templates",
      icon: Map,
      route: "/admin/roadmaps",
      description: "Create Duolingo-style animated day-wise roadmaps.",
      badge: "PRO Roadmaps",
    },
    {
      title: "Student Management",
      icon: GraduationCap,
      route: "/admin/students",
      description: "View students, memberships, saved careers and progress.",
      badge: `${users.length} Students`,
    },
    {
      title: "Eligibility Management",
      icon: Trophy,
      route: "/admin/eligibility",
      description: "Approve students for Achievers Club and referral access.",
      badge: `${achieversUsers.length} Eligible`,
    },
    {
      title: "Promo Management",
      icon: TicketPercent,
      route: "/admin/promos",
      description: "Create promo codes, set price and activate or deactivate offers.",
      badge: `${activePromos} Active`,
    },
    {
      title: "Form Management",
      icon: ClipboardList,
      route: "/admin/forms",
      description: "Manage Google Form links for Launch Batch submissions.",
      badge: `${forms.length} Forms`,
    },
    {
      title: "Community Management",
      icon: Users,
      route: "/admin/community",
      description: "Manage Launch Batch and Achievers Club group links.",
      badge: `${communityLinks.length} Links`,
    },
    {
      title: "Referral Management",
      icon: Target,
      route: "/admin/referrals",
      description: "Track referral codes, top referrers and reset counts.",
      badge: `${totalSuccessfulReferrals} Referrals`,
    },
    {
      title: "Analytics Dashboard",
      icon: BarChart3,
      route: "/admin/analytics",
      description: "View real platform analytics and business insights.",
      badge: "Charts",
    },
    {
      title: "Launch Batch Page",
      icon: Rocket,
      route: "/launch-batch",
      description: "Review the student-facing Launch Batch subscription page.",
      badge: "₹49 / ₹29",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Admin Dashboard...
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
              <LayoutDashboard size={16} />
              CareerZoid Admin Center
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Admin Dashboard
            </h1>

            <p className="text-gray-400 text-xl mt-4 max-w-3xl">
              Manage students, careers, promos, referrals, forms, community and analytics from one professional admin panel.
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl min-w-[260px]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-400" size={30} />
              <div>
                <p className="text-gray-400 text-sm">Platform Status</p>
                <h3 className="text-2xl font-black text-green-300">Active</h3>
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/promos")}
              className="mt-5 w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl py-3 font-bold"
            >
              Manage Promos
            </button>
          </div>
        </div>

        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Students" value={users.length} />
          <StatCard title="PRO Students" value={proUsers.length} />
          <StatCard title="Active Promos" value={activePromos} />
          <StatCard title="Referrals" value={totalSuccessfulReferrals} />
        </section>

        <section className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">Business Graphs</h2>

            <div className="space-y-6">
              <GraphBar label="Free Users" value={freeUsers} total={users.length} />
              <GraphBar label="PRO Conversion" value={proUsers.length} total={users.length} suffix={`${conversionRate}%`} />
              <GraphBar label="Achievers Eligibility" value={achieversUsers.length} total={Math.max(proUsers.length, 1)} suffix={`${achieversRate}%`} />
              <GraphBar label="Active Promo Codes" value={activePromos} total={Math.max(promos.length, 1)} />
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">Platform Mix</h2>

            <div className="space-y-5">
              <CircleMetric label="Users" value={users.length} icon={<Users size={22} />} />
              <CircleMetric label="Careers" value={careers.length} icon={<BookOpen size={22} />} />
              <CircleMetric label="Forms" value={forms.length} icon={<ClipboardList size={22} />} />
              <CircleMetric label="Promos" value={promos.length} icon={<Percent size={22} />} />
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-black">Admin Modules</h2>
                <p className="text-gray-400 mt-2">Promo Management card is now added here.</p>
              </div>

              <Settings className="text-purple-300" size={34} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <button
                    key={module.title}
                    onClick={() => navigate(module.route)}
                    className="text-left bg-slate-950/50 border border-white/10 rounded-3xl p-5 hover:border-purple-500 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <Icon size={24} className="text-purple-300" />
                      </div>

                      <span className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-300">
                        {module.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-black mt-5">{module.title}</h3>

                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                      {module.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">Top Referrers</h2>

            {topReferrers.length === 0 ? (
              <p className="text-gray-400">No users found yet.</p>
            ) : (
              <div className="space-y-3">
                {topReferrers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-2xl p-4"
                  >
                    <div>
                      <p className="font-bold">
                        #{index + 1} {student.name || student.fullName || "Student"}
                      </p>
                      <p className="text-xs text-gray-500">{student.email || "No email"}</p>
                    </div>

                    <span className="text-green-300 font-black">
                      {Number(student.successfulReferrals || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl hover:-translate-y-1 hover:border-purple-500/50 transition-all duration-300">
      <p className="text-gray-400">{title}</p>
      <h3 className="text-5xl font-black mt-4 text-purple-300">{value}</h3>
    </div>
  );
}

function GraphBar({ label, value, total, suffix }: any) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));

  return (
    <div>
      <div className="flex justify-between mb-2">
        <p className="font-bold">{label}</p>
        <p className="text-purple-300 font-black">{suffix || `${value}`}</p>
      </div>

      <div className="h-4 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CircleMetric({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
          {icon}
        </div>
        <p className="font-bold">{label}</p>
      </div>

      <p className="text-2xl font-black text-purple-300">{value}</p>
    </div>
  );
}