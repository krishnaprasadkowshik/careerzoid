import {
  Users,
  Briefcase,
  DollarSign,
  BookOpen,
} from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">

      {/* SIDEBAR */}

      <aside className="w-72 bg-[#111827] border-r border-white/10 p-6">

        <h1 className="text-3xl font-bold text-purple-400">
          CareerZoid
        </h1>

        <p className="text-gray-400 mt-1">
          Admin Dashboard
        </p>

        <div className="mt-10 space-y-3">

          <SidebarItem title="Dashboard" />
          <SidebarItem title="Skill Intelligence" />
          <SidebarItem title="Roadmaps" />
          <SidebarItem title="Opportunities" />
          <SidebarItem title="Certifications" />
          <SidebarItem title="Users" />
          <SidebarItem title="Payments" />
          <SidebarItem title="Community" />
          <SidebarItem title="Settings" />

        </div>

      </aside>

      {/* CONTENT */}

      <main className="flex-1 p-8">

        <h1 className="text-4xl font-bold">
          Dashboard Overview
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome to CareerZoid Admin Panel
        </p>

        {/* STATS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

          <StatCard
            title="Total Users"
            value="0"
            icon={<Users size={28} />}
          />

          <StatCard
            title="Career Views"
            value="0"
            icon={<Briefcase size={28} />}
          />

          <StatCard
            title="Skills"
            value="0"
            icon={<BookOpen size={28} />}
          />

          <StatCard
            title="Revenue"
            value="₹0"
            icon={<DollarSign size={28} />}
          />

        </div>

        {/* SECOND ROW */}

        <div className="grid lg:grid-cols-3 gap-6 mt-10">

          <div className="bg-[#1e293b] rounded-3xl p-6">

            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>

            <div className="mt-6 space-y-4">

              <ActivityItem text="New user registered" />
              <ActivityItem text="Skill added" />
              <ActivityItem text="Career viewed" />
              <ActivityItem text="Payment received" />

            </div>

          </div>

          <div className="bg-[#1e293b] rounded-3xl p-6">

            <h2 className="text-2xl font-bold">
              Quick Actions
            </h2>

            <div className="grid gap-3 mt-6">

              <QuickButton text="Add Skill" />
              <QuickButton text="Add Roadmap" />
              <QuickButton text="Add Opportunity" />
              <QuickButton text="Add Certificate" />

            </div>

          </div>

          <div className="bg-[#1e293b] rounded-3xl p-6">

            <h2 className="text-2xl font-bold">
              Platform Status
            </h2>

            <div className="space-y-4 mt-6">

              <StatusItem
                title="Firebase"
                status="Connected"
              />

              <StatusItem
                title="Authentication"
                status="Active"
              />

              <StatusItem
                title="Database"
                status="Online"
              />

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

function SidebarItem({
  title,
}: {
  title: string;
}) {
  return (
    <div className="bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer">
      {title}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-white/80">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>

        </div>

        {icon}

      </div>

    </div>
  );
}

function ActivityItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3">
      {text}
    </div>
  );
}

function QuickButton({
  text,
}: {
  text: string;
}) {
  return (
    <button className="bg-purple-600 hover:bg-purple-700 rounded-xl p-3">
      {text}
    </button>
  );
}

function StatusItem({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex justify-between bg-white/5 rounded-xl p-3">

      <span>{title}</span>

      <span className="text-green-400">
        {status}
      </span>

    </div>
  );
}
