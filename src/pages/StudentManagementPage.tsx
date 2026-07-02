import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function StudentManagementPage() {
  const [students, setStudents] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const snapshot =
        await getDocs(
          collection(db, "users")
        );

      const data =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Students...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-4">
          Student Management
        </h1>

        <p className="text-gray-400 mb-10">
          Manage all CareerZoid students
        </p>

        <div className="grid gap-5">

          {students.map(
            (student: any) => (
              <div
                key={student.id}
                className="bg-slate-900 rounded-3xl p-6"
              >
                <div className="flex justify-between items-center">

                  <div>

                    <h2 className="text-2xl font-bold">
                      {student.name ||
                        "Student"}
                    </h2>

                    <p className="text-gray-400">
                      {student.email}
                    </p>

                  </div>

                  <div className="flex gap-3 flex-wrap">

                    <span className="bg-blue-600 px-3 py-1 rounded-full">
                      {student.membershipStatus ||
                        "Free"}
                    </span>

                    {student.achieversClubEligible ? (
                      <span className="bg-green-600 px-3 py-1 rounded-full">
                        Achievers Eligible
                      </span>
                    ) : (
                      <span className="bg-yellow-600 px-3 py-1 rounded-full">
                        Not Eligible
                      </span>
                    )}

                  </div>

                </div>

                <div className="mt-5 grid md:grid-cols-3 gap-4">

                  <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-gray-400">
                      Membership
                    </div>

                    <div className="font-bold">
                      {student.membershipStatus ||
                        "Free"}
                    </div>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-gray-400">
                      Progress
                    </div>

                    <div className="font-bold">
                      {student.progress ||
                        "0"}%
                    </div>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-gray-400">
                      Referrals
                    </div>

                    <div className="font-bold">
                      {student.referralCount ||
                        0}
                    </div>
                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}