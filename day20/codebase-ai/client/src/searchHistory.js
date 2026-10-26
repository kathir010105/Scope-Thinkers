import {
  collection,
  addDoc,
  getDocs,
  query as firestoreQuery,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export async function saveSearchHistory(userId, item) {
  if (!userId || !item?.query) return;

  console.log("[searchHistory] Saving for user:", userId);

  const historyRef = collection(db, "users", userId, "searchHistory");

  await addDoc(historyRef, {
    query: item.query,
    answer: item.answer || "",
    sources: Array.isArray(item.sources) ? item.sources : [],
    createdAt: serverTimestamp(),
  });
  
  console.log("[searchHistory] Save successful");
}

export async function loadSearchHistory(userId) {
  if (!userId) return [];

  console.log("[searchHistory] Loading for user:", userId);

  const historyRef = collection(db, "users", userId, "searchHistory");
  const historyQuery = firestoreQuery(
    historyRef,
    orderBy("createdAt", "desc"),
    limit(30),
  );

  const snapshot = await getDocs(historyQuery);
  console.log("[searchHistory] Loaded docs:", snapshot.docs.length);

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      query: data.query || "",
      answer: data.answer || "",
      sources: Array.isArray(data.sources) ? data.sources : [],
      createdAt: data.createdAt?.toDate?.().toISOString() || "",
    };
  });
}

export async function clearSearchHistory(userId) {
  if (!userId) return;

  console.log("[searchHistory] Clearing for user:", userId);

  const historyRef = collection(db, "users", userId, "searchHistory");
  const snapshot = await getDocs(historyRef);

  await Promise.all(snapshot.docs.map((document) => deleteDoc(document.ref)));
  
  console.log("[searchHistory] Clear successful, deleted:", snapshot.docs.length, "docs");
}