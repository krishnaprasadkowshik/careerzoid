import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function SkillsManagerPage() {
  const [skillName, setSkillName] = useState("");
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState<any[]>([]);

  async function loadSkills() {
    const snapshot = await getDocs(
      collection(db, "skills")
    );

    const data = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    setSkills(data);
  }

  async function addSkill() {
    if (!skillName) return;

    await addDoc(
      collection(db, "skills"),
      {
        name: skillName,
        createdAt: Date.now(),
      }
    );

    setSkillName("");

    loadSkills();
  }

  async function deleteSkill(id: string) {
    await deleteDoc(
      doc(db, "skills", id)
    );

    loadSkills();
  }

  useEffect(() => {
    loadSkills();
  }, []);

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-4xl font-bold">
        Skills Manager
      </h1>

      <p className="text-gray-400 mt-2">
        Total Skills: {skills.length}
      </p>

      <div className="flex gap-4 mt-8">

        <input
          value={skillName}
          onChange={(e) =>
            setSkillName(e.target.value)
          }
          placeholder="Enter Skill"
          className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 flex-1"
        />

        <button
          onClick={addSkill}
          className="bg-purple-600 px-6 rounded-xl"
        >
          Add Skill
        </button>

      </div>

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search Skills..."
        className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 w-full mt-6"
      />

      <div className="grid md:grid-cols-3 gap-4 mt-8">

        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className="flex justify-between items-center">

              <span>
                {skill.name}
              </span>

              <button
                onClick={() =>
                  deleteSkill(skill.id)
                }
                className="bg-red-600 px-3 py-1 rounded-lg"
              >
                Delete
              </button>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}