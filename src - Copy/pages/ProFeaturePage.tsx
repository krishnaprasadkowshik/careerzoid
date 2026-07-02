import { useParams } from "react-router-dom";

export default function ProFeaturePage() {
  const { featureName } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto p-10">

        <div className="bg-slate-900 rounded-3xl p-10">

          <div className="inline-block bg-purple-600 px-5 py-2 rounded-full mb-6">
            🔒 Pro Feature
          </div>

          <h1 className="text-5xl font-bold mb-6">
            {featureName
              ?.replace(/-/g, " ")
              .replace(
                /\b\w/g,
                (c) => c.toUpperCase()
              )}
          </h1>

          <p className="text-xl text-gray-300 mb-10">
            This feature is available exclusively for
            CareerZoid Launch Batch members.
          </p>

          <div className="bg-slate-800 rounded-2xl p-6 mb-8">

            <h2 className="text-2xl font-bold mb-4">
              Benefits
            </h2>

            <ul className="space-y-3">

              <li>
                ✅ Personalized insights
              </li>

              <li>
                ✅ Career readiness improvement
              </li>

              <li>
                ✅ Better opportunities
              </li>

              <li>
                ✅ Structured guidance
              </li>

              <li>
                ✅ Progress tracking
              </li>

            </ul>

          </div>

          <button
            className="bg-purple-600 hover:bg-purple-700 px-10 py-5 rounded-2xl text-xl"
          >
            Join Launch Batch ₹49/month
          </button>

        </div>

      </div>

    </div>
  );
}