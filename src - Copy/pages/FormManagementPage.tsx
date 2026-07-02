import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export default function FormManagementPage() {
  const [forms, setForms] =
    useState<any[]>([]);

  const [formName, setFormName] =
    useState("");

  const [formLink, setFormLink] =
    useState("");

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    const snapshot =
      await getDocs(
        collection(db, "forms")
      );

    const data =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    setForms(data);
  };

  const saveForm = async () => {
    if (
      !formName ||
      !formLink
    ) {
      alert(
        "Enter Form Name & Link"
      );
      return;
    }

    await addDoc(
      collection(db, "forms"),
      {
        name: formName,
        link: formLink,
      }
    );

    setFormName("");
    setFormLink("");

    loadForms();
  };

  const removeForm = async (
    id: string
  ) => {
    await deleteDoc(
      doc(db, "forms", id)
    );

    loadForms();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-4">
          Form Management
        </h1>

        <p className="text-gray-400 mb-10">
          Manage Google Forms for
          Launch Batch.
        </p>

        <div className="bg-slate-900 rounded-3xl p-8 mb-10">

          <input
            placeholder="Form Name"
            value={formName}
            onChange={(e) =>
              setFormName(
                e.target.value
              )
            }
            className="w-full p-4 rounded-xl bg-slate-800 mb-4"
          />

          <input
            placeholder="Google Form Link"
            value={formLink}
            onChange={(e) =>
              setFormLink(
                e.target.value
              )
            }
            className="w-full p-4 rounded-xl bg-slate-800 mb-4"
          />

          <button
            onClick={saveForm}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl"
          >
            Save Form
          </button>

        </div>

        <div className="grid gap-5">

          {forms.map(
            (form: any) => (
              <div
                key={form.id}
                className="bg-slate-900 rounded-2xl p-6 flex justify-between items-center"
              >
                <div>

                  <div className="font-bold text-xl">
                    {form.name}
                  </div>

                  <div className="text-gray-400 break-all">
                    {form.link}
                  </div>

                </div>

                <button
                  onClick={() =>
                    removeForm(
                      form.id
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