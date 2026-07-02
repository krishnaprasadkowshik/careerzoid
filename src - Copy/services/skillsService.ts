import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export async function createSkill(data: any) {
  await addDoc(
    collection(db, "skills"),
    {
      ...data,
      createdAt: serverTimestamp(),
    }
  );
}