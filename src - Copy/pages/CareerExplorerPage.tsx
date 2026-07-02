import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function CareerExplorerPage() {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const [skills, setSkills] =
    useState<any[]>([]);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const snapshot =
      await getDocs(
        collection(db, "skills")
      );

    const data =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    setSkills(data);
  };

  const filteredSkills =
    skills.filter((skill: any) =>
      skill.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const openSkill = (
    skillName: string
  ) => {
    const slug =
      skillName
        .toLowerCase()
        .replace(/\s+/g, "-");

    navigate(
      `/skill/${slug}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-6xl font-bold mb-4">
          Career Explorer
        </h1>

        <p className="text-gray-400 mb-10">
          Search careers, skills and
          learning paths
        </p>

        <input
          type="text"
          placeholder="Search Python, React, Java..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-700 mb-10"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredSkills.map(
            (skill: any) => (
              <div
                key={skill.id}
                onClick={() =>
                  openSkill(
                    skill.name
                  )
                }
                className="bg-slate-900 p-6 rounded-2xl cursor-pointer hover:bg-slate-800 transition"
              >
                <h2 className="text-2xl font-bold mb-3">
                  {skill.name}
                </h2>

                <p className="text-purple-400 mb-3">
                  {skill.category}
                </p>

                <p className="text-gray-300">
                  {skill.description}
                </p>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}