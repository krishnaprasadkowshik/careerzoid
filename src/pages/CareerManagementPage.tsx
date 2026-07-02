import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function CareerManagementPage() {
  const [careers, setCareers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      salary: "",
      learningTime: "",
      skills: "",
      roadmap: "",
      youtubeLinks: "",
      freeCertifications: "",
      paidCertifications: "",
      companies: "",
      demand: "",
      thumbnail: "",
    });

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    const snapshot =
      await getDocs(
        collection(db, "careers")
      );

    const data =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    setCareers(data);
  };

  const saveCareer = async () => {
    try {
      setLoading(true);

      await addDoc(
        collection(db, "careers"),
        {
          ...formData,
          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Career Saved Successfully"
      );

      setFormData({
        name: "",
        description: "",
        salary: "",
        learningTime: "",
        skills: "",
        roadmap: "",
        youtubeLinks: "",
        freeCertifications: "",
        paidCertifications: "",
        companies: "",
        demand: "",
        thumbnail: "",
      });

      loadCareers();
    } catch (error) {
      console.error(error);
      alert("Error Saving");
    } finally {
      setLoading(false);
    }
  };

  const deleteCareer = async (
    id: string
  ) => {
    const confirmDelete =
      confirm(
        "Delete this career?"
      );

    if (!confirmDelete) return;

    await deleteDoc(
      doc(db, "careers", id)
    );

    loadCareers();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">
          Career Management
        </h1>

        <p className="text-gray-400 mb-10">
          Manage all careers from one place
        </p>

        <div className="bg-slate-900 p-8 rounded-3xl mb-10">

          <div className="grid md:grid-cols-2 gap-5">

            <input
              placeholder="Career Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Expected Salary"
              value={formData.salary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salary:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Learning Time"
              value={
                formData.learningTime
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  learningTime:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Required Skills"
              value={formData.skills}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skills:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Roadmap"
              value={formData.roadmap}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roadmap:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="YouTube Links"
              value={
                formData.youtubeLinks
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  youtubeLinks:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Free Certifications"
              value={
                formData.freeCertifications
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  freeCertifications:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Paid Certifications"
              value={
                formData.paidCertifications
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paidCertifications:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Top Companies"
              value={
                formData.companies
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  companies:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Career Demand"
              value={
                formData.demand
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  demand:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

            <input
              placeholder="Thumbnail URL"
              value={
                formData.thumbnail
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  thumbnail:
                    e.target.value,
                })
              }
              className="p-4 rounded-xl bg-slate-800"
            />

          </div>

          <textarea
            placeholder="Career Description"
            value={
              formData.description
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                description:
                  e.target.value,
              })
            }
            className="w-full h-40 mt-5 p-4 rounded-xl bg-slate-800"
          />

          <button
            onClick={saveCareer}
            disabled={loading}
            className="mt-5 bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl"
          >
            {loading
              ? "Saving..."
              : "Save Career"}
          </button>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {careers.map(
            (career: any) => (
              <div
                key={career.id}
                className="bg-slate-900 rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold mb-3">
                  {career.name}
                </h2>

                <p className="text-gray-400 mb-3">
                  {career.salary}
                </p>

                <button
                  onClick={() =>
                    deleteCareer(
                      career.id
                    )
                  }
                  className="bg-red-600 px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}