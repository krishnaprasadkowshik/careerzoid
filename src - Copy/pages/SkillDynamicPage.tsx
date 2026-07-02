import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function SkillDynamicPage() {
  const { skillName } = useParams();

  const [skill, setSkill] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadSkill();
  }, [skillName]);

  const loadSkill = async () => {
    try {
      const snapshot =
        await getDocs(
          collection(db, "skills")
        );

      const skills =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      const foundSkill =
        skills.find(
          (item: any) =>
            item.name
              ?.toLowerCase()
              .replace(/\s+/g, "-") ===
            skillName?.toLowerCase()
        );

      setSkill(foundSkill);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-2xl">
        Loading Skill...
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-2xl">
        Skill Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-6xl font-bold mb-4">
          {skill.name}
        </h1>

        <p className="text-purple-400 text-xl mb-10">
          {skill.category}
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              Description
            </h2>

            <p>
              {skill.description}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              Learning Time
            </h2>

            <p>
              {skill.learningTime ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              Fresher Salary
            </h2>

            <p>
              {skill.fresherSalary ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              2 Year Salary
            </h2>

            <p>
              {skill.twoYearSalary ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              5 Year Salary
            </h2>

            <p>
              {skill.fiveYearSalary ||
                "Not Added"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}