export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}

      <div className="w-72 bg-zinc-950 border-r border-white/10 p-6">

        <h1 className="text-3xl font-bold text-purple-400">
          CareerZoid
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Admin Panel
        </p>

        <div className="mt-10 space-y-3">

          <MenuCard title="Dashboard" />
          <MenuCard title="Skills" />
          <MenuCard title="Roadmaps" />
          <MenuCard title="Opportunities" />
          <MenuCard title="Certifications" />
          <MenuCard title="Community" />
          <MenuCard title="Users" />
          <MenuCard title="Memberships" />
          <MenuCard title="Testimonials" />
          <MenuCard title="FAQ" />

        </div>

      </div>

      {/* Main */}

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Manage CareerZoid Platform
        </p>

        {/* Stats */}

        <div className="grid md:grid-cols-4 gap-6 mt-10">

          <StatCard
            title="Skills"
            value="1000+"
          />

          <StatCard
            title="Roadmaps"
            value="500+"
          />

          <StatCard
            title="Users"
            value="0"
          />

          <StatCard
            title="Opportunities"
            value="0"
          />

        </div>

        {/* Modules */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          <ModuleCard
            title="Skills Manager"
            description="Add, Edit and Delete Skills"
          />

          <ModuleCard
            title="Roadmaps Manager"
            description="Manage Learning Roadmaps"
          />

          <ModuleCard
            title="Opportunity Hub"
            description="Jobs, Internships, Scholarships"
          />

          <ModuleCard
            title="Certification Hub"
            description="Manage Certifications"
          />

          <ModuleCard
            title="Community"
            description="Pro Members Access"
          />

          <ModuleCard
            title="Memberships"
            description="Free, Pro and Founder Plans"
          />

        </div>

      </div>

    </div>
  );
}

function MenuCard({
  title,
}: {
  title: string;
}) {
  return (
    <div className="bg-white/5 hover:bg-white/10 transition p-4 rounded-xl cursor-pointer">
      {title}
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-purple-600 p-6 rounded-2xl">
      <h2 className="text-lg">
        {title}
      </h2>

      <p className="text-4xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}

function ModuleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="text-gray-400 mt-3">
        {description}
      </p>

    </div>
  );
}