import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function SkillDetailsPage() {
  const [skill, setSkill] = useState<any>(null);

  useEffect(() => {
    loadSkill();
  }, []);

  const loadSkill = async () => {
    const snapshot = await getDocs(
      collection(db, "skills")
    );

    if (snapshot.docs.length > 0) {
      setSkill(snapshot.docs[0].data());
    }
  };

  if (!skill) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Skill...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-6xl font-bold mb-4">
          {skill.name}
        </h1>

        <p className="text-xl text-purple-400 mb-10">
          {skill.category}
        </p>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Description
            </h2>

            <p>
              {skill.description}
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Learning Time
            </h2>

            <p>
              {skill.learningTime || "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Fresher Salary
            </h2>

            <p>
              {skill.fresherSalary || "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              2 Year Salary
            </h2>

            <p>
              {skill.twoYearSalary || "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              5 Year Salary
            </h2>

            <p>
              {skill.fiveYearSalary || "Not Added"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}