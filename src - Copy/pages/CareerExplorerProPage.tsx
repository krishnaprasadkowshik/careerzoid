import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";

export default function CareerExplorerProPage() {
  const navigate = useNavigate();

  const [careers, setCareers] = useState<any[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<any[]>([]);
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const safeArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  useEffect(() => {
    loadCareers();
    loadSavedCareers();
  }, []);

  useEffect(() => {
    const results = careers.filter((career: any) =>
      career.name?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredCareers(results);
  }, [search, careers]);

  const loadCareers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "careers"));

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setCareers(data);
      setFilteredCareers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedCareers = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "savedCareers")
      );

      const ids = snapshot.docs.map((docSnap) => docSnap.id);
      setSavedCareerIds(ids);
    } catch (error) {
      console.error(error);
    }
  };

  const saveCareer = async (career: any) => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid, "savedCareers", career.id), {
        careerId: career.id,
        careerName: career.name || "",
        description: career.description || "",
        salary: career.salary || "",
        learningTime: career.learningTime || "",
        demand: career.demand || "",
        thumbnail: career.thumbnail || "",
        skills: safeArray(career.skills),
        savedAt: serverTimestamp(),
      });

      setSavedCareerIds((prev) => [...prev, career.id]);
      alert("Career saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving career.");
    }
  };

  const openCareer = (careerName: string) => {
    const slug = careerName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/career/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-2xl">
        Loading Careers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-purple-700/25 blur-[150px] rounded-full" />
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-blue-700/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-cyan-700/10 blur-[140px] rounded-full" />
      </div>

      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-8 flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition"
          >
            ← Back to Dashboard
          </button>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                Explore Your
                <span className="text-purple-500"> Dream Career</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mb-10">
                Discover high-growth careers, salaries, roadmaps,
                certifications and everything required to become job-ready.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="relative bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl shadow-2xl">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500/30 blur-2xl rounded-full" />

                <div className="bg-slate-950/70 border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">
                        CareerZoid AI Map
                      </p>
                      <h3 className="text-2xl font-black">
                        Career Intelligence
                      </h3>
                    </div>

                    <div className="text-5xl">🚀</div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                      🎯 Choose Career Path
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                      🧠 Learn Required Skills
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
                      📄 Build Profile
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                      💼 Unlock Opportunities
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12 mt-12">
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
              <h2 className="text-4xl font-bold">{careers.length}</h2>
              <p className="text-gray-400">Total Careers</p>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
              <h2 className="text-4xl font-bold">{savedCareerIds.length}</h2>
              <p className="text-gray-400">Saved Careers</p>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
              <h2 className="text-4xl font-bold">Skills</h2>
              <p className="text-gray-400">Career Roadmaps</p>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
              <h2 className="text-4xl font-bold">Free</h2>
              <p className="text-gray-400">Career Explorer</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search careers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-lg outline-none focus:border-purple-500 backdrop-blur-2xl"
          />
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-bold">Career Opportunities</h2>

          <p className="text-gray-400">
            {filteredCareers.length} Career Results
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCareers.map((career: any) => {
            const isSaved = savedCareerIds.includes(career.id);
            const careerSkills = safeArray(career.skills);

            return (
              <div
                key={career.id}
                onClick={() => openCareer(career.name)}
                className="group cursor-pointer bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500 transition-all duration-300 hover:-translate-y-2 backdrop-blur-2xl"
              >
                <div className="h-56 bg-slate-900 overflow-hidden">
                  {career.thumbnail ? (
                    <img
                      src={career.thumbnail}
                      alt={career.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🚀
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{career.name}</h3>

                  <p className="text-gray-400 mb-5 line-clamp-3">
                    {career.description || "No description added yet."}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-400">Salary</span>
                      <span>{career.salary || "Not added"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-blue-400">Learning Time</span>
                      <span>{career.learningTime || "Not added"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-purple-400">Demand</span>
                      <span>{career.demand || "Not added"}</span>
                    </div>
                  </div>

                  {careerSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {careerSkills.slice(0, 4).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl py-3 font-semibold">
                      Explore
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSaved) saveCareer(career);
                      }}
                      disabled={isSaved}
                      className={`w-full rounded-2xl py-3 font-semibold border transition ${
                        isSaved
                          ? "bg-green-500/20 border-green-500 text-green-300 cursor-not-allowed"
                          : "bg-white/5 border-white/10 hover:border-purple-500"
                      }`}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCareers.length === 0 && (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center backdrop-blur-2xl">
            <h3 className="text-3xl font-black">No careers found</h3>
            <p className="text-gray-400 mt-3">
              Try searching another career name.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}