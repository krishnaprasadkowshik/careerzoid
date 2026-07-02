import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function AdminReferralManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const resetReferral = async (student: any) => {
    if (!confirm("Reset this student's referral count?")) return;

    await setDoc(
      doc(db, "users", student.id),
      {
        totalReferrals: 0,
        successfulReferrals: 0,
      },
      { merge: true }
    );

    loadUsers();
  };

  const topReferrers = useMemo(() => {
    return [...users].sort(
      (a, b) => Number(b.successfulReferrals || 0) - Number(a.successfulReferrals || 0)
    );
  }, [users]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Referral Management...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-3">Admin Referral Management</h1>
        <p className="text-gray-400 mb-10">
          View top referrers, referral codes, successful referrals and reset counts.
        </p>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="text-left p-5">Student</th>
                <th className="text-left p-5">Email</th>
                <th className="text-left p-5">Referral Code</th>
                <th className="text-left p-5">Successful</th>
                <th className="text-left p-5">Achievers</th>
                <th className="text-left p-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {topReferrers.map((student) => (
                <tr key={student.id} className="border-b border-white/10">
                  <td className="p-5 font-bold">{student.name || student.fullName || "Student"}</td>
                  <td className="p-5">{student.email || "No email"}</td>
                  <td className="p-5 text-purple-300">{student.referralCode || "Not generated"}</td>
                  <td className="p-5 text-green-300 font-black">
                    {student.successfulReferrals || 0}
                  </td>
                  <td className="p-5">
                    {student.achieversEligible ? "Eligible" : "Not Eligible"}
                  </td>
                  <td className="p-5">
                    <button
                      onClick={() => resetReferral(student)}
                      className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300"
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}