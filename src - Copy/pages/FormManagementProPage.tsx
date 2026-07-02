import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ClipboardList,
  Edit,
  ExternalLink,
  FileText,
  Link,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { db } from "../firebase/firestore";

export default function FormManagementProPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [formName, setFormName] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formType, setFormType] = useState("careerDiscovery");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const requiredForms = [
    {
      type: "careerDiscovery",
      name: "Career Discovery Form",
      description: "Used for collecting student career goals and interests.",
    },
    {
      type: "resumeSubmission",
      name: "Resume Submission Form",
      description: "Used for collecting student resume submissions externally.",
    },
    {
      type: "linkedinSubmission",
      name: "LinkedIn Submission Form",
      description: "Used for collecting LinkedIn profile links.",
    },
    {
      type: "learningRoadmap",
      name: "Learning Roadmap Form",
      description: "Used for collecting roadmap preferences and learning data.",
    },
    {
      type: "interviewReadiness",
      name: "Interview Readiness Form",
      description: "Used for interview readiness assessment submissions.",
    },
  ];

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const snapshot = await getDocs(collection(db, "forms"));

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setForms(data);
    } catch (error) {
      console.error("Form management error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFormStatus = (type: string) => {
    return forms.some((form) => form.type === type && form.link);
  };

  const saveForm = async () => {
    if (!formName.trim() || !formLink.trim()) {
      alert("Please enter form name and Google Form link.");
      return;
    }

    if (
      !formLink.includes("docs.google.com/forms") &&
      !formLink.includes("forms.gle")
    ) {
      const confirmSave = window.confirm(
        "This does not look like a Google Form link. Save anyway?"
      );

      if (!confirmSave) return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateDoc(doc(db, "forms", editingId), {
          name: formName.trim(),
          link: formLink.trim(),
          type: formType,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "forms"), {
          name: formName.trim(),
          link: formLink.trim(),
          type: formType,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      resetForm();
      await loadForms();
    } catch (error) {
      console.error("Save form error:", error);
      alert("Failed to save form.");
    } finally {
      setSaving(false);
    }
  };

  const quickCreateRequiredForm = (item: any) => {
    setEditingId("");
    setFormType(item.type);
    setFormName(item.name);
    setFormLink("");
  };

  const editForm = (item: any) => {
    setEditingId(item.id);
    setFormName(item.name || "");
    setFormLink(item.link || "");
    setFormType(item.type || "careerDiscovery");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteForm = async (id: string) => {
    const confirmDelete = window.confirm("Delete this form link?");

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "forms", id));
      await loadForms();
    } catch (error) {
      console.error("Delete form error:", error);
      alert("Failed to delete form.");
    }
  };

  const resetForm = () => {
    setEditingId("");
    setFormName("");
    setFormLink("");
    setFormType("careerDiscovery");
  };

  const completedRequiredForms = requiredForms.filter((item) =>
    getFormStatus(item.type)
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-5 text-gray-400">Loading Form Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/25 blur-[160px] rounded-full" />
        <div className="absolute top-20 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[800px] h-[800px] bg-cyan-700/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
            <ClipboardList size={16} />
            Google Forms Control Center
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Form Management
          </h1>

          <p className="text-gray-400 text-xl mt-4 max-w-3xl">
            Manage all external Google Form links used for Launch Batch
            submissions. No file upload is required inside CareerZoid.
          </p>
        </div>

        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Forms" value={forms.length} />
          <StatCard
            title="Required Forms Added"
            value={`${completedRequiredForms}/${requiredForms.length}`}
          />
          <StatCard
            title="Submission System"
            value="Google Forms"
          />
        </section>

        <section className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                {editingId ? <Edit size={24} /> : <Plus size={24} />}
              </div>

              <div>
                <h2 className="text-3xl font-black">
                  {editingId ? "Edit Form Link" : "Add Google Form Link"}
                </h2>
                <p className="text-gray-400 mt-1">
                  Admin controlled links only. Students will open these forms
                  externally.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Form Type
                </label>

                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
                >
                  {requiredForms.map((item) => (
                    <option key={item.type} value={item.type}>
                      {item.name}
                    </option>
                  ))}
                  <option value="custom">Custom Form</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Form Name
                </label>

                <input
                  type="text"
                  placeholder="Example: Resume Submission Form"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Google Form Link
                </label>

                <input
                  type="text"
                  placeholder="https://docs.google.com/forms/..."
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={saveForm}
                disabled={saving}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:scale-105 transition disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Form"
                  : "Add Form"}
              </button>

              <button
                onClick={resetForm}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-bold"
              >
                Reset
              </button>

              <button
                onClick={loadForms}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-bold flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 backdrop-blur-2xl">
            <h2 className="text-2xl font-black mb-5">
              Required Launch Batch Forms
            </h2>

            <div className="space-y-3">
              {requiredForms.map((item) => {
                const completed = getFormStatus(item.type);

                return (
                  <button
                    key={item.type}
                    onClick={() => quickCreateRequiredForm(item)}
                    className={`w-full text-left border rounded-2xl p-4 transition ${
                      completed
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-slate-950/50 border-white/10 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {completed ? "Added" : "Missing"}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-black ${
                          completed
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {completed ? "Live" : "Add"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-black">Active Form Links</h2>
              <p className="text-gray-400 mt-2">
                These links are used by students from the Launch Batch dashboard.
              </p>
            </div>
          </div>

          {forms.length === 0 ? (
            <div className="text-center bg-slate-950/40 border border-white/10 rounded-3xl p-10">
              <FileText size={50} className="mx-auto text-purple-300" />
              <h3 className="text-2xl font-black mt-5">No Forms Added Yet</h3>
              <p className="text-gray-400 mt-2">
                Add the required Google Form links to activate submission
                workflow.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {forms.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-slate-950/50 border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-5">
                    <Link size={24} />
                  </div>

                  <h3 className="text-2xl font-black mb-3">
                    {item.name || "Untitled Form"}
                  </h3>

                  <p className="text-gray-500 text-sm mb-2">
                    Type: {item.type || "custom"}
                  </p>

                  <p className="text-gray-400 break-all mb-6 text-sm">
                    {item.link}
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center hover:bg-white/10 transition"
                    >
                      <ExternalLink size={18} />
                    </a>

                    <button
                      onClick={() => editForm(item)}
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl py-3 flex items-center justify-center hover:bg-blue-500/20 transition"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => deleteForm(item.id)}
                      className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl py-3 flex items-center justify-center hover:bg-red-500/20 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl hover:-translate-y-1 hover:border-purple-500/50 transition-all duration-300">
      <p className="text-gray-400">{title}</p>
      <h3 className="text-4xl font-black mt-3 text-purple-300">{value}</h3>
    </div>
  );
}