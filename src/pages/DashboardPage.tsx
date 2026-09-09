import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/auth";
import logo from "../assets/careerzoid-logo.png";
import { db } from "../firebase/firestore";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

import {
  Menu,
  X,
  Home,
  Compass,
  Briefcase,
  FileText,
  Link,
  Target,
  Map,
  Mic,
  Rocket,
  Users,
  Gift,
  User,
  Crown,
  LogOut,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  Bot,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const [savedCareers, setSavedCareers] = useState<any[]>([]);
  const [skillProgress, setSkillProgress] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // SAFE ARRAY HELPER
  // --------------------------------------------------

  const safeArray = (value: any): any[] => {
    if (Array.isArray(value)) {
      return value;
    }

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

  // --------------------------------------------------
  // LOAD DASHBOARD
  // --------------------------------------------------

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // USER DATA
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      // SAVED CAREERS
      const savedCareersSnap = await getDocs(
        collection(db, "users", user.uid, "savedCareers")
      );

      const careers = savedCareersSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setSavedCareers(careers);

      // SKILL PROGRESS
      const progressSnap = await getDoc(
        doc(db, "users", user.uid, "progress", "skills")
      );

      if (progressSnap.exists()) {
        setSkillProgress(
          progressSnap.data() as Record<string, boolean>
        );
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // TOGGLE SKILL
  // --------------------------------------------------

  const toggleSkillProgress = async (skill: string) => {
    const user = auth.currentUser;

    if (!user) return;

    const updatedProgress = {
      ...skillProgress,
      [skill]: !skillProgress[skill],
    };

    setSkillProgress(updatedProgress);

    try {
      await setDoc(
        doc(db, "users", user.uid, "progress", "skills"),
        updatedProgress
      );
    } catch (error) {
      console.error("Failed to save skill progress:", error);

      // Rollback if Firestore fails
      setSkillProgress(skillProgress);
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --------------------------------------------------
  // ALL SKILLS
  // --------------------------------------------------

  const allSkills = useMemo(() => {
    const skills = savedCareers.flatMap((career) =>
      safeArray(career.skills)
    );

    return Array.from(
      new Set(skills.map((skill) => String(skill).trim()).filter(Boolean))
    );
  }, [savedCareers]);

  const completedSkills = allSkills.filter(
    (skill) => skillProgress[skill]
  );

  const skillProgressPercent =
    allSkills.length === 0
      ? 0
      : Math.round(
          (completedSkills.length / allSkills.length) * 100
        );

  // --------------------------------------------------
  // MEMBERSHIP
  // --------------------------------------------------

  const membership =
    userData?.membership ||
    userData?.subscription ||
    userData?.plan ||
    "FREE";

  const isProUser =
    String(membership).toLowerCase().includes("pro") ||
    String(membership).toLowerCase().includes("launch") ||
    userData?.launchBatchActive === true;

  // --------------------------------------------------
  // ACHIEVERS ELIGIBILITY
  // --------------------------------------------------

  const isAchieversEligible =
    userData?.achieversEligible === true ||
    userData?.eligibleForAchieversClub === true;

  // --------------------------------------------------
  // LAUNCH PROGRESS
  // --------------------------------------------------

  const progressSteps = [
    {
      title: "Career Discovery",
      done:
        userData?.careerDiscoveryCompleted === true ||
        userData?.careerDiscovery === true,
    },
    {
      title: "Career Path Selection",
      done:
        userData?.careerPathSelected === true ||
        userData?.careerSelection === true,
    },
    {
      title: "Skill Gap Analysis",
      done: userData?.skillGapCompleted === true,
    },
    {
      title: "Resume Submission",
      done: userData?.resumeSubmitted === true,
    },
    {
      title: "LinkedIn Submission",
      done: userData?.linkedinSubmitted === true,
    },
    {
      title: "Learning Roadmap",
      done: userData?.roadmapCompleted === true,
    },
    {
      title: "Interview Readiness",
      done: userData?.interviewCompleted === true,
    },
  ];

  const completedSteps = progressSteps.filter(
    (step) => step.done
  ).length;

  const overallProgress =
    progressSteps.length === 0
      ? 0
      : Math.round(
          (completedSteps / progressSteps.length) * 100
        );

  // --------------------------------------------------
  // REFERRALS
  // --------------------------------------------------

  const referralCode =
    userData?.referralCode || "Not generated yet";

  const referralLink =
    userData?.referralLink || "Not generated yet";

  // --------------------------------------------------
  // SIDEBAR MENU
  // --------------------------------------------------

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      active: true,
    },
    {
      label: "Career Assessment",
      icon: Target,
      path: "/assessment",
      pro: true,
    },
    {
      label: "Career Guidance",
      icon: Compass,
      path: "/career-guidance",
      pro: true,
    },
    {
      label: "Career Explorer",
      icon: Briefcase,
      path: "/career-explorer",
    },
    {
      label: "Resume Analyzer",
      icon: FileText,
      path: "/resume-analyzer",
      pro: true,
    },
    {
      label: "ATS Checker",
      icon: FileText,
      path: "/ats-checker",
      pro: true,
    },
    {
      label: "LinkedIn Analyzer",
      icon: Link,
      path: "/linkedin-analyzer",
      pro: true,
    },
    {
      label: "Skill Gap Analysis",
      icon: Target,
      path: "/skill-gap-analysis",
      pro: true,
    },
    {
      label: "Roadmap Generator",
      icon: Map,
      path: "/roadmap-generator",
      pro: true,
    },
    {
      label: "Interview Readiness",
      icon: Mic,
      path: "/interview-readiness",
      pro: true,
    },
    {
      label: "Career AI Coach",
      icon: Brain,
      path: "/career-ai",
      pro: true,
    },
    {
      label: "Launch Batch",
      icon: Rocket,
      path: "/launch-batch-dashboard",
    },
    {
      label: "Community",
      icon: Users,
      path: "/community",
    },
    {
      label: "Referral Program",
      icon: Gift,
      path: "/referrals",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  // --------------------------------------------------
  // SIDEBAR
  // --------------------------------------------------

  const SidebarContent = () => (
    <>
      {/* LOGO HEADER */}

      <div className="flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="w-full">
            <div className="flex flex-col items-center w-full">
              <img
                src={logo}
                alt="CareerZoid"
                className="h-28 w-auto mb-3 object-contain"
              />

              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                CareerZoid
              </h1>

              <p className="text-gray-500 text-xs mt-1 text-center">
                Career Intelligence Platform
              </p>
            </div>
          </div>
        )}

        {/* DESKTOP COLLAPSE */}

        <button
          onClick={() =>
            setSidebarCollapsed(!sidebarCollapsed)
          }
          className="hidden lg:flex p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          title={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <Menu size={20} />
        </button>

        {/* MOBILE CLOSE */}

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10"
        >
          <X size={22} />
        </button>
      </div>

      {/* MENU */}

      <div className="mt-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                }

                setSidebarOpen(false);
              }}
              title={
                sidebarCollapsed ? item.label : undefined
              }
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                item.active
                  ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50"
              } ${
                sidebarCollapsed
                  ? "justify-center px-2"
                  : ""
              }`}
            >
              <Icon size={20} />

              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>

                  {item.pro && (
                    <span className="bg-yellow-400 text-black text-[10px] px-2 py-1 rounded-full font-black">
                      PRO
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* PRO CARD */}

      {!sidebarCollapsed && (
        <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-5">
          <h3 className="text-black font-black text-lg">
            Upgrade To PRO
          </h3>

          <p className="text-black/80 text-sm mt-2">
            Join Launch Batch to unlock analyzers, roadmap
            generator and interview readiness.
          </p>

          <button
            onClick={() => navigate("/launch-batch")}
            className="mt-4 w-full bg-black text-white py-3 rounded-2xl font-bold hover:scale-105 transition"
          >
            Join Launch Batch
          </button>
        </div>
      )}

      {/* LOGOUT */}

      <button
        onClick={logout}
        title={sidebarCollapsed ? "Logout" : undefined}
        className={`mt-8 w-full flex items-center justify-center gap-3 bg-red-600/90 hover:bg-red-600 p-4 rounded-2xl font-bold transition ${
          sidebarCollapsed ? "px-2" : ""
        }`}
      >
        <LogOut size={20} />

        {!sidebarCollapsed && "Logout"}
      </button>
    </>
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />

          <p className="mt-5 text-gray-400">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <div className="h-screen bg-slate-950 text-white flex relative overflow-hidden">
      {/* BACKGROUND */}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-purple-700/25 blur-[150px] rounded-full" />

        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-blue-700/20 blur-[150px] rounded-full" />

        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-cyan-700/10 blur-[150px] rounded-full" />
      </div>

      {/* DESKTOP SIDEBAR */}

      <aside
        className={`relative z-20 hidden lg:block h-screen overflow-y-auto border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl p-5 transition-all duration-500 ease-in-out ${
          sidebarCollapsed ? "w-24" : "w-80"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR */}

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="relative w-80 h-screen overflow-y-auto bg-slate-950 border-r border-white/10 p-5">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* MAIN */}

      <main className="relative z-10 flex-1 h-screen overflow-y-auto scroll-smooth">
        {/* TOP BAR */}

        <div className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-2xl border-b border-white/10 px-5 lg:px-10 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* MOBILE MENU */}

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-2xl"
            >
              <Menu size={22} />
            </button>

            {/* WELCOME */}

            <div>
              <p className="text-gray-400 text-sm">
                Welcome back
              </p>

              <h2 className="text-xl md:text-2xl font-black">
                {userData?.fullName ||
                  userData?.name ||
                  auth.currentUser?.displayName ||
                  "Student"}
              </h2>
            </div>

            {/* MEMBERSHIP */}

            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <Sparkles
                size={18}
                className="text-purple-300"
              />

              <span className="text-sm text-gray-300">
                Membership:{" "}
                <span className="text-white font-bold">
                  {membership}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}

        <div className="p-5 lg:p-10">
          {/* HERO */}

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm">
                  <Sparkles size={16} />

                  AI Career Command Center
                </div>

                <h1 className="text-4xl md:text-6xl font-black mt-6 leading-tight">
                  Build Your Future With
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    AI-Powered Career Intelligence
                  </span>
                </h1>

                <p className="mt-5 text-gray-400 text-lg max-w-2xl">
                  Track careers, skills, Launch Batch progress,
                  Achievers status and referral growth from one
                  premium dashboard.
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    onClick={() =>
                      navigate("/career-explorer")
                    }
                    className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:scale-105 transition"
                  >
                    Explore Careers
                  </button>

                  <button
                    onClick={() => navigate("/career-ai")}
                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition"
                  >
                    Ask Career AI
                  </button>

                  <button
                    onClick={() =>
                      navigate("/launch-batch-dashboard")
                    }
                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition"
                  >
                    Launch Batch Dashboard
                  </button>
                </div>
              </div>

              <AIHeroIllustration />
            </div>
          </section>

          {/* STATS */}

          <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
            <VisualStatCard
              title="Saved Careers"
              value={savedCareers.length}
              icon={<Briefcase />}
            />

            <VisualStatCard
              title="Total Skills"
              value={allSkills.length}
              icon={<Brain />}
            />

            <VisualStatCard
              title="Completed Skills"
              value={completedSkills.length}
              icon={<CheckCircle />}
            />

            <VisualStatCard
              title="Skill Progress"
              value={`${skillProgressPercent}%`}
              icon={<Zap />}
            />
          </section>

          {/* PROGRESS */}

          <section className="grid xl:grid-cols-3 gap-8 mt-8">
            {/* SKILLS */}

            <div className="xl:col-span-2 bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black">
                    Skill Progress Tracker
                  </h2>

                  <p className="text-gray-400 mt-1">
                    Track the skills required for your saved
                    careers.
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate("/career-explorer")
                  }
                  className="text-sm px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500"
                >
                  Add Career
                </button>
              </div>

              {allSkills.length === 0 ? (
                <div className="text-center py-14 bg-slate-950/40 rounded-3xl border border-white/10">
                  <BookOpen
                    size={46}
                    className="mx-auto text-purple-300"
                  />

                  <h3 className="text-2xl font-black mt-4">
                    No skills to track yet
                  </h3>

                  <p className="text-gray-400 mt-2">
                    Save careers that include skills to start
                    tracking your progress.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/career-explorer")
                    }
                    className="mt-6 px-6 py-3 bg-purple-600 rounded-xl font-bold"
                  >
                    Explore Careers
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {allSkills.map((skill) => {
                    const completed =
                      skillProgress[skill];

                    return (
                      <button
                        key={skill}
                        onClick={() =>
                          toggleSkillProgress(skill)
                        }
                        className={`text-left border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
                          completed
                            ? "bg-green-500/10 border-green-500/40"
                            : "bg-slate-950/50 border-white/10 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold">
                              {skill}
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                              {completed
                                ? "Completed"
                                : "Mark as completed"}
                            </p>
                          </div>

                          {completed ? (
                            <CheckCircle className="text-green-400" />
                          ) : (
                            <Clock className="text-yellow-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LAUNCH PROGRESS */}

            <div className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 lg:p-8">
              <MiniIllustration
                title="Launch Progress"
                icon={<Rocket size={42} />}
              />

              <div className="mt-6">
                <div className="flex justify-between mb-3">
                  <p className="text-gray-400">
                    Overall Progress
                  </p>

                  <p className="font-black">
                    {overallProgress}%
                  </p>
                </div>

                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-700"
                    style={{
                      width: `${overallProgress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {progressSteps.map((step) => (
                  <div
                    key={step.title}
                    className="flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-2xl p-4"
                  >
                    <span className="text-sm">
                      {step.title}
                    </span>

                    {step.done ? (
                      <CheckCircle
                        className="text-green-400"
                        size={20}
                      />
                    ) : (
                      <Clock
                        className="text-yellow-400"
                        size={20}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* AI TOOLS */}

          <section className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black">
                  AI Tools Hub
                </h2>

                <p className="text-gray-400 mt-2">
                  Complete career intelligence tools in one
                  premium dashboard.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              <FeatureVisualCard
                icon={<Bot size={36} />}
                title="Resume Analyzer"
                description="Analyze resume quality, missing points and improvement areas."
                locked={!isProUser}
                onClick={() =>
                  navigate("/resume-analyzer")
                }
              />

              <FeatureVisualCard
                icon={<Zap size={36} />}
                title="ATS Checker"
                description="Check formatting, keywords and ATS compatibility."
                locked={!isProUser}
                onClick={() => navigate("/ats-checker")}
              />

              <FeatureVisualCard
                icon={<Link size={36} />}
                title="LinkedIn Analyzer"
                description="Improve headline, about section and recruiter visibility."
                locked={!isProUser}
                onClick={() =>
                  navigate("/linkedin-analyzer")
                }
              />

              <FeatureVisualCard
                icon={<Target size={36} />}
                title="Skill Gap Analysis"
                description="Find missing skills and get a focused learning plan."
                locked={!isProUser}
                onClick={() =>
                  navigate("/skill-gap-analysis")
                }
              />

              <FeatureVisualCard
                icon={<Map size={36} />}
                title="Roadmap Generator"
                description="Duolingo-style daily roadmap with XP, badges and progress."
                locked={!isProUser}
                onClick={() =>
                  navigate("/roadmap-generator")
                }
              />

              <FeatureVisualCard
                icon={<Brain size={36} />}
                title="Career AI Coach"
                description="Ask career questions and get guided suggestions."
                locked={!isProUser}
                onClick={() => navigate("/career-ai")}
              />

              <FeatureVisualCard
                icon={<Mic size={36} />}
                title="Interview Readiness"
                description="Practice interviews, answers and confidence building."
                locked={!isProUser}
                onClick={() =>
                  navigate("/interview-readiness")
                }
              />

              <FeatureVisualCard
                icon={<Briefcase size={36} />}
                title="Career Explorer"
                description="Explore career paths, salary, skills and roadmaps."
                locked={false}
                onClick={() =>
                  navigate("/career-explorer")
                }
              />
            </div>
          </section>

          {/* REFERRALS + OPPORTUNITIES */}

          <section className="grid xl:grid-cols-2 gap-8 mt-8">
            {/* REFERRALS */}

            <GlassCard title="Referral Information">
              {!isProUser ? (
                <ReferralLock
                  title="PRO Required"
                  text="Take a PRO subscription to access the referral program."
                  button="Take PRO Subscription"
                  onClick={() =>
                    navigate("/launch-batch")
                  }
                />
              ) : !isAchieversEligible ? (
                <ReferralLock
                  title="Achievers Eligibility Required"
                  text="Complete Launch Batch requirements. Admin will verify and unlock referrals."
                  button="Open Launch Batch Dashboard"
                  onClick={() =>
                    navigate(
                      "/launch-batch-dashboard"
                    )
                  }
                />
              ) : (
                <div className="space-y-4">
                  <InfoBox
                    label="Referral Code"
                    value={referralCode}
                  />

                  <InfoBox
                    label="Referral Link"
                    value={referralLink}
                  />

                  <button
                    onClick={() =>
                      navigate("/referrals")
                    }
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold hover:scale-[1.01] transition"
                  >
                    Open Referral Dashboard
                  </button>
                </div>
              )}
            </GlassCard>

            {/* OPPORTUNITIES */}

            <GlassCard title="Opportunities">
              {isAchieversEligible ? (
                <div className="space-y-4">
                  <Opportunity text="HR Interaction Sessions" />
                  <Opportunity text="Internship Opportunities" />
                  <Opportunity text="Networking Opportunities" />
                  <Opportunity text="Mock Interviews" />
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-8">
                  <Crown
                    size={42}
                    className="text-yellow-300"
                  />

                  <h3 className="text-2xl font-black mt-4">
                    Achievers Club Locked
                  </h3>

                  <p className="text-gray-400 mt-2">
                    Complete Launch Batch requirements to
                    become eligible.
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        "/launch-batch-dashboard"
                      )
                    }
                    className="mt-5 px-5 py-3 rounded-xl bg-purple-600 font-bold"
                  >
                    View Requirements
                  </button>
                </div>
              )}
            </GlassCard>
          </section>

          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}

// ======================================================
// AI HERO ILLUSTRATION
// ======================================================

function AIHeroIllustration() {
  return (
    <div className="relative bg-slate-950/60 border border-white/10 rounded-[2rem] p-8 overflow-hidden min-h-[390px]">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/30 blur-3xl rounded-full" />

      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/40 to-cyan-500/40 blur-2xl" />

          <div className="absolute inset-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl flex items-center justify-center">
            <Brain
              size={78}
              className="text-purple-200"
            />
          </div>

          <div className="absolute top-6 left-2 bg-white/10 border border-white/10 rounded-2xl p-3">
            <Bot className="text-cyan-300" />
          </div>

          <div className="absolute bottom-8 right-2 bg-white/10 border border-white/10 rounded-2xl p-3">
            <Rocket className="text-purple-300" />
          </div>

          <div className="absolute top-28 -right-6 bg-white/10 border border-white/10 rounded-2xl p-3">
            <Zap className="text-yellow-300" />
          </div>
        </div>

        <h3 className="text-3xl font-black mt-6">
          AI Career Engine
        </h3>

        <p className="text-gray-400 text-center mt-2">
          Skills, progress, roadmap and career intelligence
          in one place.
        </p>
      </div>
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function VisualStatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center mb-5">
          {icon}
        </div>

        <p className="text-gray-400">{title}</p>

        <h3 className="text-4xl font-black mt-3 text-purple-300">
          {value}
        </h3>
      </div>
    </div>
  );
}

// ======================================================
// MINI ILLUSTRATION
// ======================================================

function MiniIllustration({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-950/50 border border-white/10 rounded-3xl p-6 text-center">
      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-white/10 flex items-center justify-center text-purple-200">
        {icon}
      </div>

      <h2 className="text-3xl font-black mt-5">
        {title}
      </h2>
    </div>
  );
}

// ======================================================
// FEATURE CARD
// ======================================================

function FeatureVisualCard({
  icon,
  title,
  description,
  locked,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center">
        {icon}
      </div>

      <h3 className="text-2xl font-black mt-5">
        {title}
      </h3>

      <p className="text-gray-400 mt-3">
        {description}
      </p>

      <div className="mt-6">
        {locked ? (
          <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-bold">
            PRO Locked
          </span>
        ) : (
          <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-sm font-bold">
            Available
          </span>
        )}
      </div>
    </button>
  );
}

// ======================================================
// GLASS CARD
// ======================================================

function GlassCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 lg:p-8">
      <h2 className="text-3xl font-black mb-6">
        {title}
      </h2>

      {children}
    </div>
  );
}

// ======================================================
// INFO BOX
// ======================================================

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4">
      <p className="text-gray-400 text-sm">{label}</p>

      <p className="font-bold mt-1 break-all">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// REFERRAL LOCK
// ======================================================

function ReferralLock({
  title,
  text,
  button,
  onClick,
}: {
  title: string;
  text: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-slate-950/50 border border-white/10 rounded-3xl p-6">
      <h3 className="text-2xl font-black text-yellow-300">
        {title}
      </h3>

      <p className="text-gray-400 mt-3">
        {text}
      </p>

      <button
        onClick={onClick}
        className="mt-5 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold hover:scale-[1.01] transition"
      >
        {button}
      </button>
    </div>
  );
}

// ======================================================
// OPPORTUNITY
// ======================================================

function Opportunity({ text }: { text: string }) {
  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 hover:bg-green-500/15 transition">
      <div className="flex items-center gap-3">
        <CheckCircle
          size={20}
          className="text-green-400"
        />

        <span>{text}</span>
      </div>
    </div>
  );
}