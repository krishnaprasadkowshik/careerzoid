import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function CommunityManagementPage() {
  const [groups, setGroups] =
    useState<any[]>([]);

  const [groupName, setGroupName] =
    useState("");

  const [groupType, setGroupType] =
    useState("Launch Batch");

  const [groupLink, setGroupLink] =
    useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const snapshot =
      await getDocs(
        collection(db, "communityGroups")
      );

    const data =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    setGroups(data);
  };

  const saveGroup = async () => {
    if (
      !groupName ||
      !groupLink
    ) {
      alert(
        "Enter Group Name & Link"
      );
      return;
    }

    await addDoc(
      collection(db, "communityGroups"),
      {
        name: groupName,
        type: groupType,
        link: groupLink,
      }
    );

    setGroupName("");
    setGroupLink("");

    loadGroups();
  };

  const deleteGroup = async (
    id: string
  ) => {
    await deleteDoc(
      doc(
        db,
        "communityGroups",
        id
      )
    );

    loadGroups();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-4">
          Community Management
        </h1>

        <p className="text-gray-400 mb-10">
          Manage Launch Batch &
          Achievers Club Groups
        </p>

        <div className="bg-slate-900 rounded-3xl p-8 mb-10">

          <input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) =>
              setGroupName(
                e.target.value
              )
            }
            className="w-full p-4 rounded-xl bg-slate-800 mb-4"
          />

          <select
            value={groupType}
            onChange={(e) =>
              setGroupType(
                e.target.value
              )
            }
            className="w-full p-4 rounded-xl bg-slate-800 mb-4"
          >
            <option>
              Launch Batch
            </option>

            <option>
              Achievers Club
            </option>
          </select>

          <input
            placeholder="Group Link"
            value={groupLink}
            onChange={(e) =>
              setGroupLink(
                e.target.value
              )
            }
            className="w-full p-4 rounded-xl bg-slate-800 mb-4"
          />

          <button
            onClick={saveGroup}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl"
          >
            Save Group
          </button>

        </div>

        <div className="grid gap-5">

          {groups.map(
            (group: any) => (
              <div
                key={group.id}
                className="bg-slate-900 rounded-2xl p-6 flex justify-between items-center"
              >
                <div>

                  <div className="text-xl font-bold">
                    {group.name}
                  </div>

                  <div className="text-purple-400">
                    {group.type}
                  </div>

                  <div className="text-gray-400 break-all">
                    {group.link}
                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteGroup(
                      group.id
                    )
                  }
                  className="bg-red-600 px-4 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}