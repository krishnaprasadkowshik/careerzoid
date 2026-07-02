import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  BookOpen,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Image,
  Layers,
  Rocket,
  Save,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";

import { db } from "../firebase/firestore";

export default function RoadmapTemplateAdminPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [careerName, setCareerName] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [careerImage, setCareerImage] = useState("");

  const [editingRoadmap, setEditingRoadmap] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const snapshot = await getDocs(collection(db, "roadmapTemplates"));

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setRoadmaps(data);
    } catch (error) {
      console.error("Roadmap template error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatedDayType = (day: number) => {
    if (day % 30 === 0) return "final-project";
    if (day % 15 === 0) return "project";
    if (day % 7 === 0) return "checkpoint";
    if (day % 10 === 0) return "interview";
    return "lesson";
  };

  const createRoadmap = async () => {
    if (!title.trim() || !careerName.trim() || !durationDays) {
      alert("Enter roadmap title, career name and duration.");
      return;
    }

    const totalDays = Number(durationDays);

    const generatedDays = Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      const type = generatedDayType(day);

      return {
        day,
        title: `Day ${day}`,
        description: "",
        task: "",
        assignment: "",
        resource: "",
        type,
        xp: type === "lesson" ? 50 : 100,
      };
    });

    await addDoc(collection(db, "roadmapTemplates"), {
      title: title.trim(),
      careerName: careerName.trim(),
      durationDays: totalDays,
      careerImage: careerImage.trim(),
      days: generatedDays,
      active: true,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setCareerName("");
    setDurationDays("30");
    setCareerImage("");

    loadRoadmaps();
  };

  const editRoadmap = (roadmap: any) => {
    setEditingRoadmap(roadmap);
    setDays(roadmap.days || []);
    setSelectedDayIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateDay = (index: number, field: string, value: string) => {
    const updated = [...days];

    updated[index] = {
      ...updated[index],
      [field]: field === "xp" ? Number(value) : value,
    };

    setDays(updated);
  };

  const saveRoadmapDays = async () => {
    if (!editingRoadmap) return;

    await setDoc(
      doc(db, "roadmapTemplates", editingRoadmap.id),
      {
        title: editingRoadmap.title,
        careerName: editingRoadmap.careerName,
        durationDays: editingRoadmap.durationDays,
        careerImage: editingRoadmap.careerImage || "",
        days,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    alert("Roadmap saved successfully.");

    setEditingRoadmap(null);
    setDays([]);
    setSelectedDayIndex(0);

    loadRoadmaps();
  };

  const updateEditingMeta = (field: string, value: string) => {
    setEditingRoadmap({
      ...editingRoadmap,
      [field]: field === "durationDays" ? Number(value) : value,
    });
  };

  const deleteRoadmap = async (id: string) => {
    const confirmDelete = confirm("Delete this roadmap permanently?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "roadmapTemplates", id));
    loadRoadmaps();
  };

  const selectedDay = days[selectedDayIndex];

  const stats = useMemo(() => {
    return {
      total: roadmaps.length,
      active: roadmaps.filter((roadmap) => roadmap.active !== false).length,
      days: roadmaps.reduce(
        (total, roadmap) => total + Number(roadmap.durationDays || 0),
        0
      ),
      projects: roadmaps.reduce((total, roadmap) => {
        const roadmapDays = Array.isArray(roadmap.days) ? roadmap.days : [];

        return (
          total +
          roadmapDays.filter(
            (day: any) =>
              day.type === "project" || day.type === "final-project"
          ).length
        );
      }, 0),
    };
  }, [roadmaps]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Roadmap Templates...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/25 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />
        <div className="absolute top-1/3 left-1/2 w-[700px] h-[700px] bg-cyan-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <section className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
              <Sparkles size={16} />
              CareerZoid Roadmap Builder
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Roadmap Builder Admin
            </h1>

            <p className="text-gray-400 text-lg mt-5 max-w-3xl">
              Create Duolingo-style animated day-wise roadmaps for students.
              Add lessons, projects, checkpoints, resources and assignments.
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-7 backdrop-blur-2xl">
            <h2 className="text-2xl font-black mb-5">
              Builder Stats
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <StatBox title="Roadmaps" value={stats.total} />
              <StatBox title="Active" value={stats.active} />
              <StatBox title="Total Days" value={stats.days} />
              <StatBox title="Projects" value={stats.projects} />
            </div>
          </div>
        </section>

        <section className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 mb-10 backdrop-blur-2xl">
          <h2 className="text-3xl font-black mb-6">
            Create New Roadmap
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InputBox
              icon={<BookOpen size={18} />}
              value={title}
              onChange={setTitle}
              placeholder="Roadmap Title"
            />

            <InputBox
              icon={<Rocket size={18} />}
              value={careerName}
              onChange={setCareerName}
              placeholder="Career Name"
            />

            <div className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3">
              <CalendarDays size={18} className="text-purple-300" />

              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="bg-transparent outline-none w-full"
              >
                <option className="bg-slate-900" value="30">
                  30 Days
                </option>

                <option className="bg-slate-900" value="60">
                  60 Days
                </option>

                <option className="bg-slate-900" value="90">
                  90 Days
                </option>

                <option className="bg-slate-900" value="180">
                  180 Days
                </option>
              </select>
            </div>

            <InputBox
              icon={<Image size={18} />}
              value={careerImage}
              onChange={setCareerImage}
              placeholder="Career Image URL"
            />
          </div>

          <button
            onClick={createRoadmap}
            className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:scale-105 transition"
          >
            Generate Duolingo Roadmap
          </button>
        </section>

        {editingRoadmap && (
          <section className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 lg:p-8 mb-10 backdrop-blur-2xl">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-4xl font-black">
                  Editing Roadmap
                </h2>

                <p className="text-gray-400 mt-2">
                  Select a day from the left and edit content on the right.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingRoadmap(null);
                    setDays([]);
                  }}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  Cancel
                </button>

                <button
                  onClick={saveRoadmapDays}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Roadmap
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <input
                value={editingRoadmap.title || ""}
                onChange={(e) => updateEditingMeta("title", e.target.value)}
                placeholder="Roadmap Title"
                className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4"
              />

              <input
                value={editingRoadmap.careerName || ""}
                onChange={(e) => updateEditingMeta("careerName", e.target.value)}
                placeholder="Career Name"
                className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4"
              />

              <input
                value={editingRoadmap.careerImage || ""}
                onChange={(e) => updateEditingMeta("careerImage", e.target.value)}
                placeholder="Career Image URL"
                className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4"
              />

              <div className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4">
                {days.length} Generated Days
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-slate-950/50 border border-white/10 rounded-3xl p-5 max-h-[720px] overflow-y-auto">
                <h3 className="text-2xl font-black mb-5">
                  Roadmap Days
                </h3>

                <div className="space-y-3">
                  {days.map((day, index) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`w-full text-left rounded-2xl p-4 border transition ${
                        selectedDayIndex === index
                          ? "bg-purple-600 border-purple-300"
                          : "bg-white/5 border-white/10 hover:border-purple-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">
                            Day {day.day}
                          </p>

                          <h4 className="font-black">
                            {day.title || `Day ${day.day}`}
                          </h4>
                        </div>

                        <DayTypeBadge type={day.type} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 bg-slate-950/50 border border-white/10 rounded-3xl p-6">
                {!selectedDay ? (
                  <p className="text-gray-400">
                    Select a day to edit.
                  </p>
                ) : (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-purple-300 font-black">
                          Day {selectedDay.day}
                        </p>

                        <h3 className="text-3xl font-black">
                          {selectedDay.title || `Day ${selectedDay.day}`}
                        </h3>
                      </div>

                      <select
                        value={selectedDay.type || "lesson"}
                        onChange={(e) =>
                          updateDay(selectedDayIndex, "type", e.target.value)
                        }
                        className="bg-slate-900 border border-white/10 rounded-2xl px-5 py-3"
                      >
                        <option value="lesson">Lesson Day</option>
                        <option value="checkpoint">Checkpoint Day</option>
                        <option value="project">Project Day</option>
                        <option value="interview">Interview Day</option>
                        <option value="final-project">Final Project</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Field
                        label="Day Title"
                        value={selectedDay.title || ""}
                        onChange={(value: string) =>
                          updateDay(selectedDayIndex, "title", value)
                        }
                      />

                      <Field
                        label="XP Points"
                        value={String(selectedDay.xp || 50)}
                        onChange={(value: string) =>
                          updateDay(selectedDayIndex, "xp", value)
                        }
                      />

                      <TextArea
                        label="Description"
                        value={selectedDay.description || ""}
                        onChange={(value: string) =>
                          updateDay(selectedDayIndex, "description", value)
                        }
                      />

                      <TextArea
                        label="Task"
                        value={selectedDay.task || ""}
                        onChange={(value: string) =>
                          updateDay(selectedDayIndex, "task", value)
                        }
                      />

                      <TextArea
                        label="Assignment"
                        value={selectedDay.assignment || ""}
                        onChange={(value: string) =>
                          updateDay(selectedDayIndex, "assignment", value)
                        }
                      />

                      <Field
                        label="Resource Link"
                        value={selectedDay.resource || ""}
                        onChange={(value: string) =>
                          updateDay(selectedDayIndex, "resource", value)
                        }
                      />
                    </div>

                    <div className="mt-8 bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                      <h3 className="text-2xl font-black mb-5">
                        Student Preview
                      </h3>

                      <div className="flex items-center gap-5">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center border-4 border-purple-200">
                          {selectedDay.type === "checkpoint" ||
                          selectedDay.type === "project" ||
                          selectedDay.type === "final-project" ? (
                            <Trophy size={36} />
                          ) : (
                            <CheckCircle size={36} />
                          )}
                        </div>

                        <div>
                          <p className="text-purple-300 font-black">
                            Day {selectedDay.day}
                          </p>

                          <h4 className="text-2xl font-black">
                            {selectedDay.title || `Day ${selectedDay.day}`}
                          </h4>

                          <p className="text-gray-400 mt-2">
                            {selectedDay.description ||
                              "Description will appear here."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-3xl font-black mb-6">
            Existing Roadmaps
          </h2>

          {roadmaps.length === 0 ? (
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center text-gray-400">
              No roadmaps created yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl hover:border-purple-500 transition"
                >
                  {roadmap.careerImage ? (
                    <img
                      src={roadmap.careerImage}
                      alt={roadmap.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-purple-600/30 to-blue-600/20 flex items-center justify-center">
                      <Rocket size={60} className="text-purple-200" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black">
                          {roadmap.title}
                        </h2>

                        <p className="text-gray-400 mt-2">
                          {roadmap.careerName}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-black">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <SmallStat icon={<CalendarDays size={16} />} value={roadmap.durationDays} label="Days" />
                      <SmallStat icon={<Layers size={16} />} value={roadmap.days?.length || 0} label="Cards" />
                      <SmallStat icon={<Trophy size={16} />} value={countProjects(roadmap.days)} label="Projects" />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => editRoadmap(roadmap)}
                        className="flex-1 py-3 rounded-xl bg-blue-500/20 text-blue-300 font-bold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteRoadmap(roadmap.id)}
                        className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-300 font-bold flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
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

function countProjects(days: any[] = []) {
  if (!Array.isArray(days)) return 0;

  return days.filter(
    (day) =>
      day.type === "project" ||
      day.type === "final-project" ||
      day.type === "checkpoint"
  ).length;
}

function InputBox({ icon, value, onChange, placeholder }: any) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3">
      <div className="text-purple-300">
        {icon}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent outline-none w-full"
      />
    </div>
  );
}

function Field({ label, value, onChange }: any) {
  return (
    <label>
      <span className="text-gray-400 text-sm">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: any) {
  return (
    <label className="md:col-span-2">
      <span className="text-gray-400 text-sm">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-2 w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
      />
    </label>
  );
}

function DayTypeBadge({ type }: any) {
  const label =
    type === "checkpoint"
      ? "Checkpoint"
      : type === "project"
      ? "Project"
      : type === "interview"
      ? "Interview"
      : type === "final-project"
      ? "Final"
      : "Lesson";

  return (
    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200">
      {label}
    </span>
  );
}

function StatBox({ title, value }: any) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-3xl font-black mt-2 text-purple-300">
        {value}
      </h3>
    </div>
  );
}

function SmallStat({ icon, value, label }: any) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-3">
      <div className="text-purple-300">
        {icon}
      </div>

      <p className="font-black mt-2">
        {value}
      </p>

      <p className="text-xs text-gray-500">
        {label}
      </p>
    </div>
  );
}