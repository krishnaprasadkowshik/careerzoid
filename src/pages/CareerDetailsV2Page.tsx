import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function CareerDetailsV2Page() {
  const { careerName } = useParams();

  const [career, setCareer] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadCareer();
  }, [careerName]);

  const loadCareer = async () => {
    try {
      const snapshot =
        await getDocs(
          collection(db, "careers")
        );

      const careers =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      const foundCareer =
        careers.find(
          (item: any) =>
            item.name
              ?.toLowerCase()
              .replace(/\s+/g, "-") ===
            careerName?.toLowerCase()
        );

      setCareer(foundCareer);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Career...
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Career Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        {career.thumbnail && (
          <img
            src={career.thumbnail}
            alt={career.name}
            className="w-full h-[350px] object-cover rounded-3xl mb-8"
          />
        )}

        <h1 className="text-6xl font-bold mb-4">
          {career.name}
        </h1>

        <p className="text-gray-300 text-lg mb-10">
          {career.description}
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              Expected Salary
            </h2>

            <p>
              {career.salary || "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              Time Required To Learn
            </h2>

            <p>
              {career.learningTime ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              Required Skills
            </h2>

            <p>
              {career.skills ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              Learning Roadmap
            </h2>

            <p>
              {career.roadmap ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              YouTube Playlists
            </h2>

            <p>
              {career.youtubeLinks ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              Free Certifications
            </h2>

            <p>
              {career.freeCertifications ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              Paid Certifications
            </h2>

            <p>
              {career.paidCertifications ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              Top Hiring Companies
            </h2>

            <p>
              {career.companies ||
                "Not Added"}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl md:col-span-2">
            <h2 className="text-2xl font-bold mb-3">
              Career Demand
            </h2>

            <p>
              {career.demand ||
                "Not Added"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}