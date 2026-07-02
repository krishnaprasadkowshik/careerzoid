import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function CareerExplorerV2Page() {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const [careers, setCareers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    try {
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers =
    careers.filter((career: any) =>
      career.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const openCareer = (
    careerName: string
  ) => {
    const slug =
      careerName
        .toLowerCase()
        .replace(/\s+/g, "-");

    navigate(`/career/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Careers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <h1 className="text-6xl font-bold mb-3">
          Career Explorer
        </h1>

        <p className="text-gray-400 mb-10">
          Explore careers and discover
          your future path.
        </p>

        <input
          type="text"
          placeholder="Search careers..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-700 mb-10"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredCareers.map(
            (career: any) => (
              <div
                key={career.id}
                onClick={() =>
                  openCareer(
                    career.name
                  )
                }
                className="bg-slate-900 rounded-2xl p-6 cursor-pointer hover:bg-slate-800 transition"
              >
                {career.thumbnail && (
                  <img
                    src={
                      career.thumbnail
                    }
                    alt={career.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}

                <h2 className="text-2xl font-bold mb-3">
                  {career.name}
                </h2>

                <p className="text-green-400 mb-2">
                  Salary:
                  {" "}
                  {career.salary}
                </p>

                <p className="text-blue-400 mb-2">
                  Learning Time:
                  {" "}
                  {career.learningTime}
                </p>

                <p className="text-purple-400 mb-4">
                  Demand:
                  {" "}
                  {career.demand}
                </p>

                <p className="text-gray-300 line-clamp-3">
                  {
                    career.description
                  }
                </p>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}