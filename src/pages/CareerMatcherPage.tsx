import { useState } from "react";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

export default function CareerMatcherPage() {
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [goal, setGoal] = useState("");

  const [career, setCareer] = useState<any>(null);

  const generateCareer = async () => {
    try {
      const careersSnapshot = await getDocs(
        collection(db, "careers")
      );

      let selectedCareer: any = null;

      careersSnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          interests.toLowerCase().includes("ai") &&
          data.title === "AI Engineer"
        ) {
          selectedCareer = data;
        }

        if (
          interests.toLowerCase().includes("data") &&
          data.title === "Data Scientist"
        ) {
          selectedCareer = data;
        }

        if (
          interests.toLowerCase().includes("design") &&
          data.title === "UI/UX Designer"
        ) {
          selectedCareer = data;
        }
      });

      if (!selectedCareer) {
        careersSnapshot.forEach((doc) => {
          if (
            doc.data().title ===
            "Software Engineer"
          ) {
            selectedCareer = doc.data();
          }
        });
      }

      setCareer(selectedCareer);

      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in");
        return;
      }

      await addDoc(
        collection(db, "careerMatches"),
        {
          userId: user.uid,
          interests,
          skills,
          education,
          goal,
          careerTitle:
            selectedCareer.title,
          matchScore:
            selectedCareer.matchScore,
          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Career Match Saved Successfully!"
      );
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero */}
      <div className="px-10 pt-12">

        <div className="bg-gradient-to-r from-purple-700 to-blue-600 rounded-3xl p-10">

          <h1 className="text-5xl font-bold">
            Career Matcher
          </h1>

          <p className="mt-4 text-white/80 text-lg">
            Discover careers based on your interests and goals.
          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-8 p-10">

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Career Assessment
          </h2>

          <div className="space-y-4">

            <input
              value={interests}
              onChange={(e) =>
                setInterests(
                  e.target.value
                )
              }
              placeholder="Interests"
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
            />

            <input
              value={skills}
              onChange={(e) =>
                setSkills(
                  e.target.value
                )
              }
              placeholder="Skills"
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
            />

            <input
              value={education}
              onChange={(e) =>
                setEducation(
                  e.target.value
                )
              }
              placeholder="Education"
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
            />

            <input
              value={goal}
              onChange={(e) =>
                setGoal(
                  e.target.value
                )
              }
              placeholder="Career Goal"
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
            />

            <button
              onClick={
                generateCareer
              }
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl"
            >
              Generate Career Match
            </button>

          </div>

        </div>

        {/* Result */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">

          {!career ? (
            <>
              <h2 className="text-2xl font-bold">
                Your Results
              </h2>

              <p className="text-gray-400 mt-4">
                Complete the assessment to get recommendations.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold">
                {career.title}
              </h2>

              <div className="mt-4 bg-green-500/20 text-green-400 inline-block px-4 py-2 rounded-full">
                {career.matchScore}% Match
              </div>

              <p className="mt-6 text-gray-300">
                {career.description}
              </p>

              <div className="mt-6 bg-white/5 p-6 rounded-2xl">

                <h3 className="text-xl font-bold">
                  Salary Range
                </h3>

                <p className="mt-2 text-blue-400 text-2xl">
                  {career.salaryIndia}
                </p>

              </div>

              <div className="mt-6 bg-white/5 p-6 rounded-2xl">

                <h3 className="text-xl font-bold">
                  Skills Required
                </h3>

                <p className="mt-3 text-gray-300">
                  {career.skills}
                </p>

              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}