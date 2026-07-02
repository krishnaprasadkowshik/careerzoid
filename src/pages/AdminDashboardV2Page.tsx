import { useNavigate } from "react-router-dom";

export default function AdminDashboardV2Page() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Career Management",
      description:
        "Create, Edit and Manage Careers",
      route: "/admin/careers",
      icon: "💼",
    },
    {
      title: "Form Management",
      description:
        "Manage Google Forms",
      route: "/admin/forms",
      icon: "📋",
    },
    {
      title: "Community Management",
      description:
        "Manage Community Links",
      route: "/admin/community-management",
      icon: "👥",
    },
    {
      title: "Student Management",
      description:
        "Manage Students",
      route: "/admin/students",
      icon: "🎓",
    },
    {
      title: "Membership Management",
      description:
        "Manage Membership Status",
      route: "/admin/memberships",
      icon: "⭐",
    },
    {
      title: "Eligibility Management",
      description:
        "Manage Achievers Club Eligibility",
      route: "/admin/eligibility",
      icon: "🏆",
    },
    {
      title: "Referral Dashboard",
      description:
        "Manage Referrals",
      route: "/admin/referrals",
      icon: "🚀",
    },
    {
      title: "Launch Batch",
      description:
        "Track Launch Batch Progress",
      route: "/launch-batch-dashboard",
      icon: "📈",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <div className="mb-12">

          <h1 className="text-6xl font-bold">
            CareerZoid Admin
          </h1>

          <p className="text-gray-400 mt-3">
            Complete Platform Control Center
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {modules.map((module) => (
            <div
              key={module.title}
              onClick={() =>
                navigate(module.route)
              }
              className="bg-slate-900 rounded-3xl p-6 cursor-pointer hover:bg-slate-800 transition"
            >
              <div className="text-5xl mb-4">
                {module.icon}
              </div>

              <h2 className="text-2xl font-bold mb-3">
                {module.title}
              </h2>

              <p className="text-gray-400">
                {module.description}
              </p>

            </div>
          ))}

        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-12">

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3 className="text-gray-400">
              Total Users
            </h3>

            <p className="text-4xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3 className="text-gray-400">
              Launch Batch
            </h3>

            <p className="text-4xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3 className="text-gray-400">
              Achievers Club
            </h3>

            <p className="text-4xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3 className="text-gray-400">
              Referrals
            </h3>

            <p className="text-4xl font-bold mt-2">
              0
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}