import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function SkillWizardV3Page() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    difficulty: "",
    learningTime: "",
    fresherSalary: "",
    twoYearSalary: "",
    fiveYearSalary: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveSkill = async () => {
    try {
      setLoading(true);

      await addDoc(
        collection(db, "skills"),
        {
          ...formData,
          createdAt: serverTimestamp(),
        }
      );

      alert("Skill Saved Successfully");

      setFormData({
        name: "",
        category: "",
        description: "",
        difficulty: "",
        learningTime: "",
        fresherSalary: "",
        twoYearSalary: "",
        fiveYearSalary: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error Saving Skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-3">
          Skill Intelligence Manager
        </h1>

        <p className="text-gray-400 mb-10">
          Save Skills Directly To Firestore
        </p>

        <div className="space-y-5">

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Skill Name"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 h-40"
          />

          <input
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            placeholder="Difficulty"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <input
            name="learningTime"
            value={formData.learningTime}
            onChange={handleChange}
            placeholder="Learning Time"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <input
            name="fresherSalary"
            value={formData.fresherSalary}
            onChange={handleChange}
            placeholder="Fresher Salary"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <input
            name="twoYearSalary"
            value={formData.twoYearSalary}
            onChange={handleChange}
            placeholder="2 Year Salary"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <input
            name="fiveYearSalary"
            value={formData.fiveYearSalary}
            onChange={handleChange}
            placeholder="5 Year Salary"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <button
            onClick={saveSkill}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-semibold"
          >
            {loading ? "Saving..." : "Save Skill"}
          </button>

        </div>

      </div>

    </div>
  );
}