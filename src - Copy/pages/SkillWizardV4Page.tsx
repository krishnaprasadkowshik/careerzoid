import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { db } from "../firebase/firestore";
import { storage } from "../firebase/storage";

export default function SkillWizardV4Page() {
  const [loading, setLoading] = useState(false);

  const [image, setImage] =
    useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveSkill = async () => {
    try {
      setLoading(true);

      let imageUrl = "";

      if (image) {
        const imageRef = ref(
          storage,
          `skills/${Date.now()}-${image.name}`
        );

        await uploadBytes(
          imageRef,
          image
        );

        imageUrl =
          await getDownloadURL(imageRef);
      }

      await addDoc(
        collection(db, "skills"),
        {
          ...formData,
          imageUrl,
          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Skill Saved Successfully"
      );

      setFormData({
        name: "",
        category: "",
        description: "",
      });

      setImage(null);
    } catch (error) {
      console.error(error);

      alert(
        "Error Saving Skill"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-3">
          Skill Intelligence V4
        </h1>

        <p className="text-gray-400 mb-10">
          Save Skills With Images
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
            className="w-full h-40 p-4 rounded-xl bg-slate-900 border border-slate-700"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(
                e.target.files?.[0] || null
              )
            }
          />

          <button
            onClick={saveSkill}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-semibold"
          >
            {loading
              ? "Saving..."
              : "Save Skill"}
          </button>

        </div>

      </div>

    </div>
  );
}