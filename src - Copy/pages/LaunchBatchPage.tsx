export default function LaunchBatchPage() {
  const features = [
    {
      name: "Career Assessment",
      description:
        "Identify the most suitable career path based on your interests and strengths.",
    },
    {
      name: "Personalized Career Guidance",
      description:
        "Receive guidance tailored to your goals and career ambitions.",
    },
    {
      name: "Resume Analyzer",
      description:
        "Analyze and improve your resume professionally.",
    },
    {
      name: "ATS Score Checker",
      description:
        "Check how well your resume performs against ATS systems.",
    },
    {
      name: "LinkedIn Analyzer",
      description:
        "Improve your LinkedIn profile and professional presence.",
    },
    {
      name: "Skill Gap Analysis",
      description:
        "Discover missing skills required for your target career.",
    },
    {
      name: "Learning Roadmap Generator",
      description:
        "Get a personalized roadmap to reach your career goal.",
    },
    {
      name: "Interview Readiness Assessment",
      description:
        "Evaluate your readiness for interviews and placements.",
    },
    {
      name: "Progress Tracking",
      description:
        "Track your career readiness journey step-by-step.",
    },
  ];

  const openProFeature = (
    featureName: string
  ) => {
    alert(
      `${featureName}\n\n🔒 Pro Feature\n\nJoin CareerZoid Launch Batch to access this feature.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <div className="text-center mb-16">

          <div className="inline-block bg-purple-600 px-5 py-2 rounded-full mb-6">
            Most Popular
          </div>

          <h1 className="text-6xl font-bold mb-5">
            CareerZoid Launch Batch
          </h1>

          <p className="text-2xl text-gray-300 mb-6">
            Structured 30-Day Career Readiness Program
          </p>

          <div className="text-5xl font-bold text-green-400 mb-8">
            ₹49 / Month
          </div>

          <button
            className="bg-purple-600 hover:bg-purple-700 px-10 py-5 rounded-2xl text-xl"
          >
            Join Launch Batch
          </button>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-slate-900 rounded-3xl p-8"
            >
              <div className="text-purple-400 text-xl mb-4">
                🔒 Pro Feature
              </div>

              <h2 className="text-2xl font-bold mb-4">
                {feature.name}
              </h2>

              <p className="text-gray-300 mb-6">
                {feature.description}
              </p>

              <button
                onClick={() =>
                  openProFeature(
                    feature.name
                  )
                }
                className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl"
              >
                View Details
              </button>
            </div>
          ))}

        </div>

        <div className="mt-20 bg-slate-900 rounded-3xl p-10">

          <h2 className="text-4xl font-bold mb-8">
            Launch Batch Benefits
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>✅ Career Assessment</div>
            <div>✅ Personalized Career Guidance</div>
            <div>✅ Resume Analyzer</div>
            <div>✅ ATS Score Checker</div>
            <div>✅ LinkedIn Analyzer</div>
            <div>✅ Skill Gap Analysis</div>
            <div>✅ Learning Roadmap Generator</div>
            <div>✅ Interview Readiness Assessment</div>
            <div>✅ Progress Tracking</div>

          </div>

        </div>

      </div>

    </div>
  );
}
