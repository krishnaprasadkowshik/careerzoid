import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

type PromoCode = {
  id: string;
  code?: string;
  price?: number;
  active?: boolean;
};

export default function LaunchBatchProPage() {
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const [referralCode, setReferralCode] = useState("");
  const [referralMessage, setReferralMessage] = useState("");
  const [referralError, setReferralError] = useState("");

  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const basePrice = 49;
  const finalPrice =
    promoApplied && appliedPromo?.price ? Number(appliedPromo.price) : basePrice;

  const isProUser = (userData: any) => {
    const plan = String(
      userData?.membership || userData?.subscription || userData?.plan || ""
    ).toLowerCase();

    return (
      plan.includes("pro") ||
      plan.includes("launch") ||
      userData?.launchBatchActive === true
    );
  };

  const applyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();

    setPromoApplied(false);
    setAppliedPromo(null);
    setPromoError("");
    setPromoSuccess("");

    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "promoCodes"));

      const promos: PromoCode[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<PromoCode, "id">),
      }));

      const matchedPromo = promos.find(
        (promo) => String(promo.code || "").toUpperCase() === code
      );

      if (!matchedPromo) {
        setPromoError("Invalid promo code. Please check and try again.");
        return;
      }

      if (matchedPromo.active !== true) {
        setPromoError("This promo code is currently inactive.");
        return;
      }

      if (!matchedPromo.price) {
        setPromoError("Promo price is missing in admin panel.");
        return;
      }

      setAppliedPromo(matchedPromo);
      setPromoApplied(true);
      setPromoSuccess(`Promo applied successfully! Price changed to ₹${matchedPromo.price}.`);
    } catch (error) {
      console.error("Promo validation error:", error);
      setPromoError("Unable to validate promo code. Try again.");
    }
  };

  const findReferralOwner = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return null;

    const usersSnapshot = await getDocs(collection(db, "users"));

    const matchedUser = usersSnapshot.docs.find((userDoc) => {
      const userData: any = userDoc.data();
      return String(userData.referralCode || "").toUpperCase() === cleanCode;
    });

    if (!matchedUser) return null;

    return {
      uid: matchedUser.id,
      ...matchedUser.data(),
    };
  };

  const validateReferralCode = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return false;
    }

    const code = referralCode.trim().toUpperCase();

    setReferralError("");
    setReferralMessage("");

    if (!code) {
      setReferralMessage("No referral code added. You can continue without it.");
      return true;
    }

    const referrer: any = await findReferralOwner(code);

    if (!referrer) {
      setReferralError("Invalid referral code. No user found with this code.");
      return false;
    }

    if (referrer.uid === user.uid || referrer.email === user.email) {
      setReferralError("You cannot use your own referral code.");
      return false;
    }

    if (!isProUser(referrer)) {
      setReferralError("Referral owner must be a PRO member.");
      return false;
    }

    if (referrer.achieversEligible !== true) {
      setReferralError("Referral owner must be Achievers eligible.");
      return false;
    }

    setReferralMessage("Referral verified. It will count only after PRO activation.");
    return true;
  };

  const confirmProSubscription = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    setProcessing(true);
    setSuccessMessage("");
    setReferralError("");

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));

      const currentUserDoc = usersSnapshot.docs.find((userDoc) => {
        const userData: any = userDoc.data();
        return userDoc.id === user.uid || userData.email === user.email;
      });

      const currentUserData: any = currentUserDoc?.data() || {};

      if (isProUser(currentUserData)) {
        setSuccessMessage("You already have PRO access.");
        setProcessing(false);
        return;
      }

      let referrer: any = null;
      const cleanReferralCode = referralCode.trim().toUpperCase();

      if (cleanReferralCode) {
        referrer = await findReferralOwner(cleanReferralCode);

        if (!referrer) {
          setReferralError("Invalid referral code.");
          setProcessing(false);
          return;
        }

        if (referrer.uid === user.uid || referrer.email === user.email) {
          setReferralError("You cannot use your own referral code.");
          setProcessing(false);
          return;
        }

        if (!isProUser(referrer) || referrer.achieversEligible !== true) {
          setReferralError("Referral code is not eligible.");
          setProcessing(false);
          return;
        }

        if (currentUserData.usedReferralCode) {
          setReferralError("You have already used a referral code before.");
          setProcessing(false);
          return;
        }
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: currentUserData.email || user.email || "",
          name:
            currentUserData.name ||
            currentUserData.fullName ||
            user.displayName ||
            "Student",

          membership: "PRO",
          plan: "PRO",
          subscription: "PRO",
          launchBatchActive: true,
          proSubscribedAt: serverTimestamp(),

          paymentStatus: "paid",
          subscriptionPrice: finalPrice,
          originalPrice: basePrice,
          promoCodeUsed: promoApplied ? promoCode.trim().toUpperCase() : "",
          promoId: appliedPromo?.id || "",
          paymentMode: "manual-test",

          usedReferralCode: cleanReferralCode || "",
          referredByUid: referrer?.uid || "",
          referredByEmail: referrer?.email || "",
        },
        { merge: true }
      );

      if (referrer && cleanReferralCode) {
        const newTotalReferrals = Number(referrer.totalReferrals || 0) + 1;
        const newSuccessfulReferrals =
          Number(referrer.successfulReferrals || 0) + 1;

        await setDoc(
          doc(db, "users", referrer.uid),
          {
            totalReferrals: newTotalReferrals,
            successfulReferrals: newSuccessfulReferrals,
            lastReferralAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setSuccessMessage("PRO activated successfully.");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Something went wrong while activating PRO.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-purple-700/25 blur-[150px] rounded-full" />
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-blue-700/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-cyan-700/10 blur-[140px] rounded-full" />
      </div>

      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-10 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
        >
          ← Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-5 py-2 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 mb-6">
              CareerZoid Premium Program
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              Launch Batch
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mb-10">
              A structured 30-day career readiness program designed to help
              students gain clarity, build a professional profile, identify
              skill gaps and prepare for opportunities.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <MiniCard title="30 Days" description="Career readiness plan" />
              <MiniCard title="PRO Tools" description="Resume, ATS, LinkedIn" />
              <MiniCard title="Progress" description="Track every step" />
              <MiniCard title="Admin Promo" description="Promo controlled by admin" />
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 max-w-md w-full mx-auto backdrop-blur-2xl shadow-2xl">
            <div className="text-center">
              <div className="inline-flex px-4 py-2 rounded-full bg-yellow-400 text-black text-sm font-black mb-5">
                Most Popular
              </div>

              <h2 className="text-6xl font-black text-green-400">₹{finalPrice}</h2>

              <p className="text-gray-400 mt-2">Per Month</p>

              {promoApplied && (
                <p className="mt-3 text-green-300 font-semibold">{promoSuccess}</p>
              )}

              <div className="mt-6 bg-slate-950/60 border border-white/10 rounded-2xl p-4">
                <label className="block text-left text-sm text-gray-400 mb-2">
                  Promo Code
                </label>

                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError("");
                      setPromoSuccess("");
                    }}
                    placeholder="Enter promo"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 uppercase"
                  />

                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold"
                  >
                    Apply
                  </button>
                </div>

                {promoError && (
                  <p className="text-red-400 text-sm text-left mt-3">
                    {promoError}
                  </p>
                )}
              </div>

              <div className="mt-5 bg-slate-950/60 border border-white/10 rounded-2xl p-4">
                <label className="block text-left text-sm text-gray-400 mb-2">
                  Referral Code
                </label>

                <input
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase());
                    setReferralError("");
                    setReferralMessage("");
                  }}
                  placeholder="Enter referral code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 uppercase"
                />

                <button
                  onClick={validateReferralCode}
                  className="mt-3 w-full bg-white/5 border border-white/10 py-3 rounded-xl font-bold hover:bg-white/10 transition"
                >
                  Verify Referral
                </button>

                {referralMessage && (
                  <p className="text-green-400 text-sm text-left mt-3">
                    {referralMessage}
                  </p>
                )}

                {referralError && (
                  <p className="text-red-400 text-sm text-left mt-3">
                    {referralError}
                  </p>
                )}
              </div>

              <button
                onClick={confirmProSubscription}
                disabled={processing}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition disabled:opacity-60"
              >
                {processing
                  ? "Processing..."
                  : `Confirm PRO Subscription - ₹${finalPrice}`}
              </button>

              {successMessage && (
                <p className="text-green-300 font-semibold mt-4">
                  {successMessage}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-4">
                Razorpay will be connected later. For now this is test activation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniCard({ title, description }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 backdrop-blur-2xl">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="text-gray-400 mt-1">{description}</p>
    </div>
  );
}