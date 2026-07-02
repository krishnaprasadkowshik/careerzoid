import { useMemo } from "react";

export default function LaunchBatchDashboardPage() {
  const steps = [
    {
      name: "Career Discovery",
      completed: true,
    },
    {
      name: "Career Path Selection",
      completed: true,
    },
    {
      name: "Skill Gap Analysis",
      completed: true,
    },
    {
      name: "Resume Submission",
      completed: false,
    },
    {
      name: "LinkedIn Submission",
      completed: false,
    },
    {
      name: "Learning Roadmap",
      completed: false,
    },
    {
      name: "Interview Readiness",
      completed: false,
    },
  ];

  const progress = useMemo(() => {
    const completed =
      steps.filter(
        (step) => step.completed
      ).length;

    return Math.round(
      (completed /
        steps.length) *
        100
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-4">
          Launch Batch Dashboard
        </h1>

        <p className="text-gray-400 mb-10">
          Track your career readiness
          journey.
        </p>

        <div className="bg-slate-900 rounded-3xl p-8 mb-10">

          <div className="flex justify-between mb-4">

            <h2 className="text-2xl font-bold">
              Overall Progress
            </h2>

            <div className="text-2xl font-bold text-green-400">
              {progress}%
            </div>

          </div>

          <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden">

            <div
              className="h-full bg-green-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        <div className="grid gap-5">

          {steps.map((step) => (
            <div
              key={step.name}
              className="bg-slate-900 rounded-2xl p-6 flex justify-between items-center"
            >
              <div className="text-lg font-medium">
                {step.name}
              </div>

              <div>
                {step.completed ? (
                  <span className="text-green-400 text-xl">
                    ✅
                  </span>
                ) : (
                  <span className="text-yellow-400 text-xl">
                    ⏳
                  </span>
                )}
              </div>

            </div>
          ))}

        </div>

        <div className="bg-slate-900 rounded-3xl p-8 mt-10">

          <h2 className="text-3xl font-bold mb-4">
            Membership Status
          </h2>

          <div className="inline-block bg-purple-600 px-5 py-2 rounded-full">
            Launch Batch Member
          </div>

        </div>

      </div>

    </div>
  );
}