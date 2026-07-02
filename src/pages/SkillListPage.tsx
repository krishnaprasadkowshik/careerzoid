import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function SkillListPage() {
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const snapshot = await getDocs(
      collection(db, "skills")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSkills(data);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-5xl font-bold mb-8">
        Skills Database
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {skills.map((skill) => (
          <div
            key={skill.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold">
              {skill.name}
            </h2>

            <p className="text-gray-400 mt-3">
              {skill.category}
            </p>

            <p className="mt-4 text-sm">
              {skill.description}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}