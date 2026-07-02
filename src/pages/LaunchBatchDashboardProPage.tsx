import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  CheckCircle,
  ClipboardList,
  Crown,
  ExternalLink,
  FileText,
  Link,
  Lock,
  Map,
  MessageCircle,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

export default function LaunchBatchDashboardProPage() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
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

      const formsSnap = await getDocs(collection(db, "forms"));
      const communitySnap = await getDocs(collection(db, "community"));

      setForms(
        formsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );

      setCommunities(
        communitySnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    } catch (error) {
      console.error("Launch Batch dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLaunchBatchMember = () => {
    const plan = String(
      userData?.membership || userData?.subscription || userData?.plan || ""
    ).toLowerCase();

    return (
      plan.includes("pro") ||
      plan.includes("launch") ||
      userData?.launchBatchActive === true
    );
  };

  const isAchieversEligible = () => {
    return (
      userData?.achieversEligible === true ||
      userData?.eligibleForAchieversClub === true
    );
  };

  const getFormByType = (type: string) => {
    return forms.find((form) => form.type === type);
  };

  const progressSteps = [
    {
      key: "careerDiscovery",
      title: "Career Discovery",
      description: "Submit your interests, goals and career confusion details.",
      formType: "careerDiscovery",
      icon: <Target size={24} />,
      done:
        userData?.careerDiscoveryCompleted === true ||
        userData?.careerDiscovery === true,
    },
    {
      key: "careerSelection",
      title: "Career Path Selection",
      description: "Choose your target career path based on exploration.",
      formType: "careerDiscovery",
      icon: <Rocket size={24} />,
      done:
        userData?.careerPathSelected === true ||
        userData?.careerSelection === true,
    },
    {
      key: "skillGap",
      title: "Skill Gap Analysis",
      description: "Understand missing skills required for your selected career.",
      formType: "careerDiscovery",
      icon: <ShieldCheck size={24} />,
      done: userData?.skillGapCompleted === true,
    },
    {
      key: "resume",
      title: "Resume Submission",
      description: "Submit your resume through the Google Form link.",
      formType: "resumeSubmission",
      icon: <FileText size={24} />,
      done: userData?.resumeSubmitted === true,
    },
    {
      key: "linkedin",
      title: "LinkedIn Submission",
      description: "Submit your LinkedIn profile link for review.",
      formType: "linkedinSubmission",
      icon: <Link size={24} />,
      done: userData?.linkedinSubmitted === true,
    },
    {
      key: "roadmap",
      title: "Learning Roadmap",
      description: "Submit roadmap details and learning preferences.",
      formType: "learningRoadmap",
      icon: <Map size={24} />,
      done: userData?.roadmapCompleted === true,
    },
    {
      key: "interview",
      title: "Interview Readiness",
      description: "Submit interview readiness assessment details.",
      formType: "interviewReadiness",
      icon: <ClipboardList size={24} />,
      done: userData?.interviewCompleted === true,
    },
  ];

  const completedSteps = progressSteps.filter((step) => step.done).length;
  const pendingSteps = progressSteps.length - completedSteps;

  const progress = Math.round((completedSteps / progressSteps.length) * 100);

  const launchBatchGroups = communities.filter(
    (group) => group.type === "Launch Batch"
  );

  const achieversGroups = communities.filter(
    (group) => group.type === "Achievers Club"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-5 text-gray-400">
            Loading Launch Batch Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isLaunchBatchMember()) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden px-6 py-10">
        <div className="max-w-3xl mx-auto bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-2xl">
          <Lock size={60} className="mx-auto text-yellow-300" />

          <h1 className="text-5xl font-black mt-6">
            Launch Batch Locked
          </h1>

          <p className="text-gray-400 text-lg mt-4">
            This dashboard is available only for CareerZoid Launch Batch / PRO
            members.
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
        <div className="absolute top-20 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[800px] h-[800px] bg-cyan-700/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
        >
          ← Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-2 gap-10 items-center bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 lg:p-10 backdrop-blur-2xl mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-6">
              <Rocket size={16} />
              CareerZoid Launch Batch
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Launch Batch Dashboard
            </h1>

            <p className="text-gray-400 text-xl mt-6 max-w-3xl">
              Track your 30-day career readiness journey, open submission forms,
              join communities and unlock CareerZoid Achievers Club.
            </p>

            <button
              onClick={loadDashboard}
              className="mt-8 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-bold flex items-center gap-3"
            >
              <RefreshCw size={20} />
              Refresh Progress
            </button>
          </div>

          <div className="bg-slate-950/60 border border-white/10 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-3xl font-black">
                Overall Progress
              </h2>

              <span className="text-5xl font-black text-green-300">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-white/10 h-5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <MiniStat title="Completed" value={completedSteps} />
              <MiniStat title="Pending" value={pendingSteps} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Overall Progress" value={`${progress}%`} />
          <StatCard title="Completed Steps" value={completedSteps} />
          <StatCard title="Pending Steps" value={pendingSteps} />
          <StatCard
            title="Achievers Club"
            value={isAchieversEligible() ? "Eligible" : "Not Yet"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-6">
              Launch Batch Steps
            </h2>

            <div className="space-y-4">
              {progressSteps.map((step) => {
                const form = getFormByType(step.formType);

                return (
                  <div
                    key={step.key}
                    className={`border rounded-3xl p-5 ${
                      step.done
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-slate-950/50 border-white/10"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                          {step.icon}
                        </div>

                        <div>
                          <h3 className="text-xl font-black">
                            {step.title}
                          </h3>

                          <p className="text-gray-400 mt-1">
                            {step.description}
                          </p>

                          <p className="text-sm mt-2">
                            {step.done ? (
                              <span className="text-green-300 font-bold">
                                ✅ Completed
                              </span>
                            ) : (
                              <span className="text-yellow-300 font-bold">
                                ⏳ Pending admin verification
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {form?.link ? (
                        <a
                          href={form.link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold flex items-center gap-2 justify-center"
                        >
                          Open Form
                          <ExternalLink size={18} />
                        </a>
                      ) : (
                        <span className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400">
                          Form Not Added
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <GlassCard title="Achievers Club Status">
              {isAchieversEligible() ? (
                <div>
                  <Trophy size={50} className="text-yellow-300" />

                  <h3 className="text-2xl font-black mt-5 text-yellow-300">
                    Eligible
                  </h3>

                  <p className="text-gray-400 mt-3">
                    You can access Achievers Club benefits and referral system.
                  </p>

                  <button
                    onClick={() => navigate("/referrals")}
                    className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl py-4 font-bold"
                  >
                    Open Referral Dashboard
                  </button>
                </div>
              ) : (
                <div>
                  <Crown size={50} className="text-yellow-300" />

                  <h3 className="text-2xl font-black mt-5 text-yellow-300">
                    Not Yet Eligible
                  </h3>

                  <p className="text-gray-400 mt-3">
                    Complete all Launch Batch requirements. Admin will manually
                    verify and unlock Achievers Club.
                  </p>
                </div>
              )}
            </GlassCard>

            <GlassCard title="Community Access">
              <div className="space-y-4">
                <CommunitySection
                  title="Launch Batch Group"
                  groups={launchBatchGroups}
                  allowed={true}
                />

                <CommunitySection
                  title="Achievers Club Group"
                  groups={achieversGroups}
                  allowed={isAchieversEligible()}
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
      <p className="text-gray-400">{title}</p>
      <h3 className="text-4xl font-black mt-3 text-purple-300">{value}</h3>
    </div>
  );
}

function MiniStat({ title, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
    </div>
  );
}

function GlassCard({ title, children }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 backdrop-blur-2xl">
      <h2 className="text-3xl font-black mb-6">{title}</h2>
      {children}
    </div>
  );
}

function CommunitySection({ title, groups, allowed }: any) {
  if (!allowed) {
    return (
      <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Lock className="text-yellow-300" size={22} />
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-gray-500 text-sm">
              Complete requirements to unlock.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-5">
        <p className="font-bold">{title}</p>
        <p className="text-gray-500 text-sm mt-1">
          Admin has not added a group yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group: any) => (
        <a
          key={group.id}
          href={group.link}
          target="_blank"
          rel="noreferrer"
          className="bg-slate-950/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-purple-500 transition"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="text-green-300" size={22} />
            <div>
              <p className="font-bold">{group.name}</p>
              <p className="text-gray-500 text-sm">{title}</p>
            </div>
          </div>

          <ExternalLink size={18} />
        </a>
      ))}
    </div>
  );
}