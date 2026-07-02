import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function MembershipManagementPage() {
  const [students, setStudents] =
    useState<any[]>([]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const snapshot =
      await getDocs(
        collection(db, "users")
      );

    const data =
      snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

    setStudents(data);
  };

  const updateMembership = async (
    studentId: string,
    status: string
  ) => {
    await updateDoc(
      doc(db, "users", studentId),
      {
        membershipStatus: status,
      }
    );

    loadStudents();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-4">
          Membership Management
        </h1>

        <p className="text-gray-400 mb-10">
          Manage Free, Launch Batch and
          Achievers Club Memberships
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

                  <div>

                    <span className="bg-purple-600 px-4 py-2 rounded-full">
                      {student.membershipStatus ||
                        "free"}
                    </span>

                  </div>

                </div>

                <div className="flex gap-3 mt-6 flex-wrap">

                  <button
                    onClick={() =>
                      updateMembership(
                        student.id,
                        "free"
                      )
                    }
                    className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl"
                  >
                    Free
                  </button>

                  <button
                    onClick={() =>
                      updateMembership(
                        student.id,
                        "launch-batch"
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl"
                  >
                    Launch Batch
                  </button>

                  <button
                    onClick={() =>
                      updateMembership(
                        student.id,
                        "achievers-club"
                      )
                    }
                    className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl"
                  >
                    Achievers Club
                  </button>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}