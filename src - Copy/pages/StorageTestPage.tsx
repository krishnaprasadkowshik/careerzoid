import { useState } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { storage } from "../firebase/storage";

export default function StorageTestPage() {
  const [imageUrl, setImageUrl] =
    useState("");

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageRef = ref(
      storage,
      `skills/${Date.now()}-${file.name}`
    );

    await uploadBytes(
      imageRef,
      file
    );

    const url =
      await getDownloadURL(imageRef);

    setImageUrl(url);

    alert("Image Uploaded");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-5xl font-bold mb-8">
        Firebase Storage Test
      </h1>

      <input
        type="file"
        onChange={uploadImage}
      />

      {imageUrl && (
        <div className="mt-10">

          <img
            src={imageUrl}
            alt="uploaded"
            className="w-96 rounded-2xl"
          />

          <p className="mt-4 break-all">
            {imageUrl}
          </p>

        </div>
      )}

    </div>
  );
}