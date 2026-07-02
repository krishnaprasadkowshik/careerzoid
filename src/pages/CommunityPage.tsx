import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  Crown,
  ExternalLink,
  Lock,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

export default function CommunityPage() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
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

      const communitySnap = await getDocs(collection(db, "community"));

      const communityData = communitySnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setCommunities(communityData);
    } catch (error) {
      console.error("Community page error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isProUser = () => {
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

  const launchBatchGroups = communities.filter(
    (group) => group.type === "Launch Batch"
  );

  const achieversGroups = communities.filter(
    (group) => group.type === "Achievers Club"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Community...
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

        <section className="grid lg:grid-cols-2 gap-10 items-center bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 lg:p-10 backdrop-blur-2xl mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-6">
              <Users size={16} />
              CareerZoid Community
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Community Access
            </h1>

            <p className="text-gray-400 text-xl mt-6 max-w-3xl">
              Join your allowed CareerZoid communities. Launch Batch groups are
              for PRO students. Achievers Club groups are only for eligible
              students.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-white/10 rounded-[2rem] p-8">
            <h2 className="text-3xl font-black mb-5">Your Access</h2>

            <div className="space-y-4">
              <AccessRow
                title="Launch Batch Community"
                allowed={isProUser()}
                allowedText="Unlocked"
                lockedText="PRO required"
              />

              <AccessRow
                title="Achievers Club Community"
                allowed={isAchieversEligible()}
                allowedText="Unlocked"
                lockedText="Eligibility required"
              />
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-8">
          <CommunityBlock
            title="Launch Batch Community"
            description="Available for PRO / Launch Batch students."
            icon={<Rocket size={34} />}
            groups={launchBatchGroups}
            allowed={isProUser()}
            lockedTitle="PRO Subscription Required"
            lockedDescription="You need to join Launch Batch to access this community."
            buttonText="Join Launch Batch"
            onClick={() => navigate("/launch-batch")}
          />

          <CommunityBlock
            title="Achievers Club Community"
            description="Available only after admin marks you eligible."
            icon={<Crown size={34} />}
            groups={achieversGroups}
            allowed={isAchieversEligible()}
            lockedTitle="Achievers Eligibility Required"
            lockedDescription="Complete Launch Batch requirements. Admin will verify and unlock this community."
            buttonText="Open Launch Batch Dashboard"
            onClick={() => navigate("/launch-batch-dashboard")}
          />
        </section>
      </div>
    </div>
  );
}

function AccessRow({ title, allowed, allowedText, lockedText }: any) {
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        {allowed ? (
          <ShieldCheck className="text-green-300" size={24} />
        ) : (
          <Lock className="text-yellow-300" size={24} />
        )}

        <p className="font-bold">{title}</p>
      </div>

      <span
        className={`text-sm font-black ${
          allowed ? "text-green-300" : "text-yellow-300"
        }`}
      >
        {allowed ? allowedText : lockedText}
      </span>
    </div>
  );
}

function CommunityBlock({
  title,
  description,
  icon,
  groups,
  allowed,
  lockedTitle,
  lockedDescription,
  buttonText,
  onClick,
}: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center mb-6">
        {icon}
      </div>

      <h2 className="text-3xl font-black">{title}</h2>

      <p className="text-gray-400 mt-3 mb-6">{description}</p>

      {!allowed ? (
        <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6">
          <Lock className="text-yellow-300" size={40} />

          <h3 className="text-2xl font-black text-yellow-300 mt-4">
            {lockedTitle}
          </h3>

          <p className="text-gray-400 mt-3">{lockedDescription}</p>

          <button
            onClick={onClick}
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold"
          >
            {buttonText}
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 text-gray-400">
          Admin has not added community links yet.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group: any) => (
            <a
              key={group.id}
              href={group.link}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-950/60 border border-white/10 rounded-3xl p-5 flex items-center justify-between hover:border-purple-500 transition"
            >
              <div className="flex items-center gap-4">
                <MessageCircle className="text-green-300" size={26} />

                <div>
                  <h3 className="font-black">{group.name}</h3>
                  <p className="text-gray-500 text-sm">{group.type}</p>
                </div>
              </div>

              <ExternalLink size={20} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}