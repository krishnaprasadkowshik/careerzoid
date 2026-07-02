import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function PromoManagementPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("29");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    const snapshot = await getDocs(collection(db, "promoCodes"));
    setPromos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const addPromo = async () => {
    if (!code.trim()) return alert("Enter promo code");

    await addDoc(collection(db, "promoCodes"), {
      code: code.trim().toUpperCase(),
      price: Number(price),
      active: true,
      createdAt: serverTimestamp(),
    });

    setCode("");
    setPrice("29");
    loadPromos();
  };

  const togglePromo = async (promo: any) => {
    await setDoc(
      doc(db, "promoCodes", promo.id),
      { active: !promo.active },
      { merge: true }
    );

    loadPromos();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await deleteDoc(doc(db, "promoCodes", id));
    loadPromos();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Promo Codes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-3">Promo Management</h1>
        <p className="text-gray-400 mb-10">
          Create your own promo codes and activate/deactivate them anytime.
        </p>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Promo Code e.g STUDENT29"
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4"
            />

            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price e.g 29"
              type="number"
              className="bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4"
            />

            <button
              onClick={addPromo}
              className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold"
            >
              Add Promo
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="bg-white/[0.04] border border-white/10 rounded-3xl p-6"
            >
              <h2 className="text-3xl font-black">{promo.code}</h2>
              <p className="text-green-300 text-2xl font-black mt-3">₹{promo.price}</p>

              <p className="mt-3">
                Status:{" "}
                <span className={promo.active ? "text-green-300" : "text-red-300"}>
                  {promo.active ? "Active" : "Inactive"}
                </span>
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => togglePromo(promo)}
                  className="flex-1 py-3 rounded-xl bg-yellow-500/20 text-yellow-300"
                >
                  {promo.active ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => deletePromo(promo.id)}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}