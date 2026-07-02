import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

export default function ReferralDashboardProPage() {
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    loadReferralDashboard();
  }, []);

  const isProUser = (data: any) => {
    const plan = String(data?.membership || data?.subscription || data?.plan || "").toLowerCase();

    return (
      plan.includes("pro") ||
      plan.includes("launch") ||
      data?.launchBatchActive === true
    );
  };

  const isAchieversEligible = (data: any) => {
    return data?.achieversEligible === true || data?.eligibleForAchieversClub === true;
  };

  const generateReferralCode = (user: any) => {
    const emailName = user?.email?.split("@")[0] || "USER";
    const shortName = emailName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
    const shortUid = user?.uid?.slice(0, 5)?.toUpperCase();

    return `CZ-${shortName.toUpperCase()}-${shortUid}`;
  };

  const loadReferralDashboard = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let currentUserData: any = {};

      if (userSnap.exists()) {
        currentUserData = userSnap.data();
      }

      const pro = isProUser(currentUserData);
      const eligible = isAchieversEligible(currentUserData);

      let updatedUserData: any = {
        ...currentUserData,
        uid: user.uid,
        email: currentUserData.email || user.email || "",
        name:
          currentUserData.name ||
          currentUserData.fullName ||
          user.displayName ||
          "Student",
        totalReferrals: Number(currentUserData.totalReferrals || 0),
        successfulReferrals: Number(currentUserData.successfulReferrals || 0),
      };

      if (pro && eligible) {
        const referralCode =
          currentUserData.referralCode || generateReferralCode(user);

        const referralLink =
          currentUserData.referralLink ||
          `${window.location.origin}/signup?ref=${referralCode}`;

        updatedUserData = {
          ...updatedUserData,
          referralCode,
          referralLink,
          referralAccess: true,
          referralUpdatedAt: serverTimestamp(),
        };

        await setDoc(userRef, updatedUserData, { merge: true });
      }

      setUserData(updatedUserData);

      const snapshot = await getDocs(collection(db, "users"));

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const sorted = data
        .filter((student: any) => student.achieversEligible === true)
        .sort(
          (a: any, b: any) =>
            Number(b.successfulReferrals || 0) -
            Number(a.successfulReferrals || 0)
        );

      setLeaderboard(sorted);
    } catch (error) {
      console.error("Referral dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (error) {
      alert("Copy failed. Please copy manually.");
    }
  };

  const leaderboardRank = useMemo(() => {
    if (!userData) return "-";

    const index = leaderboard.findIndex((student) => {
      return (
        student.uid === userData.uid ||
        student.email === userData.email ||
        student.referralCode === userData.referralCode
      );
    });

    return index >= 0 ? index + 1 : "-";
  }, [leaderboard, userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Referral Dashboard...
      </div>
    );
  }

  const pro = isProUser(userData);
  const eligible = isAchieversEligible(userData);

  if (!pro) {
    return (
      <LockedPage
        title="PRO Subscription Required"
        description="You should take PRO subscription to unlock the referral program."
        buttonText="Take PRO Subscription"
        onClick={() => navigate("/launch-batch")}
      />
    );
  }

  if (!eligible) {
    return (
      <LockedPage
        title="Achievers Eligibility Required"
        description="You must become an eligible PRO student by completing Launch Batch requirements before referral code is generated."
        buttonText="Go To Launch Batch Dashboard"
        onClick={() => navigate("/launch-batch-dashboard")}
      />
    );
  }

  const referralCode = userData?.referralCode || "Generating...";
  const referralLink = userData?.referralLink || "Generating...";
  const totalReferrals = Number(userData?.totalReferrals || 0);
  const successfulReferrals = Number(userData?.successfulReferrals || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-5xl md:text-7xl font-black">
          Referral Dashboard
        </h1>

        <p className="text-xl text-gray-400 mt-5 max-w-3xl">
          Your Achievers Club referral system is active. Share your code only
          with real students. Referrals count only after PRO subscription.
        </p>

        <section className="grid md:grid-cols-4 gap-6 mt-10">
          <StatCard title="Total Referrals" value={totalReferrals} />
          <StatCard title="Successful" value={successfulReferrals} />
          <StatCard title="Rank" value={`#${leaderboardRank}`} />
          <StatCard title="Status" value="Eligible" />
        </section>

        <section className="grid lg:grid-cols-2 gap-8 mt-8">
          <GlassCard title="Your Referral Code">
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-center text-2xl font-black break-all">
              {referralCode}
            </div>

            <button
              onClick={() => copyText(referralCode, "code")}
              className="mt-5 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold"
            >
              {copied === "code" ? "Copied!" : "Copy Referral Code"}
            </button>
          </GlassCard>

          <GlassCard title="Your Referral Link">
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 break-all text-gray-300">
              {referralLink}
            </div>

            <button
              onClick={() => copyText(referralLink, "link")}
              className="mt-5 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold"
            >
              {copied === "link" ? "Copied!" : "Copy Referral Link"}
            </button>
          </GlassCard>
        </section>

        <section className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden mt-8 backdrop-blur-2xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-3xl font-black">Referral Leaderboard</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="text-left p-5">Rank</th>
                  <th className="text-left p-5">Student</th>
                  <th className="text-left p-5">Referral Code</th>
                  <th className="text-left p-5">Successful</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((student: any, index) => (
                  <tr key={student.id} className="border-b border-white/10">
                    <td className="p-5 font-black">#{index + 1}</td>
                    <td className="p-5">
                      {student.name || student.fullName || "Student"}
                    </td>
                    <td className="p-5 text-purple-300">
                      {student.referralCode || "Not generated"}
                    </td>
                    <td className="p-5 text-green-400 font-bold">
                      {student.successfulReferrals || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function LockedPage({ title, description, buttonText, onClick }: any) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center bg-white/[0.04] border border-white/10 rounded-[2rem] p-10">
        <h1 className="text-5xl font-black">{title}</h1>
        <p className="text-gray-400 text-lg mt-5">{description}</p>

        <button
          onClick={onClick}
          className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
      <p className="text-gray-400">{title}</p>
      <h3 className="text-4xl font-black mt-3 text-purple-300">{value}</h3>
    </div>
  );
}

function GlassCard({ title, children }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8">
      <h2 className="text-3xl font-black mb-6">{title}</h2>
      {children}
    </div>
  );
}