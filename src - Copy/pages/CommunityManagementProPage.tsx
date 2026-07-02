import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  ExternalLink,
  MessageCircle,
  Plus,
  RefreshCw,
  Shield,
  Star,
  Trash2,
  Users,
  Edit,
} from "lucide-react";

import { db } from "../firebase/firestore";

export default function CommunityManagementProPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("Launch Batch");
  const [groupLink, setGroupLink] = useState("");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "community")
      );

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setGroups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId("");
    setGroupName("");
    setGroupType("Launch Batch");
    setGroupLink("");
  };

  const saveGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter community name");
      return;
    }

    if (!groupLink.trim()) {
      alert("Please enter community link");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "community", editingId),
          {
            name: groupName,
            type: groupType,
            link: groupLink,
            updatedAt: serverTimestamp(),
          }
        );
      } else {
        await addDoc(
          collection(db, "community"),
          {
            name: groupName,
            type: groupType,
            link: groupLink,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
      }

      resetForm();
      await loadGroups();
    } catch (error) {
      console.error(error);
      alert("Failed to save community.");
    } finally {
      setSaving(false);
    }
  };

  const editGroup = (item: any) => {
    setEditingId(item.id);
    setGroupName(item.name);
    setGroupType(item.type);
    setGroupLink(item.link);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteGroup = async (id: string) => {
    const confirmDelete = window.confirm(
      "Delete this community?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "community", id)
      );

      await loadGroups();
    } catch (error) {
      console.error(error);
    }
  };

  const launchBatchGroups = groups.filter(
    (group) =>
      group.type === "Launch Batch"
  ).length;

  const achieversGroups = groups.filter(
    (group) =>
      group.type === "Achievers Club"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-5 text-gray-400">
            Loading Communities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-purple-700/25 blur-[160px] rounded-full" />
        <div className="absolute top-20 right-0 w-[900px] h-[900px] bg-blue-700/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[800px] h-[800px] bg-cyan-700/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm mb-5">
            <Users size={16} />
            CareerZoid Community Center
          </div>

          <h1 className="text-5xl md:text-7xl font-black">
            Community Management
          </h1>

          <p className="text-gray-400 text-xl mt-4 max-w-3xl">
            Manage Launch Batch and Achievers Club
            communities. Students will only
            see communities they have access to.
          </p>
        </div>

        {/* Stats */}

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Communities"
            value={groups.length}
            icon={<Users size={24} />}
          />

          <StatCard
            title="Launch Batch"
            value={launchBatchGroups}
            icon={<MessageCircle size={24} />}
          />

          <StatCard
            title="Achievers Club"
            value={achieversGroups}
            icon={<Star size={24} />}
          />

          <StatCard
            title="Access Control"
            value="Active"
            icon={<Shield size={24} />}
          />
        </div>

        {/* Form */}

        <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl mb-10">
          <div className="flex items-center gap-3 mb-6">
            {editingId ? (
              <Edit size={28} />
            ) : (
              <Plus size={28} />
            )}

            <h2 className="text-3xl font-black">
              {editingId
                ? "Edit Community"
                : "Create Community"}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <input
              type="text"
              placeholder="Community Name"
              value={groupName}
              onChange={(e) =>
                setGroupName(e.target.value)
              }
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
            />

            <select
              value={groupType}
              onChange={(e) =>
                setGroupType(e.target.value)
              }
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
            >
              <option>
                Launch Batch
              </option>

              <option>
                Achievers Club
              </option>
            </select>

            <input
              type="text"
              placeholder="Community Link"
              value={groupLink}
              onChange={(e) =>
                setGroupLink(e.target.value)
              }
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={saveGroup}
              disabled={saving}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Community"
                : "Create Community"}
            </button>

            <button
              onClick={resetForm}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold"
            >
              Reset
            </button>

            <button
              onClick={loadGroups}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Communities */}

        {groups.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-12 text-center backdrop-blur-2xl">
            <Users
              size={60}
              className="mx-auto text-purple-300"
            />

            <h2 className="text-3xl font-black mt-5">
              No Communities Created
            </h2>

            <p className="text-gray-400 mt-3">
              Create your first Launch Batch
              or Achievers Club community.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groups.map((group: any) => (
              <div
                key={group.id}
                className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-6 backdrop-blur-2xl hover:border-purple-500/50 transition"
              >
                <div className="flex justify-between items-center mb-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      group.type ===
                      "Achievers Club"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {group.type}
                  </span>
                </div>

                <h3 className="text-2xl font-black mb-3">
                  {group.name}
                </h3>

                <p className="text-gray-400 break-all text-sm mb-6">
                  {group.link}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <a
                    href={group.link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center"
                  >
                    <ExternalLink size={18} />
                  </a>

                  <button
                    onClick={() =>
                      editGroup(group)
                    }
                    className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl py-3 flex items-center justify-center"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() =>
                      deleteGroup(group.id)
                    }
                    className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl py-3 flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: any) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-5">
        {icon}
      </div>

      <p className="text-gray-400">
        {title}
      </p>

      <h3 className="text-4xl font-black mt-3 text-purple-300">
        {value}
      </h3>
    </div>
  );
}