import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function EligibilityManagementPage() {
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

  const makeEligible = async (
    studentId: string
  ) => {
    await updateDoc(
      doc(db, "users", studentId),
      {
        achieversClubEligible: true,
      }
    );

    loadStudents();
  };

  const removeEligible = async (
    studentId: string
  ) => {
    await updateDoc(
      doc(db, "users", studentId),
      {
        achieversClubEligible: false,
      }
    );

    loadStudents();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-4">
          Eligibility Management
        </h1>

        <p className="text-gray-400 mb-10">
          Manage Achievers Club Eligibility
        </p>

        <div className="grid gap-5">

          {students.map(
            (student: any) => (
              <div
                key={student.id}
                className="bg-slate-900 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center">

                  <div>

                    <h2 className="text-xl font-bold">
                      {student.name ||
                        "Student"}
                    </h2>

                    <p className="text-gray-400">
                      {student.email}
                    </p>

                    <div className="mt-3">

                      {student.achieversClubEligible ? (
                        <span className="bg-green-600 px-3 py-1 rounded-full">
                          Eligible
                        </span>
                      ) : (
                        <span className="bg-yellow-600 px-3 py-1 rounded-full">
                          Not Eligible
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        makeEligible(
                          student.id
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl"
                    >
                      Make Eligible
                    </button>

                    <button
                      onClick={() =>
                        removeEligible(
                          student.id
                        )
                      }
                      className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl"
                    >
                      Remove
                    </button>

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